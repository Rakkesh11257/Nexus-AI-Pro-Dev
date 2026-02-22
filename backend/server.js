require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, GetUserCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const fs = require('fs');
const os = require('os');

const rateLimit = require('express-rate-limit');

// ═══════════════════════════════════════════════
// CREDIT COSTS PER MODEL (server-side source of truth)
// Types: 'fixed' | 'variable' | 'per_second'
// Pricing: 4x profit for cheap models, 2x for expensive (>$0.30)
// Rate: ₹83.75/USD, pack value ₹0.50/credit (Ultimate)
// Formula: credits = ceil(USD × 83.75 × multiplier / 0.50)
// ═══════════════════════════════════════════════
const CREDIT_COSTS = {

  // ── IMAGE GENERATION (4x) ──
  'black-forest-labs/flux-schnell': { type: 'fixed', credits: 3 },       // $0.003/img
  'black-forest-labs/flux-dev': { type: 'fixed', credits: 4 },           // $0.005/img
  'black-forest-labs/flux-1.1-pro': { type: 'fixed', credits: 27 },      // $0.04/img
  'black-forest-labs/flux-1.1-pro-ultra': { type: 'fixed', credits: 41 },// $0.06/img
  'prunaai/flux-fast': { type: 'fixed', credits: 4 },                    // $0.005/img
  'prunaai/wan-2.2-image': { type: 'fixed', credits: 14 },               // $0.02/img
  'bytedance/sdxl-lightning-4step': { type: 'fixed', credits: 2 },       // $0.0017/img
  'stability-ai/sdxl': { type: 'fixed', credits: 5 },                    // $0.0067/img
  'ideogram-ai/ideogram-v3-quality': { type: 'fixed', credits: 61 },     // $0.09/img
  'stability-ai/stable-diffusion-3.5-large': { type: 'fixed', credits: 44 }, // $0.065/img
  'google/nano-banana-pro': {                                            // $0.04-$0.30 by resolution (2x)
    type: 'variable',
    base: {
      'default': { 'default': 14 },
      '1K': { 'default': 51 },
      '2K': { 'default': 51 },
      '4K': { 'default': 101 },
    },
    default: 51,
  },

  // ── IMAGE EDIT / I2I (4x) ──
  'sdxl-based/consistent-character': { type: 'fixed', credits: 6 },
  'zsxkib/instant-id': { type: 'fixed', credits: 20 },                   // $0.029/img
  'zedge/instantid': { type: 'fixed', credits: 2 },                      // $0.0015/img
  'minimax/image-01': { type: 'fixed', credits: 7 },                     // $0.01/img
  'qwen/qwen-image': { type: 'fixed', credits: 17 },                     // $0.025/img

  // ── FACE SWAP (4x) ──
  'cdingram/face-swap': { type: 'fixed', credits: 10 },                  // $0.014/run
  'codeplugtech/face-swap': { type: 'fixed', credits: 2 },               // $0.0025/run

  // ── UPSCALE ──
  'nightmareai/real-esrgan': { type: 'fixed', credits: 2 },              // $0.002/img (4x)
  'philz1337x/crystal-upscaler': {                                       // $0.05-$1.60 by scale (2x)
    type: 'variable',
    base: {
      '2': { 'default': 34 },
      '3': { 'default': 67 },
      '4': { 'default': 67 },
      '5': { 'default': 134 },
      '6': { 'default': 134 },
      '7': { 'default': 268 },
      '8': { 'default': 268 },
      '9': { 'default': 536 },
      '10': { 'default': 536 },
    },
    default: 67,
  },

  // ── SKIN / PORTRAIT (4x) ──
  'fofr/kontext-make-person-real': { type: 'fixed', credits: 13 },       // $0.018/run
  'flux-kontext-apps/change-haircut': { type: 'fixed', credits: 27 },    // $0.04/img
  'zsxkib/ic-light': { type: 'fixed', credits: 16 },                     // $0.023/run

  // ── IMAGE-TO-VIDEO ──
  'wan-video/wan-2.2-i2v-fast': {                                        // $0.05-$0.145/video (4x)
    type: 'variable',
    base: {
      '480p': { '5': 34, '7': 38, '8': 44, '9': 44, '10': 44 },
      '720p': { '5': 74, '7': 86, '8': 98, '9': 98, '10': 98 },
    },
    default: 44,
  },
  'wavespeedai/wan-2.1-i2v-720p': { type: 'fixed', credits: 419 },      // $0.25/sec × ~5s = $1.25 (2x)
  'wan-video/wan-2.5-i2v': {                                             // $0.05-$0.15/sec (2x)
    type: 'variable',
    base: {
      '480p': { '5': 84, '10': 168 },
      '720p': { '5': 168, '10': 335 },
      '1080p': { '5': 252, '10': 503 },
    },
    default: 168,
  },
  'wan-video/wan-2.5-i2v-fast': {                                        // $0.068-$0.102/sec (2x)
    type: 'variable',
    base: {
      '720p': { '5': 114, '10': 228 },
      '1080p': { '5': 171, '10': 342 },
    },
    default: 114,
  },

  // ── TEXT-TO-VIDEO ──
  'wan-video/wan-2.2-t2v-fast': {                                        // $0.05-$0.145/video (4x)
    type: 'variable',
    base: {
      '480p': { '5': 34, '7': 38, '8': 44, '9': 44, '10': 44 },
      '720p': { '5': 74, '7': 86, '8': 98, '9': 98, '10': 98 },
    },
    default: 44,
  },
  'wavespeedai/wan-2.1-t2v-720p': { type: 'fixed', credits: 402 },      // $0.24/sec × ~5s = $1.20 (2x)
  'wan-video/wan-2.5-t2v': {                                             // $0.05-$0.15/sec (2x)
    type: 'variable',
    base: {
      '480p': { '5': 84, '10': 168 },
      '720p': { '5': 168, '10': 335 },
      '1080p': { '5': 252, '10': 503 },
    },
    default: 168,
  },
  'wan-video/wan-2.5-t2v-fast': {                                        // $0.068-$0.102/sec (2x)
    type: 'variable',
    base: {
      '720p': { '5': 114, '10': 228 },
      '1080p': { '5': 171, '10': 342 },
    },
    default: 114,
  },

  // ── PREMIUM VIDEO MODELS ──
  'google/veo-3.1-fast': {                                               // $0.10-$0.15/sec (2x)
    type: 'per_second',
    rates: {
      '720p': 34,
      '1080p': 34,
    },
    default_rate: 34,
    min_credits: 134,
  },
  'kwaivgi/kling-v2.5-turbo-pro': {                                      // $0.07/sec (2x)
    type: 'variable',
    base: {
      'default': { '5': 118, '10': 235 },
    },
    default: 118,
  },
  'openai/sora-2-pro': {                                                 // $0.30-$0.50/sec (2x)
    type: 'variable',
    base: {
      'standard': { '4': 402, '8': 804, '12': 1206 },
      'high': { '4': 670, '8': 1340, '12': 2010 },
    },
    default: 402,
  },
  'minimax/video-01': { type: 'fixed', credits: 168 },                   // $0.50/video (2x)
  'minimax/video-01-live': { type: 'fixed', credits: 168 },              // $0.50/video (2x)
  'xai/grok-imagine-video': {                                            // $0.05/sec (2x)
    type: 'per_second',
    rates: {
      '720p': 17,
      '1080p': 17,
    },
    default_rate: 17,
    min_credits: 84,
  },

  // ── VIDEO-TO-VIDEO ──
  'kwaivgi/kling-o1': {                                                  // $0.084/sec std (2x)
    type: 'variable',
    base: {
      'default': { '5': 141, '10': 282 },
    },
    default: 141,
  },
  'zsxkib/hunyuan-video2video': { type: 'fixed', credits: 218 },         // $0.65/run (2x)
  'luma/modify-video': { type: 'fixed', credits: 701 },                  // ~$2.09 for 720p 5s (2x)

  // ── MOTION CONTROL ──
  'kwaivgi/kling-v2.6-motion-control': {                                 // $0.07/sec (2x)
    type: 'variable',
    base: {
      'default': { '5': 118, '10': 235 },
    },
    default: 118,
  },
  'wan-video/wan-2.2-animate-animation': { type: 'fixed', credits: 121 },// ~$0.36 runtime (2x)

  // ── VIDEO FACE SWAP (4x) ──
  'xrunda/hello': { type: 'fixed', credits: 66 },                        // $0.098/run
  'okaris/roop': { type: 'fixed', credits: 47 },                         // $0.070/run

  // ── REPLACE CHARACTER (2x) ──
  'wan-video/wan-2.2-animate-replace': {                                 // $0.02-$0.05/sec × ~8s
    type: 'variable',
    base: {
      '480': { 'default': 54 },
      '720': { 'default': 134 },
      '480p': { 'default': 54 },
      '720p': { 'default': 134 },
    },
    default: 54,
  },

  // ── AUDIO / TTS (4x) ──
  'elevenlabs/v3': { type: 'fixed', credits: 14 },                       // $0.10/1k chars × ~200 chars
  'elevenlabs/turbo-v2.5': { type: 'fixed', credits: 7 },                // $0.05/1k chars × ~200 chars
  'minimax/speech-02-turbo': { type: 'fixed', credits: 5 },              // $0.06/1k tok × ~100 tok
  'google/lyria-2': { type: 'fixed', credits: 41 },                      // $2/1000s × ~30s
  'zsxkib/mmaudio': { type: 'fixed', credits: 5 },                       // $0.0064/run

  // ── VOICE CLONE ──
  'lucataco/xtts-v2': { type: 'fixed', credits: 41 },                    // $0.061/run (4x)
  'resemble-ai/chatterbox': { type: 'fixed', credits: 4 },              // $0.005/run (4x)
  'minimax/voice-cloning': { type: 'fixed', credits: 1005 },             // $3.00/output (2x)

  // ── TRANSCRIPTION ──
  'openai/gpt-4o-transcribe': { type: 'fixed', credits: 41 },            // ~$0.06/run (4x)
  'openai/whisper': { type: 'fixed', credits: 5 },                       // $0.007/run

  // ── TRAINING (fixed, 2x – Replicate charges ~$3-5 per training) ──
  'replicate/fast-flux-trainer': { type: 'fixed', credits: 500 },        // ~$3 avg (2x)

  // ── CHAT (flat 2 cr per message) ──
  'openai/gpt-5': { type: 'fixed', credits: 2 },
  'anthropic/claude-4-sonnet': { type: 'fixed', credits: 2 },
  'google/gemini-2.5-pro': { type: 'fixed', credits: 2 },
  'google/gemini-2.5-flash': { type: 'fixed', credits: 2 },
  'deepseek-ai/deepseek-r1': { type: 'fixed', credits: 2 },
  'meta/meta-llama-3.1-405b-instruct': { type: 'fixed', credits: 2 },
  'mistralai/mistral-large-latest': { type: 'fixed', credits: 2 },
};

const DEFAULT_CREDIT_COST = 5; // fallback for unknown models

/**
 * Calculate credit cost dynamically based on model + user parameters.
 * @param {string} modelId - Replicate model ID (e.g., 'wan-video/wan-2.2-t2v-fast')
 * @param {object} params - User-selected parameters: { resolution, duration, seconds }
 * @returns {number} credit cost
 */
function getCreditCost(modelId, params = {}) {
  const baseId = modelId.split(':')[0];
  const costConfig = CREDIT_COSTS[baseId];
  
  if (!costConfig) return DEFAULT_CREDIT_COST;
  
  // Type 1: Fixed cost
  if (costConfig.type === 'fixed') {
    return costConfig.credits;
  }
  
  // Type 2: Variable by resolution + duration
  if (costConfig.type === 'variable') {
    const resolution = params.resolution || 'default';
    const duration = String(params.duration || params.seconds || 'default');
    
    // Try exact match: base[resolution][duration]
    if (costConfig.base[resolution] && costConfig.base[resolution][duration] !== undefined) {
      return costConfig.base[resolution][duration];
    }
    // Try 'default' resolution: base['default'][duration]
    if (costConfig.base['default'] && costConfig.base['default'][duration] !== undefined) {
      return costConfig.base['default'][duration];
    }
    // Try resolution with 'default' duration: base[resolution]['default']
    if (costConfig.base[resolution] && costConfig.base[resolution]['default'] !== undefined) {
      return costConfig.base[resolution]['default'];
    }
    // Try finding closest duration in first matching resolution
    if (costConfig.base[resolution]) {
      const durations = Object.keys(costConfig.base[resolution]).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
      const targetDur = parseInt(duration);
      if (durations.length > 0 && !isNaN(targetDur)) {
        // Find nearest duration (round up for safety/profit)
        const nearest = durations.find(d => d >= targetDur) || durations[durations.length - 1];
        return costConfig.base[resolution][String(nearest)];
      }
    }
    return costConfig.default || DEFAULT_CREDIT_COST;
  }
  
  // Type 3: Per-second billing
  if (costConfig.type === 'per_second') {
    const resolution = params.resolution || 'default';
    const duration = parseInt(params.duration || params.seconds || 5);
    const rate = costConfig.rates?.[resolution] || costConfig.default_rate || 40;
    const calculated = rate * duration;
    return Math.max(calculated, costConfig.min_credits || 0);
  }
  
  return DEFAULT_CREDIT_COST;
}

// ═══════════════════════════════════════════════
// SERVER-SIDE REPLICATE API KEY (for credit mode)
// ═══════════════════════════════════════════════
const SERVER_REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Temp upload directory for serving files with correct Content-Type
const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'nexus-uploads');
if (!fs.existsSync(TEMP_UPLOAD_DIR)) fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

// Serve temp uploads with correct Content-Type headers
app.use('/tmp-uploads', (req, res, next) => {
  const filePath = path.join(TEMP_UPLOAD_DIR, req.path);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  res.set('Content-Type', mimeMap[ext] || 'application/octet-stream');
  res.sendFile(filePath);
});

// Clean up temp files older than 10 minutes every 5 minutes
setInterval(() => {
  try {
    const files = fs.readdirSync(TEMP_UPLOAD_DIR);
    const now = Date.now();
    for (const f of files) {
      const fp = path.join(TEMP_UPLOAD_DIR, f);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > 10 * 60 * 1000) fs.unlinkSync(fp);
    }
  } catch (e) {}
}, 5 * 60 * 1000);

// ============================================
// RATE LIMITING
// ============================================
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 auth attempts per 15 min per IP
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/signup', authLimiter);
app.use('/api/login', authLimiter);

// ============================================
// AWS CONFIG
// ============================================
const AWS_REGION = 'ap-south-1';
const USER_POOL_ID = 'ap-south-1_k3mHGKDKx';
const CLIENT_ID = '20gh952epf9n1fcgdhehmm9s58';
const DYNAMO_TABLE = 'nexus-ai-pro-users';

const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: AWS_REGION }));

// ============================================
// RAZORPAY CONFIG
// ============================================
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_SCpCGFak928F7f';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'sAaMXrCyXwMAVxIHfqgaQFA1';
const PLAN_YEARLY_PRICE = 299900;   // Rs 2999 in paise
const PLAN_MONTHLY_PRICE = 49900;   // Rs 499 in paise

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());

// IMPORTANT: webhook route needs raw body, so register it BEFORE express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) return res.status(400).json({ error: 'No signature' });

  const body = typeof req.body === 'string' ? req.body : req.body.toString();
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    const event = JSON.parse(body);
    console.log('Webhook event:', event.event);

    // --- One-time payment captured (legacy lifetime users) ---
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const userId = payment.notes?.userId;
      const plan = payment.notes?.plan;

      if (userId && plan === 'lifetime') {
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId },
          UpdateExpression: 'SET isPaid = :paid, paymentId = :pid, paymentPlan = :plan, paidAt = :now',
          ExpressionAttributeValues: {
            ':paid': true,
            ':pid': payment.id,
            ':plan': 'lifetime',
            ':now': new Date().toISOString(),
          },
        }));
        console.log('Webhook: Lifetime activated for', userId);
      }

      // --- Credit purchase captured ---
      const type = payment.notes?.type;
      if (userId && type === 'credit_purchase') {
        const credits = parseInt(payment.notes?.credits) || 0;
        if (credits > 0) {
          await dynamoClient.send(new UpdateCommand({
            TableName: DYNAMO_TABLE,
            Key: { userId },
            UpdateExpression: 'SET credits = if_not_exists(credits, :zero) + :amount',
            ExpressionAttributeValues: { ':amount': credits, ':zero': 0 },
          }));
          console.log(`Webhook: ${credits} credits added for ${userId} (payment: ${payment.id})`);
        }
      }
    }

    // --- Subscription charged (monthly/yearly renewal success) ---
    if (event.event === 'subscription.charged') {
      const sub = event.payload.subscription.entity;
      const userId = sub.notes?.userId;

      if (userId) {
        const subEnd = new Date();
        subEnd.setMonth(subEnd.getMonth() + 1);

        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId },
          UpdateExpression: 'SET isPaid = :paid, subscriptionEnd = :subEnd, subscriptionStatus = :status, lastRenewal = :now',
          ExpressionAttributeValues: {
            ':paid': true,
            ':subEnd': subEnd.toISOString(),
            ':status': 'active',
            ':now': new Date().toISOString(),
          },
        }));
        console.log('Webhook: Monthly renewed for', userId);
      }
    }

    // --- Subscription halted (payment failed after retries) ---
    if (event.event === 'subscription.halted') {
      const sub = event.payload.subscription.entity;
      const userId = sub.notes?.userId;

      if (userId) {
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId },
          UpdateExpression: 'SET isPaid = :paid, subscriptionStatus = :status',
          ExpressionAttributeValues: { ':paid': false, ':status': 'halted' },
        }));
        console.log('Webhook: Subscription halted for', userId);
      }
    }

    // --- Subscription cancelled ---
    if (event.event === 'subscription.cancelled') {
      const sub = event.payload.subscription.entity;
      const userId = sub.notes?.userId;

      if (userId) {
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId },
          UpdateExpression: 'SET isPaid = :paid, subscriptionStatus = :status',
          ExpressionAttributeValues: { ':paid': false, ':status': 'cancelled' },
        }));
        console.log('Webhook: Subscription cancelled for', userId);
      }
    }

    // --- Subscription completed ---
    if (event.event === 'subscription.completed') {
      const sub = event.payload.subscription.entity;
      const userId = sub.notes?.userId;

      if (userId) {
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId },
          UpdateExpression: 'SET isPaid = :paid, subscriptionStatus = :status',
          ExpressionAttributeValues: { ':paid': false, ':status': 'completed' },
        }));
        console.log('Webhook: Subscription completed for', userId);
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.use(express.json({ limit: '100mb' }));

// Debug: log all /api requests
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// AUTH MIDDLEWARE
// ============================================
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['x-auth-token'];
  if (!authHeader) return res.status(401).json({ error: 'No auth token provided' });

  try {
    const result = await cognitoClient.send(new GetUserCommand({ AccessToken: authHeader }));
    const email = result.UserAttributes.find(a => a.Name === 'email')?.Value;
    const sub = result.UserAttributes.find(a => a.Name === 'sub')?.Value;
    req.user = { sub, email, username: result.Username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============================================
// AUTH ROUTES
// ============================================
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await cognitoClient.send(new SignUpCommand({
      ClientId: CLIENT_ID, Username: email, Password: password,
      UserAttributes: [{ Name: 'email', Value: email }]
    }));
    res.json({ message: 'Sign up successful. Check your email for verification code.', userSub: result.UserSub });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Sign up failed' });
  }
});

app.post('/auth/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  try {
    await cognitoClient.send(new ConfirmSignUpCommand({ ClientId: CLIENT_ID, Username: email, ConfirmationCode: code }));
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Verification failed' });
  }
});

app.post('/auth/resend-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    await cognitoClient.send(new ResendConfirmationCodeCommand({ ClientId: CLIENT_ID, Username: email }));
    res.json({ message: 'Verification code resent.' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to resend code' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await cognitoClient.send(new InitiateAuthCommand({
      ClientId: CLIENT_ID, AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: password }
    }));
    const tokens = result.AuthenticationResult;
    const userInfo = await cognitoClient.send(new GetUserCommand({ AccessToken: tokens.AccessToken }));
    const sub = userInfo.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const userEmail = userInfo.UserAttributes.find(a => a.Name === 'email')?.Value;

    let userData;
    try {
      const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));
      userData = dbResult.Item;
    } catch (e) {}

    if (!userData) {
      userData = { userId: sub, email: userEmail, isPaid: false, credits: 45, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() };
      console.log('New user created with 45 free credits:', userEmail);
      await dynamoClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: userData }));
    } else {
      // Check monthly subscription expiry
      if ((userData.paymentPlan === 'monthly' || userData.paymentPlan === 'yearly') && userData.subscriptionEnd) {
        const endDate = new Date(userData.subscriptionEnd);
        if (endDate < new Date() && userData.subscriptionStatus !== 'active') {
          userData.isPaid = false;
          await dynamoClient.send(new UpdateCommand({
            TableName: DYNAMO_TABLE, Key: { userId: sub },
            UpdateExpression: 'SET isPaid = :paid, lastLogin = :now',
            ExpressionAttributeValues: { ':paid': false, ':now': new Date().toISOString() },
          }));
        } else {
          await dynamoClient.send(new UpdateCommand({
            TableName: DYNAMO_TABLE, Key: { userId: sub },
            UpdateExpression: 'SET lastLogin = :now',
            ExpressionAttributeValues: { ':now': new Date().toISOString() },
          }));
        }
      } else {
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE, Key: { userId: sub },
          UpdateExpression: 'SET lastLogin = :now',
          ExpressionAttributeValues: { ':now': new Date().toISOString() },
        }));
      }
    }

    res.json({
      accessToken: tokens.AccessToken, idToken: tokens.IdToken,
      refreshToken: tokens.RefreshToken, expiresIn: tokens.ExpiresIn,
      user: {
        sub, email: userEmail, isPaid: userData.isPaid || false,
        paymentPlan: userData.paymentPlan || null,
        subscriptionStatus: userData.subscriptionStatus || null,
        credits: userData.credits || 0,
      }
    });
  } catch (err) {
    if (err.name === 'UserNotConfirmedException') return res.status(403).json({ error: 'Please verify your email first', needsVerification: true });
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const result = await cognitoClient.send(new InitiateAuthCommand({
      ClientId: CLIENT_ID, AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: refreshToken }
    }));
    const tokens = result.AuthenticationResult;
    res.json({ accessToken: tokens.AccessToken, idToken: tokens.IdToken, expiresIn: tokens.ExpiresIn });
  } catch (err) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    await cognitoClient.send(new ForgotPasswordCommand({ ClientId: CLIENT_ID, Username: email }));
    res.json({ message: 'Password reset code sent.' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to send reset code' });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, code, and new password required' });
  try {
    await cognitoClient.send(new ConfirmForgotPasswordCommand({ ClientId: CLIENT_ID, Username: email, ConfirmationCode: code, Password: newPassword }));
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Password reset failed' });
  }
});

app.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
    const userData = dbResult.Item || {};

    // Check monthly expiry
    let isPaid = userData.isPaid || false;
    if ((userData.paymentPlan === 'monthly' || userData.paymentPlan === 'yearly') && userData.subscriptionEnd) {
      const endDate = new Date(userData.subscriptionEnd);
      if (endDate < new Date() && userData.subscriptionStatus !== 'active') {
        isPaid = false;
      }
    }

    res.json({
      sub: req.user.sub, email: req.user.email, isPaid,
      paymentPlan: userData.paymentPlan || null,
      subscriptionStatus: userData.subscriptionStatus || null,
      subscriptionEnd: userData.subscriptionEnd || null,
      credits: userData.credits || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// ============================================
// RAZORPAY PAYMENT ROUTES
// ============================================

// Auto-create monthly & yearly plans on startup
let MONTHLY_PLAN_ID = process.env.RAZORPAY_MONTHLY_PLAN_ID || null;
let YEARLY_PLAN_ID = process.env.RAZORPAY_YEARLY_PLAN_ID || null;

(async () => {
  if (MONTHLY_PLAN_ID) return;
  try {
    const plans = await razorpay.plans.all({ count: 50 });
    const existing = plans.items.find(p => p.item?.name === 'NEXUS AI Pro - Monthly' && p.item?.amount === PLAN_MONTHLY_PRICE);
    if (existing) {
      MONTHLY_PLAN_ID = existing.id;
      console.log('Found existing monthly plan:', MONTHLY_PLAN_ID);
    } else {
      const plan = await razorpay.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: 'NEXUS AI Pro - Monthly',
          amount: PLAN_MONTHLY_PRICE,
          currency: 'INR',
          description: 'Monthly access to NEXUS AI Pro',
        },
      });
      MONTHLY_PLAN_ID = plan.id;
      console.log('Created monthly plan:', MONTHLY_PLAN_ID);
    }
  } catch (err) {
    console.error('Failed to setup monthly Razorpay plan:', err.message);
  }
  // Yearly plan
  if (!YEARLY_PLAN_ID) {
    try {
      const plans = await razorpay.plans.all({ count: 50 });
      const existing = plans.items.find(p => p.item?.name === 'NEXUS AI Pro - Yearly' && p.item?.amount === PLAN_YEARLY_PRICE);
      if (existing) {
        YEARLY_PLAN_ID = existing.id;
        console.log('Found existing yearly plan:', YEARLY_PLAN_ID);
      } else {
        const plan = await razorpay.plans.create({
          period: 'yearly',
          interval: 1,
          item: {
            name: 'NEXUS AI Pro - Yearly',
            amount: PLAN_YEARLY_PRICE,
            currency: 'INR',
            description: 'Yearly access to NEXUS AI Pro',
          },
        });
        YEARLY_PLAN_ID = plan.id;
        console.log('Created yearly plan:', YEARLY_PLAN_ID);
      }
    } catch (err) {
      console.error('Failed to setup yearly Razorpay plan:', err.message);
    }
  }
})();

// Create Subscription (monthly or yearly)
app.post('/api/payment/create-order', verifyToken, async (req, res) => {
  const { plan } = req.body;

  try {
    if (plan === 'monthly') {
      if (!MONTHLY_PLAN_ID) return res.status(500).json({ error: 'Monthly plan not configured yet. Try again in a moment.' });

      const subscription = await razorpay.subscriptions.create({
        plan_id: MONTHLY_PLAN_ID,
        total_count: 120,
        quantity: 1,
        customer_notify: 1,
        notes: { userId: req.user.sub, email: req.user.email, plan: 'monthly' },
      });

      res.json({
        type: 'subscription',
        subscriptionId: subscription.id,
        keyId: RAZORPAY_KEY_ID,
        planName: 'NEXUS AI Pro - Monthly',
        plan: 'monthly',
        amount: PLAN_MONTHLY_PRICE,
      });
    } else if (plan === 'yearly') {
      if (!YEARLY_PLAN_ID) return res.status(500).json({ error: 'Yearly plan not configured yet. Try again in a moment.' });
      const subscription = await razorpay.subscriptions.create({
        plan_id: YEARLY_PLAN_ID,
        total_count: 10,
        quantity: 1,
        customer_notify: 1,
        notes: { userId: req.user.sub, email: req.user.email, plan: 'yearly' },
      });
      res.json({
        type: 'subscription',
        subscriptionId: subscription.id,
        keyId: RAZORPAY_KEY_ID,
        planName: 'NEXUS AI Pro - Yearly',
        plan: 'yearly',
        amount: PLAN_YEARLY_PRICE,
      });
    } else {
      return res.status(400).json({ error: 'Invalid plan. Choose monthly or yearly.' });
    }
  } catch (err) {
    console.error('Razorpay create error:', err.error || err.message || err);
    const errMsg = err.error?.description || err.message || 'Failed to create payment.';
    res.status(500).json({ error: errMsg });
  }
});

// Verify Payment
app.post('/api/payment/verify', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpay_subscription_id, plan } = req.body;

  // Signature differs for order vs subscription
  let signaturePayload;
  if ((plan === 'monthly' || plan === 'yearly') && razorpay_subscription_id) {
    signaturePayload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  } else {
    signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(signaturePayload)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed.' });
  }

  try {
    const now = new Date();

    if (plan === 'monthly' || plan === 'yearly') {
      const subEnd = new Date(now);
      if (plan === 'yearly') {
        subEnd.setFullYear(subEnd.getFullYear() + 1);
      } else {
        subEnd.setMonth(subEnd.getMonth() + 1);
      }

      await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { userId: req.user.sub },
        UpdateExpression: 'SET isPaid = :paid, paymentId = :pid, paymentPlan = :plan, paidAt = :now, razorpaySubscriptionId = :subId, subscriptionEnd = :subEnd, subscriptionStatus = :status',
        ExpressionAttributeValues: {
          ':paid': true, ':pid': razorpay_payment_id, ':plan': plan,
          ':now': now.toISOString(), ':subId': razorpay_subscription_id,
          ':subEnd': subEnd.toISOString(), ':status': 'active',
        },
      }));
    } else {
      // Legacy lifetime one-time payment
      await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { userId: req.user.sub },
        UpdateExpression: 'SET isPaid = :paid, paymentId = :pid, paymentPlan = :plan, paidAt = :now',
        ExpressionAttributeValues: {
          ':paid': true, ':pid': razorpay_payment_id,
          ':plan': 'lifetime', ':now': now.toISOString(),
        },
      }));
    }

    console.log('Payment verified:', req.user.email, plan, razorpay_payment_id);
    res.json({ success: true, message: 'Account activated!', isPaid: true, plan });
  } catch (err) {
    console.error('Activation error:', err);
    res.status(500).json({ error: 'Payment verified but activation failed. Contact support.' });
  }
});

// Cancel Subscription
app.post('/api/payment/cancel-subscription', verifyToken, async (req, res) => {
  try {
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
    const subId = dbResult.Item?.razorpaySubscriptionId;
    if (!subId) return res.status(400).json({ error: 'No active subscription found.' });

    await razorpay.subscriptions.cancel(subId, { cancel_at_cycle_end: true });

    await dynamoClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { userId: req.user.sub },
      UpdateExpression: 'SET subscriptionStatus = :status',
      ExpressionAttributeValues: { ':status': 'cancelling' },
    }));

    console.log('Subscription cancelling for', req.user.email);
    res.json({ success: true, message: 'Subscription will cancel at end of billing cycle.' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
});

// Upgrade Monthly to Yearly
const UPGRADE_PRICE = 250000; // Rs 2500 in paise
app.post('/api/payment/create-upgrade-order', verifyToken, async (req, res) => {
  try {
    // Verify user is currently monthly
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
    if (!dbResult.Item || dbResult.Item.paymentPlan !== 'monthly') {
      return res.status(400).json({ error: 'Upgrade is only available for monthly subscribers.' });
    }
    const receiptId = `nxs_upg_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: UPGRADE_PRICE,
      currency: 'INR',
      receipt: receiptId,
      notes: { userId: req.user.sub, email: req.user.email, type: 'upgrade_to_yearly' },
    });
    res.json({
      type: 'order',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Upgrade order error:', err.error || err.message || err);
    res.status(500).json({ error: 'Failed to create upgrade order.' });
  }
});

app.post('/api/payment/verify-upgrade', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed.' });
  }
  try {
    // 1. Cancel existing monthly subscription
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
    const oldSubId = dbResult.Item?.razorpaySubscriptionId;
    if (oldSubId) {
      try { await razorpay.subscriptions.cancel(oldSubId); } catch (e) { console.log('Old sub cancel:', e.message); }
    }
    // 2. Update DynamoDB to yearly (no subscription, just expiry-based)
    const now = new Date();
    const subEnd = new Date(now);
    subEnd.setFullYear(subEnd.getFullYear() + 1);
    await dynamoClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { userId: req.user.sub },
      UpdateExpression: 'SET isPaid = :paid, paymentId = :pid, paymentPlan = :plan, paidAt = :now, subscriptionEnd = :subEnd, subscriptionStatus = :status, upgradedFromMonthly = :upgraded, upgradePaymentId = :upgPid REMOVE razorpaySubscriptionId',
      ExpressionAttributeValues: {
        ':paid': true, ':pid': razorpay_payment_id, ':plan': 'yearly',
        ':now': now.toISOString(),
        ':subEnd': subEnd.toISOString(), ':status': 'active', ':upgraded': true, ':upgPid': razorpay_payment_id,
      },
    }));
    console.log('Upgrade verified:', req.user.email, 'monthly -> yearly', razorpay_payment_id);
    res.json({ success: true, message: 'Upgraded to Yearly!', isPaid: true, plan: 'yearly' });
  } catch (err) {
    console.error('Upgrade activation error:', err);
    res.status(500).json({ error: 'Payment verified but upgrade failed. Contact support.' });
  }
});

// ============================================
// CREDIT SYSTEM ENDPOINTS
// ============================================

// GET /api/credits - Check credit balance
app.get('/api/credits', verifyToken, async (req, res) => {
  try {
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
    const credits = dbResult.Item?.credits || 0;
    res.json({ credits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get credits' });
  }
});

// GET /api/credits/cost - Get credit cost for a model (supports dynamic params)
app.get('/api/credits/cost', (req, res) => {
  const { model, resolution, duration, seconds } = req.query;
  if (!model) return res.status(400).json({ error: 'model parameter required' });
  const params = {};
  if (resolution) params.resolution = resolution;
  if (duration) params.duration = duration;
  if (seconds) params.seconds = seconds;
  const credits = getCreditCost(model, params);
  res.json({ model, credits, params });
});

// GET /api/credits/costs - Get all credit costs (for frontend cache)
app.get('/api/credits/costs', (req, res) => {
  res.json({ costs: CREDIT_COSTS, default: DEFAULT_CREDIT_COST });
});

// POST /api/credits/deduct - Deduct credits for a generation (supports dynamic params)
app.post('/api/credits/deduct', verifyToken, async (req, res) => {
  const { modelId, resolution, duration, seconds } = req.body;
  if (!modelId) return res.status(400).json({ error: 'modelId required' });

  const params = {};
  if (resolution) params.resolution = resolution;
  if (duration) params.duration = duration;
  if (seconds) params.seconds = seconds;
  const cost = getCreditCost(modelId, params);

  try {
    // Atomic deduct: only succeeds if user has enough credits
    const result = await dynamoClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { userId: req.user.sub },
      UpdateExpression: 'SET credits = credits - :cost',
      ConditionExpression: 'credits >= :cost',
      ExpressionAttributeValues: { ':cost': cost },
      ReturnValues: 'ALL_NEW',
    }));
    res.json({ success: true, remaining: result.Attributes.credits, deducted: cost });
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      // Get current balance for error message
      const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
      const current = dbResult.Item?.credits || 0;
      return res.status(402).json({ error: 'Insufficient credits', required: cost, current });
    }
    res.status(500).json({ error: 'Failed to deduct credits' });
  }
});

// POST /api/credits/add - DISABLED (security: credits only added via verified purchase or webhook)
// Credits are added server-side only through:
//   1. POST /api/credits/verify (after Razorpay signature verification)
//   2. Webhook payment.captured (after Razorpay signature verification)
//   3. Refund logic in prediction endpoints (server-initiated only)
app.post('/api/credits/add', (req, res) => {
  res.status(403).json({ error: 'Direct credit addition is not permitted.' });
});

// POST /api/credits/purchase - Create Razorpay order for credit pack
app.post('/api/credits/purchase', verifyToken, async (req, res) => {
  const { packId } = req.body;
  const CREDIT_PACKS = {
    // ⚠️ TEST PRICES (₹1-₹4) - REVERT TO REAL PRICES BEFORE PRODUCTION
    starter:  { credits: 100,  price: 100,    name: 'Starter Pack - 100 Credits' },   // ₹1
    popular:  { credits: 500,  price: 200,    name: 'Popular Pack - 500 Credits' },   // ₹2
    pro:      { credits: 1500, price: 300,    name: 'Pro Pack - 1,500 Credits' },     // ₹3
    ultimate: { credits: 5000, price: 400,    name: 'Ultimate Pack - 5,000 Credits' }, // ₹4
    // REAL PRICES (uncomment for production):
    // starter:  { credits: 100,  price: 14900,  name: 'Starter Pack - 100 Credits' },
    // popular:  { credits: 500,  price: 49900,  name: 'Popular Pack - 500 Credits' },
    // pro:      { credits: 1500, price: 99900,  name: 'Pro Pack - 1,500 Credits' },
    // ultimate: { credits: 5000, price: 249900, name: 'Ultimate Pack - 5,000 Credits' },
  };

  const pack = CREDIT_PACKS[packId];
  if (!pack) return res.status(400).json({ error: 'Invalid pack' });

  try {
    const order = await razorpay.orders.create({
      amount: pack.price, // in paise
      currency: 'INR',
      receipt: `cr_${req.user.sub.slice(-8)}_${Date.now()}`,
      notes: {
        userId: req.user.sub,
        email: req.user.email,
        type: 'credit_purchase',
        packId,
        credits: String(pack.credits),
      },
    });
    res.json({ orderId: order.id, amount: pack.price, credits: pack.credits, name: pack.name, keyId: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Credit purchase error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/credits/verify - Verify credit purchase payment
app.post('/api/credits/verify', verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } = req.body;

  const CREDIT_PACKS = {
    starter:  { credits: 100 },
    popular:  { credits: 500 },
    pro:      { credits: 1500 },
    ultimate: { credits: 5000 },
  };

  const pack = CREDIT_PACKS[packId];
  if (!pack) return res.status(400).json({ error: 'Invalid pack' });

  // Verify signature
  const generated = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  try {
    // Add credits to user
    const result = await dynamoClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { userId: req.user.sub },
      UpdateExpression: 'SET credits = if_not_exists(credits, :zero) + :amount, isPaid = :paid',
      ExpressionAttributeValues: { ':amount': pack.credits, ':zero': 0, ':paid': true },
      ReturnValues: 'ALL_NEW',
    }));

    console.log(`Credits added: ${pack.credits} to user ${req.user.sub} (payment: ${razorpay_payment_id})`);
    res.json({ success: true, credits: result.Attributes.credits, added: pack.credits });
  } catch (err) {
    console.error('Credit verify error:', err);
    res.status(500).json({ error: 'Failed to add credits' });
  }
});

// ============================================
// REPLICATE API RELAY
// Supports TWO modes:
//   1. Developer Mode: User sends own API key via Authorization header
//   2. Credit Mode: No user API key → server uses its own key + deducts credits
// ============================================

// Middleware: Authenticate and determine mode (credit vs developer)
const requireAccess = async (req, res, next) => {
  const authToken = req.headers['x-auth-token'];
  if (!authToken) return res.status(401).json({ error: 'Authentication required' });

  try {
    const userInfo = await cognitoClient.send(new GetUserCommand({ AccessToken: authToken }));
    const sub = userInfo.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const email = userInfo.UserAttributes.find(a => a.Name === 'email')?.Value;
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));
    const userData = dbResult.Item || {};

    req.user = { sub, email };
    req.userData = userData;

    // Determine mode: if user sends Authorization header with Bearer token, it's developer mode
    const userApiKey = req.headers['authorization'];
    if (userApiKey && userApiKey.startsWith('Bearer ') && userApiKey !== `Bearer ${SERVER_REPLICATE_API_TOKEN}`) {
      // Developer mode: user has subscription + own API key
      if (!userData.isPaid) {
        return res.status(403).json({ error: 'Premium access required. Subscribe or use credits.' });
      }
      // Check subscription expiry
      if ((userData.paymentPlan === 'monthly' || userData.paymentPlan === 'yearly') && userData.subscriptionEnd) {
        const endDate = new Date(userData.subscriptionEnd);
        if (endDate < new Date() && userData.subscriptionStatus !== 'active') {
          return res.status(403).json({ error: 'Subscription expired. Please renew or use credits.' });
        }
      }
      req.mode = 'developer';
      req.replicateApiKey = userApiKey;
    } else {
      // Credit mode: server API key + credits
      if (!SERVER_REPLICATE_API_TOKEN) {
        return res.status(503).json({ error: 'Credit mode is not configured. Please use your own API key.' });
      }
      req.mode = 'credits';
      req.replicateApiKey = `Bearer ${SERVER_REPLICATE_API_TOKEN}`;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Legacy requirePaid middleware (for non-Replicate endpoints that still need subscription check)
const requirePaid = async (req, res, next) => {
  const authHeader = req.headers['x-auth-token'];
  if (!authHeader) return res.status(401).json({ error: 'Authentication required' });

  try {
    const userInfo = await cognitoClient.send(new GetUserCommand({ AccessToken: authHeader }));
    const sub = userInfo.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));

    if (!dbResult.Item || !dbResult.Item.isPaid) {
      return res.status(403).json({ error: 'Premium access required.' });
    }

    if (dbResult.Item.paymentPlan === 'monthly' && dbResult.Item.subscriptionEnd) {
      const endDate = new Date(dbResult.Item.subscriptionEnd);
      if (endDate < new Date() && dbResult.Item.subscriptionStatus !== 'active') {
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE, Key: { userId: sub },
          UpdateExpression: 'SET isPaid = :paid',
          ExpressionAttributeValues: { ':paid': false },
        }));
        return res.status(403).json({ error: 'Subscription expired. Please renew.' });
      }
    }

    req.user = { sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============================================
// REPLICATE FILE UPLOAD (for video/audio → URL)
// ============================================
app.post('/api/replicate/upload', requireAccess, async (req, res) => {
  try {
    const apiKey = req.replicateApiKey;
    const { data, content_type, filename } = req.body;
    if (!data) return res.status(400).json({ error: 'No file data provided' });

    // Strip data URI prefix to get raw base64
    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64, 'base64');

    // Determine filename with correct extension
    const extMap = {
      'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
      'audio/mpeg': '.mp3', 'audio/mp3': '.mp3', 'audio/wav': '.wav',
      'audio/ogg': '.ogg', 'audio/mp4': '.m4a', 'audio/m4a': '.m4a',
      'audio/aac': '.aac', 'audio/webm': '.webm', 'audio/flac': '.flac',
      'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp',
    };
    const ext = extMap[content_type] || '';
    const uploadFilename = filename || `upload_${Date.now()}${ext}`;
    const mime = content_type || 'application/octet-stream';

    console.log('>>> Uploading to Replicate Files:', uploadFilename, mime, buffer.length, 'bytes');

    // Method: Use Replicate's upload URL approach (serves with correct Content-Type)
    // Step 1: Create an upload URL
    const createUrlRes = await fetch('https://api.replicate.com/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: uploadFilename,
        content_type: mime,
      }),
    });

    if (createUrlRes.ok) {
      const urlData = await createUrlRes.json();
      console.log('>>> Got upload URL, uploading via PUT...');

      // Step 2: PUT the file to the upload URL
      const putRes = await fetch(urlData.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': mime },
        body: buffer,
      });

      if (putRes.ok || putRes.status === 200 || putRes.status === 201) {
        console.log('>>> File uploaded via URL method. Serving URL:', urlData.serving_url);
        return res.json({ url: urlData.serving_url, id: urlData.id, content_type: mime });
      }
      console.log('>>> PUT upload failed:', putRes.status, ', falling back to multipart...');
    } else {
      console.log('>>> Upload URL method not available, falling back to multipart...');
    }

    // Fallback: multipart/form-data upload (may serve as application/octet-stream)
    const boundary = `----ReplicateUpload${Date.now()}`;
    const CRLF = '\r\n';
    const headerPart = `--${boundary}${CRLF}Content-Disposition: form-data; name="content"; filename="${uploadFilename}"${CRLF}Content-Type: ${mime}${CRLF}${CRLF}`;
    const footerPart = `${CRLF}--${boundary}--${CRLF}`;
    const headerBuf = Buffer.from(headerPart, 'utf-8');
    const footerBuf = Buffer.from(footerPart, 'utf-8');
    const multipartBody = Buffer.concat([headerBuf, buffer, footerBuf]);

    let createRes = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    // Fallback: raw binary with Content-Disposition (older API format)
    if (!createRes.ok) {
      console.log('>>> Multipart upload failed, trying raw binary fallback...');
      createRes = await fetch('https://api.replicate.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': mime,
          'Content-Disposition': `inline; filename="${uploadFilename}"`,
        },
        body: buffer,
      });
    }

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      console.error('Replicate upload error:', createRes.status, errData);
      return res.status(createRes.status).json({ error: errData.detail || errData.error || `Upload failed (${createRes.status})` });
    }

    const fileData = await createRes.json();
    console.log('>>> Replicate file uploaded:', fileData.id, 'content_type:', fileData.content_type, 'url:', fileData.urls?.get);
    // Return both the API URL and the file ID for models that need proper Content-Type
    res.json({ url: fileData.urls?.get, id: fileData.id, content_type: fileData.content_type });
  } catch (err) {
    console.error('File upload error:', err.message);
    res.status(502).json({ error: 'Failed to upload file: ' + err.message });
  }
});

// Upload file to temp storage with correct Content-Type (for models like Runway that validate headers)
app.post('/api/upload-temp', requireAccess, async (req, res) => {
  try {
    const { data, content_type } = req.body;
    if (!data) return res.status(400).json({ error: 'No file data provided' });

    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64, 'base64');

    const extMap = {
      'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
      'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp',
    };
    const ext = extMap[content_type] || '';
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(TEMP_UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, buffer);
    console.log('>>> Temp file saved:', filename, content_type, buffer.length, 'bytes');

    // Build public URL - must be externally accessible for models like Runway
    const PUBLIC_HOST = process.env.PUBLIC_HOST || 'https://test.nexus-ai-pro.com';
    const publicUrl = `${PUBLIC_HOST}/tmp-uploads/${filename}`;

    res.json({ url: publicUrl, filename });
  } catch (err) {
    console.error('Temp upload error:', err.message);
    res.status(500).json({ error: 'Failed to save temp file: ' + err.message });
  }
});

// ============================================
// CREATE PREDICTION (supports credit + developer mode)
// ============================================
app.post('/api/replicate/predictions', requireAccess, async (req, res) => {
  try {
    const { model, version, input, _model, _creditParams } = req.body;
    const modelId = model || _model;

    // ── CREDIT MODE: deduct credits BEFORE making the prediction ──
    if (req.mode === 'credits') {
      // Extract resolution/duration from either _creditParams or input
      const creditParams = _creditParams || {};
      if (!creditParams.resolution && input?.resolution) creditParams.resolution = input.resolution;
      if (!creditParams.duration && input?.duration) creditParams.duration = input.duration;
      if (!creditParams.seconds && input?.seconds) creditParams.seconds = input.seconds;
      // Crystal upscaler: use scale_factor or scale as resolution key
      if (!creditParams.resolution && (input?.scale_factor || input?.scale)) {
        creditParams.resolution = String(input.scale_factor || input.scale);
      }
      // For num_frames → approximate duration (at model fps, default 16)
      if (!creditParams.duration && input?.num_frames) {
        const frames = parseInt(input.num_frames);
        const fps = parseInt(input?.fps || 16);
        creditParams.duration = String(Math.round(frames / fps));
      }

      const cost = getCreditCost(modelId, creditParams);
      console.log(`>>> Credit mode: model=${modelId}, params=${JSON.stringify(creditParams)}, cost=${cost} credits`);

      // Atomic deduct
      try {
        const deductResult = await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId: req.user.sub },
          UpdateExpression: 'SET credits = credits - :cost',
          ConditionExpression: 'credits >= :cost',
          ExpressionAttributeValues: { ':cost': cost },
          ReturnValues: 'ALL_NEW',
        }));
        console.log(`>>> Credits deducted: ${cost}, remaining: ${deductResult.Attributes.credits}`);
      } catch (deductErr) {
        if (deductErr.name === 'ConditionalCheckFailedException') {
          const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
          const current = dbResult.Item?.credits || 0;
          return res.status(402).json({
            error: 'Insufficient credits',
            required: cost,
            current,
            model: modelId,
          });
        }
        throw deductErr;
      }
    }

    // ── MAKE THE PREDICTION (both modes) ──
    const apiKey = req.replicateApiKey;
    let url, body;
    const versionHash = version || (modelId && modelId.includes(':') ? modelId.split(':')[1] : null);
    if (versionHash) {
      url = 'https://api.replicate.com/v1/predictions';
      body = { version: versionHash, input };
    } else {
      url = `https://api.replicate.com/v1/models/${modelId}/predictions`;
      body = { input };
    }

    console.log(`>>> Replicate POST (${req.mode} mode):`, url);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify(body),
    });
    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await resp.text();
      console.error('>>> Replicate non-JSON response:', resp.status, text.slice(0, 200));

      // If credit mode and prediction failed at API level, refund credits
      if (req.mode === 'credits') {
        const creditParams = _creditParams || {};
        if (!creditParams.resolution && input?.resolution) creditParams.resolution = input.resolution;
        if (!creditParams.duration && input?.duration) creditParams.duration = input.duration;
        if (!creditParams.seconds && input?.seconds) creditParams.seconds = input.seconds;
        if (!creditParams.resolution && (input?.scale_factor || input?.scale)) creditParams.resolution = String(input.scale_factor || input.scale);
        if (!creditParams.duration && input?.num_frames) { creditParams.duration = String(Math.round(parseInt(input.num_frames) / parseInt(input?.fps || 16))); }
        const cost = getCreditCost(modelId, creditParams);
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId: req.user.sub },
          UpdateExpression: 'SET credits = if_not_exists(credits, :zero) + :amount',
          ExpressionAttributeValues: { ':amount': cost, ':zero': 0 },
        }));
        console.log(`>>> Credits refunded: ${cost} (API error)`);
      }

      return res.status(resp.status).json({ error: `Replicate returned non-JSON (${resp.status}). Model may not exist or URL is wrong.` });
    }
    const data = await resp.json();
    console.log('>>> Replicate status:', resp.status, data.id || data.detail || data.error || '');

    // If prediction creation failed (4xx/5xx), refund credits
    if (req.mode === 'credits' && resp.status >= 400) {
      const creditParams = _creditParams || {};
      if (!creditParams.resolution && input?.resolution) creditParams.resolution = input.resolution;
      if (!creditParams.duration && input?.duration) creditParams.duration = input.duration;
      if (!creditParams.seconds && input?.seconds) creditParams.seconds = input.seconds;
      if (!creditParams.resolution && (input?.scale_factor || input?.scale)) creditParams.resolution = String(input.scale_factor || input.scale);
      if (!creditParams.duration && input?.num_frames) { creditParams.duration = String(Math.round(parseInt(input.num_frames) / parseInt(input?.fps || 16))); }
      const cost = getCreditCost(modelId, creditParams);
      await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { userId: req.user.sub },
        UpdateExpression: 'SET credits = if_not_exists(credits, :zero) + :amount',
        ExpressionAttributeValues: { ':amount': cost, ':zero': 0 },
      }));
      console.log(`>>> Credits refunded: ${cost} (prediction creation failed: ${resp.status})`);
    }

    // Add remaining credits to response for frontend to update UI
    if (req.mode === 'credits' && resp.status < 400) {
      const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
      data._remainingCredits = dbResult.Item?.credits || 0;
    }

    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate create error:', err.message);
    res.status(502).json({ error: 'Failed to reach Replicate API: ' + err.message });
  }
});

// Poll prediction status
app.get('/api/replicate/predictions/:id', requireAccess, async (req, res) => {
  try {
    const apiKey = req.replicateApiKey;
    const resp = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { 'Authorization': apiKey },
    });
    const data = await resp.json();
    // Log failed predictions to help debug model issues
    if (data.status === 'failed') {
      console.error('>>> Prediction FAILED:', req.params.id, 'error:', JSON.stringify(data.error).slice(0, 500));
      if (data.input?.video) console.log('>>> Failed prediction video URL:', typeof data.input.video === 'string' ? data.input.video.slice(0, 200) : 'not-string');

      // Refund credits if prediction failed during processing
      if (req.mode === 'credits' && data.model) {
        const cost = getCreditCost(data.model, {
          resolution: data.input?.resolution,
          duration: data.input?.duration,
          seconds: data.input?.seconds,
        });
        await dynamoClient.send(new UpdateCommand({
          TableName: DYNAMO_TABLE,
          Key: { userId: req.user.sub },
          UpdateExpression: 'SET credits = if_not_exists(credits, :zero) + :amount',
          ExpressionAttributeValues: { ':amount': cost, ':zero': 0 },
        }));
        console.log(`>>> Credits refunded: ${cost} (prediction failed during processing)`);
        data._creditsRefunded = cost;
      }
    }

    // Add remaining credits to poll response for frontend
    if (req.mode === 'credits') {
      const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: req.user.sub } }));
      data._remainingCredits = dbResult.Item?.credits || 0;
    }

    res.json(data);
  } catch (err) {
    console.error('Replicate poll error:', err.message);
    res.status(502).json({ error: 'Failed to poll prediction: ' + err.message });
  }
});

// ============================================
// TRAINED MODELS (DynamoDB persistence)
// ============================================

// Get user's trained models
app.get('/api/trained-models', verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers['x-auth-token'];
    const userInfo = await cognitoClient.send(new GetUserCommand({ AccessToken: authHeader }));
    const sub = userInfo.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));
    res.json({ models: dbResult.Item?.trainedModels || [] });
  } catch (err) {
    console.error('Get trained models error:', err.message);
    res.status(500).json({ error: 'Failed to get trained models' });
  }
});

// Save a trained model
app.post('/api/trained-models', verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers['x-auth-token'];
    const userInfo = await cognitoClient.send(new GetUserCommand({ AccessToken: authHeader }));
    const sub = userInfo.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const { name, trigger, version, trainedAt } = req.body;
    if (!name || !trigger) return res.status(400).json({ error: 'Name and trigger required' });

    // Get existing models, append new one
    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));
    const existing = dbResult.Item?.trainedModels || [];
    // Avoid duplicates by name
    const filtered = existing.filter(m => m.name !== name);
    const updated = [{ name, trigger, version, trainedAt: trainedAt || new Date().toISOString() }, ...filtered];

    await dynamoClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { userId: sub },
      UpdateExpression: 'SET trainedModels = :models',
      ExpressionAttributeValues: { ':models': updated },
    }));
    console.log('Trained model saved for', sub, ':', name);
    res.json({ success: true, models: updated });
  } catch (err) {
    console.error('Save trained model error:', err.message);
    res.status(500).json({ error: 'Failed to save trained model' });
  }
});

// Delete a trained model
app.delete('/api/trained-models/:name', verifyToken, async (req, res) => {
  try {
    const authHeader = req.headers['x-auth-token'];
    const userInfo = await cognitoClient.send(new GetUserCommand({ AccessToken: authHeader }));
    const sub = userInfo.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const modelName = decodeURIComponent(req.params.name);

    const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));
    const existing = dbResult.Item?.trainedModels || [];
    const updated = existing.filter(m => m.name !== modelName);

    await dynamoClient.send(new UpdateCommand({
      TableName: DYNAMO_TABLE,
      Key: { userId: sub },
      UpdateExpression: 'SET trainedModels = :models',
      ExpressionAttributeValues: { ':models': updated },
    }));
    console.log('Trained model deleted for', sub, ':', modelName);
    res.json({ success: true, models: updated });
  } catch (err) {
    console.error('Delete trained model error:', err.message);
    res.status(500).json({ error: 'Failed to delete trained model' });
  }
});


// ============================================
// CREDIT-MODE TRAINING API
// ============================================

// POST /api/credits/train - Start training using server key + credits
app.post('/api/credits/train', verifyToken, async (req, res) => {
  try {
    const sub = req.user.sub;
    const { modelName, triggerWord, training_steps, zipData } = req.body;

    if (!modelName || !triggerWord) {
      return res.status(400).json({ error: 'Missing required fields: modelName, triggerWord' });
    }
    if (!zipData) {
      return res.status(400).json({ error: 'Missing training images (zipData)' });
    }
    if (!SERVER_REPLICATE_API_TOKEN) {
      return res.status(503).json({ error: 'Credit mode training is not available.' });
    }

    // 1. Deduct credits atomically (500 cr)
    const TRAIN_COST = getCreditCost('replicate/fast-flux-trainer');
    let remainingCredits;
    try {
      const deductResult = await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { userId: sub },
        UpdateExpression: 'SET credits = credits - :cost',
        ConditionExpression: 'credits >= :cost',
        ExpressionAttributeValues: { ':cost': TRAIN_COST },
        ReturnValues: 'ALL_NEW',
      }));
      remainingCredits = deductResult.Attributes?.credits ?? 0;
      console.log(`[CreditTrain] Deducted ${TRAIN_COST} credits from ${sub}. Remaining: ${remainingCredits}`);
    } catch (deductErr) {
      if (deductErr.name === 'ConditionalCheckFailedException') {
        const dbResult = await dynamoClient.send(new GetCommand({ TableName: DYNAMO_TABLE, Key: { userId: sub } }));
        return res.status(402).json({
          error: `Insufficient credits. Training requires ${TRAIN_COST} credits.`,
          required: TRAIN_COST,
          current: dbResult.Item?.credits || 0,
        });
      }
      throw deductErr;
    }

    // Helper to refund credits on failure
    const refund = async () => {
      await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE, Key: { userId: sub },
        UpdateExpression: 'SET credits = credits + :cost',
        ExpressionAttributeValues: { ':cost': TRAIN_COST },
      }));
      console.log(`[CreditTrain] Refunded ${TRAIN_COST} credits to ${sub}`);
    };

    const serverKey = `Bearer ${SERVER_REPLICATE_API_TOKEN}`;

    // 2. Get server's Replicate username
    const acctResp = await fetch('https://api.replicate.com/v1/account', {
      headers: { 'Authorization': serverKey },
    });
    if (!acctResp.ok) {
      await refund();
      return res.status(502).json({ error: 'Failed to get server account info' });
    }
    const acctData = await acctResp.json();
    const serverUsername = acctData.username;

    // 3. Create unique model slug: user-hash + modelName
    const userHash = sub.replace(/-/g, '').substring(0, 8);
    const slug = `${userHash}-${modelName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')}`;
    const destination = `${serverUsername}/${slug}`;

    // 4. Create model on our account
    const modelResp = await fetch('https://api.replicate.com/v1/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': serverKey },
      body: JSON.stringify({
        owner: serverUsername, name: slug, visibility: 'private',
        hardware: 'gpu-t4',
        description: `NEXUS AI Pro trained LoRA - user ${userHash}`,
      }),
    });
    if (!modelResp.ok && modelResp.status !== 409) {
      const modelErr = await modelResp.json().catch(() => ({}));
      await refund();
      return res.status(502).json({ error: modelErr.detail || 'Failed to create model' });
    }
    console.log(`[CreditTrain] Model destination: ${destination}`);

    // 5. Upload training images zip
    const base64 = zipData.includes(',') ? zipData.split(',')[1] : zipData;
    const buffer = Buffer.from(base64, 'base64');

    const createUrlRes = await fetch('https://api.replicate.com/v1/files/upload', {
      method: 'POST',
      headers: { 'Authorization': serverKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'training_images.zip', content_type: 'application/zip' }),
    });
    if (!createUrlRes.ok) {
      await refund();
      return res.status(502).json({ error: 'Failed to create upload URL' });
    }
    const createUrlData = await createUrlRes.json();

    const putResp = await fetch(createUrlData.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/zip' },
      body: buffer,
    });
    if (!putResp.ok) {
      await refund();
      return res.status(502).json({ error: 'Failed to upload training images' });
    }
    const imageUrl = createUrlData.serving_url || createUrlData.urls?.get;
    console.log(`[CreditTrain] Images uploaded: ${imageUrl}`);

    // 6. Start training
    const trainUrl = 'https://api.replicate.com/v1/models/replicate/fast-flux-trainer/versions/f463fbfc97389e10a2f443a8a84b6953b1058eafbf0c9af4d84457ff07cb04db/trainings';
    const trainResp = await fetch(trainUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': serverKey },
      body: JSON.stringify({
        input: {
          input_images: imageUrl,
          trigger_word: triggerWord.trim(),
          training_steps: training_steps || 1000,
        },
        destination,
      }),
    });
    const trainData = await trainResp.json();
    if (!trainResp.ok) {
      await refund();
      return res.status(502).json({ error: trainData.detail || 'Failed to start training' });
    }

    console.log(`[CreditTrain] Training started: ${trainData.id} for ${sub}`);
    res.json({
      id: trainData.id,
      status: trainData.status,
      destination,
      credits: remainingCredits,
      cost: TRAIN_COST,
    });
  } catch (err) {
    console.error('[CreditTrain] Error:', err.message);
    res.status(500).json({ error: 'Training failed: ' + err.message });
  }
});

// GET /api/credits/train/:id - Poll training status (uses server key)
app.get('/api/credits/train/:id', verifyToken, async (req, res) => {
  try {
    if (!SERVER_REPLICATE_API_TOKEN) {
      return res.status(503).json({ error: 'Credit mode not available' });
    }
    const resp = await fetch(`https://api.replicate.com/v1/trainings/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${SERVER_REPLICATE_API_TOKEN}` },
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to poll training' });
  }
});

// POST /api/credits/train/:id/cancel - Cancel training + refund credits
app.post('/api/credits/train/:id/cancel', verifyToken, async (req, res) => {
  try {
    if (!SERVER_REPLICATE_API_TOKEN) {
      return res.status(503).json({ error: 'Credit mode not available' });
    }
    const resp = await fetch(`https://api.replicate.com/v1/trainings/${req.params.id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SERVER_REPLICATE_API_TOKEN}` },
    });
    const data = await resp.json();
    if (resp.ok) {
      const TRAIN_COST = getCreditCost('replicate/fast-flux-trainer');
      const refundResult = await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { userId: req.user.sub },
        UpdateExpression: 'SET credits = credits + :cost',
        ExpressionAttributeValues: { ':cost': TRAIN_COST },
        ReturnValues: 'ALL_NEW',
      }));
      console.log(`[CreditTrain] Cancelled & refunded ${TRAIN_COST} credits for ${req.user.sub}`);
      data._creditsRefunded = TRAIN_COST;
      data._remainingCredits = refundResult.Attributes?.credits ?? 0;
    }
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to cancel training' });
  }
});

// ============================================
// REPLICATE TRAINING API
// ============================================

// Start a LoRA training
app.post('/api/replicate/trainings', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const { input, destination } = req.body;

    // Use replicate/fast-flux-trainer
    const url = 'https://api.replicate.com/v1/models/replicate/fast-flux-trainer/versions/f463fbfc97389e10a2f443a8a84b6953b1058eafbf0c9af4d84457ff07cb04db/trainings';
    const body = { input, destination };

    console.log('>>> Replicate Training POST:', url, 'destination:', destination);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    console.log('>>> Replicate training status:', resp.status, data.id || data.detail || data.error || '');
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate training error:', err.message);
    res.status(502).json({ error: 'Failed to start training: ' + err.message });
  }
});

// Poll training status
app.get('/api/replicate/trainings/:id', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const resp = await fetch(`https://api.replicate.com/v1/trainings/${req.params.id}`, {
      headers: { 'Authorization': apiKey },
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate training poll error:', err.message);
    res.status(502).json({ error: 'Failed to poll training: ' + err.message });
  }
});

// Cancel training
app.post('/api/replicate/trainings/:id/cancel', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const resp = await fetch(`https://api.replicate.com/v1/trainings/${req.params.id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': apiKey },
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate training cancel error:', err.message);
    res.status(502).json({ error: 'Failed to cancel training: ' + err.message });
  }
});

// Create a model (needed as training destination)
app.post('/api/replicate/models', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const { owner, name, visibility, hardware, description } = req.body;

    const resp = await fetch('https://api.replicate.com/v1/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify({ owner, name, visibility: visibility || 'private', hardware: hardware || 'gpu-t4', description: description || 'NEXUS AI Pro trained LoRA model' }),
    });
    const data = await resp.json();
    console.log('>>> Replicate model created:', resp.status, data.url || data.detail || '');
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate model create error:', err.message);
    res.status(502).json({ error: 'Failed to create model: ' + err.message });
  }
});

// Get Replicate account info (to get username)
app.get('/api/replicate/account', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const resp = await fetch('https://api.replicate.com/v1/account', {
      headers: { 'Authorization': apiKey },
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate account error:', err.message);
    res.status(502).json({ error: 'Failed to get account info: ' + err.message });
  }
});

// ============================================
// STATIC FILES (PWA)
// ============================================
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// Increase max header size for Node HTTP server (Cognito JWTs + Chrome headers can exceed 16KB default)
const http = require('http');
const server = http.createServer({ maxHeaderSize: 65536 }, app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
======================================================
  NEXUS AI Pro v4.0 (SaaS Mode + Credits)
  App:     http://localhost:${PORT}
  Auth:    AWS Cognito + DynamoDB
  Payment: Razorpay (Subscription + Credit Packs)
  Modes:   Developer (own API key) | Credits (server key)
  Models:  ${Object.keys(CREDIT_COSTS).length} models with dynamic pricing
======================================================
  `);
});

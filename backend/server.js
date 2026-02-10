const express = require('express');
const path = require('path');
const cors = require('cors');
const { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, GetUserCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 3000;

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
const PLAN_LIFETIME_PRICE = 500; // Rs 5 in paise (TEST - change to 299900 for production)
const PLAN_MONTHLY_PRICE = 100;   // Rs 1 in paise (TEST - change to 49900 for production)

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

    // --- One-time payment captured (lifetime) ---
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
    }

    // --- Subscription charged (monthly renewal success) ---
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
      userData = { userId: sub, email: userEmail, isPaid: false, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() };
      await dynamoClient.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: userData }));
    } else {
      // Check monthly subscription expiry
      if (userData.paymentPlan === 'monthly' && userData.subscriptionEnd) {
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
      user: { sub, email: userEmail, isPaid: userData.isPaid || false, paymentPlan: userData.paymentPlan || null, subscriptionStatus: userData.subscriptionStatus || null }
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
    if (userData.paymentPlan === 'monthly' && userData.subscriptionEnd) {
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
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// ============================================
// RAZORPAY PAYMENT ROUTES
// ============================================

// Auto-create monthly plan on startup
let MONTHLY_PLAN_ID = process.env.RAZORPAY_MONTHLY_PLAN_ID || null;

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
    console.error('Failed to setup Razorpay plan:', err.message);
  }
})();

// Create Order (lifetime) or Subscription (monthly)
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
    } else {
      const receiptId = `nxs_${Date.now()}`;
      const order = await razorpay.orders.create({
        amount: PLAN_LIFETIME_PRICE,
        currency: 'INR',
        receipt: receiptId,
        notes: { userId: req.user.sub, email: req.user.email, plan: 'lifetime' },
      });

      res.json({
        type: 'order',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
        planName: 'NEXUS AI Pro - Lifetime',
        plan: 'lifetime',
      });
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
  if (plan === 'monthly' && razorpay_subscription_id) {
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

    if (plan === 'monthly') {
      const subEnd = new Date(now);
      subEnd.setMonth(subEnd.getMonth() + 1);

      await dynamoClient.send(new UpdateCommand({
        TableName: DYNAMO_TABLE,
        Key: { userId: req.user.sub },
        UpdateExpression: 'SET isPaid = :paid, paymentId = :pid, paymentPlan = :plan, paidAt = :now, razorpaySubscriptionId = :subId, subscriptionEnd = :subEnd, subscriptionStatus = :status',
        ExpressionAttributeValues: {
          ':paid': true, ':pid': razorpay_payment_id, ':plan': 'monthly',
          ':now': now.toISOString(), ':subId': razorpay_subscription_id,
          ':subEnd': subEnd.toISOString(), ':status': 'active',
        },
      }));
    } else {
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

// ============================================
// REPLICATE API RELAY (paid users only)
// ============================================
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

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============================================
// REPLICATE FILE UPLOAD (for video/audio → URL)
// ============================================
app.post('/api/replicate/upload', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const { data, content_type, filename } = req.body;
    if (!data) return res.status(400).json({ error: 'No file data provided' });

    // Strip data URI prefix to get raw base64
    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64, 'base64');

    // Determine filename with correct extension
    const extMap = {
      'video/mp4': '.mp4', 'video/webm': '.webm', 'audio/mpeg': '.mp3',
      'audio/mp3': '.mp3', 'audio/wav': '.wav', 'audio/ogg': '.ogg',
      'audio/mp4': '.m4a', 'audio/m4a': '.m4a', 'audio/aac': '.aac',
      'audio/webm': '.webm', 'audio/flac': '.flac', 'image/png': '.png',
      'image/jpeg': '.jpg', 'image/webp': '.webp',
    };
    const ext = extMap[content_type] || '';
    const uploadFilename = filename || `upload_${Date.now()}${ext}`;
    const mime = content_type || 'application/octet-stream';

    console.log('>>> Uploading to Replicate Files:', uploadFilename, mime, buffer.length, 'bytes');
    const createRes = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': mime,
        'Content-Disposition': `inline; filename="${uploadFilename}"`,
      },
      body: buffer,
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      console.error('Replicate upload error:', createRes.status, errData);
      return res.status(createRes.status).json({ error: errData.detail || errData.error || `Upload failed (${createRes.status})` });
    }

    const fileData = await createRes.json();
    console.log('>>> Replicate file uploaded:', fileData.id, 'content_type:', fileData.content_type, 'url:', fileData.urls?.get);
    res.json({ url: fileData.urls?.get, id: fileData.id, content_type: fileData.content_type });
  } catch (err) {
    console.error('File upload error:', err.message);
    res.status(502).json({ error: 'Failed to upload file: ' + err.message });
  }
});

// Create prediction
app.post('/api/replicate/predictions', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const { model, version, input, _model } = req.body;

    let url, body;
    if (version) {
      // Version-based: POST /v1/predictions with version hash
      url = 'https://api.replicate.com/v1/predictions';
      body = { version, input };
    } else {
      // Model-based: POST /v1/models/{owner}/{name}/predictions
      const modelId = model || _model;
      url = `https://api.replicate.com/v1/models/${modelId}/predictions`;
      body = { input };
    }

    console.log('>>> Replicate POST:', url);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify(body),
    });
    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await resp.text();
      console.error('>>> Replicate non-JSON response:', resp.status, text.slice(0, 200));
      return res.status(resp.status).json({ error: `Replicate returned non-JSON (${resp.status}). Model may not exist or URL is wrong.` });
    }
    const data = await resp.json();
    console.log('>>> Replicate status:', resp.status, data.id || data.detail || data.error || '');
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate create error:', err.message);
    res.status(502).json({ error: 'Failed to reach Replicate API: ' + err.message });
  }
});

// Poll prediction status
app.get('/api/replicate/predictions/:id', requirePaid, async (req, res) => {
  try {
    const apiKey = req.headers['authorization'];
    const resp = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { 'Authorization': apiKey },
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error('Replicate poll error:', err.message);
    res.status(502).json({ error: 'Failed to poll prediction: ' + err.message });
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
  NEXUS AI Pro v4.0 (SaaS Mode)
  App:     http://localhost:${PORT}
  Auth:    AWS Cognito + DynamoDB
  Payment: Razorpay (Lifetime + Monthly Subscription)
  API:     Paid users provide their own Replicate key
======================================================
  `);
});

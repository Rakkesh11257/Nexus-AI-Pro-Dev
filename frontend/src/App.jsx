import React, { useState, useEffect } from 'react';

const API_BASE = window.location.origin;

// ─── Model Configs ───
const IMAGE_MODELS = [
  { id: 'black-forest-labs/flux-schnell', name: 'FLUX Schnell', desc: 'Fast (~2s)', maxSteps: 4, nsfw: false },
  { id: 'black-forest-labs/flux-dev', name: 'FLUX Dev', desc: 'High quality (~10s)', maxSteps: 50, nsfw: false },
  { id: 'black-forest-labs/flux-1.1-pro', name: 'FLUX 1.1 Pro', desc: 'Best quality (~15s)', maxSteps: 50, nsfw: false },
  { id: 'black-forest-labs/flux-1.1-pro-ultra', name: 'FLUX 1.1 Pro Ultra', desc: 'Ultra HD (~20s)', maxSteps: 50, nsfw: false },
  { id: 'google/nano-banana-pro', name: 'Google Nano Banana Pro', desc: 'Google T2I', maxSteps: 50, nsfw: false },
  { id: 'prunaai/flux-fast', name: 'FLUX Fast (Pruna)', desc: 'Speed optimized (~4s)', maxSteps: 28, nsfw: false },
  { id: 'prunaai/wan-2.2-image', name: 'Wan 2.2 Image', desc: 'Wan T2I model', maxSteps: 50, nsfw: true },
  { id: 'ideogram-ai/ideogram-v3-quality', name: 'Ideogram V3 Quality', desc: 'Best text rendering', maxSteps: 50, nsfw: false },
  { id: 'stability-ai/stable-diffusion-3.5-large', name: 'SD 3.5 Large', desc: 'Stability AI latest', maxSteps: 50, nsfw: false },
  { id: 'bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe', name: 'SDXL Lightning 4-Step', desc: 'Ultra fast SDXL (~2s)', maxSteps: 10, nsfw: true, useVersion: true },
  { id: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc', name: 'SDXL 1.0', desc: 'Stable Diffusion XL', maxSteps: 50, nsfw: true, useVersion: true },
];
const I2I_MODELS = [
  { id: 'qwen/qwen-image', name: 'Qwen Image', desc: 'LoRA + img2img', nsfw: false },
  { id: 'google/nano-banana-pro', name: 'Google Nano Banana Pro', desc: 'Google img2img', nsfw: false },
  { id: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4', name: 'Stable Diffusion 1.5', desc: 'Classic img2img', nsfw: false, useVersion: true },
  { id: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc', name: 'SDXL 1.0', desc: 'SDXL img2img', nsfw: false, useVersion: true },
];
// I2V models with per-model config
const I2V_MODELS = [
  { id: 'wan-video/wan-2.2-i2v-fast', name: 'Wan 2.2 I2V Fast', desc: '$0.05-0.145/vid', nsfw: true, price: '$0.05-0.145',
    params: { prompt: true, last_frame: true, num_frames: { min: 81, max: 121, default: 81 }, resolution: ['480p','720p'], fps: { min: 5, max: 30, default: 16 }, go_fast: true, sample_shift: { min: 1, max: 10, default: 8 }, seed: true, interpolate_output: true, disable_safety_checker: true, lora: true } },
  { id: 'wavespeedai/wan-2.1-i2v-720p', name: 'Wan 2.1 I2V 720p', desc: 'Wavespeed NSFW', nsfw: true,
    params: { prompt: true, last_frame: true, num_frames: { min: 81, max: 121, default: 81 }, resolution: ['480p','720p'], fps: { min: 5, max: 30, default: 16 }, go_fast: true, sample_shift: { min: 1, max: 10, default: 8 }, seed: true, interpolate_output: true, disable_safety_checker: true, lora: true } },
  { id: 'wan-video/wan-2.5-i2v', name: 'Wan 2.5 I2V', desc: 'HD + audio', nsfw: false,
    params: { prompt: true, duration: [5,10], resolution: ['720p','1080p'], negative_prompt: true, enable_prompt_expansion: true, seed: true } },
  { id: 'wan-video/wan-2.5-i2v-fast', name: 'Wan 2.5 I2V Fast', desc: 'Fast + audio', nsfw: false,
    params: { prompt: true, duration: [5,10], resolution: ['720p','1080p'], negative_prompt: true, enable_prompt_expansion: true, seed: true } },
  { id: 'google/veo-3.1-fast', name: 'Google Veo 3.1 Fast', desc: '$0.10-0.15/sec', nsfw: false, price: '$0.10-0.15/s',
    params: { prompt: true, duration: [4,6,8], resolution: ['720p','1080p'], aspect_ratio: ['16:9','9:16'], generate_audio: true, first_frame: true, last_frame: true, negative_prompt: true, seed: true } },
  { id: 'kwaivgi/kling-v2.5-turbo-pro', name: 'Kling V2.5 Turbo Pro', desc: '$0.07/sec', nsfw: false, price: '$0.07/s',
    params: { prompt: true, duration: [5,10], aspect_ratio: ['16:9','9:16','1:1'], negative_prompt: true, first_frame: true, last_frame: true } },
];
// T2V models with per-model config
const T2V_MODELS = [
  { id: 'wan-video/wan-2.2-t2v-fast', name: 'Wan 2.2 T2V Fast', desc: '$0.05-0.145/vid', nsfw: true, price: '$0.05-0.145',
    params: { num_frames: { min: 81, max: 121, default: 81 }, resolution: ['480p','720p'], aspect_ratio: ['16:9','9:16'], fps: { min: 5, max: 30, default: 16 }, go_fast: true, sample_shift: { min: 1, max: 10, default: 8 }, seed: true, interpolate_output: true, disable_safety_checker: true, lora: true, optimize_prompt: true } },
  { id: 'wavespeedai/wan-2.1-t2v-720p', name: 'Wan 2.1 T2V 720p', desc: 'Wavespeed NSFW', nsfw: true,
    params: { num_frames: { min: 81, max: 121, default: 81 }, resolution: ['480p','720p'], aspect_ratio: ['16:9','9:16'], fps: { min: 5, max: 30, default: 16 }, go_fast: true, sample_shift: { min: 1, max: 10, default: 8 }, seed: true, interpolate_output: true, disable_safety_checker: true, lora: true, optimize_prompt: true } },
  { id: 'wan-video/wan-2.5-t2v', name: 'Wan 2.5 T2V', desc: 'HD + audio', nsfw: false,
    params: { size: ['1280*720','720*1280','1920*1080','1080*1920'], duration: [5,10], negative_prompt: true, enable_prompt_expansion: true, seed: true } },
  { id: 'wan-video/wan-2.5-t2v-fast', name: 'Wan 2.5 T2V Fast', desc: 'Fastest + audio', nsfw: false,
    params: { size: ['1280*720','720*1280','1920*1080','1080*1920'], duration: [5,10], negative_prompt: true, enable_prompt_expansion: true, seed: true } },
  { id: 'kwaivgi/kling-v2.5-turbo-pro', name: 'Kling V2.5 Turbo Pro', desc: '$0.07/sec', nsfw: false, price: '$0.07/s',
    params: { duration: [5,10], aspect_ratio: ['16:9','9:16','1:1'], negative_prompt: true } },
  { id: 'openai/sora-2-pro', name: 'OpenAI Sora 2 Pro', desc: 'Sora T2V', nsfw: false,
    params: { seconds: [4,8,12], resolution: ['standard','high'], aspect_ratio: ['landscape','portrait'], first_frame: true } },
  { id: 'google/veo-3.1-fast', name: 'Google Veo 3.1 Fast', desc: '$0.10-0.15/sec', nsfw: false, price: '$0.10-0.15/s',
    params: { duration: [4,6,8], resolution: ['720p','1080p'], aspect_ratio: ['16:9','9:16'], generate_audio: true, negative_prompt: true, seed: true } },
  { id: 'minimax/video-01', name: 'MiniMax Video-01', desc: 'High quality', nsfw: false,
    params: { prompt_optimizer: true } },
  { id: 'minimax/video-01-live', name: 'MiniMax Video-01 Live', desc: 'Real-time', nsfw: false,
    params: { prompt_optimizer: true } },
  { id: 'haiper-ai/haiper-video-2', name: 'Haiper Video 2', desc: 'Creative', nsfw: false,
    params: { duration: [4,6], resolution: ['720p','1080p'] } },
];
const ASPECTS = [
  { id: '1:1', w: 1024, h: 1024 },
  { id: '16:9', w: 1344, h: 768 },
  { id: '9:16', w: 768, h: 1344 },
  { id: '4:3', w: 1152, h: 896 },
  { id: '3:4', w: 896, h: 1152 },
];
// Motion Control models
const MOTION_MODELS = [
  { id: 'kwaivgi/kling-v2.6-motion-control', name: 'Kling V2.6 Motion Control', desc: 'Motion transfer from video',
    params: { prompt: true, image: true, video: true, character_orientation: ['image','video'], mode: ['std','pro'], keep_original_sound: true } },
  { id: 'wan-video/wan-2.2-animate-animation', name: 'Wan 2.2 Animate', desc: 'Character animation',
    params: { video: true, character_image: true, resolution: ['720','480'], refert_num: { default: 1, options: [1, 5] }, fps: { min: 5, max: 60, default: 24 }, go_fast: true, seed: true, merge_audio: true } },
];
// Lip Sync models
const LIPSYNC_MODELS = [
  { id: 'kwaivgi/kling-lip-sync', name: 'Kling Lip Sync', desc: 'Text/Audio lip sync',
    params: { video_url: true, audio_file: true, text: true, voice_id: true, voice_speed: { min: 0.8, max: 2, default: 1 } } },
  { id: 'sync/lipsync-2-pro', name: 'Lipsync 2 Pro', desc: 'Pro audio lip sync',
    params: { video: true, audio: true, sync_mode: ['loop','bounce','cut_off','silence','remap'], temperature: { min: 0, max: 1, default: 0.5 }, active_speaker: false } },
  { id: 'pixverse/lipsync', name: 'PixVerse Lipsync', desc: 'Simple video+audio sync',
    params: { video: true, audio: true } },
];
const KLING_VOICES = [
  { id: 'en_AOT', name: 'English - AOT' }, { id: 'en_oversea_male1', name: 'English - Male 1' },
  { id: 'en_girlfriend_4_speech02', name: 'English - Girlfriend' }, { id: 'en_chat_0407_5-1', name: 'English - Chat' },
  { id: 'en_uk_boy1', name: 'English - UK Boy' }, { id: 'en_PeppaPig_platform', name: 'English - Peppa Pig' },
  { id: 'en_calm_story1', name: 'English - Calm Story' }, { id: 'en_uk_man2', name: 'English - UK Man' },
  { id: 'en_reader_en_m-v1', name: 'English - Reader Male' }, { id: 'en_commercial_lady_en_f-v1', name: 'English - Commercial Lady' },
  { id: 'zh_genshin_vindi2', name: 'Chinese - Vindi' }, { id: 'zh_zhinen_xuesheng', name: 'Chinese - Student' },
  { id: 'zh_genshin_klee2', name: 'Chinese - Klee' }, { id: 'zh_girlfriend_1_speech02', name: 'Chinese - Girlfriend 1' },
  { id: 'zh_girlfriend_2_speech02', name: 'Chinese - Girlfriend 2' }, { id: 'zh_cartoon-boy-07', name: 'Chinese - Cartoon Boy' },
  { id: 'zh_cartoon-girl-01', name: 'Chinese - Cartoon Girl' },
];
// Transcribe models
const TRANSCRIBE_MODELS = [
  { id: 'openai/gpt-4o-transcribe', name: 'GPT-4o Transcribe', desc: 'OpenAI latest transcription',
    params: { audio_file: true, prompt: true, language: true, temperature: { min: 0, max: 1, default: 0 } } },
  { id: 'openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e', name: 'OpenAI Whisper', desc: 'Classic speech-to-text', useVersion: true,
    params: { audio: true, transcription: ['plain text','srt','vtt'], translate: false, language: true, temperature: { default: 0 }, condition_on_previous_text: true } },
  { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', desc: 'Multimodal transcription',
    params: { prompt: true, audio: true, system_instruction: true, thinking_level: ['low','high'], temperature: { min: 0, max: 2, default: 1 }, max_output_tokens: { default: 65535, max: 65535 } } },
];
// Text/Chat models
const TEXT_MODELS = [
  { id: 'openai/gpt-5', name: 'GPT-5', desc: 'OpenAI GPT-5',
    params: { system_prompt: true, image: true, reasoning_effort: ['minimal','low','medium','high'], verbosity: ['low','medium','high'], max_tokens: { default: 4096, max: 65535, key: 'max_completion_tokens' } } },
  { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', desc: 'Google Gemini 3',
    params: { system_prompt: true, system_prompt_key: 'system_instruction', image: true, thinking_level: ['low','high'], temperature: { default: 1, max: 2 }, top_p: { default: 0.95, max: 1 }, max_tokens: { default: 65535, max: 65535, key: 'max_output_tokens' } } },
  { id: 'anthropic/claude-4.5-sonnet', name: 'Claude 4.5 Sonnet', desc: 'Anthropic Claude',
    params: { system_prompt: true, image: true, max_tokens: { default: 8192, max: 64000, key: 'max_tokens' } } },
  { id: 'xai/grok-4', name: 'Grok 4', desc: 'xAI Grok 4',
    params: { max_tokens: { default: 2048, max: 65535, key: 'max_tokens' }, temperature: { default: 0.1, max: 2 }, top_p: { default: 1, max: 1 } } },
  { id: 'deepseek-ai/deepseek-v3.1', name: 'DeepSeek V3.1', desc: 'DeepSeek',
    params: { thinking: ['medium','None'], max_tokens: { default: 1024, max: 65535, key: 'max_tokens' }, temperature: { default: 0.1, max: 2 }, top_p: { default: 1, max: 1 } } },
];

// ─── SVG Logo ───
const NexusLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" /></linearGradient>
      <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#ec4899" /></linearGradient>
    </defs>
    <rect x="4" y="4" width="112" height="112" rx="28" fill="url(#lg1)" />
    <rect x="12" y="12" width="96" height="96" rx="22" fill="#0d0d1a" />
    <path d="M38 78V42l22 36h0l22-36v36" stroke="url(#lg2)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="60" cy="55" r="6" fill="url(#lg2)" opacity="0.8" />
  </svg>
);

// ─── Media Components (handle expired URLs + cross-browser) ───
function MediaImg({ src, alt = '', style = {}, onClick, ...props }) {
  const [broken, setBroken] = React.useState(false);
  if (broken) return (
    <div onClick={onClick} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#555', fontSize: 13, textAlign: 'center', padding: 12, cursor: style.cursor || 'pointer' }}>
      🖼️ Image expired<br/><span style={{ fontSize: 11 }}>Replicate URLs are temporary</span>
    </div>
  );
  return <img src={src} alt={alt} style={style} onClick={onClick} onError={() => setBroken(true)} loading="lazy" crossOrigin="anonymous" {...props} />;
}

function MediaVid({ src, style = {}, onClick, ...props }) {
  const [broken, setBroken] = React.useState(false);
  if (broken) return (
    <div onClick={onClick} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#555', fontSize: 13, textAlign: 'center', padding: 12, cursor: 'pointer' }}>
      🎬 Video expired<br/><span style={{ fontSize: 11 }}>Replicate URLs are temporary</span>
    </div>
  );
  return <video src={src} style={style} onClick={onClick} onError={() => setBroken(true)} muted loop playsInline webkit-playsinline="true" preload="metadata" {...props} />;
}

// ─── Auth Screen ───
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); setMessage(''); setPassword(''); setConfirmPassword(''); setCode(''); };

  const api = async (endpoint, body) => {
    const res = await fetch(API_BASE + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { if (data.needsVerification) throw { message: 'Please verify your email first', needsVerification: true }; throw new Error(data.error || 'Request failed'); }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    if ((mode === 'signup' || mode === 'reset') && password !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        onAuth(data.user, data.accessToken);
      } else if (mode === 'signup') { await api('/auth/signup', { email, password, name }); setMessage('Verification code sent!'); setMode('verify'); }
      else if (mode === 'verify') { await api('/auth/verify', { email, code }); setMessage('Verified! Please sign in.'); setMode('login'); }
      else if (mode === 'forgot') { await api('/auth/forgot-password', { email }); setMessage('Reset code sent!'); setMode('reset'); }
      else if (mode === 'reset') { await api('/auth/reset-password', { email, code, newPassword: password }); setMessage('Password reset! Please sign in.'); setMode('login'); }
    } catch (err) {
      if (err.needsVerification) { setError('Email not verified.'); setMessage('Please verify your email.'); setMode('verify'); }
      else setError(err.message);
    } finally { setLoading(false); }
  };

  const resendCode = async () => {
    if (!email) return setError('Enter your email first');
    setLoading(true);
    try { await api('/auth/resend-code', { email }); setMessage('New code sent!'); } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const titles = { login: 'Welcome Back', signup: 'Create Account', verify: 'Verify Email', forgot: 'Forgot Password', reset: 'Reset Password' };
  const subtitles = { login: 'Sign in to your account', signup: 'Start creating with AI', verify: 'Enter the code from your email', forgot: "We'll send a reset code", reset: 'Enter code and new password' };
  const submitLabels = { login: 'Sign In', signup: 'Create Account', verify: 'Verify', forgot: 'Send Code', reset: 'Reset Password' };

  return (
    <div style={S.page}>
      <div style={{ textAlign: 'center', paddingTop: 40, marginBottom: 8 }}>
        <NexusLogo size={56} />
        <h1 style={S.gradientText}>NEXUS AI Pro</h1>
        <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>AI Image & Video Generation</p>
      </div>
      <form onSubmit={handleSubmit} style={S.card}>
        <h2 style={{ margin: 0, fontSize: 22, textAlign: 'center' }}>{titles[mode]}</h2>
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 }}>{subtitles[mode]}</p>
        {error && <div style={S.errorBox}><span>⚠ {error}</span><span onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span></div>}
        {message && <div style={S.successBox}>✓ {message}</div>}
        {mode === 'signup' && <div style={S.field}><label style={S.label}>Full Name</label><input style={S.input} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required /></div>}
        {mode !== 'verify' && <div style={S.field}><label style={S.label}>Email</label><input style={S.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>}
        {['login','signup','reset'].includes(mode) && <div style={S.field}><label style={S.label}>{mode === 'reset' ? 'New Password' : 'Password'}</label><div style={{ position: 'relative' }}><input style={S.input} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /><span onClick={() => setShowPassword(!showPassword)} style={S.eyeIcon}>{showPassword ? '🙈' : '👁'}</span></div></div>}
        {['signup','reset'].includes(mode) && <div style={S.field}><label style={S.label}>Confirm Password</label><input style={{ ...S.input, borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : '#333' }} type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />{confirmPassword && password !== confirmPassword && <span style={{ color: '#ef4444', fontSize: 12 }}>Passwords do not match</span>}</div>}
        {['verify','reset'].includes(mode) && <div style={S.field}><label style={S.label}>Verification Code</label><input style={{ ...S.input, letterSpacing: 4, textAlign: 'center', fontSize: 18, fontWeight: 600 }} placeholder="------" value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} required maxLength={6} /></div>}
        <button type="submit" disabled={loading || ((mode === 'signup' || mode === 'reset') && password !== confirmPassword)} style={{ ...S.btn, opacity: loading ? 0.7 : 1, marginTop: 8 }}>
          {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />Please wait...</span> : submitLabels[mode]}
        </button>
        {mode === 'verify' && <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#888' }}>Didn't get a code? <span onClick={resendCode} style={S.link}>Resend</span></p>}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: '#888' }}>
          {mode === 'login' && <>Don't have an account? <span onClick={() => switchMode('signup')} style={S.link}>Sign Up</span><br /><span onClick={() => switchMode('forgot')} style={{ ...S.link, fontSize: 13, marginTop: 8, display: 'inline-block' }}>Forgot password?</span></>}
          {mode === 'signup' && <>Already have an account? <span onClick={() => switchMode('login')} style={S.link}>Sign In</span></>}
          {['verify','forgot','reset'].includes(mode) && <span onClick={() => switchMode('login')} style={S.link}>← Back to Sign In</span>}
        </div>
      </form>
      <p style={{ textAlign: 'center', color: '#444', fontSize: 12, marginTop: 24 }}>© 2026 NEXUS AI Pro</p>
    </div>
  );
}

// ─── Paywall Modal ───
function PaywallModal({ onClose, accessToken, user, onPaymentSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = [
    { id: 'lifetime', name: 'Lifetime', price: '₹5', priceNum: 5, desc: 'One-time payment', badge: 'BEST VALUE' },
    { id: 'monthly', name: 'Monthly', price: '₹1', priceNum: 1, desc: 'Per month', badge: null },
  ];

  const handlePayment = async () => {
    setError(''); setLoading(true);
    try {
      // Step 1: Create order on backend
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create order');
      const order = await res.json();

      // Step 2: Open Razorpay Checkout
      const options = {
        key: order.keyId,
        name: 'NEXUS AI Pro',
        description: order.planName,
        prefill: { email: user?.email || '' },
        theme: { color: '#667eea' },
        modal: { ondismiss: () => setLoading(false) },
      };

      // Different fields for order vs subscription
      if (order.type === 'subscription') {
        options.subscription_id = order.subscriptionId;
      } else {
        options.amount = order.amount;
        options.currency = order.currency;
        options.order_id = order.orderId;
      }

      options.handler = async function (response) {
        // Step 3: Verify payment on backend
        try {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || null,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpay_subscription_id: response.razorpay_subscription_id || order.subscriptionId || null,
              plan: selectedPlan,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            onPaymentSuccess(selectedPlan);
          } else {
            setError(result.error || 'Verification failed');
          }
        } catch (err) {
          setError('Payment verification failed. Please contact support.');
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.card, maxWidth: 500, position: 'relative', margin: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={S.closeBtn}>✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔓</div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>Unlock NEXUS AI Pro</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Choose your plan to start generating</p>

          {error && <div style={{ ...S.errorBox, marginBottom: 16 }}>{error}</div>}

          {/* Plan Cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {plans.map(plan => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} style={{
                flex: 1, padding: '16px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', position: 'relative',
                background: selectedPlan === plan.id ? 'rgba(102,126,234,0.1)' : '#0d0d1a',
                border: selectedPlan === plan.id ? '2px solid #667eea' : '2px solid #1f2937',
                transition: 'all 0.2s',
              }}>
                {plan.badge && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{plan.badge}</div>}
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{plan.price}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{plan.desc}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            {['All FLUX image models (Schnell, Dev, 1.1 Pro)', 'Wan 2.1 & Wavespeed video generation', 'MiniMax Video-01 text-to-video', 'Unlimited generations with your API key', selectedPlan === 'lifetime' ? 'Lifetime access & updates' : '30-day access, cancel anytime'].map(f => (
              <div key={f} style={{ padding: '7px 0', borderBottom: '1px solid #1f2937', color: '#ccc', fontSize: 13 }}>
                <span style={{ color: '#4ade80', marginRight: 8 }}>✓</span>{f}
              </div>
            ))}
          </div>

          <button onClick={handlePayment} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1, fontSize: 16, padding: 16 }}>
            {loading ? 'Processing...' : `Pay ${plans.find(p => p.id === selectedPlan).price} →`}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
            {['🔒 Secure Payment', '💳 UPI/Cards/Netbanking', '🔄 Instant Activation'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#666' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Modal ───
function SettingsModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey);
  const trimmed = key.trim();
  const valid = trimmed.startsWith('r8_') && trimmed.length > 20;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.card, maxWidth: 460, position: 'relative', margin: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={S.closeBtn}>✕</button>
        <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>⚙ Settings</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Configure your Replicate API key</p>
        <div style={S.field}>
          <label style={S.label}>Replicate API Key</label>
          <input style={S.input} type="password" placeholder="r8_..." value={key} onChange={e => setKey(e.target.value)} />
          <p style={{ fontSize: 12, color: valid ? '#4ade80' : '#888', marginTop: 4 }}>
            {valid ? '✓ Valid key format' : 'Get your key from replicate.com/account/api-tokens'}
          </p>
        </div>
        <button onClick={() => onSave(trimmed)} disabled={!valid} style={{ ...S.btn, opacity: valid ? 1 : 0.5 }}>Save Key</button>
      </div>
    </div>
  );
}

// ─── Media Viewer Modal ───
function ViewerModal({ item, onClose, onUseForVideo }) {
  if (!item) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ ...S.closeBtn, top: -12, right: -12 }}>✕</button>
        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay loop playsInline webkit-playsinline="true" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, width: '100%' }} />
        ) : (
          <img src={item.url} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain', width: '100%' }} />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
          <a href={item.url} download target="_blank" rel="noopener noreferrer" style={{ ...S.btnSm, textDecoration: 'none' }}>⬇ Download</a>
          {item.type === 'image' && <button onClick={() => onUseForVideo(item.url)} style={S.btnSm}>🎬 Use for Video</button>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ─── Main App ───
// ═══════════════════════════════════════
function App() {
  const [authState, setAuthState] = useState('loading'); // loading | auth | app
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  // Tab
  const [tab, setTab] = useState('image');

  // Image
  const [prompt, setPrompt] = useState('');
  const [negPrompt, setNegPrompt] = useState('');
  const [model, setModel] = useState(IMAGE_MODELS[0].id);
  const [aspect, setAspect] = useState('1:1');
  const [steps, setSteps] = useState(4);
  const [guidance, setGuidance] = useState(3.5);
  const [seed, setSeed] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Image to Image
  const [i2iPrompt, setI2iPrompt] = useState('');
  const [i2iModel, setI2iModel] = useState(I2I_MODELS[0].id);
  const [i2iImage, setI2iImage] = useState(null);
  const [i2iStrength, setI2iStrength] = useState(0.8);
  const [i2iNegPrompt, setI2iNegPrompt] = useState('');

  // Video (I2V)
  const [i2vPrompt, setI2vPrompt] = useState('');
  const [i2vModel, setI2vModel] = useState(I2V_MODELS[0].id);
  const [i2vImage, setI2vImage] = useState(null);
  const [i2vLastFrame, setI2vLastFrame] = useState(null);
  const [i2vOpts, setI2vOpts] = useState({});

  // Video (T2V)
  const [t2vPrompt, setT2vPrompt] = useState('');
  const [t2vModel, setT2vModel] = useState(T2V_MODELS[0].id);
  const [t2vOpts, setT2vOpts] = useState({});
  const [t2vNegPrompt, setT2vNegPrompt] = useState('');

  // Text/Chat
  const [chatModel, setChatModel] = useState(TEXT_MODELS[0].id);
  const [chatInput, setChatInput] = useState('');
  const [chatSystemPrompt, setChatSystemPrompt] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [chatOpts, setChatOpts] = useState({});
  const [chatMessages, setChatMessages] = useState([]); // { role, content }
  const [chatStreaming, setChatStreaming] = useState(false);

  // Motion Control
  const [motionModel, setMotionModel] = useState(MOTION_MODELS[0].id);
  const [motionPrompt, setMotionPrompt] = useState('');
  const [motionImage, setMotionImage] = useState(null);
  const [motionVideo, setMotionVideo] = useState(null);
  const [motionOpts, setMotionOpts] = useState({});

  // Lip Sync
  const [lipsyncModel, setLipsyncModel] = useState(LIPSYNC_MODELS[0].id);
  const [lipsyncVideo, setLipsyncVideo] = useState(null);
  const [lipsyncAudio, setLipsyncAudio] = useState(null);
  const [lipsyncText, setLipsyncText] = useState('');
  const [lipsyncOpts, setLipsyncOpts] = useState({});

  // Transcribe
  const [transcribeModel, setTranscribeModel] = useState(TRANSCRIBE_MODELS[0].id);
  const [transcribeAudio, setTranscribeAudio] = useState(null);
  const [transcribeAudioMime, setTranscribeAudioMime] = useState('audio/mpeg');
  const [transcribePrompt, setTranscribePrompt] = useState('');
  const [transcribeOpts, setTranscribeOpts] = useState({});
  const [transcribeResult, setTranscribeResult] = useState('');

  // UI — concurrent jobs system: multiple generations can run simultaneously
  const [jobs, setJobs] = useState([]); // [{ id, tab, model, prompt, status, error, ts }]
  const [errors, setErrors] = useState({});
  const error = errors[tab] || '';
  const setError = (v) => setErrors(prev => ({ ...prev, [tab]: v }));
  // Derived: active jobs for current tab
  const tabJobs = jobs.filter(j => j.tab === tab && !j.done);
  const loading = tabJobs.length > 0;
  const loadingStatus = tabJobs.length > 0 ? tabJobs.map(j => j.status).join(' | ') : '';
  // Total active jobs across all tabs (for badge on tab bar)
  const totalActiveJobs = jobs.filter(j => !j.done).length;
  // Job helpers
  const addJob = (tabName, modelName, promptText) => {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const job = { id, tab: tabName, model: modelName, prompt: promptText || '', status: 'Starting...', done: false, ts: Date.now() };
    setJobs(prev => [job, ...prev]);
    return id;
  };
  const updateJob = (id, updates) => setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  const finishJob = (id, errorMsg) => setJobs(prev => prev.map(j => j.id === id ? { ...j, done: true, status: errorMsg ? 'Failed' : 'Done', error: errorMsg || null } : j));
  // Auto-clean finished jobs after 8 seconds
  useEffect(() => {
    const done = jobs.filter(j => j.done);
    if (done.length === 0) return;
    const timer = setTimeout(() => setJobs(prev => prev.filter(j => !j.done || Date.now() - j.ts < 8000)), 8000);
    return () => clearTimeout(timer);
  }, [jobs]);
  const [results, setResults] = useState([]);
  const [viewerItem, setViewerItem] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('replicate_api_key') || '');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_history')) || { images: [], videos: [] }; } catch { return { images: [], videos: [] }; }
  });

  // ─── Auth Check on Mount ───
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setAuthState('auth'); return; }
    fetch(`${API_BASE}/auth/me`, { headers: { 'x-auth-token': token } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setUser(data); setAccessToken(token); setAuthState('app'); })
      .catch(() => {
        const rt = localStorage.getItem('refreshToken');
        if (!rt) { setAuthState('auth'); return; }
        fetch(`${API_BASE}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) })
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(data => { localStorage.setItem('accessToken', data.accessToken); setAccessToken(data.accessToken); return fetch(`${API_BASE}/auth/me`, { headers: { 'x-auth-token': data.accessToken } }); })
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(data => { setUser(data); setAuthState('app'); })
          .catch(() => { localStorage.clear(); setAuthState('auth'); });
      });
  }, []);

  useEffect(() => { localStorage.setItem('nexus_history', JSON.stringify(history)); }, [history]);

  const handleAuth = (u, t) => { setUser(u); setAccessToken(t); setAuthState('app'); };
  const handleLogout = () => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); setUser(null); setAccessToken(''); setAuthState('auth'); };
  const saveApiKey = (key) => { localStorage.setItem('replicate_api_key', key); setApiKey(key); setShowSettings(false); };
  const keyValid = apiKey.trim().startsWith('r8_') && apiKey.trim().length > 20;

  // ─── Pre-generate Check ───
  const canGenerate = () => {
    if (!user?.isPaid) { setShowPaywall(true); return false; }
    if (!keyValid) { setError('Please set your Replicate API key in Settings first.'); setShowSettings(true); return false; }
    return true;
  };

  // Helper: extract detailed error from Replicate API response
  const parseApiError = async (res) => {
    try {
      const data = await res.json();
      // Replicate 422 validation errors: { detail: "input.field: message" }
      if (data.detail) {
        if (typeof data.detail === 'string') return data.detail;
        if (Array.isArray(data.detail)) return data.detail.map(d => d.msg || d.message || JSON.stringify(d)).join('; ');
        if (typeof data.detail === 'object') return JSON.stringify(data.detail).replace(/[{}"]|\\n/g, ' ').trim();
      }
      if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      if (data.title) return data.title;
      return `API error (${res.status}): ${JSON.stringify(data).slice(0, 200)}`;
    } catch { return `API error (${res.status})`; }
  };

  // ─── Generate Image ───
  const generateImage = async () => {
    if (!prompt.trim()) return setError('Enter a prompt');
    if (!canGenerate()) return;
    const jobId = addJob('image', model, prompt.trim());
    setError('');
    try {
      const asp = ASPECTS.find(a => a.id === aspect);
      const input = { prompt: prompt.trim(), width: asp.w, height: asp.h, num_outputs: 1 };
      if (negPrompt.trim()) input.negative_prompt = negPrompt.trim();
      if (model.includes('schnell')) input.num_inference_steps = Math.min(steps, 4);
      else if (model.includes('sdxl-lightning')) {
        input.num_inference_steps = Math.min(steps, 10);
        input.guidance_scale = 0;
        input.scheduler = 'K_EULER';
        input.disable_safety_checker = true;
      }
      else if (model.includes('stability-ai/sdxl')) {
        input.num_inference_steps = steps;
        input.guidance_scale = guidance;
        input.scheduler = 'K_EULER';
        input.refine = 'expert_ensemble_refiner';
        input.high_noise_frac = 0.8;
        input.apply_watermark = false;
        input.disable_safety_checker = true;
      }
      else { input.num_inference_steps = steps; input.guidance_scale = guidance; }
      if (seed) input.seed = parseInt(seed);

      // Version-based models (SDXL, SD 1.5 etc) need version field
      const curModel = IMAGE_MODELS.find(m => m.id === model);
      let reqBody;
      if (curModel?.useVersion && model.includes(':')) {
        const version = model.split(':')[1];
        reqBody = { version, input };
      } else {
        reqBody = { model, input };
      }

      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();

      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` });
        await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');

      const output = Array.isArray(pred.output) ? pred.output : [pred.output];
      const items = output.filter(Boolean).map(url => ({ type: 'image', url, prompt: prompt.trim(), model, ts: Date.now() }));
      setResults(prev => [...items, ...prev]);
      setHistory(prev => ({ ...prev, images: [...items, ...prev.images].slice(0, 50) }));
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Image to Image ───
  const generateI2I = async () => {
    if (!i2iPrompt.trim()) return setError('Enter a prompt');
    if (!i2iImage) return setError('Upload a source image');
    if (!canGenerate()) return;
    const jobId = addJob('i2i', i2iModel, i2iPrompt.trim());
    setError('');
    try {
      // Convert image to data URI
      updateJob(jobId, { status: 'Preparing image...' });
      const resp = await fetch(i2iImage);
      const blob = await resp.blob();
      const dataUri = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });

      const curI2IModel = I2I_MODELS.find(m => m.id === i2iModel);
      const input = { prompt: i2iPrompt.trim(), image: dataUri };

      // Model-specific params
      if (i2iModel.includes('nano-banana')) {
        input.prompt_strength = i2iStrength;
        if (i2iNegPrompt.trim()) input.negative_prompt = i2iNegPrompt.trim();
      } else if (i2iModel.includes('qwen')) {
        input.go_fast = true;
        input.guidance = guidance;
        input.strength = i2iStrength;
        input.image_size = 'optimize_for_quality';
        input.aspect_ratio = aspect;
        input.output_format = 'webp';
        input.num_inference_steps = steps;
        if (i2iNegPrompt.trim()) input.negative_prompt = i2iNegPrompt.trim();
      } else if (i2iModel.includes('stability-ai/sdxl')) {
        input.prompt_strength = i2iStrength;
        input.width = ASPECTS.find(a => a.id === aspect)?.w || 1024;
        input.height = ASPECTS.find(a => a.id === aspect)?.h || 1024;
        input.num_outputs = 1;
        input.guidance_scale = guidance;
        input.num_inference_steps = steps;
        input.scheduler = 'K_EULER';
        input.refine = 'expert_ensemble_refiner';
        input.high_noise_frac = 0.8;
        input.apply_watermark = false;
        input.disable_safety_checker = true;
        if (i2iNegPrompt.trim()) input.negative_prompt = i2iNegPrompt.trim();
      } else if (i2iModel.includes('stable-diffusion')) {
        input.prompt_strength = i2iStrength;
        input.width = ASPECTS.find(a => a.id === aspect)?.w || 768;
        input.height = ASPECTS.find(a => a.id === aspect)?.h || 768;
        input.num_outputs = 1;
        input.guidance_scale = guidance;
        input.num_inference_steps = steps;
        if (i2iNegPrompt.trim()) input.negative_prompt = i2iNegPrompt.trim();
      }

      // For version-based models, use /v1/predictions with version
      let url, body;
      if (curI2IModel?.useVersion) {
        const [modelPath, version] = i2iModel.split(':');
        url = 'https://api.replicate.com/v1/predictions';
        body = { version, input };
      } else {
        url = `https://api.replicate.com/v1/models/${i2iModel}/predictions`;
        body = { input };
      }

      updateJob(jobId, { status: 'Generating...' });
      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ ...body, _model: i2iModel }),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();

      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` });
        await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');

      const output = pred.output;
      const imgUrl = Array.isArray(output) ? output[0] : (typeof output === 'object' && output?.url ? output.url() : output);
      const item = { type: 'image', url: imgUrl, prompt: i2iPrompt.trim(), model: i2iModel, ts: Date.now() };
      setResults(prev => [item, ...prev]);
      setHistory(prev => ({ ...prev, images: [item, ...prev.images].slice(0, 50) }));
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  const handleI2IFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setI2iImage(URL.createObjectURL(file));
  };

  // ─── Helper: convert blob URL to data URI ───
  const toDataUri = async (blobUrl) => {
    const resp = await fetch(blobUrl);
    const blob = await resp.blob();
    return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  };

  // ─── Helper: upload file to Replicate and get URL (for video/audio that need URLs) ───
  const uploadToReplicate = async (blobOrDataUri, contentType = 'video/mp4') => {
    const dataUri = blobOrDataUri.startsWith('blob:') ? await toDataUri(blobOrDataUri) : blobOrDataUri;
    const res = await fetch(`${API_BASE}/api/replicate/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ data: dataUri, content_type: contentType }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `File upload failed (${res.status})`); }
    const result = await res.json();
    if (!result.url) throw new Error('Upload succeeded but no URL returned');
    return result.url;
  };

  // ─── Helper: build video input from model config ───
  const buildVideoInput = async (modelCfg, opts, prompt, negPrompt, image, lastFrame, jobId) => {
    const p = modelCfg.params || {};
    const input = {};
    if (prompt?.trim()) input.prompt = prompt.trim();

    // Image inputs
    if (image) {
      if (jobId) updateJob(jobId, { status: 'Preparing image...' });
      const imgData = image.startsWith('blob:') ? await toDataUri(image) : image;
      // Veo/Sora use 'image' for first_frame param name, Kling uses 'image'
      input.image = imgData;
    }
    if (lastFrame && p.last_frame) {
      if (jobId) updateJob(jobId, { status: 'Preparing end frame...' });
      input.last_frame = lastFrame.startsWith('blob:') ? await toDataUri(lastFrame) : lastFrame;
    }

    // Duration (array options)
    if (Array.isArray(p.duration)) input.duration = opts.duration || p.duration[0];
    // Seconds (Sora)
    if (Array.isArray(p.seconds)) input.seconds = opts.seconds || p.seconds[0];
    // Num frames (range object)
    if (p.num_frames && typeof p.num_frames === 'object' && !Array.isArray(p.num_frames)) {
      input.num_frames = opts.num_frames || p.num_frames.default;
    }
    // Resolution
    if (Array.isArray(p.resolution)) input.resolution = opts.resolution || p.resolution[0];
    // Size (Wan 2.5)
    if (Array.isArray(p.size)) input.size = opts.size || p.size[0];
    // Aspect ratio
    if (Array.isArray(p.aspect_ratio)) input.aspect_ratio = opts.aspect_ratio || p.aspect_ratio[0];
    // FPS (range object)
    if (p.fps && typeof p.fps === 'object') {
      input.frames_per_second = opts.fps || p.fps.default;
    }
    // Sample shift (range object)
    if (p.sample_shift && typeof p.sample_shift === 'object') {
      input.sample_shift = opts.sample_shift ?? p.sample_shift.default;
    }
    // Boolean flags
    if (p.go_fast) input.go_fast = opts.go_fast !== false;
    if (p.generate_audio && opts.generate_audio !== false) input.generate_audio = true;
    if (p.enable_prompt_expansion && opts.enable_prompt_expansion !== false) input.enable_prompt_expansion = true;
    if (p.prompt_optimizer) input.prompt_optimizer = true;
    if (p.optimize_prompt && opts.optimize_prompt) input.optimize_prompt = true;
    if (p.interpolate_output && opts.interpolate_output) input.interpolate_output = true;
    if (p.disable_safety_checker && opts.disable_safety_checker) input.disable_safety_checker = true;
    // Negative prompt
    if (p.negative_prompt && negPrompt?.trim()) input.negative_prompt = negPrompt.trim();
    // Seed
    if (p.seed && opts.seed) input.seed = parseInt(opts.seed);
    // LoRA
    if (p.lora && opts.lora_url?.trim()) {
      input.lora_weights_transformer = opts.lora_url.trim();
      input.lora_scale_transformer = opts.lora_scale ?? 1;
      if (opts.lora_url_2?.trim()) {
        input.lora_weights_transformer_2 = opts.lora_url_2.trim();
        input.lora_scale_transformer_2 = opts.lora_scale_2 ?? 1;
      }
    }
    return input;
  };

  // ─── Generate I2V ───
  const generateI2V = async () => {
    if (!i2vImage) return setError('Upload a source image');
    if (!canGenerate()) return;
    const modelCfg = I2V_MODELS.find(m => m.id === i2vModel);
    const jobId = addJob('i2v', i2vModel, i2vPrompt.trim());
    setError('');
    try {
      const input = await buildVideoInput(modelCfg, i2vOpts, i2vPrompt, i2vOpts.negative_prompt, i2vImage, i2vLastFrame, jobId);
      updateJob(jobId, { status: 'Generating video...' });

      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: i2vModel, input }),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();

      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` });
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');

      const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      const item = { type: 'video', url, prompt: i2vPrompt.trim(), model: i2vModel, ts: Date.now() };
      setResults(prev => [item, ...prev]);
      setHistory(prev => ({ ...prev, videos: [item, ...prev.videos].slice(0, 50) }));
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate T2V ───
  const generateT2V = async () => {
    if (!t2vPrompt.trim()) return setError('Enter a prompt');
    if (!canGenerate()) return;
    const modelCfg = T2V_MODELS.find(m => m.id === t2vModel);
    const jobId = addJob('t2v', t2vModel, t2vPrompt.trim());
    setError('');
    try {
      const input = await buildVideoInput(modelCfg, t2vOpts, t2vPrompt, t2vNegPrompt, null, null, jobId);
      updateJob(jobId, { status: 'Generating video...' });

      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: t2vModel, input }),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();

      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` });
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');

      const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      const item = { type: 'video', url, prompt: t2vPrompt.trim(), model: t2vModel, ts: Date.now() };
      setResults(prev => [item, ...prev]);
      setHistory(prev => ({ ...prev, videos: [item, ...prev.videos].slice(0, 50) }));
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Chat ───
  const generateChat = async () => {
    if (!chatInput.trim() && !chatImage) return setError('Enter a message or attach an image');
    if (!canGenerate()) return;
    const modelCfg = TEXT_MODELS.find(m => m.id === chatModel);
    const p = modelCfg?.params || {};
    // Capture values before clearing state
    const msgText = chatInput.trim();
    const msgImage = chatImage;
    const userMsg = { role: 'user', content: msgImage ? (msgText ? `📎 ${msgText}` : '📎 [Image attached]') : msgText };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatImage(null); // Clear image after capturing
    const jobId = addJob('chat', chatModel, msgText);
    setError(''); setChatStreaming(true);
    try {
      const input = {};
      input.prompt = msgText || 'Describe this image';
      // System prompt
      if (chatSystemPrompt.trim()) {
        const sysKey = p.system_prompt_key || 'system_prompt';
        input[sysKey] = chatSystemPrompt.trim();
      }
      // Image
      if (msgImage && p.image) {
        const resp = await fetch(msgImage);
        const blob = await resp.blob();
        const dataUri = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
        // GPT-5 uses image_input array, Gemini uses images array, Claude uses image
        if (chatModel.includes('gpt')) input.image_input = [dataUri];
        else if (chatModel.includes('gemini')) input.images = [dataUri];
        else input.image = dataUri;
      }
      // Model-specific params
      if (p.reasoning_effort) input.reasoning_effort = chatOpts.reasoning_effort || p.reasoning_effort[0];
      if (p.verbosity) input.verbosity = chatOpts.verbosity || p.verbosity[0];
      if (p.thinking_level) input.thinking_level = chatOpts.thinking_level || p.thinking_level[0];
      if (p.thinking) input.thinking = chatOpts.thinking || p.thinking[0];
      if (p.temperature) input.temperature = chatOpts.temperature ?? p.temperature.default;
      if (p.top_p) input.top_p = chatOpts.top_p ?? p.top_p.default;
      if (p.max_tokens) {
        input[p.max_tokens.key] = chatOpts.max_tokens || p.max_tokens.default;
      }

      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: chatModel, input }),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();

      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` });
        await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');

      // Output can be string, array of strings, or object
      let output = pred.output;
      if (Array.isArray(output)) output = output.join('');
      else if (typeof output === 'object' && output !== null) output = JSON.stringify(output, null, 2);

      setChatMessages(prev => [...prev, { role: 'assistant', content: output, model: chatModel }]);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
    finally { setChatStreaming(false); }
  };

  const handleChatImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChatImage(URL.createObjectURL(file));
  };

  const handleI2VFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setI2vImage(URL.createObjectURL(file));
  };

  const useForVideo = (url) => { setI2vImage(url); setTab('i2v'); setI2vModel(I2V_MODELS[0].id); setViewerItem(null); };

  const handleI2VLastFrame = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setI2vLastFrame(URL.createObjectURL(file));
  };

  // Reusable video options UI renderer
  const renderVideoOpts = (modelCfg, opts, setOpts, negPrompt, setNegPrompt) => {
    const p = modelCfg?.params || {};
    const btnStyle = (selected) => ({ padding: '6px 12px', background: selected ? 'rgba(102,126,234,0.2)' : '#111827', border: selected ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: selected ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
    const checkStyle = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aaa', fontSize: 13 };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {/* Duration */}
        {Array.isArray(p.duration) && (
          <div>
            <label style={S.label}>Duration</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {p.duration.map(d => <button key={d} onClick={() => setOpts(o => ({ ...o, duration: d }))} style={btnStyle((opts.duration || p.duration[0]) === d)}>{d}s</button>)}
            </div>
          </div>
        )}
        {/* Seconds (Sora) */}
        {Array.isArray(p.seconds) && (
          <div>
            <label style={S.label}>Duration</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {p.seconds.map(d => <button key={d} onClick={() => setOpts(o => ({ ...o, seconds: d }))} style={btnStyle((opts.seconds || p.seconds[0]) === d)}>{d}s</button>)}
            </div>
          </div>
        )}
        {/* Num Frames (range slider) */}
        {p.num_frames && typeof p.num_frames === 'object' && !Array.isArray(p.num_frames) && (
          <div>
            <label style={S.label}>Frames: {opts.num_frames || p.num_frames.default} (~{Math.round((opts.num_frames || p.num_frames.default) / 16)}s)</label>
            <input type="range" min={p.num_frames.min} max={p.num_frames.max} step={1} value={opts.num_frames || p.num_frames.default} onChange={e => setOpts(o => ({ ...o, num_frames: +e.target.value }))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>{p.num_frames.min}</span><span>{p.num_frames.max}</span></div>
          </div>
        )}
        {/* Resolution */}
        {Array.isArray(p.resolution) && (
          <div>
            <label style={S.label}>Resolution</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {p.resolution.map(r => <button key={r} onClick={() => setOpts(o => ({ ...o, resolution: r }))} style={btnStyle((opts.resolution || p.resolution[0]) === r)}>{r}</button>)}
            </div>
          </div>
        )}
        {/* Size (Wan 2.5) */}
        {Array.isArray(p.size) && (
          <div>
            <label style={S.label}>Size</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.size.map(s => {
                const label = s === '1280*720' ? '720p 16:9' : s === '720*1280' ? '720p 9:16' : s === '1920*1080' ? '1080p 16:9' : s === '1080*1920' ? '1080p 9:16' : s;
                return <button key={s} onClick={() => setOpts(o => ({ ...o, size: s }))} style={btnStyle((opts.size || p.size[0]) === s)}>{label}</button>;
              })}
            </div>
          </div>
        )}
        {/* Aspect Ratio */}
        {Array.isArray(p.aspect_ratio) && (
          <div>
            <label style={S.label}>Aspect Ratio</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {p.aspect_ratio.map(ar => <button key={ar} onClick={() => setOpts(o => ({ ...o, aspect_ratio: ar }))} style={btnStyle((opts.aspect_ratio || p.aspect_ratio[0]) === ar)}>{ar}</button>)}
            </div>
          </div>
        )}
        {/* FPS (range slider) */}
        {p.fps && typeof p.fps === 'object' && (
          <div>
            <label style={S.label}>FPS: {opts.fps || p.fps.default}</label>
            <input type="range" min={p.fps.min} max={p.fps.max} step={1} value={opts.fps || p.fps.default} onChange={e => setOpts(o => ({ ...o, fps: +e.target.value }))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>{p.fps.min}</span><span>{p.fps.max}</span></div>
          </div>
        )}
        {/* Sample Shift (range slider) */}
        {p.sample_shift && typeof p.sample_shift === 'object' && (
          <div>
            <label style={S.label}>Sample Shift: {opts.sample_shift ?? p.sample_shift.default}</label>
            <input type="range" min={p.sample_shift.min} max={p.sample_shift.max} step={1} value={opts.sample_shift ?? p.sample_shift.default} onChange={e => setOpts(o => ({ ...o, sample_shift: +e.target.value }))} style={{ width: '100%' }} />
          </div>
        )}
        {/* Boolean toggles */}
        {p.generate_audio && (
          <label style={checkStyle}>
            <input type="checkbox" checked={opts.generate_audio !== false} onChange={e => setOpts(o => ({ ...o, generate_audio: e.target.checked }))} />
            🔊 Generate Audio
          </label>
        )}
        {p.enable_prompt_expansion && (
          <label style={checkStyle}>
            <input type="checkbox" checked={opts.enable_prompt_expansion !== false} onChange={e => setOpts(o => ({ ...o, enable_prompt_expansion: e.target.checked }))} />
            ✨ Auto-enhance prompt
          </label>
        )}
        {p.optimize_prompt && (
          <label style={checkStyle}>
            <input type="checkbox" checked={!!opts.optimize_prompt} onChange={e => setOpts(o => ({ ...o, optimize_prompt: e.target.checked }))} />
            ✨ Optimize prompt
          </label>
        )}
        {p.interpolate_output && (
          <label style={checkStyle}>
            <input type="checkbox" checked={!!opts.interpolate_output} onChange={e => setOpts(o => ({ ...o, interpolate_output: e.target.checked }))} />
            🎬 Interpolate to 30 FPS
          </label>
        )}
        {p.go_fast && (
          <label style={checkStyle}>
            <input type="checkbox" checked={opts.go_fast !== false} onChange={e => setOpts(o => ({ ...o, go_fast: e.target.checked }))} />
            ⚡ Go Fast
          </label>
        )}
        {p.disable_safety_checker && (
          <label style={checkStyle}>
            <input type="checkbox" checked={!!opts.disable_safety_checker} onChange={e => setOpts(o => ({ ...o, disable_safety_checker: e.target.checked }))} />
            🔞 Disable Safety Checker (NSFW)
          </label>
        )}
        {/* Negative Prompt */}
        {p.negative_prompt && setNegPrompt && (
          <div>
            <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Negative prompt (optional)..." value={negPrompt || ''} onChange={e => setNegPrompt(e.target.value)} />
          </div>
        )}
        {/* Seed */}
        {p.seed && (
          <div>
            <label style={S.label}>Seed (optional)</label>
            <input style={S.input} type="number" placeholder="Random" value={opts.seed || ''} onChange={e => setOpts(o => ({ ...o, seed: e.target.value }))} />
          </div>
        )}
        {/* LoRA */}
        {p.lora && (
          <div style={{ padding: 12, background: '#0d0d1a', borderRadius: 8, border: '1px solid #1f2937' }}>
            <label style={S.label}>LoRA Weights (optional)</label>
            <input style={{ ...S.input, marginBottom: 8 }} placeholder="URL to .safetensors file..." value={opts.lora_url || ''} onChange={e => setOpts(o => ({ ...o, lora_url: e.target.value }))} />
            {opts.lora_url && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...S.label, fontSize: 11 }}>Scale: {opts.lora_scale ?? 1}</label>
                  <input type="range" min={0} max={2} step={0.1} value={opts.lora_scale ?? 1} onChange={e => setOpts(o => ({ ...o, lora_scale: +e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
            )}
            <input style={S.input} placeholder="LoRA 2 URL (optional)..." value={opts.lora_url_2 || ''} onChange={e => setOpts(o => ({ ...o, lora_url_2: e.target.value }))} />
            {opts.lora_url_2 && (
              <div style={{ flex: 1, marginTop: 8 }}>
                <label style={{ ...S.label, fontSize: 11 }}>Scale 2: {opts.lora_scale_2 ?? 1}</label>
                <input type="range" min={0} max={2} step={0.1} value={opts.lora_scale_2 ?? 1} onChange={e => setOpts(o => ({ ...o, lora_scale_2: +e.target.value }))} style={{ width: '100%' }} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  // ─── Generate Motion Control ───
  const generateMotion = async () => {
    if (!canGenerate()) return;
    const modelCfg = MOTION_MODELS.find(m => m.id === motionModel);
    const isKling = motionModel.includes('kling');
    const isAnimate = motionModel.includes('animate');
    if (isKling && !motionImage) return setError('Upload a reference image');
    if (isKling && !motionVideo) return setError('Upload a reference video');
    if (isAnimate && !motionVideo) return setError('Upload an input video');
    if (isAnimate && !motionImage) return setError('Upload a character image');
    const jobId = addJob('motion', motionModel, motionPrompt.trim());
    setError('');
    try {
      const input = {};
      if (motionPrompt.trim()) input.prompt = motionPrompt.trim();
      // Image — upload to get URL for Kling models
      updateJob(jobId, { status: 'Uploading image...' });
      const imgUrl = await uploadToReplicate(motionImage, 'image/png');
      if (isKling) input.image = imgUrl;
      else input.character_image = imgUrl;
      // Video — upload to get URL (Kling requires URL, not base64)
      updateJob(jobId, { status: 'Uploading video...' });
      const vidUrl = await uploadToReplicate(motionVideo, 'video/mp4');
      input.video = vidUrl;
      // Model-specific params
      if (isKling) {
        input.character_orientation = motionOpts.character_orientation || 'image';
        input.mode = motionOpts.mode || 'std';
        input.keep_original_sound = motionOpts.keep_original_sound !== false;
      } else {
        input.resolution = motionOpts.resolution || '720';
        input.refert_num = motionOpts.refert_num || 1;
        input.frames_per_second = motionOpts.fps || 24;
        input.go_fast = motionOpts.go_fast !== false;
        input.merge_audio = motionOpts.merge_audio !== false;
        if (motionOpts.seed) input.seed = parseInt(motionOpts.seed);
      }
      updateJob(jobId, { status: 'Generating...' });
      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: motionModel, input }),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();
      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` }); await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');
      const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      const item = { type: 'video', url, prompt: motionPrompt.trim() || 'Motion control', model: motionModel, ts: Date.now() };
      setResults(prev => [item, ...prev]);
      setHistory(prev => ({ ...prev, videos: [item, ...prev.videos].slice(0, 50) }));
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Lip Sync ───
  const generateLipsync = async () => {
    if (!canGenerate()) return;
    const isKling = lipsyncModel.includes('kling');
    const isSync = lipsyncModel.includes('sync/');
    const isPix = lipsyncModel.includes('pixverse');
    if (!isKling && !lipsyncVideo) return setError('Upload a video');
    if ((isSync || isPix) && !lipsyncAudio) return setError('Upload an audio file');
    if (isKling && !lipsyncVideo && !lipsyncOpts.video_url?.trim()) return setError('Upload a video or enter video URL');
    if (isKling && !lipsyncAudio && !lipsyncText.trim()) return setError('Enter text or upload audio');
    const jobId = addJob('lipsync', lipsyncModel, 'Lip sync');
    setError('');
    try {
      const input = {};
      if (isKling) {
        if (lipsyncVideo) {
          updateJob(jobId, { status: 'Uploading video...' });
          input.video_url = await uploadToReplicate(lipsyncVideo, 'video/mp4');
        } else if (lipsyncOpts.video_url?.trim()) input.video_url = lipsyncOpts.video_url.trim();
        if (lipsyncAudio) {
          updateJob(jobId, { status: 'Uploading audio...' });
          input.audio_file = await uploadToReplicate(lipsyncAudio, 'audio/mpeg');
        } else if (lipsyncText.trim()) {
          input.text = lipsyncText.trim();
          input.voice_id = lipsyncOpts.voice_id || 'en_AOT';
          input.voice_speed = lipsyncOpts.voice_speed || 1;
        }
      } else {
        updateJob(jobId, { status: 'Uploading video...' });
        input.video = await uploadToReplicate(lipsyncVideo, 'video/mp4');
        updateJob(jobId, { status: 'Uploading audio...' });
        input.audio = await uploadToReplicate(lipsyncAudio, 'audio/mpeg');
        if (isSync) {
          input.sync_mode = lipsyncOpts.sync_mode || 'loop';
          input.temperature = lipsyncOpts.temperature ?? 0.5;
          input.active_speaker = !!lipsyncOpts.active_speaker;
        }
      }
      updateJob(jobId, { status: 'Generating...' });
      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: lipsyncModel, input }),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();
      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` }); await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');
      const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      const item = { type: 'video', url, prompt: 'Lip sync', model: lipsyncModel, ts: Date.now() };
      setResults(prev => [item, ...prev]);
      setHistory(prev => ({ ...prev, videos: [item, ...prev.videos].slice(0, 50) }));
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Transcription ───
  const generateTranscribe = async () => {
    if (!transcribeAudio) return setError('Upload an audio file');
    if (!canGenerate()) return;
    const jobId = addJob('transcribe', transcribeModel, 'Transcription');
    setError('');
    try {
      const input = {};
      updateJob(jobId, { status: 'Preparing audio...' });
      const audioData = transcribeAudio.startsWith('blob:') ? await toDataUri(transcribeAudio) : transcribeAudio;
      const isGPT4o = transcribeModel.includes('gpt-4o');
      const isWhisper = transcribeModel.includes('whisper');
      const isGemini = transcribeModel.includes('gemini');
      const curTransModel = TRANSCRIBE_MODELS.find(m => m.id === transcribeModel);
      if (isGPT4o) {
        input.audio_file = audioData;
        if (transcribePrompt.trim()) input.prompt = transcribePrompt.trim();
        if (transcribeOpts.language?.trim()) input.language = transcribeOpts.language.trim();
        input.temperature = transcribeOpts.temperature ?? 0;
      } else if (isWhisper) {
        input.audio = audioData;
        input.transcription = transcribeOpts.transcription || 'plain text';
        input.translate = !!transcribeOpts.translate;
        if (transcribeOpts.language?.trim()) input.language = transcribeOpts.language.trim();
        else input.language = 'auto';
        input.temperature = transcribeOpts.temperature ?? 0;
        input.condition_on_previous_text = transcribeOpts.condition_on_previous_text !== false;
      } else if (isGemini) {
        // Gemini needs a URL with correct content-type (data URIs fail with octet-stream)
        let audioMime = transcribeAudioMime || 'audio/mpeg';
        if (audioMime.startsWith('video/')) audioMime = audioMime.replace('video/', 'audio/');
        if (audioMime === 'application/octet-stream' || !audioMime.startsWith('audio/')) audioMime = 'audio/mpeg';
        updateJob(jobId, { status: 'Uploading audio...' });
        const audioUrl = await uploadToReplicate(transcribeAudio, audioMime);
        input.audio = audioUrl;
        input.images = [];
        input.videos = [];
        input.prompt = transcribePrompt.trim() || 'Transcribe this audio accurately';
        if (transcribeOpts.system_instruction?.trim()) input.system_instruction = transcribeOpts.system_instruction.trim();
        input.thinking_level = transcribeOpts.thinking_level || 'low';
        input.temperature = transcribeOpts.temperature ?? 1;
        input.top_p = 0.95;
        input.max_output_tokens = transcribeOpts.max_output_tokens || 65535;
      }
      updateJob(jobId, { status: 'Transcribing...' });
      // Version-based models (Whisper) need version field
      let reqBody;
      if (curTransModel?.useVersion && transcribeModel.includes(':')) {
        const version = transcribeModel.split(':')[1];
        reqBody = { version, input };
      } else {
        reqBody = { model: transcribeModel, input };
      }
      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();
      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` }); await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Transcription failed');
      let output = pred.output;
      if (typeof output === 'object' && output?.text) output = output.text;
      if (typeof output === 'object' && output?.transcription) output = output.transcription;
      if (Array.isArray(output)) output = output.join('');
      if (typeof output === 'object') output = JSON.stringify(output, null, 2);
      setTranscribeResult(output);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  const deleteHistoryItem = (type, idx) => setHistory(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));

  // ─── Render ───
  if (authState === 'loading') return <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid #333', borderTopColor: '#667eea', borderRadius: '50%' }} /></div>;
  if (authState === 'auth') return <AuthScreen onAuth={handleAuth} />;

  const curImgModel = IMAGE_MODELS.find(m => m.id === model);

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NexusLogo size={32} />
          <span style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS AI Pro</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {user?.isPaid ? <span style={{ fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(74,222,128,0.2)' }}>✓ Pro</span>
            : <span onClick={() => setShowPaywall(true)} style={{ fontSize: 10, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer' }}>🔒 Free</span>}
          <button onClick={() => setShowSettings(true)} style={{ ...S.btnSm, padding: '5px 10px', fontSize: 12 }}>⚙</button>
          <button onClick={handleLogout} style={{ ...S.btnSm, padding: '5px 10px', fontSize: 12 }}>Sign Out</button>
        </div>
      </header>

      <div style={S.container}>
        {/* Tabs */}
        <div style={S.tabs}>
          {[{id:'image',icon:'🎨',label:'Text to Image'},{id:'i2i',icon:'🔄',label:'Img to Img'},{id:'i2v',icon:'🖼️',label:'Img to Video'},{id:'t2v',icon:'🎬',label:'Text to Video'},{id:'motion',icon:'🎭',label:'Motion'},{id:'lipsync',icon:'👄',label:'Lip Sync'},{id:'transcribe',icon:'🎙️',label:'Transcribe'},{id:'chat',icon:'💬',label:'AI Chat'},{id:'history',icon:'📂',label:'History'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 12px', background: tab === t.id ? 'rgba(102,126,234,0.15)' : 'none', border: tab === t.id ? '1px solid rgba(102,126,234,0.3)' : '1px solid transparent', borderRadius: 8, color: tab === t.id ? '#fff' : '#888', fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0, position: 'relative' }}>
              {t.icon} {t.label}
              {jobs.some(j => j.tab === t.id && !j.done) && t.id !== tab && <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#667eea', animation: 'spin 1s linear infinite', border: '1.5px solid transparent', borderTopColor: '#fff' }} />}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div style={S.errorBox}><span>⚠ {error}</span><span onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span></div>}

        {/* Loading Bar */}
        {loading && (
          <div style={{ padding: '16px 20px', background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid #333', borderTopColor: '#667eea', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ color: '#aaa', fontSize: 14 }}>{loadingStatus || 'Generating...'}</span>
          </div>
        )}

        {/* ══ IMAGE TAB ══ */}
        {tab === 'image' && (
          <div>
            <textarea style={{ ...S.input, minHeight: 80 }} placeholder="Describe the image you want to create..." value={prompt} onChange={e => setPrompt(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <select value={model} onChange={e => { setModel(e.target.value); if (e.target.value.includes('schnell')) setSteps(4); else setSteps(20); }} style={{ ...S.select, flex: '1 1 auto', minWidth: 0, width: '100%' }}>
                {IMAGE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}{m.nsfw ? ' 🔞 NSFW' : ''}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {ASPECTS.map(a => (
                  <button key={a.id} onClick={() => setAspect(a.id)} style={{ padding: '7px 10px', background: aspect === a.id ? 'rgba(102,126,234,0.2)' : '#111827', border: aspect === a.id ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: aspect === a.id ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 }}>{a.id}</button>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div style={{ marginBottom: 12 }}>
              <span onClick={() => setShowAdvanced(!showAdvanced)} style={{ color: '#888', fontSize: 13, cursor: 'pointer' }}>{showAdvanced ? '▼' : '▶'} Advanced Settings</span>
              {showAdvanced && (
                <div style={{ marginTop: 8, padding: 16, background: '#111827', borderRadius: 8, border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={S.label}>Negative Prompt</label><input style={S.input} placeholder="What to avoid..." value={negPrompt} onChange={e => setNegPrompt(e.target.value)} /></div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}><label style={S.label}>Steps: {steps}</label><input type="range" min={1} max={curImgModel?.maxSteps || 50} value={steps} onChange={e => setSteps(+e.target.value)} style={{ width: '100%' }} /></div>
                    {!model.includes('schnell') && <div style={{ flex: 1 }}><label style={S.label}>Guidance: {guidance}</label><input type="range" min={1} max={20} step={0.5} value={guidance} onChange={e => setGuidance(+e.target.value)} style={{ width: '100%' }} /></div>}
                  </div>
                  <div><label style={S.label}>Seed (optional)</label><input style={S.input} type="number" placeholder="Random" value={seed} onChange={e => setSeed(e.target.value)} /></div>
                </div>
              )}
            </div>

            <button onClick={generateImage} style={S.btn}>
              ✨ Generate Image
            </button>

            {/* Results */}
            {results.filter(r => r.type === 'image').length > 0 && (
              <div style={S.grid}>
                {results.filter(r => r.type === 'image').map((item, i) => (
                  <div key={i} style={S.gridCard} onClick={() => setViewerItem(item)}>
                    <MediaImg src={item.url} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                    <div style={{ padding: '8px 10px' }}><p style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.prompt}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ IMAGE TO IMAGE TAB ══ */}
        {tab === 'i2i' && (
          <div>
            <select value={i2iModel} onChange={e => setI2iModel(e.target.value)} style={{ ...S.select, width: '100%', marginBottom: 12 }}>
              {I2I_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}{m.nsfw ? ' 🔞 NSFW' : ''}</option>)}
            </select>

            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>Source Image</label>
              {i2iImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={i2iImage} alt="" style={{ maxHeight: 180, borderRadius: 8, border: '1px solid #333' }} />
                  <button onClick={() => setI2iImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '40px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🔄 Click to upload source image<br/><span style={{ fontSize: 12, color: '#555' }}>JPG, PNG • Will be transformed based on your prompt</span>
                  <input type="file" accept="image/*" onChange={handleI2IFile} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <textarea style={{ ...S.input, minHeight: 80 }} placeholder="Describe how you want the image transformed..." value={i2iPrompt} onChange={e => setI2iPrompt(e.target.value)} />

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 100%', minWidth: 0 }}>
                <label style={S.label}>Strength: {i2iStrength}</label>
                <input type="range" min={0.1} max={1} step={0.05} value={i2iStrength} onChange={e => setI2iStrength(+e.target.value)} style={{ width: '100%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>Subtle</span><span>Strong</span></div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {ASPECTS.map(a => (
                  <button key={a.id} onClick={() => setAspect(a.id)} style={{ padding: '7px 10px', background: aspect === a.id ? 'rgba(102,126,234,0.2)' : '#111827', border: aspect === a.id ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: aspect === a.id ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 }}>{a.id}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Negative prompt (optional)..." value={i2iNegPrompt} onChange={e => setI2iNegPrompt(e.target.value)} />
            </div>

            <button onClick={generateI2I} style={S.btn}>
              🔄 Generate Image to Image
            </button>

            {results.filter(r => r.type === 'image').length > 0 && (
              <div style={S.grid}>
                {results.filter(r => r.type === 'image').map((item, i) => (
                  <div key={i} style={S.gridCard} onClick={() => setViewerItem(item)}>
                    <MediaImg src={item.url} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                    <div style={{ padding: '8px 10px' }}><p style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.prompt}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ IMAGE TO VIDEO TAB ══ */}
        {tab === 'i2v' && (
          <div>
            <select value={i2vModel} onChange={e => { setI2vModel(e.target.value); setI2vOpts({}); }} style={{ ...S.select, width: '100%', marginBottom: 12 }}>
              {I2V_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}{m.nsfw ? ' 🔞 NSFW' : ''}</option>)}
            </select>

            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>Source Image (Start Frame)</label>
              {i2vImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={i2vImage} alt="" style={{ maxHeight: 180, borderRadius: 8, border: '1px solid #333' }} />
                  <button onClick={() => setI2vImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '40px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🖼️ Click to upload source image<br/><span style={{ fontSize: 12, color: '#555' }}>JPG, PNG • The image will be animated</span>
                  <input type="file" accept="image/*" onChange={handleI2VFile} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Last Frame (Veo 3.1, Kling, Wan 2.2) */}
            {I2V_MODELS.find(m => m.id === i2vModel)?.params?.last_frame && (
              <div style={{ marginBottom: 12 }}>
                <label style={S.label}>End Frame (optional)</label>
                {i2vLastFrame ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={i2vLastFrame} alt="" style={{ maxHeight: 120, borderRadius: 8, border: '1px solid #333' }} />
                    <button onClick={() => setI2vLastFrame(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                  </div>
                ) : (
                  <label style={{ display: 'block', padding: '20px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#666', background: '#0a0a18', fontSize: 13 }}>
                    🎬 Upload end frame (optional)
                    <input type="file" accept="image/*" onChange={handleI2VLastFrame} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            )}

            <textarea style={{ ...S.input, minHeight: 60, marginBottom: 12 }} placeholder="Describe the motion you want (optional)..." value={i2vPrompt} onChange={e => setI2vPrompt(e.target.value)} />

            {renderVideoOpts(I2V_MODELS.find(m => m.id === i2vModel), i2vOpts, setI2vOpts, i2vOpts.negative_prompt, (v) => setI2vOpts(o => ({ ...o, negative_prompt: v })))}

            <button onClick={generateI2V} style={S.btn}>
              🖼️ Generate Image to Video
            </button>

            {results.filter(r => r.type === 'video').length > 0 && (
              <div style={S.grid}>
                {results.filter(r => r.type === 'video').map((item, i) => (
                  <div key={i} style={S.gridCard} onClick={() => setViewerItem(item)}>
                    <MediaVid src={item.url} onMouseEnter={e => e.target?.play?.()} onMouseLeave={e => { if(e.target?.pause) { e.target.pause(); e.target.currentTime = 0; }}} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', minHeight: 100 }} onClick={() => setViewerItem(item)} />
                    <div style={{ padding: '8px 10px' }}><p style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.prompt}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TEXT TO VIDEO TAB ══ */}
        {tab === 't2v' && (
          <div>
            <select value={t2vModel} onChange={e => { setT2vModel(e.target.value); setT2vOpts({}); }} style={{ ...S.select, width: '100%', marginBottom: 12 }}>
              {T2V_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}{m.nsfw ? ' 🔞 NSFW' : ''}</option>)}
            </select>

            <textarea style={{ ...S.input, minHeight: 80, marginBottom: 12 }} placeholder="Describe the video you want to create..." value={t2vPrompt} onChange={e => setT2vPrompt(e.target.value)} />

            {renderVideoOpts(T2V_MODELS.find(m => m.id === t2vModel), t2vOpts, setT2vOpts, t2vNegPrompt, setT2vNegPrompt)}

            <button onClick={generateT2V} style={S.btn}>
              🎬 Generate Text to Video
            </button>

            {results.filter(r => r.type === 'video').length > 0 && (
              <div style={S.grid}>
                {results.filter(r => r.type === 'video').map((item, i) => (
                  <div key={i} style={S.gridCard} onClick={() => setViewerItem(item)}>
                    <MediaVid src={item.url} onMouseEnter={e => e.target?.play?.()} onMouseLeave={e => { if(e.target?.pause) { e.target.pause(); e.target.currentTime = 0; }}} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', minHeight: 100 }} onClick={() => setViewerItem(item)} />
                    <div style={{ padding: '8px 10px' }}><p style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.prompt}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MOTION CONTROL TAB ══ */}
        {tab === 'motion' && (() => {
          const isKling = motionModel.includes('kling');
          const isAnimate = motionModel.includes('animate');
          const curMotion = MOTION_MODELS.find(m => m.id === motionModel);
          const btnSt = (sel) => ({ padding: '6px 12px', background: sel ? 'rgba(102,126,234,0.2)' : '#111827', border: sel ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          const checkSt = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aaa', fontSize: 13 };
          return (
          <div>
            <select value={motionModel} onChange={e => { setMotionModel(e.target.value); setMotionOpts({}); }} style={{ ...S.select, width: '100%', marginBottom: 12 }}>
              {MOTION_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>)}
            </select>

            {/* Reference Image */}
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>{isKling ? 'Reference Image' : 'Character Image'}</label>
              {motionImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={motionImage} alt="" style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} />
                  <button onClick={() => setMotionImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '30px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🖼️ Upload {isKling ? 'reference' : 'character'} image<br/><span style={{ fontSize: 11, color: '#555' }}>JPG, PNG • {isKling ? 'Characters & backgrounds based on this' : 'Character to animate'}</span>
                  <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setMotionImage(URL.createObjectURL(e.target.files[0])); }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Reference Video */}
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>{isKling ? 'Reference Video (motion source)' : 'Input Video (motion reference)'}</label>
              {motionVideo ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <video src={motionVideo} style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} controls playsInline />
                  <button onClick={() => setMotionVideo(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '30px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🎬 Upload reference video<br/><span style={{ fontSize: 11, color: '#555' }}>{isKling ? 'MP4/MOV • 3-30s • Actions will be transferred' : 'MP4 • Motion will be applied to character'}</span>
                  <input type="file" accept="video/*" onChange={e => { if(e.target.files?.[0]) setMotionVideo(URL.createObjectURL(e.target.files[0])); }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Prompt (Kling only) */}
            {isKling && <textarea style={{ ...S.input, minHeight: 60, marginBottom: 12 }} placeholder="Describe motion effects (optional)..." value={motionPrompt} onChange={e => setMotionPrompt(e.target.value)} />}

            {/* Model-specific options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {isKling && (
                <>
                  <div>
                    <label style={S.label}>Character Orientation</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['image','video'].map(o => <button key={o} onClick={() => setMotionOpts(p => ({...p, character_orientation: o}))} style={btnSt((motionOpts.character_orientation||'image')===o)}>{o === 'image' ? '🖼️ Image (max 10s)' : '🎬 Video (max 30s)'}</button>)}
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>Mode</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['std','pro'].map(m => <button key={m} onClick={() => setMotionOpts(p => ({...p, mode: m}))} style={btnSt((motionOpts.mode||'std')===m)}>{m === 'std' ? 'Standard' : 'Professional'}</button>)}
                    </div>
                  </div>
                  <label style={checkSt}><input type="checkbox" checked={motionOpts.keep_original_sound !== false} onChange={e => setMotionOpts(p => ({...p, keep_original_sound: e.target.checked}))} />🔊 Keep original sound</label>
                </>
              )}
              {isAnimate && (
                <>
                  <div>
                    <label style={S.label}>Resolution</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['720','480'].map(r => <button key={r} onClick={() => setMotionOpts(p => ({...p, resolution: r}))} style={btnSt((motionOpts.resolution||'720')===r)}>{r}p</button>)}
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>Reference Frames</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,5].map(n => <button key={n} onClick={() => setMotionOpts(p => ({...p, refert_num: n}))} style={btnSt((motionOpts.refert_num||1)===n)}>{n} frame{n>1?'s':''}</button>)}
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>FPS: {motionOpts.fps || 24}</label>
                    <input type="range" min={5} max={60} value={motionOpts.fps || 24} onChange={e => setMotionOpts(p => ({...p, fps: +e.target.value}))} style={{ width: '100%' }} />
                  </div>
                  <label style={checkSt}><input type="checkbox" checked={motionOpts.go_fast !== false} onChange={e => setMotionOpts(p => ({...p, go_fast: e.target.checked}))} />⚡ Go Fast</label>
                  <label style={checkSt}><input type="checkbox" checked={motionOpts.merge_audio !== false} onChange={e => setMotionOpts(p => ({...p, merge_audio: e.target.checked}))} />🔊 Merge audio from input</label>
                  <div><label style={S.label}>Seed (optional)</label><input style={S.input} type="number" placeholder="Random" value={motionOpts.seed||''} onChange={e => setMotionOpts(p => ({...p, seed: e.target.value}))} /></div>
                </>
              )}
            </div>

            <button onClick={generateMotion} style={S.btn}>
              🎭 Generate Motion Control
            </button>

            {results.filter(r => r.type === 'video').length > 0 && (
              <div style={S.grid}>
                {results.filter(r => r.type === 'video').map((item, i) => (
                  <div key={i} style={S.gridCard} onClick={() => setViewerItem(item)}>
                    <MediaVid src={item.url} onMouseEnter={e => e.target?.play?.()} onMouseLeave={e => { if(e.target?.pause) { e.target.pause(); e.target.currentTime = 0; }}} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', minHeight: 100 }} onClick={() => setViewerItem(item)} />
                    <div style={{ padding: '8px 10px' }}><p style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.prompt}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })()}

        {/* ══ LIP SYNC TAB ══ */}
        {tab === 'lipsync' && (() => {
          const isKling = lipsyncModel.includes('kling');
          const isSync = lipsyncModel.includes('sync/');
          const isPix = lipsyncModel.includes('pixverse');
          const btnSt = (sel) => ({ padding: '6px 12px', background: sel ? 'rgba(102,126,234,0.2)' : '#111827', border: sel ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          const checkSt = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aaa', fontSize: 13 };
          return (
          <div>
            <select value={lipsyncModel} onChange={e => { setLipsyncModel(e.target.value); setLipsyncOpts({}); setLipsyncText(''); }} style={{ ...S.select, width: '100%', marginBottom: 12 }}>
              {LIPSYNC_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>)}
            </select>

            {/* Video input */}
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>Video {isKling ? '(or paste URL below)' : ''}</label>
              {lipsyncVideo ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <video src={lipsyncVideo} style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} controls playsInline />
                  <button onClick={() => setLipsyncVideo(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '30px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🎬 Upload video<br/><span style={{ fontSize: 11, color: '#555' }}>{isKling ? 'MP4/MOV • 2-10s • 720p-1080p' : isSync ? 'MP4 video file' : 'Video file'}</span>
                  <input type="file" accept="video/*" onChange={e => { if(e.target.files?.[0]) setLipsyncVideo(URL.createObjectURL(e.target.files[0])); }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Kling: video URL alternative */}
            {isKling && !lipsyncVideo && (
              <div style={{ marginBottom: 12 }}>
                <input style={S.input} placeholder="Or paste video URL (mp4/mov)..." value={lipsyncOpts.video_url||''} onChange={e => setLipsyncOpts(p => ({...p, video_url: e.target.value}))} />
              </div>
            )}

            {/* Audio input (all models) */}
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>Audio {isKling ? '(or use text-to-speech below)' : ''}</label>
              {lipsyncAudio ? (
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <audio src={lipsyncAudio} controls style={{ height: 40 }} />
                  <button onClick={() => setLipsyncAudio(null)} style={{ width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '20px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🎙️ Upload audio<br/><span style={{ fontSize: 11, color: '#555' }}>{isKling ? 'MP3, WAV, M4A, AAC • Max 5MB' : isSync ? 'WAV audio file' : 'Audio file'}</span>
                  <input type="file" accept="audio/*" onChange={e => { if(e.target.files?.[0]) setLipsyncAudio(URL.createObjectURL(e.target.files[0])); }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Kling: Text-to-speech as alternative to audio */}
            {isKling && !lipsyncAudio && (
              <div style={{ marginBottom: 12 }}>
                <label style={S.label}>Or enter text (will use TTS)</label>
                <textarea style={{ ...S.input, minHeight: 60 }} placeholder="Text to speak..." value={lipsyncText} onChange={e => setLipsyncText(e.target.value)} />
                {lipsyncText.trim() && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <div>
                      <label style={S.label}>Voice</label>
                      <select value={lipsyncOpts.voice_id||'en_AOT'} onChange={e => setLipsyncOpts(p => ({...p, voice_id: e.target.value}))} style={{ ...S.select, width: '100%' }}>
                        {KLING_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Speed: {lipsyncOpts.voice_speed || 1}x</label>
                      <input type="range" min={0.8} max={2} step={0.1} value={lipsyncOpts.voice_speed || 1} onChange={e => setLipsyncOpts(p => ({...p, voice_speed: +e.target.value}))} style={{ width: '100%' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sync Pro options */}
            {isSync && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={S.label}>Sync Mode</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {['loop','bounce','cut_off','silence','remap'].map(m => <button key={m} onClick={() => setLipsyncOpts(p => ({...p, sync_mode: m}))} style={btnSt((lipsyncOpts.sync_mode||'loop')===m)}>{m}</button>)}
                  </div>
                </div>
                <div>
                  <label style={S.label}>Expression: {lipsyncOpts.temperature ?? 0.5}</label>
                  <input type="range" min={0} max={1} step={0.1} value={lipsyncOpts.temperature ?? 0.5} onChange={e => setLipsyncOpts(p => ({...p, temperature: +e.target.value}))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>Subtle</span><span>Expressive</span></div>
                </div>
                <label style={checkSt}><input type="checkbox" checked={!!lipsyncOpts.active_speaker} onChange={e => setLipsyncOpts(p => ({...p, active_speaker: e.target.checked}))} />🗣️ Auto-detect active speaker</label>
              </div>
            )}

            <button onClick={generateLipsync} style={S.btn}>
              👄 Generate Lip Sync
            </button>

            {results.filter(r => r.type === 'video').length > 0 && (
              <div style={S.grid}>
                {results.filter(r => r.type === 'video').map((item, i) => (
                  <div key={i} style={S.gridCard} onClick={() => setViewerItem(item)}>
                    <MediaVid src={item.url} onMouseEnter={e => e.target?.play?.()} onMouseLeave={e => { if(e.target?.pause) { e.target.pause(); e.target.currentTime = 0; }}} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', minHeight: 100 }} onClick={() => setViewerItem(item)} />
                    <div style={{ padding: '8px 10px' }}><p style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.prompt}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })()}

        {/* ══ TRANSCRIBE TAB ══ */}
        {tab === 'transcribe' && (() => {
          const isGPT4o = transcribeModel.includes('gpt-4o');
          const isWhisper = transcribeModel.includes('whisper');
          const isGemini = transcribeModel.includes('gemini');
          const btnSt = (sel) => ({ padding: '6px 12px', background: sel ? 'rgba(102,126,234,0.2)' : '#111827', border: sel ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          const checkSt = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aaa', fontSize: 13 };
          return (
          <div>
            <select value={transcribeModel} onChange={e => { setTranscribeModel(e.target.value); setTranscribeOpts({}); }} style={{ ...S.select, width: '100%', marginBottom: 12 }}>
              {TRANSCRIBE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>)}
            </select>

            {/* Audio upload */}
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}>Audio File</label>
              {transcribeAudio ? (
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <audio src={transcribeAudio} controls style={{ height: 40 }} />
                  <button onClick={() => setTranscribeAudio(null)} style={{ width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'block', padding: '30px 16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18' }}>
                  🎙️ Upload audio file<br/><span style={{ fontSize: 11, color: '#555' }}>{isGPT4o ? 'MP3, MP4, WAV, WEBM, OGG' : isWhisper ? 'MP3, MP4, WAV, WEBM, OGG' : 'Audio file (up to 8.4 hours)'}</span>
                  <input type="file" accept="audio/*,.mp3,.mp4,.wav,.ogg,.webm,.m4a,.mpeg,.mpga" onChange={e => { const f = e.target.files?.[0]; if(f) { setTranscribeAudio(URL.createObjectURL(f)); setTranscribeAudioMime(f.type || 'audio/mpeg'); } }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Prompt */}
            {(isGPT4o || isGemini) && (
              <textarea style={{ ...S.input, minHeight: 50, marginBottom: 12 }} placeholder={isGemini ? 'Prompt (e.g. Transcribe this audio accurately)...' : 'Optional prompt to guide transcription style...'} value={transcribePrompt} onChange={e => setTranscribePrompt(e.target.value)} />
            )}

            {/* Model-specific options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {/* Language (GPT-4o & Whisper) */}
              {(isGPT4o || isWhisper) && (
                <div>
                  <label style={S.label}>Language (ISO-639-1, e.g. en, es, hi)</label>
                  <input style={S.input} placeholder={isWhisper ? 'auto' : 'en'} value={transcribeOpts.language||''} onChange={e => setTranscribeOpts(p => ({...p, language: e.target.value}))} />
                </div>
              )}

              {/* Whisper-specific */}
              {isWhisper && (
                <>
                  <div>
                    <label style={S.label}>Output Format</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['plain text','srt','vtt'].map(f => <button key={f} onClick={() => setTranscribeOpts(p => ({...p, transcription: f}))} style={btnSt((transcribeOpts.transcription||'plain text')===f)}>{f.toUpperCase()}</button>)}
                    </div>
                  </div>
                  <label style={checkSt}><input type="checkbox" checked={!!transcribeOpts.translate} onChange={e => setTranscribeOpts(p => ({...p, translate: e.target.checked}))} />🌐 Translate to English</label>
                  <label style={checkSt}><input type="checkbox" checked={transcribeOpts.condition_on_previous_text !== false} onChange={e => setTranscribeOpts(p => ({...p, condition_on_previous_text: e.target.checked}))} />📝 Condition on previous text</label>
                </>
              )}

              {/* Gemini-specific */}
              {isGemini && (
                <>
                  <textarea style={{ ...S.input, minHeight: 36, fontSize: 12 }} placeholder="System instruction (optional)..." value={transcribeOpts.system_instruction||''} onChange={e => setTranscribeOpts(p => ({...p, system_instruction: e.target.value}))} />
                  <div>
                    <label style={S.label}>Thinking Level</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['low','high'].map(t => <button key={t} onClick={() => setTranscribeOpts(p => ({...p, thinking_level: t}))} style={btnSt((transcribeOpts.thinking_level||'low')===t)}>{t}</button>)}
                    </div>
                  </div>
                </>
              )}

              {/* Temperature (all models) */}
              <div>
                <label style={S.label}>Temperature: {transcribeOpts.temperature ?? (isGemini ? 1 : 0)}</label>
                <input type="range" min={0} max={isGemini ? 2 : 1} step={0.1} value={transcribeOpts.temperature ?? (isGemini ? 1 : 0)} onChange={e => setTranscribeOpts(p => ({...p, temperature: +e.target.value}))} style={{ width: '100%' }} />
              </div>
            </div>

            <button onClick={generateTranscribe} style={S.btn}>
              🎙️ Transcribe Audio
            </button>

            {/* Transcription result */}
            {transcribeResult && (
              <div style={{ marginTop: 16, padding: 16, background: '#111827', borderRadius: 10, border: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...S.label, margin: 0 }}>Transcription Result</label>
                  <button onClick={() => { navigator.clipboard.writeText(transcribeResult); }} style={{ ...S.btnSm, fontSize: 11 }}>📋 Copy</button>
                </div>
                <div style={{ background: '#0a0a18', borderRadius: 8, padding: 14, maxHeight: 400, overflowY: 'auto', fontSize: 14, color: '#ddd', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{transcribeResult}</div>
              </div>
            )}
          </div>
          );
        })()}

        {/* ══ AI CHAT TAB ══ */}
        {tab === 'chat' && (() => {
          const curChatModel = TEXT_MODELS.find(m => m.id === chatModel);
          const cp = curChatModel?.params || {};
          const btnSt = (sel) => ({ padding: '5px 10px', background: sel ? 'rgba(102,126,234,0.2)' : '#111827', border: sel ? '1px solid rgba(102,126,234,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          return (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 400 }}>
            {/* Model selector + settings */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={chatModel} onChange={e => { setChatModel(e.target.value); setChatOpts({}); }} style={{ ...S.select, flex: 1, minWidth: 180 }}>
                {TEXT_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>)}
              </select>
              <button onClick={() => { setChatMessages([]); setChatImage(null); }} style={{ ...S.btnSm, color: '#ef4444', borderColor: '#ef4444' }}>Clear Chat</button>
            </div>

            {/* Model-specific options row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {Array.isArray(cp.reasoning_effort) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Reasoning:</span>
                  {cp.reasoning_effort.map(r => <button key={r} onClick={() => setChatOpts(o => ({ ...o, reasoning_effort: r }))} style={btnSt((chatOpts.reasoning_effort || cp.reasoning_effort[0]) === r)}>{r}</button>)}
                </div>
              )}
              {Array.isArray(cp.verbosity) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Verbosity:</span>
                  {cp.verbosity.map(v => <button key={v} onClick={() => setChatOpts(o => ({ ...o, verbosity: v }))} style={btnSt((chatOpts.verbosity || cp.verbosity[0]) === v)}>{v}</button>)}
                </div>
              )}
              {Array.isArray(cp.thinking_level) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Thinking:</span>
                  {cp.thinking_level.map(t => <button key={t} onClick={() => setChatOpts(o => ({ ...o, thinking_level: t }))} style={btnSt((chatOpts.thinking_level || cp.thinking_level[0]) === t)}>{t}</button>)}
                </div>
              )}
              {Array.isArray(cp.thinking) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Thinking:</span>
                  {cp.thinking.map(t => <button key={t} onClick={() => setChatOpts(o => ({ ...o, thinking: t }))} style={btnSt((chatOpts.thinking || cp.thinking[0]) === t)}>{t}</button>)}
                </div>
              )}
              {cp.temperature && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#666' }}>Temp: {chatOpts.temperature ?? cp.temperature.default}</span>
                  <input type="range" min={0} max={cp.temperature.max} step={0.1} value={chatOpts.temperature ?? cp.temperature.default} onChange={e => setChatOpts(o => ({ ...o, temperature: +e.target.value }))} style={{ width: 80 }} />
                </div>
              )}
            </div>

            {/* System prompt (collapsible) */}
            {cp.system_prompt && (
              <textarea style={{ ...S.input, minHeight: 36, marginBottom: 8, fontSize: 12 }} placeholder="System prompt (optional)..." value={chatSystemPrompt} onChange={e => setChatSystemPrompt(e.target.value)} />
            )}

            {/* Chat messages area */}
            <div style={{ flex: 1, overflowY: 'auto', borderRadius: 10, border: '1px solid #1f2937', background: '#0a0a18', padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#444', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 14 }}>Start a conversation with {curChatModel?.name || 'AI'}</p>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Ask questions, generate text, analyze images (text output only)</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
                    background: msg.role === 'user' ? 'rgba(102,126,234,0.2)' : '#111827',
                    border: msg.role === 'user' ? '1px solid rgba(102,126,234,0.3)' : '1px solid #1f2937',
                  }}>
                    {msg.role === 'assistant' && <div style={{ fontSize: 10, color: '#667eea', marginBottom: 4, fontWeight: 600 }}>{TEXT_MODELS.find(m => m.id === msg.model)?.name || 'AI'}</div>}
                    <div style={{ fontSize: 14, color: '#ddd', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.content}</div>
                  </div>
                </div>
              ))}
              {chatStreaming && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: '#111827', border: '1px solid #1f2937' }}>
                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #333', borderTopColor: '#667eea', borderRadius: '50%', display: 'inline-block' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Image attachment */}
            {cp.image && chatImage && (
              <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
                <img src={chatImage} alt="" style={{ maxHeight: 80, borderRadius: 8, border: '1px solid #333' }} />
                <button onClick={() => setChatImage(null)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10 }}>✕</button>
              </div>
            )}

            {/* Input area */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {cp.image && (
                <label style={{ padding: '10px 12px', background: '#111827', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', color: '#888', fontSize: 16, flexShrink: 0 }}>
                  📎
                  <input type="file" accept="image/*" onChange={handleChatImage} style={{ display: 'none' }} />
                </label>
              )}
              <textarea
                style={{ ...S.input, flex: 1, minHeight: 44, maxHeight: 120, resize: 'vertical' }}
                placeholder={`Message ${curChatModel?.name || 'AI'}...`}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateChat(); } }}
              />
              <button onClick={generateChat} disabled={loading || (!chatInput.trim() && !chatImage)} style={{ ...S.btn, width: 'auto', padding: '10px 20px', opacity: (loading || (!chatInput.trim() && !chatImage)) ? 0.5 : 1, flexShrink: 0 }}>
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
          );
        })()}

        {/* ══ HISTORY TAB ══ */}
        {tab === 'history' && (
          <div>
            {/* Images History */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, color: '#ccc' }}>🎨 Images ({history.images.length})</h3>
              {history.images.length > 0 && <button onClick={() => setHistory(p => ({ ...p, images: [] }))} style={{ ...S.btnSm, color: '#ef4444', borderColor: '#ef4444' }}>Clear All</button>}
            </div>
            {history.images.length === 0 ? <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>No images yet</p> : (
              <div style={{ ...S.grid, marginBottom: 24 }}>
                {history.images.map((item, i) => (
                  <div key={i} style={S.gridCard}>
                    <MediaImg src={item.url} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', minHeight: 120 }} onClick={() => setViewerItem(item)} />
                    <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.prompt}</span>
                      <button onClick={() => deleteHistoryItem('images', i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Videos History */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, color: '#ccc' }}>🎬 Videos ({history.videos.length})</h3>
              {history.videos.length > 0 && <button onClick={() => setHistory(p => ({ ...p, videos: [] }))} style={{ ...S.btnSm, color: '#ef4444', borderColor: '#ef4444' }}>Clear All</button>}
            </div>
            {history.videos.length === 0 ? <p style={{ color: '#555', fontSize: 14 }}>No videos yet</p> : (
              <div style={S.grid}>
                {history.videos.map((item, i) => (
                  <div key={i} style={S.gridCard}>
                    <MediaVid src={item.url} onMouseEnter={e => e.target?.play?.()} onMouseLeave={e => { if(e.target?.pause) { e.target.pause(); e.target.currentTime = 0; }}} style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', minHeight: 100 }} onClick={() => setViewerItem(item)} />
                    <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.prompt}</span>
                      <button onClick={() => deleteHistoryItem('videos', i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 16px', borderTop: '1px solid #1f2937', marginTop: 32 }}>
        <p style={{ color: '#444', fontSize: 12 }}>© 2026 NEXUS AI Pro · Powered by Replicate</p>
      </div>

      {/* Modals */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} accessToken={accessToken} user={user} onPaymentSuccess={(plan) => { setUser(prev => ({ ...prev, isPaid: true, paymentPlan: plan })); setShowPaywall(false); }} />}
      {showSettings && <SettingsModal apiKey={apiKey} onSave={saveApiKey} onClose={() => setShowSettings(false)} />}
      {viewerItem && <ViewerModal item={viewerItem} onClose={() => setViewerItem(null)} onUseForVideo={useForVideo} />}
    </div>
  );
}

// ═══════════════════════════════════════
// ─── Styles ───
// ═══════════════════════════════════════
// Responsive grid helper
const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

const S = {
  page: { minHeight: '100vh', background: '#0d0d1a', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', WebkitTextSizeAdjust: '100%' },
  gradientText: { fontSize: 26, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #1f2937', background: 'rgba(13,13,26,0.95)', position: 'sticky', top: 0, zIndex: 50, gap: 8 },
  container: { maxWidth: 900, margin: '0 auto', padding: '16px 10px' },
  tabs: { display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' },
  card: { maxWidth: 420, margin: '16px auto', padding: '24px 18px', background: '#111827', borderRadius: 14, border: '1px solid #1f2937', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 5, fontWeight: 500 },
  input: { width: '100%', padding: '11px 14px', background: '#0d0d1a', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 16, boxSizing: 'border-box', outline: 'none', WebkitAppearance: 'none' },
  select: { padding: '10px 14px', background: '#111827', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer', outline: 'none', WebkitAppearance: 'none', maxWidth: '100%', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' },
  btnSm: { padding: '6px 14px', background: '#111827', border: '1px solid #333', borderRadius: 6, color: '#ccc', fontSize: 13, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' },
  link: { color: '#818cf8', cursor: 'pointer', fontWeight: 500 },
  eyeIcon: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16, userSelect: 'none' },
  errorBox: { padding: '12px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 14, color: '#fca5a5', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  successBox: { padding: '12px 16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, marginBottom: 14, color: '#86efac', fontSize: 14 },
  closeBtn: { position: 'absolute', top: 12, right: 12, background: '#1f2937', border: 'none', color: '#888', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: 10, marginTop: 16 },
  gridCard: { background: '#111827', borderRadius: 10, overflow: 'hidden', border: '1px solid #1f2937', cursor: 'pointer', transition: 'border-color 0.2s' },
};

export default App;

import React, { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import CategoryScreen from './screens/CategoryScreen.jsx';
import ToolScreen from './screens/ToolScreen.jsx';

const API_BASE = window.location.origin;

// ??? Model Logo Helper ???
const getModelLogo = (modelId) => {
  const baseId = modelId.split(':')[0];
  const filename = baseId.replace('/', ':');
  return `/samples/models/${filename}.png`;
};

// ??? Custom Model Selector with Logos ???
const ModelSelector = ({ models, value, onChange, extraOptions, style }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const selected = models.find(m => m.id === value);
  const isTrainedModel = !selected && value;

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', marginBottom: 14, ...style }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.2s',
        borderColor: open ? 'rgba(34,212,123,0.5)' : 'rgba(255,255,255,0.12)'
      }}>
        {selected && <img src={getModelLogo(selected.id)} alt='' style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />}
        {isTrainedModel && <span style={{ fontSize: 20, flexShrink: 0 }}>?</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected ? selected.name : value}
          </div>
          {selected && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 1 }}>{selected.desc}</div>}
        </div>
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d='M2 4L6 8L10 4' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
        </svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 1000,
          background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxHeight: 320, overflowY: 'auto',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent'
        }}>
          {models.map(m => (
            <div key={m.id} onClick={() => { onChange(m.id); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                cursor: 'pointer', transition: 'background 0.15s',
                background: m.id === value ? 'rgba(34,212,123,0.1)' : 'transparent',
                borderLeft: m.id === value ? '3px solid #22d47b' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (m.id !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (m.id !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              <img src={getModelLogo(m.id)} alt='' style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{m.desc}</div>
              </div>
              {m.id === value && <span style={{ color: '#22d47b', fontSize: 14 }}>?</span>}
            </div>
          ))}
          {extraOptions}
        </div>
      )}
    </div>
  );
};

// ─── Model Configs ───
const IMAGE_MODELS = [
  { id: 'prunaai/wan-2.2-image', name: 'Wan 2.2 Image', desc: 'Wan Text to Image', maxSteps: 50, nsfw: true },
  { id: 'bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe', name: 'SDXL Lightning 4-Step', desc: 'Ultra fast SDXL (~2s)', maxSteps: 10, nsfw: true, useVersion: true },
  { id: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc', name: 'SDXL 1.0', desc: 'Stable Diffusion XL', maxSteps: 50, nsfw: true, useVersion: true },
  { id: 'black-forest-labs/flux-schnell', name: 'FLUX Schnell', desc: 'Fast (~2s)', maxSteps: 4, nsfw: false },
  { id: 'black-forest-labs/flux-dev', name: 'FLUX Dev', desc: 'High quality (~10s)', maxSteps: 50, nsfw: false },
  { id: 'black-forest-labs/flux-1.1-pro', name: 'FLUX 1.1 Pro', desc: 'Best quality (~15s)', maxSteps: 50, nsfw: false },
  { id: 'black-forest-labs/flux-1.1-pro-ultra', name: 'FLUX 1.1 Pro Ultra', desc: 'Ultra HD (~20s)', maxSteps: 50, nsfw: false },
  { id: 'google/nano-banana-pro', name: 'Google Nano Banana Pro', desc: 'Google T2I', maxSteps: 50, nsfw: false },
  { id: 'prunaai/flux-fast', name: 'FLUX Fast (Pruna)', desc: 'Speed optimized (~4s)', maxSteps: 28, nsfw: false },
  { id: 'ideogram-ai/ideogram-v3-quality', name: 'Ideogram V3 Quality', desc: 'Best text rendering', maxSteps: 50, nsfw: false },
  { id: 'stability-ai/stable-diffusion-3.5-large', name: 'SD 3.5 Large', desc: 'Stability AI latest', maxSteps: 50, nsfw: false },
];
const I2I_MODELS = [
  { id: 'sdxl-based/consistent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772', name: 'Consistent Character', desc: '$0.038/run (~₹3.20/run)', nsfw: true, useVersion: true },
  { id: 'zsxkib/instant-id:2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789', name: 'Instant-ID Pro', desc: '$0.031/run (~₹2.60/run)', nsfw: true, useVersion: true },
  { id: 'minimax/image-01', name: 'minimax/image-01', desc: '$0.01/image (~₹0.84/image)', nsfw: false, isMinimax: true },
  { id: 'zedge/instantid:ba2d5293be8794a05841a6f6eed81e810340142c3c25fab4838ff2b5d9574420', name: 'InstantID', desc: '$0.0015/run (~₹0.13/run)', nsfw: true, useVersion: true },
  { id: 'qwen/qwen-image', name: 'Qwen Image', desc: '$0.025/image (~₹2.10)', nsfw: false },
];
const FACESWAP_MODELS = [
  { id: 'cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111', name: 'cdingram/face-swap', desc: '$0.014/run (~₹1.17/run)', nsfw: true, useVersion: true },
  { id: 'codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34', name: 'codeplugtech/face-swap', desc: '$0.0025/run (~₹0.21/run)', nsfw: true, useVersion: true },
];
const UPSCALE_MODELS = [
  { id: 'nightmareai/real-esrgan', name: 'nightmareai/real-esrgan', desc: '$0.002/image (~₹0.17/image)', nsfw: true },
  { id: 'philz1337x/crystal-upscaler', name: 'philz1337x/crystal-upscaler', desc: '$0.05-3.20/image (~₹4.20-268/image)', nsfw: true },
];
const SKIN_MODELS = [
  { id: 'fofr/kontext-make-person-real:3f0b0f59a22997052c144a76457f113f7c35f6573b9f994f14367ec35f96254d', name: 'fofr/kontext-make-person-real', desc: '$0.018/run (~₹1.51/run)', nsfw: true, useVersion: true },
  { id: 'flux-kontext-apps/change-haircut', name: 'flux-kontext-apps/change-haircut', desc: '$0.04/image (~₹3.35/image)', nsfw: true, isHaircut: true },
  { id: 'zsxkib/ic-light:d41bcb10d8c159868f4cfbd7c6a2ca01484f7d39e4613419d5952c61562f1ba7', name: 'zsxkib/ic-light', desc: '$0.011/image (~₹0.92/image)', nsfw: true, useVersion: true, isICLight: true },
];
const V2V_MODELS = [
  { id: 'runwayml/gen4-aleph', name: 'runwayml/gen4-aleph', desc: '$0.18/sec (~₹15.10/sec)', nsfw: false },
  { id: 'xai/grok-imagine-video', name: 'xai/grok-imagine-video', desc: '$0.05/sec (~₹4.20/sec)', nsfw: false, isGrokV2V: true },
  { id: 'kwaivgi/kling-o1', name: 'kwaivgi/kling-o1', desc: '$0.126-0.168/sec (~₹10.60-14.10/sec)', nsfw: false, isKlingO1: true },
];
const VIDEOFS_MODELS = [
  { id: 'xrunda/hello:104b4a39315349db50880757bc8c1c996c5309e3aa11286b0a3c84dab81fd440', name: 'Video Face Swap', desc: '~$0.12/run', price: '$0.12', useVersion: true },
];
// I2V models with per-model config
const I2V_MODELS = [
  { id: 'wan-video/wan-2.2-i2v-fast', name: 'Wan 2.2 I2V Fast', desc: '$0.05-0.145/vid', nsfw: true, price: '$0.05-0.145',
    params: { prompt: true, last_frame: true, num_frames: { min: 81, max: 121, default: 81 }, resolution: ['480p','720p'], fps: { min: 5, max: 30, default: 16 }, go_fast: true, sample_shift: { min: 1, max: 10, default: 8 }, seed: true, interpolate_output: true, disable_safety_checker: true, lora: true } },
  { id: 'wavespeedai/wan-2.1-i2v-720p', name: 'Wan 2.1 I2V 720p', desc: 'Wavespeed 720p', nsfw: true,
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
  { id: 'wavespeedai/wan-2.1-t2v-720p', name: 'Wan 2.1 T2V 720p', desc: 'Wavespeed 720p', nsfw: true,
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
// Audio Generation models
const AUDIO_MODELS = [
  { id: 'elevenlabs/v3', name: 'ElevenLabs V3', desc: 'Best TTS quality',
    params: { voice: ['Rachel','Drew','Clyde','Paul','Aria','Domi','Dave','Roger','Fin','Sarah','James','Jane','Juniper','Arabella','Hope','Bradford','Reginald','Gaming','Austin','Kuon','Blondie','Priyanka','Alexandra','Monika','Mark','Grimblewood'], stability: { min: 0, max: 1, default: 0.5 }, similarity_boost: { min: 0, max: 1, default: 0.75 }, style: { min: 0, max: 1, default: 0 }, speed: { min: 0.7, max: 1.2, default: 1 }, language_code: true } },
  { id: 'elevenlabs/turbo-v2.5', name: 'ElevenLabs Turbo V2.5', desc: 'Fast TTS',
    params: { voice: ['Rachel','Drew','Clyde','Paul','Aria','Domi','Dave','Roger','Fin','Sarah','James','Jane','Juniper','Arabella','Hope','Bradford','Reginald','Gaming','Austin','Kuon','Blondie','Priyanka','Alexandra','Monika','Mark','Grimblewood'], stability: { min: 0, max: 1, default: 0.5 }, similarity_boost: { min: 0, max: 1, default: 0.75 }, style: { min: 0, max: 1, default: 0 }, speed: { min: 0.7, max: 1.2, default: 1 }, language_code: true } },
  { id: 'google/lyria-2', name: 'Google Lyria 2', desc: 'AI music generation',
    params: { negative_prompt: true, seed: true } },
  { id: 'zsxkib/mmaudio:62871fb59889b2d7c13777f08deb3b36bdff88f7e1d53a50ad7694548a41b484', name: 'MMAudio', desc: 'Video/Image to audio', useVersion: true,
    params: { video: true, image: true, negative_prompt: true, duration: { min: 1, max: 30, default: 8 }, num_steps: { min: 1, max: 50, default: 25 }, cfg_strength: { min: 1, max: 10, default: 4.5 }, seed: true } },
];
// Transcribe models
const TRANSCRIBE_MODELS = [
  { id: 'openai/gpt-4o-transcribe', name: 'GPT-4o Transcribe', desc: 'OpenAI latest transcription',
    params: { audio_file: true, prompt: true, language: true, temperature: { min: 0, max: 1, default: 0 } } },
  { id: 'openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e', name: 'OpenAI Whisper', desc: 'Classic speech-to-text', useVersion: true,
    params: { audio: true, transcription: ['plain text','srt','vtt'], translate: false, language: true, temperature: { default: 0 }, condition_on_previous_text: true } },

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
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d47b" /><stop offset="100%" stopColor="#0a8f4f" /></linearGradient>
      <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d47b" /><stop offset="100%" stopColor="#4fffb0" /></linearGradient>
    </defs>
    <rect x="4" y="4" width="112" height="112" rx="28" fill="url(#lg1)" />
    <rect x="12" y="12" width="96" height="96" rx="22" fill="#060608" />
    <path d="M38 78V42l22 36h0l22-36v36" stroke="url(#lg2)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="60" cy="55" r="6" fill="url(#lg2)" opacity="0.8" />
  </svg>
);

// ─── Star Field Background (3D Space Travel) ───
function StarField() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, cx, cy, animId;
    const STAR_COUNT = 180, TRAVEL_SPEED = 0.3;
    const stars = [];
    const galaxies = [];
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; cx = W / 2; cy = H / 2; };
    const seed = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    const makeStar = (scattered) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.15 + Math.random() * 0.85;
      return { ox: Math.cos(angle) * dist * (W || 800), oy: Math.sin(angle) * dist * (H || 600), z: scattered ? 50 + Math.random() * 750 : 600 + Math.random() * 200, twinkle: Math.random() * Math.PI * 2, size: 0.4 + Math.random() * 1.2 };
    };
    const makeGalaxy = (side, depth) => {
      const xOff = side === 'left' ? -(0.2 + Math.random() * 0.3) * (W || 800) : (0.2 + Math.random() * 0.3) * (W || 800);
      return { ox: xOff, oy: (Math.random() - 0.5) * (H || 600) * 0.5, z: depth, rotation: Math.random() * Math.PI * 2, arms: 3 + Math.floor(Math.random() * 2), colorBase: Math.random(), id: Math.random() * 9999 };
    };
    const project = (ox, oy, z) => { const s = 400 / Math.max(z, 1); return { x: cx + ox * s, y: cy + oy * s, s }; };
    const drawGalaxy3D = (g, px, py, scale, alpha) => {
      if (alpha < 0.02) return;
      const sz = Math.min(scale * 80, 200);
      // Core glow
      const coreG = ctx.createRadialGradient(px, py, 0, px, py, sz * 0.3);
      coreG.addColorStop(0, `rgba(34,212,123,${alpha * 0.5})`);
      coreG.addColorStop(1, 'transparent');
      ctx.fillStyle = coreG; ctx.beginPath(); ctx.arc(px, py, sz * 0.3, 0, Math.PI * 2); ctx.fill();
      // Spiral arms
      for (let a = 0; a < g.arms; a++) {
        ctx.beginPath();
        for (let t = 0; t < 4; t += 0.08) {
          const angle = g.rotation + (a / g.arms) * Math.PI * 2 + t;
          const r = t * sz * 0.22;
          const x = px + Math.cos(angle) * r;
          const y = py + Math.sin(angle) * r * 0.6;
          t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(34,212,123,${alpha * 0.2})`;
        ctx.lineWidth = Math.max(1, scale * 2);
        ctx.stroke();
      }
    };
    resize();
    for (let i = 0; i < STAR_COUNT; i++) stars.push(makeStar(true));
    galaxies.push(makeGalaxy('right', 300), makeGalaxy('left', 650), makeGalaxy('right', 1000));
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      const centerR = Math.min(W, H) * 0.18;
      // Stars
      for (const st of stars) {
        st.z -= TRAVEL_SPEED;
        st.twinkle += 0.02;
        if (st.z < 1) Object.assign(st, makeStar(false));
        const { x, y, s } = project(st.ox, st.oy, st.z);
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
        const dx = x - cx, dy = y - cy;
        const centerFade = Math.min(1, Math.sqrt(dx * dx + dy * dy) / centerR);
        const depthAlpha = Math.min(1, s * 0.8);
        const twinkle = 0.6 + 0.4 * Math.sin(st.twinkle);
        const a = depthAlpha * twinkle * centerFade;
        if (a < 0.02) continue;
        const r = Math.max(0.3, st.size * s * 0.5);
        ctx.globalAlpha = a;
        ctx.fillStyle = '#e0e0e8';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Galaxies
      for (const g of galaxies) {
        g.z -= TRAVEL_SPEED;
        g.rotation += 0.0003;
        if (g.z < -50) Object.assign(g, makeGalaxy(g.ox > 0 ? 'left' : 'right', 800 + Math.random() * 300));
        const { x, y, s } = project(g.ox, g.oy, g.z);
        const a = Math.min(1, s * 0.6) * 0.7;
        drawGalaxy3D(g, x, y, s, a);
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

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
  const [agreeTerms, setAgreeTerms] = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); setMessage(''); setPassword(''); setConfirmPassword(''); setCode(''); setAgreeTerms(false); };

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
  const subtitles = { login: 'Sign in to continue creating', signup: 'Start generating AI content', verify: 'Enter the code from your email', forgot: "We'll send a reset code", reset: 'Enter code and new password' };
  const submitLabels = { login: 'Sign In', signup: 'Create Account', verify: 'Verify', forgot: 'Send Code', reset: 'Reset Password' };

  const AS = {
    page: { minHeight: '100vh', background: '#060608', color: '#f0f0f5', fontFamily: "'Outfit', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', zIndex: 1 },
    card: { width: '100%', maxWidth: 420, padding: '32px 24px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' },
    field: { marginBottom: 16 },
    label: { display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500, letterSpacing: '0.02em' },
    input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f5', fontSize: 16, boxSizing: 'border-box', outline: 'none', WebkitAppearance: 'none', transition: 'border-color 0.2s', fontFamily: "'Outfit', system-ui, sans-serif" },
    btn: { width: '100%', padding: '14px', background: '#22d47b', border: 'none', borderRadius: 10, color: '#060608', fontSize: 15, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', letterSpacing: '0.02em', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(34,212,123,0.25)' },
    link: { color: '#22d47b', cursor: 'pointer', fontWeight: 600 },
    eyeIcon: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16, userSelect: 'none' },
    errorBox: { padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, marginBottom: 14, color: '#fca5a5', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    successBox: { padding: '12px 16px', background: 'rgba(34,212,123,0.08)', border: '1px solid rgba(34,212,123,0.15)', borderRadius: 10, marginBottom: 14, color: '#22d47b', fontSize: 13 },
  };

  return (
    <>
      <StarField />
      <div style={AS.page}>
        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <NexusLogo size={56} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12, letterSpacing: '-0.03em' }}>
            <span style={{ color: '#22d47b' }}>N</span><span style={{ color: '#f0f0f5' }}>EXUS AI Pro</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 4, letterSpacing: '0.04em', fontWeight: 400 }}>AI Image & Video Generation Platform</p>
        </div>

        {/* Auth Card */}
        <form onSubmit={handleSubmit} style={AS.card}>
          <h2 style={{ margin: 0, fontSize: 22, textAlign: 'center', fontWeight: 700, letterSpacing: '-0.02em' }}>{titles[mode]}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 24 }}>{subtitles[mode]}</p>

          {error && <div style={AS.errorBox}><span>⚠ {error}</span><span onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span></div>}
          {message && <div style={AS.successBox}>✓ {message}</div>}

          {mode === 'signup' && <div style={AS.field}><label style={AS.label}>Full Name</label><input style={AS.input} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required /></div>}
          {mode !== 'verify' && <div style={AS.field}><label style={AS.label}>Email</label><input style={AS.input} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>}
          {['login','signup','reset'].includes(mode) && <div style={AS.field}><label style={AS.label}>{mode === 'reset' ? 'New Password' : 'Password'}</label><div style={{ position: 'relative' }}><input style={AS.input} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /><span onClick={() => setShowPassword(!showPassword)} style={AS.eyeIcon}>{showPassword ? '🙈' : '👁'}</span></div></div>}
          {['signup','reset'].includes(mode) && <div style={AS.field}><label style={AS.label}>Confirm Password</label><input style={{ ...AS.input, borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.08)' }} type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />{confirmPassword && password !== confirmPassword && <span style={{ color: '#ef4444', fontSize: 12 }}>Passwords do not match</span>}</div>}
          {mode === 'signup' && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8 }}><input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} style={{ marginTop: 3, accentColor: '#22d47b', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }} /><span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>I agree to the <a href="https://nexus-ai-pro.com/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#22d47b' }}>Terms & Conditions</a>. I am 18+ and accept full responsibility for all content I generate.</span></div>}
          {['verify','reset'].includes(mode) && <div style={AS.field}><label style={AS.label}>Verification Code</label><input style={{ ...AS.input, letterSpacing: 6, textAlign: 'center', fontSize: 20, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }} placeholder="------" value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} required maxLength={6} /></div>}

          <button type="submit" disabled={loading || ((mode === 'signup' || mode === 'reset') && password !== confirmPassword) || (mode === 'signup' && !agreeTerms)} style={{ ...AS.btn, opacity: (loading || (mode === 'signup' && !agreeTerms)) ? 0.5 : 1, marginTop: 8 }}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(6,6,8,0.3)', borderTopColor: '#060608', borderRadius: '50%', display: 'inline-block' }} />Please wait...</span> : submitLabels[mode]}
          </button>

          {mode === 'verify' && <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Didn't get a code? <span onClick={resendCode} style={AS.link}>Resend</span></p>}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'login' && <>Don't have an account? <span onClick={() => switchMode('signup')} style={AS.link}>Sign Up</span><br /><span onClick={() => switchMode('forgot')} style={{ ...AS.link, fontSize: 13, marginTop: 10, display: 'inline-block', opacity: 0.7 }}>Forgot password?</span></>}
            {mode === 'signup' && <>Already have an account? <span onClick={() => switchMode('login')} style={AS.link}>Sign In</span></>}
            {['verify','forgot','reset'].includes(mode) && <span onClick={() => switchMode('login')} style={AS.link}>← Back to Sign In</span>}
          </div>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12, marginTop: 32 }}>© 2026 NEXUS AI Pro · Powered by Replicate</p>
      </div>
    </>
  );
}

// ─── Paywall Modal ───
function PaywallModal({ onClose, accessToken, user, onPaymentSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = [
    { id: 'lifetime', name: 'Lifetime', price: '₹2,999', originalPrice: '₹9,999', priceNum: 2999, desc: 'One-time payment', badge: 'BEST VALUE' },
    { id: 'monthly', name: 'Monthly', price: '₹499', originalPrice: '₹999', priceNum: 499, desc: 'Per month', badge: null },
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
        theme: { color: "#22d47b" },
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
                background: selectedPlan === plan.id ? 'rgba(34,212,123,0.1)' : '#0d0d1a',
                border: selectedPlan === plan.id ? '2px solid #22d47b' : '2px solid #1f2937',
                transition: 'all 0.2s',
              }}>
                {plan.badge && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #22d47b, #0a8f4f)', padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', color: '#060608' }}>{plan.badge}</div>}
                {plan.originalPrice && <div style={{ fontSize: 14, color: '#666', textDecoration: 'line-through', marginBottom: 2 }}>{plan.originalPrice}</div>}
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{plan.price}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{plan.desc}</div>
              </div>
            ))}
          </div>

          {/* Offer Deadline */}
          <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#eab308', fontWeight: 600 }}>⏰ Offer valid only till Feb 20, 2026</span>
          </div>

          {/* Features */}
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            {['All FLUX image models (Schnell, Dev, 1.1 Pro)', 'Wan 2.2 & Wavespeed video generation', 'MiniMax Video-01 text-to-video', 'Train your own AI model with LoRA', 'Unlimited generations with your API key', selectedPlan === 'lifetime' ? 'Lifetime access & updates' : '30-day access, cancel anytime', 'Prices may increase in future — lock in now!'].map(f => (
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
  const [showSteps, setShowSteps] = useState(!apiKey);
  const trimmed = key.trim();
  const valid = trimmed.startsWith('r8_') && trimmed.length > 20;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.card, maxWidth: 500, position: 'relative', margin: 0, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={S.closeBtn}>✕</button>
        <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>⚙ Settings</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Your Replicate API key powers all AI generations</p>

        <div style={S.field}>
          <label style={S.label}>Replicate API Key</label>
          <input style={S.input} type="password" placeholder="r8_..." value={key} onChange={e => setKey(e.target.value)} />
          <p style={{ fontSize: 12, color: valid ? '#4ade80' : '#f87171', marginTop: 4 }}>
            {valid ? '✓ Valid key format' : 'Enter your key starting with r8_'}
          </p>
        </div>
        <button onClick={() => onSave(trimmed)} disabled={!valid} style={{ ...S.btn, opacity: valid ? 1 : 0.5, marginBottom: 16 }}>Save Key</button>

        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 14 }}>
          <p onClick={() => setShowSteps(!showSteps)} style={{ fontSize: 13, color: '#22d47b', cursor: 'pointer', margin: '0 0 12px', fontWeight: 600 }}>
            {showSteps ? '▼' : '▶'} {apiKey ? 'How to manage your API key' : 'How to get your API key'}
          </p>

          {showSteps && (
            <div style={{ fontSize: 12.5, color: '#aaa', lineHeight: 1.8 }}>
              <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 8px' }}>🆕 New to Replicate? Create your key:</p>
              <div style={{ background: '#0a0a18', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px' }}>1. Go to <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" style={{ color: '#22d47b', textDecoration: 'underline' }}>replicate.com</a> and sign up (free)</p>
                <p style={{ margin: '0 0 4px' }}>2. Go to <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#22d47b', textDecoration: 'underline' }}>Account → API Tokens</a></p>
                <p style={{ margin: '0 0 4px' }}>3. Click <strong style={{ color: '#fff' }}>"Create Token"</strong>, copy the key (starts with <code style={{ background: '#1a1a2e', padding: '1px 5px', borderRadius: 4, color: '#4ade80' }}>r8_</code>)</p>
                <p style={{ margin: '0 0 4px' }}>4. Go to <a href="https://replicate.com/account/billing" target="_blank" rel="noopener noreferrer" style={{ color: '#22d47b', textDecoration: 'underline' }}>Account → Billing</a></p>
                <p style={{ margin: 0 }}>5. Add credits — minimum <strong style={{ color: '#fff' }}>$1</strong> to start (up to $10,000)</p>
              </div>

              <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 8px' }}>🔑 Already have a key?</p>
              <div style={{ background: '#0a0a18', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px' }}>• View your existing keys: <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#22d47b', textDecoration: 'underline' }}>replicate.com/account/api-tokens</a></p>
                <p style={{ margin: 0 }}>• Check your balance & usage: <a href="https://replicate.com/account/billing" target="_blank" rel="noopener noreferrer" style={{ color: '#22d47b', textDecoration: 'underline' }}>replicate.com/account/billing</a></p>
              </div>

              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: 10 }}>
                <p style={{ margin: '0 0 4px', color: '#fbbf24', fontWeight: 600 }}>💡 How billing works</p>
                <p style={{ margin: '0 0 2px', fontSize: 12, color: '#aaa' }}>• You only pay for what you generate — no monthly fees from Replicate</p>
                <p style={{ margin: '0 0 2px', fontSize: 12, color: '#aaa' }}>• Image generation: ~$0.003 - $0.05 per image (~₹1 or less)</p>
                <p style={{ margin: '0 0 2px', fontSize: 12, color: '#aaa' }}>• Video generation: ~$0.05 - $1.50 per video (~₹3 - ₹120)</p>
                <p style={{ margin: '0 0 2px', fontSize: 12, color: '#aaa' }}>• Model training: ~$1 - $3 per training (~₹85 - ₹250)</p>
                <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>• $5 (₹420) credit can generate ~100-1000+ images</p>
              </div>
            </div>
          )}
        </div>
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

  // Tab & Category (persist across refresh)
  const [tab, setTabRaw] = useState(() => localStorage.getItem('nexus_tab') || 'image');
  const [screen, setScreenRaw] = useState(() => localStorage.getItem('nexus_screen') || 'home');
  const setTab = (v) => { setTabRaw(v); try { localStorage.setItem('nexus_tab', v); } catch {} };
  const setScreen = (v) => { setScreenRaw(v); try { localStorage.setItem('nexus_screen', v); } catch {} };
  const [category, setCategory] = useState(null); // null=home, 'image','video','audio','chat','train'

  // Navigation helpers
  const navigateToTool = (tabId) => { setTab(tabId); setScreen(tabId); };
  const navigateToCategory = (catId) => { setScreen('category:' + catId); };
  const navigateHome = () => { setScreen('home'); };

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
  const [faceswapModel, setFaceswapModel] = useState(FACESWAP_MODELS[0].id);
  const [faceswapSource, setFaceswapSource] = useState(null);
  const [faceswapTarget, setFaceswapTarget] = useState(null);
  const [upscaleModel, setUpscaleModel] = useState(UPSCALE_MODELS[0].id);
  const [upscaleImage, setUpscaleImage] = useState(null);
  const [upscaleScale, setUpscaleScale] = useState(4);
  const [skinModel, setSkinModel] = useState(SKIN_MODELS[0].id);
  const [skinImage, setSkinImage] = useState(null);
  const [skinPrompt, setSkinPrompt] = useState('');
  const [v2vModel, setV2vModel] = useState(V2V_MODELS[0].id);
  const [v2vVideo, setV2vVideo] = useState(null);
  const [v2vPrompt, setV2vPrompt] = useState('');
  const [vfsModel, setVfsModel] = useState(VIDEOFS_MODELS[0].id);
  const [vfsVideo, setVfsVideo] = useState(null);
  const [vfsFaceImage, setVfsFaceImage] = useState(null);

  // Audio Generation
  const [audioModel, setAudioModel] = useState(AUDIO_MODELS[0].id);
  const [audioPrompt, setAudioPrompt] = useState('');
  const [audioNegPrompt, setAudioNegPrompt] = useState('');
  const [audioOpts, setAudioOpts] = useState({});
  const [audioVideo, setAudioVideo] = useState(null);
  const [audioImage, setAudioImage] = useState(null);
  const [audioResults, setAudioResults] = useState([]);

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
  const [results, setResultsRaw] = useState(() => { try { return JSON.parse(localStorage.getItem('nexus_results') || '[]'); } catch { return []; } });
  const setResults = (fn) => { setResultsRaw(prev => { const next = typeof fn === 'function' ? fn(prev) : fn; try { localStorage.setItem('nexus_results', JSON.stringify(next.slice(0, 100))); } catch {} return next; }); };
  const [viewerItem, setViewerItem] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState(false);

  // ─── Training State ───
  const [trainImages, setTrainImages] = useState([]);
  const [trainTrigger, setTrainTrigger] = useState('');
  const [trainModelName, setTrainModelName] = useState('');
  const [trainSteps, setTrainSteps] = useState(1000);
  const [trainStatus, setTrainStatus] = useState(null); // { id, status, logs, version }
  const [trainHistory, setTrainHistory] = useState([]);
  const [trainPolling, setTrainPolling] = useState(false);
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
          .catch(() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); setAuthState('auth'); });
      });
  }, []);

  // Load trained models from DynamoDB when user logs in
  useEffect(() => {
    if (!user?.user?.isPaid || !accessToken) return;
    fetch(`${API_BASE}/api/trained-models`, { headers: { 'x-auth-token': accessToken } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (data.models) setTrainHistory(data.models); })
      .catch(() => {});
  }, [user, accessToken]);

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

      // Check if this is a trained model
      const trainedModel = trainHistory.find(m => m.name === model);
      if (trainedModel) {
        // Trained LoRA models: override with FLUX-compatible params
        input.num_inference_steps = steps || 28;
        input.guidance_scale = guidance || 3.5;
        input.disable_safety_checker = true;
        input.output_format = 'png';
      }
      const curModel = IMAGE_MODELS.find(m => m.id === model);
      let reqBody;
      if (trainedModel && trainedModel.version) {
        // Trained LoRA model: use version hash
        reqBody = { version: trainedModel.version, input };
      } else if (trainedModel) {
        // Trained model without version: use model name
        reqBody = { model, input };
      } else if (curModel?.useVersion && model.includes(':')) {
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
      // Model-specific image field names and params
      let input;
      if (i2iModel.includes('consistent-character')) {
        input = { prompt: i2iPrompt.trim(), subject: dataUri };
      } else if (i2iModel.includes('zsxkib/instant-id')) {
        input = { prompt: i2iPrompt.trim(), input_image: dataUri };
        input.num_outputs = 1;
        input.guidance_scale = 7.5;
        input.num_inference_steps = 30;
        input.disable_nsfw_checker = true;
        input.ip_adapter_scale = 0.8;
        input.identitynet_strength_ratio = 0.8;
        if (i2iNegPrompt.trim()) input.negative_prompt = i2iNegPrompt.trim();
      } else if (i2iModel.includes('zedge/instantid')) {
        input = { prompt: i2iPrompt.trim(), input_image: dataUri };
        input.num_outputs = 1;
        input.guidance_scale = 5;
        input.num_inference_steps = 30;
        input.disable_safety_checker = true;
        if (i2iNegPrompt.trim()) input.negative_prompt = i2iNegPrompt.trim();
      } else {
        input = { prompt: i2iPrompt.trim(), image: dataUri };
      }

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
      // Handle various output formats: array of URLs, single URL string, or object with output_paths
      let urls = [];
      if (Array.isArray(output)) {
        urls = output.filter(u => typeof u === 'string' && u.startsWith('http'));
        // If array of objects with url field
        if (urls.length === 0) urls = output.map(o => o?.url || o).filter(Boolean);
      } else if (typeof output === 'string') {
        urls = [output];
      } else if (typeof output === 'object' && output !== null) {
        // Some models return { output_paths: [...] }
        if (output.output_paths) urls = output.output_paths;
        else if (output.url) urls = [output.url];
      }
      if (urls.length === 0) urls = [Array.isArray(output) ? output[0] : output].filter(Boolean);
      const items = urls.map(url => ({ type: 'image', url, prompt: i2iPrompt.trim(), model: i2iModel, ts: Date.now() }));
      setResults(prev => [...items, ...prev]);
      setHistory(prev => ({ ...prev, images: [...items, ...prev.images].slice(0, 50) }));
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
    const btnStyle = (selected) => ({ padding: '6px 12px', background: selected ? 'rgba(34,212,123,0.2)' : '#111827', border: selected ? '1px solid rgba(34,212,123,0.4)' : '1px solid #333', borderRadius: 6, color: selected ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
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
            Disable Safety Checker
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

  // ─── Generate Audio ───
  const generateAudio = async () => {
    if (!audioPrompt.trim()) return setError('Enter text or a prompt');
    if (!canGenerate()) return;
    const modelCfg = AUDIO_MODELS.find(m => m.id === audioModel);
    const p = modelCfg?.params || {};
    const isEL = audioModel.includes('elevenlabs');
    const isLyria = audioModel.includes('lyria');
    const isMM = audioModel.includes('mmaudio');
    const jobId = addJob('audio', audioModel, audioPrompt.trim());
    setError('');
    try {
      const input = { prompt: audioPrompt.trim() };
      // ElevenLabs params
      if (isEL) {
        input.voice = audioOpts.voice || 'Rachel';
        input.stability = audioOpts.stability ?? 0.5;
        input.similarity_boost = audioOpts.similarity_boost ?? 0.75;
        input.style = audioOpts.style ?? 0;
        input.speed = audioOpts.speed ?? 1;
        if (audioOpts.language_code?.trim()) input.language_code = audioOpts.language_code.trim();
      }
      // Lyria params
      if (isLyria) {
        if (audioNegPrompt.trim()) input.negative_prompt = audioNegPrompt.trim();
        if (audioOpts.seed) input.seed = parseInt(audioOpts.seed);
      }
      // MMAudio params
      if (isMM) {
        if (audioNegPrompt.trim()) input.negative_prompt = audioNegPrompt.trim();
        else input.negative_prompt = 'music';
        input.duration = audioOpts.duration ?? 8;
        input.num_steps = audioOpts.num_steps ?? 25;
        input.cfg_strength = audioOpts.cfg_strength ?? 4.5;
        if (audioOpts.seed) input.seed = parseInt(audioOpts.seed);
        if (audioVideo) {
          updateJob(jobId, { status: 'Uploading video...' });
          input.video = await uploadToReplicate(audioVideo, 'video/mp4');
        }
        if (audioImage) {
          updateJob(jobId, { status: 'Uploading image...' });
          input.image = audioImage.startsWith('blob:') ? await toDataUri(audioImage) : audioImage;
        }
      }
      updateJob(jobId, { status: 'Generating audio...' });
      // Version-based model (MMAudio)
      let reqBody;
      if (modelCfg?.useVersion && audioModel.includes(':')) {
        reqBody = { version: audioModel.split(':')[1], input };
      } else {
        reqBody = { model: audioModel, input };
      }
      const res = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody),
      });
      if (res.status === 403) { setShowPaywall(true); finishJob(jobId); return; }
      if (!res.ok) throw new Error(await parseApiError(res));
      let pred = await res.json();
      while (pred.status !== 'succeeded' && pred.status !== 'failed') {
        updateJob(jobId, { status: `${pred.status}...` });
        await new Promise(r => setTimeout(r, 2500));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${pred.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        pred = await poll.json();
      }
      if (pred.status === 'failed') throw new Error(pred.error || 'Generation failed');
      const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      const item = { url, prompt: audioPrompt.trim(), model: audioModel, ts: Date.now(), type: 'audio' };
      setAudioResults(prev => [item, ...prev]);
      setResults(prev => [item, ...prev]);
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

  // ─── Training Functions ───
  const handleTrainImages = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map(f => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: f.name, data: reader.result, size: f.size });
      reader.readAsDataURL(f);
    }));
    Promise.all(promises).then(imgs => setTrainImages(prev => [...prev, ...imgs]));
  };

  const startTraining = async () => {
    if (!canGenerate()) return;
    if (trainImages.length < 5) { setError('Please upload at least 5 images for training.'); return; }
    if (!trainTrigger.trim()) { setError('Please enter a trigger word.'); return; }
    if (!trainModelName.trim()) { setError('Please enter a model name.'); return; }

    let logLines = ['Initializing...'];
    const log = (msg) => { logLines = [...logLines, msg]; setTrainStatus(prev => ({ ...(prev || {}), logs: logLines.join('\n'), status: prev?.status || 'starting' })); };
    setTrainStatus({ id: null, status: 'starting', logs: 'Initializing...', version: null, destination: '' });
    setTrainPolling(true);

    try {
      // Step 1: Get Replicate username
      log('Step 1/4: Getting Replicate account info...');
      console.log('[Train] Step 1: Fetching account...');
      const acctResp = await fetch(`${API_BASE}/api/replicate/account`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'x-auth-token': accessToken },
      });
      console.log('[Train] Account response:', acctResp.status);
      const acctData = await acctResp.json();
      console.log('[Train] Account data:', acctData);
      if (!acctResp.ok) throw new Error(acctData.error || acctData.detail || 'Failed to get account. Check your API key.');
      const username = acctData.username;
      log(`✅ Account: ${username}`);

      // Step 2: Create destination model
      const modelSlug = trainModelName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      log(`Step 2/4: Creating model ${username}/${modelSlug}...`);
      console.log('[Train] Step 2: Creating model...');
      const modelResp = await fetch(`${API_BASE}/api/replicate/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'x-auth-token': accessToken },
        body: JSON.stringify({ owner: username, name: modelSlug, visibility: 'private', hardware: 'gpu-t4' }),
      });
      console.log('[Train] Model response:', modelResp.status);
      const modelData = await modelResp.json();
      console.log('[Train] Model data:', modelData);
      if (!modelResp.ok && modelResp.status !== 409) throw new Error(modelData.error || modelData.detail || 'Failed to create model');
      log(modelResp.status === 409 ? '✅ Model already exists, reusing.' : '✅ Model created successfully.');

      // Step 3: Upload training images as a zip
      log(`Step 3/4: Zipping ${trainImages.length} images...`);
      console.log('[Train] Step 3: Creating zip...');
      const zipBlob = await createTrainingZip(trainImages);
      const sizeMB = (zipBlob.size / 1024 / 1024).toFixed(1);
      log(`Zip created: ${sizeMB}MB. Uploading...`);
      console.log('[Train] Zip size:', sizeMB, 'MB. Uploading...');
      const zipBase64 = await blobToBase64(zipBlob);

      const uploadResp = await fetch(`${API_BASE}/api/replicate/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'x-auth-token': accessToken },
        body: JSON.stringify({ data: zipBase64, content_type: 'application/zip', filename: 'training_images.zip' }),
      });
      console.log('[Train] Upload response:', uploadResp.status);
      const uploadData = await uploadResp.json();
      console.log('[Train] Upload data:', uploadData);
      if (!uploadResp.ok) throw new Error(uploadData.error || 'Failed to upload training images');
      log(`✅ Images uploaded successfully`);

      // Step 4: Start training
      log('Step 4/4: Starting LoRA training...');
      console.log('[Train] Step 4: Starting training...');
      const trainResp = await fetch(`${API_BASE}/api/replicate/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'x-auth-token': accessToken },
        body: JSON.stringify({
          destination: `${username}/${modelSlug}`,
          input: {
            input_images: uploadData.url,
            trigger_word: trainTrigger.trim(),
            training_steps: trainSteps,
          },
        }),
      });
      console.log('[Train] Training response:', trainResp.status);
      const trainData = await trainResp.json();
      console.log('[Train] Training data:', trainData);
      if (!trainResp.ok) throw new Error(trainData.error || trainData.detail || 'Failed to start training');

      log(`✅ Training started! ID: ${trainData.id}`);
      log('🔄 Polling for progress every 10 seconds...');
      setTrainStatus({ id: trainData.id, status: trainData.status || 'processing', logs: logLines.join('\n') + '\n✅ Training started! ID: ' + trainData.id + '\n🔄 Polling...', version: null, destination: `${username}/${modelSlug}` });

      // Start polling
      pollTraining(trainData.id, `${username}/${modelSlug}`);
      return;
    } catch (err) {
      console.error('[Train] ERROR:', err);
      setError(err.message);
      logLines.push(`❌ ERROR: ${err.message}`);
      setTrainStatus(prev => ({ ...(prev || {}), status: 'failed', logs: logLines.join('\n') }));
      setTrainPolling(false);
    }
  };

  const pollTraining = async (trainingId, destination) => {
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'x-auth-token': accessToken };
    const poll = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/replicate/trainings/${trainingId}`, { headers });
        const data = await resp.json();
        const logs = data.logs || '';
        const lastLines = logs.split('\n').filter(Boolean).slice(-5).join('\n');
        setTrainStatus(prev => ({ ...prev, status: data.status, logs: lastLines, version: data.output?.version || null }));

        if (data.status === 'succeeded') {
          const newModel = { name: destination, trigger: trainTrigger, version: data.output?.version, trainedAt: new Date().toISOString() };
          // Save to DynamoDB
          fetch(`${API_BASE}/api/trained-models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken },
            body: JSON.stringify(newModel),
          }).then(r => r.json()).then(d => { if (d.models) setTrainHistory(d.models); }).catch(() => {});
          setTrainHistory(prev => [newModel, ...prev.filter(m => m.name !== destination)]);
          setTrainPolling(false);
          return;
        }
        if (data.status === 'failed' || data.status === 'canceled') {
          setTrainPolling(false);
          setError(`Training ${data.status}: ${data.error || 'Unknown error'}`);
          return;
        }
        // Still processing, poll again in 10s
        setTimeout(poll, 10000);
      } catch (err) {
        setTimeout(poll, 15000); // Retry on network error
      }
    };
    poll();
  };

  // Helper: Create a ZIP from images using raw approach
  const createTrainingZip = async (images) => {
    // Minimal ZIP creation without external library
    const files = images.map((img, i) => {
      const ext = img.name.split('.').pop() || 'jpg';
      const base64 = img.data.includes(',') ? img.data.split(',')[1] : img.data;
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
      return { name: `image_${i + 1}.${ext}`, data: bytes };
    });

    // Use JSZip if available, otherwise create simple concatenated tar-like format
    // Actually, let's dynamically load JSZip
    if (!window.JSZip) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      document.head.appendChild(script);
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
    }
    const zip = new window.JSZip();
    files.forEach(f => zip.file(f.name, f.data));
    return await zip.generateAsync({ type: 'blob' });
  };

  const blobToBase64 = (blob) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  // ─── Generate Face Swap ───
  const generateFaceSwap = async () => {
    if (!faceswapSource) return setError('Upload a source image');
    if (!faceswapTarget) return setError('Upload a target face image');
    if (!canGenerate()) return;
    const jobId = addJob('faceswap', faceswapModel, 'Face Swap');
    setError('');
    try {
      const srcUri = await toDataUri(faceswapSource);
      const tgtUri = await toDataUri(faceswapTarget);
      const input = { swap_image: srcUri, input_image: tgtUri };
      const modelObj = FACESWAP_MODELS.find(m => m.id === faceswapModel);
      updateJob(jobId, { status: 'Swapping faces...' });
      const reqBody = modelObj?.useVersion ? { version: faceswapModel.split(':')[1], input } : { model: faceswapModel, input };
      const resp = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody)
      });
      if (resp.status === 403) { setShowPaywall(true); finishJob(jobId, 'API key required'); return; }
      if (!resp.ok) throw new Error(await parseApiError(resp));
      let result = await resp.json();
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${result.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        result = await poll.json();
        updateJob(jobId, { status: result.status });
      }
      if (result.status === 'failed') throw new Error(result.error || 'Face swap failed');
      const output = typeof result.output === 'string' ? result.output : Array.isArray(result.output) ? result.output[0] : result.output;
      setResults(prev => [{ url: output, type: 'image', model: faceswapModel, prompt: 'Face Swap', ts: Date.now() }, ...prev]);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Upscale ───
  const generateUpscale = async () => {
    if (!upscaleImage) return setError('Upload an image to upscale');
    if (!canGenerate()) return;
    const jobId = addJob('upscale', upscaleModel, 'Image Upscale');
    setError('');
    try {
      const imgUri = await toDataUri(upscaleImage);
      const input = { image: imgUri, scale: upscaleScale };
      updateJob(jobId, { status: 'Upscaling...' });
      const resp = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: upscaleModel, input })
      });
      if (resp.status === 403) { setShowPaywall(true); finishJob(jobId, 'API key required'); return; }
      if (!resp.ok) throw new Error(await parseApiError(resp));
      let result = await resp.json();
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${result.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        result = await poll.json();
        updateJob(jobId, { status: result.status });
      }
      if (result.status === 'failed') throw new Error(result.error || 'Upscale failed');
      const output = typeof result.output === 'string' ? result.output : Array.isArray(result.output) ? result.output[0] : result.output;
      setResults(prev => [{ url: output, type: 'image', model: upscaleModel, prompt: 'Image Upscale', ts: Date.now() }, ...prev]);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Portrait Studio ───
  const generateSkin = async () => {
    if (!skinImage) return setError('Upload an image');
    if (!canGenerate()) return;
    const jobId = addJob('skin', skinModel, 'Portrait Studio');
    setError('');
    try {
      const imgUri = await toDataUri(skinImage);
      const modelObj = SKIN_MODELS.find(m => m.id === skinModel);
      let input;
      if (modelObj?.isHaircut) { input = { image: imgUri, prompt: skinPrompt || 'change haircut' }; }
      else if (modelObj?.isICLight) { input = { image: imgUri, prompt: skinPrompt || 'portrait, professional lighting' }; }
      else { input = { input_image: imgUri, prompt: skinPrompt || 'make this person look realistic', disable_safety_checker: true }; }
      updateJob(jobId, { status: 'Processing portrait...' });
      // Use version mode if useVersion flag is set OR if model ID contains a version hash
      const hasVersion = modelObj?.useVersion || skinModel.includes(':');
      const reqBody = hasVersion ? { version: skinModel.split(':')[1], input } : { model: skinModel, input };
      const resp = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody)
      });
      if (resp.status === 403) { setShowPaywall(true); finishJob(jobId, 'API key required'); return; }
      if (!resp.ok) throw new Error(await parseApiError(resp));
      let result = await resp.json();
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${result.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        result = await poll.json();
        updateJob(jobId, { status: result.status });
      }
      if (result.status === 'failed') throw new Error(result.error || 'Portrait processing failed');
      const output = typeof result.output === 'string' ? result.output : Array.isArray(result.output) ? result.output[0] : result.output;
      setResults(prev => [{ url: output, type: 'image', model: skinModel, prompt: skinPrompt || 'Portrait Studio', ts: Date.now() }, ...prev]);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate V2V ───
  const generateV2V = async () => {
    if (!v2vVideo) return setError('Upload a source video');
    if (!v2vPrompt) return setError('Enter a prompt');
    if (!canGenerate()) return;
    const jobId = addJob('v2v', v2vModel, 'Edit Video');
    setError('');
    try {
      const videoUri = await toDataUri(v2vVideo);
      const modelObj = V2V_MODELS.find(m => m.id === v2vModel);
      let input;
      if (modelObj?.isGrokV2V) { input = { prompt: v2vPrompt, image: videoUri }; }
      else if (modelObj?.isKlingO1) { input = { prompt: v2vPrompt, input_video: videoUri }; }
      else { input = { prompt: v2vPrompt, video: videoUri }; }
      updateJob(jobId, { status: 'Editing video...' });
      const resp = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: v2vModel, input })
      });
      if (resp.status === 403) { setShowPaywall(true); finishJob(jobId, 'API key required'); return; }
      if (!resp.ok) throw new Error(await parseApiError(resp));
      let result = await resp.json();
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${result.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        result = await poll.json();
        updateJob(jobId, { status: result.status });
      }
      if (result.status === 'failed') throw new Error(result.error || 'Video editing failed');
      const output = typeof result.output === 'string' ? result.output : Array.isArray(result.output) ? result.output[0] : result.output;
      setResults(prev => [{ url: output, type: 'video', model: v2vModel, prompt: v2vPrompt, ts: Date.now() }, ...prev]);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };

  // ─── Generate Video Face Swap ───
  const generateVideoFS = async () => {
    if (!vfsVideo) return setError('Upload a source video');
    if (!vfsFaceImage) return setError('Upload a face image');
    if (!canGenerate()) return;
    const jobId = addJob('videofs', vfsModel, 'Video Face Swap');
    setError('');
    try {
      const videoUri = await toDataUri(vfsVideo);
      const faceUri = await toDataUri(vfsFaceImage);
      const input = { source: videoUri, target: faceUri };
      const modelObj = VIDEOFS_MODELS.find(m => m.id === vfsModel);
      updateJob(jobId, { status: 'Swapping face in video...' });
      const reqBody = modelObj?.useVersion ? { version: vfsModel.split(':')[1], input } : { model: vfsModel, input };
      const resp = await fetch(`${API_BASE}/api/replicate/predictions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(reqBody)
      });
      if (resp.status === 403) { setShowPaywall(true); finishJob(jobId, 'API key required'); return; }
      if (!resp.ok) throw new Error(await parseApiError(resp));
      let result = await resp.json();
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API_BASE}/api/replicate/predictions/${result.id}`, { headers: { 'x-auth-token': accessToken, Authorization: `Bearer ${apiKey}` } });
        result = await poll.json();
        updateJob(jobId, { status: result.status });
      }
      if (result.status === 'failed') throw new Error(result.error || 'Video face swap failed');
      const output = typeof result.output === 'string' ? result.output : Array.isArray(result.output) ? result.output[0] : result.output;
      setResults(prev => [{ url: output, type: 'video', model: vfsModel, prompt: 'Video Face Swap', ts: Date.now() }, ...prev]);
      finishJob(jobId);
    } catch (err) { setError(err.message); finishJob(jobId, err.message); }
  };


  // ─── Render ───
  if (authState === 'loading') return (<><StarField /><div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}><div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#22d47b', borderRadius: '50%' }} /></div></>);
  if (authState === 'auth') return <AuthScreen onAuth={handleAuth} />;

  const curImgModel = IMAGE_MODELS.find(m => m.id === model);

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={navigateHome}>
          <NexusLogo size={32} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}><span style={{ color: '#22d47b' }}>N</span><span style={{ color: '#f0f0f5' }}>EXUS AI Pro</span></span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {user?.isPaid ? <span style={{ fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(74,222,128,0.2)' }}>✓ Pro</span>
            : <span onClick={() => setShowPaywall(true)} style={{ fontSize: 10, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '3px 8px', borderRadius: 20, border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer' }}>🔒 Free</span>}
          <button onClick={() => setShowSettings(true)} style={{ ...S.btnSm, padding: '5px 10px', fontSize: 12 }}>⚙</button>
          <button onClick={handleLogout} style={{ ...S.btnSm, padding: '5px 10px', fontSize: 12 }}>Sign Out</button>
        </div>
      </header>

      <div style={{ ...S.container, maxWidth: '100%', padding: '0' }}>
        {/* Home Screen */}
        {screen === 'home' && (
          <HomeScreen
            onSelectTool={(tabId) => navigateToTool(tabId)}
            onSelectCategory={(catId) => navigateToCategory(catId)}
          />
        )}

        {/* Category Screen */}
        {screen.startsWith('category:') && (
          <CategoryScreen
            categoryId={screen.replace('category:', '')}
            onSelectTool={(tabId) => navigateToTool(tabId)}
            onBack={navigateHome}
          />
        )}

        {/* Tool Screen */}
        {screen !== 'home' && !screen.startsWith('category:') && (
          <ToolScreen
            tabId={tab}
            onBack={() => {
              const categoryToolTabs = { image: 'image', i2i: 'image', faceswap: 'image', upscale: 'image', skin: 'image', i2v: 'image', t2v: 'video', v2v: 'video', motion: 'video', videofs: 'video', audio: 'audio', transcribe: 'transcribe', train: 'character', chat: 'chat' };
              const catId = categoryToolTabs[tab];
              if (catId) { setScreen('category:' + catId); } else { navigateHome(); }
            }}
            onSwitchTool={(newTab) => { setTab(newTab); setScreen(newTab); }}
            results={results.filter(r => {
              const tabTypes = { image: ['image'], i2i: ['image'], faceswap: ['image'], upscale: ['image'], skin: ['image'], i2v: ['video'], t2v: ['video'], v2v: ['video'], motion: ['video'], videofs: ['video'], audio: ['audio'], transcribe: ['transcription'] };
              const types = tabTypes[tab] || [];
              return types.includes(r.type);
            })}
            onViewItem={(item) => setViewerItem(item)}
          >

        {/* Error */}
        {error && <div style={S.errorBox}><span>⚠ {error}</span><span onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.7 }}>✕</span></div>}

        {/* Loading Bar */}
        {loading && (
          <div style={{ padding: '16px 20px', background: 'rgba(34,212,123,0.1)', border: '1px solid rgba(34,212,123,0.2)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid #333', borderTopColor: '#22d47b', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ color: '#aaa', fontSize: 14 }}>{loadingStatus || 'Generating...'}</span>
          </div>
        )}

        {/* Download reminder - shows when new results exist */}
        {!downloadNotice && results.length > 0 && (
          <div style={{ padding: '10px 14px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <span style={{ color: '#d4a937', fontSize: 12, flex: 1, lineHeight: 1.4 }}>For your privacy, we don’t store media on our servers. Generated files are temporary and will expire soon — please <b>download</b> them before they’re gone!</span>
            <span onClick={() => setDownloadNotice(true)} style={{ cursor: 'pointer', color: '#d4a937', opacity: 0.6, fontSize: 14, flexShrink: 0 }}>✕</span>
          </div>
        )}

        {/* ══ IMAGE TAB ══ */}
        {tab === 'image' && (
          <div>
            <ModelSelector models={IMAGE_MODELS} value={model} onChange={v => { setModel(v); if (v.includes('schnell')) setSteps(4); else setSteps(20); }}
              extraOptions={trainHistory.length > 0 ? (<>
                <div style={{ padding: '8px 14px', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.08)' }}>Your Trained Models</div>
                {trainHistory.map(m => (
                  <div key={m.name} onClick={() => { setModel(m.name); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: m.name === model ? 'rgba(34,212,123,0.1)' : 'transparent', borderLeft: m.name === model ? '3px solid #22d47b' : '3px solid transparent' }}
                    onMouseEnter={e => { if (m.name !== model) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (m.name !== model) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>🧪</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Trigger: {m.trigger}</div>
                    </div>
                    {m.name === model && <span style={{ color: '#22d47b', fontSize: 14 }}>✓</span>}
                  </div>
                ))}
              </>) : null}
            />

            {/* Prompt */}
            <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Describe your image</label>
            <textarea style={{ ...S.input, minHeight: 100, marginBottom: 14 }} placeholder="What do you want to see? Example: 'A cat sitting on a table, warm morning light.'" value={prompt} onChange={e => setPrompt(e.target.value)} />

            {/* Aspect Ratio */}
            <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Aspect Ratio</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {ASPECTS.map(a => (
                <button key={a.id} onClick={() => setAspect(a.id)} style={{ padding: '7px 12px', background: aspect === a.id ? 'rgba(34,212,123,0.15)' : 'rgba(255,255,255,0.03)', border: aspect === a.id ? '1px solid rgba(34,212,123,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: aspect === a.id ? '#22d47b' : '#888', cursor: 'pointer', fontSize: 13, fontWeight: aspect === a.id ? 600 : 400, transition: 'all 0.2s ease' }}>{a.id}</button>
              ))}
            </div>

            {/* Advanced */}
            <div style={{ marginBottom: 12 }}>
              <span onClick={() => setShowAdvanced(!showAdvanced)} style={{ color: '#888', fontSize: 13, cursor: 'pointer' }}>{showAdvanced ? '▼' : '▶'} Adjust Settings</span>
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

            <button onClick={generateImage} disabled={loading} style={{ ...S.btn, width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 10, opacity: loading ? 0.6 : 1 }}>
              ✨ Generate Image
            </button>

          </div>
        )}

        {/* ══ IMAGE TO IMAGE TAB ══ */}
        {tab === 'i2i' && (
          <div>
            <ModelSelector models={I2I_MODELS} value={i2iModel} onChange={v => setI2iModel(v)} />

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
                  <button key={a.id} onClick={() => setAspect(a.id)} style={{ padding: '7px 10px', background: aspect === a.id ? 'rgba(34,212,123,0.2)' : '#111827', border: aspect === a.id ? '1px solid rgba(34,212,123,0.4)' : '1px solid #333', borderRadius: 6, color: aspect === a.id ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 }}>{a.id}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <textarea style={{ ...S.input, minHeight: 40 }} placeholder="Negative prompt (optional)..." value={i2iNegPrompt} onChange={e => setI2iNegPrompt(e.target.value)} />
            </div>

            <button onClick={generateI2I} style={S.btn}>
              🔄 Generate Image to Image
            </button>


          </div>
        )}

        {/* ══ IMAGE TO VIDEO TAB ══ */}
        {tab === 'i2v' && (
          <div>
            <ModelSelector models={I2V_MODELS} value={i2vModel} onChange={v => { setI2vModel(v); setI2vOpts({}); }} />

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


          </div>
        )}

        {/* ══ TEXT TO VIDEO TAB ══ */}
        {tab === 't2v' && (
          <div>
            <ModelSelector models={T2V_MODELS} value={t2vModel} onChange={v => { setT2vModel(v); setT2vOpts({}); }} />

            <textarea style={{ ...S.input, minHeight: 80, marginBottom: 12 }} placeholder="Describe the video you want to create..." value={t2vPrompt} onChange={e => setT2vPrompt(e.target.value)} />

            {renderVideoOpts(T2V_MODELS.find(m => m.id === t2vModel), t2vOpts, setT2vOpts, t2vNegPrompt, setT2vNegPrompt)}

            <button onClick={generateT2V} style={S.btn}>
              🎬 Generate Text to Video
            </button>


          </div>
        )}

        {/* ══ MOTION CONTROL TAB ══ */}
        {tab === 'motion' && (() => {
          const isKling = motionModel.includes('kling');
          const isAnimate = motionModel.includes('animate');
          const curMotion = MOTION_MODELS.find(m => m.id === motionModel);
          const btnSt = (sel) => ({ padding: '6px 12px', background: sel ? 'rgba(34,212,123,0.2)' : '#111827', border: sel ? '1px solid rgba(34,212,123,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          const checkSt = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aaa', fontSize: 13 };
          return (
          <div>
            <ModelSelector models={MOTION_MODELS} value={motionModel} onChange={v => { setMotionModel(v); setMotionOpts({}); }} />

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


          </div>
          );
        })()}

        {/* ══ AUDIO GEN TAB ══ */}
        {tab === 'audio' && (() => {
          const modelCfg = AUDIO_MODELS.find(m => m.id === audioModel);
          const p = modelCfg?.params || {};
          const isEL = audioModel.includes('elevenlabs');
          const isLyria = audioModel.includes('lyria');
          const isMM = audioModel.includes('mmaudio');
          const btnSt = (sel) => ({ padding: '6px 12px', background: sel ? 'rgba(34,212,123,0.2)' : '#111827', border: sel ? '1px solid rgba(34,212,123,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          return (
          <div>
            <ModelSelector models={AUDIO_MODELS} value={audioModel} onChange={v => { setAudioModel(v); setAudioOpts({}); setAudioNegPrompt(''); setAudioVideo(null); setAudioImage(null); }} />

            {/* Prompt */}
            <textarea style={{ ...S.input, minHeight: isEL ? 80 : 60 }} placeholder={isEL ? 'Enter text to speak...' : isLyria ? 'Describe the music you want...' : 'Describe the audio/sound...'} value={audioPrompt} onChange={e => setAudioPrompt(e.target.value)} />

            {/* Negative Prompt (Lyria & MMAudio) */}
            {(isLyria || isMM) && (
              <textarea style={{ ...S.input, minHeight: 40, marginTop: 8 }} placeholder={isMM ? 'Negative prompt (default: music)...' : 'Negative prompt (optional)...'} value={audioNegPrompt} onChange={e => setAudioNegPrompt(e.target.value)} />
            )}

            {/* ElevenLabs options */}
            {isEL && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <div>
                  <label style={S.label}>Voice</label>
                  <select value={audioOpts.voice || 'Rachel'} onChange={e => setAudioOpts(o => ({...o, voice: e.target.value}))} style={{ ...S.select, width: '100%' }}>
                    {p.voice?.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Stability: {audioOpts.stability ?? 0.5}</label>
                  <input type="range" min={0} max={1} step={0.05} value={audioOpts.stability ?? 0.5} onChange={e => setAudioOpts(o => ({...o, stability: +e.target.value}))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>Variable</span><span>Stable</span></div>
                </div>
                <div>
                  <label style={S.label}>Similarity: {audioOpts.similarity_boost ?? 0.75}</label>
                  <input type="range" min={0} max={1} step={0.05} value={audioOpts.similarity_boost ?? 0.75} onChange={e => setAudioOpts(o => ({...o, similarity_boost: +e.target.value}))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>Low</span><span>High</span></div>
                </div>
                <div>
                  <label style={S.label}>Style: {audioOpts.style ?? 0}</label>
                  <input type="range" min={0} max={1} step={0.05} value={audioOpts.style ?? 0} onChange={e => setAudioOpts(o => ({...o, style: +e.target.value}))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>None</span><span>Exaggerated</span></div>
                </div>
                <div>
                  <label style={S.label}>Speed: {audioOpts.speed ?? 1}x</label>
                  <input type="range" min={0.7} max={1.2} step={0.05} value={audioOpts.speed ?? 1} onChange={e => setAudioOpts(o => ({...o, speed: +e.target.value}))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={S.label}>Language</label>
                  <input style={S.input} placeholder="en" value={audioOpts.language_code || ''} onChange={e => setAudioOpts(o => ({...o, language_code: e.target.value}))} />
                </div>
              </div>
            )}

            {/* MMAudio options */}
            {isMM && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <div>
                  <label style={S.label}>Duration: {audioOpts.duration ?? 8}s</label>
                  <input type="range" min={1} max={30} step={1} value={audioOpts.duration ?? 8} onChange={e => setAudioOpts(o => ({...o, duration: +e.target.value}))} style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}><span>1s</span><span>30s</span></div>
                </div>
                <div>
                  <label style={S.label}>Steps: {audioOpts.num_steps ?? 25}</label>
                  <input type="range" min={1} max={50} step={1} value={audioOpts.num_steps ?? 25} onChange={e => setAudioOpts(o => ({...o, num_steps: +e.target.value}))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={S.label}>CFG Strength: {audioOpts.cfg_strength ?? 4.5}</label>
                  <input type="range" min={1} max={10} step={0.5} value={audioOpts.cfg_strength ?? 4.5} onChange={e => setAudioOpts(o => ({...o, cfg_strength: +e.target.value}))} style={{ width: '100%' }} />
                </div>
                {/* Video upload */}
                <div>
                  <label style={S.label}>Video (optional — for video-to-audio)</label>
                  {audioVideo ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <video src={audioVideo} style={{ maxHeight: 120, borderRadius: 8, border: '1px solid #333' }} controls playsInline />
                      <button onClick={() => setAudioVideo(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <label style={{ display: 'block', padding: '16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18', fontSize: 13 }}>
                      🎬 Upload video
                      <input type="file" accept="video/*" onChange={e => { if(e.target.files?.[0]) setAudioVideo(URL.createObjectURL(e.target.files[0])); }} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
                {/* Image upload */}
                <div>
                  <label style={S.label}>Image (optional — experimental)</label>
                  {audioImage ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={audioImage} alt="" style={{ maxHeight: 120, borderRadius: 8, border: '1px solid #333' }} />
                      <button onClick={() => setAudioImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <label style={{ display: 'block', padding: '16px', border: '2px dashed #333', borderRadius: 8, textAlign: 'center', cursor: 'pointer', color: '#888', background: '#0a0a18', fontSize: 13 }}>
                      🖼️ Upload image
                      <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setAudioImage(URL.createObjectURL(e.target.files[0])); }} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Seed (Lyria & MMAudio) */}
            {(isLyria || isMM) && (
              <div style={{ marginTop: 10 }}>
                <label style={S.label}>Seed (optional)</label>
                <input style={S.input} type="number" placeholder="Random" value={audioOpts.seed || ''} onChange={e => setAudioOpts(o => ({...o, seed: e.target.value}))} />
              </div>
            )}

            <button onClick={generateAudio} style={{ ...S.btn, marginTop: 12 }}>
              🔊 Generate Audio
            </button>


          </div>
          );
        })()}

        {/* ══ TRANSCRIBE TAB ══ */}
        {tab === 'transcribe' && (() => {
          const isGPT4o = transcribeModel.includes('gpt-4o');
          const isWhisper = transcribeModel.includes('whisper');

          const btnSt = (sel) => ({ padding: '6px 12px', background: sel ? 'rgba(34,212,123,0.2)' : '#111827', border: sel ? '1px solid rgba(34,212,123,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          const checkSt = { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aaa', fontSize: 13 };
          return (
          <div>
            <ModelSelector models={TRANSCRIBE_MODELS} value={transcribeModel} onChange={v => { setTranscribeModel(v); setTranscribeOpts({}); }} />

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
                  🎙️ Upload audio file<br/><span style={{ fontSize: 11, color: '#555' }}>MP3, MP4, WAV, WEBM, OGG</span>
                  <input type="file" accept="audio/*,.mp3,.mp4,.wav,.ogg,.webm,.m4a,.mpeg,.mpga" onChange={e => { const f = e.target.files?.[0]; if(f) { setTranscribeAudio(URL.createObjectURL(f)); setTranscribeAudioMime(f.type || 'audio/mpeg'); } }} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Prompt */}
            {isGPT4o && (
              <textarea style={{ ...S.input, minHeight: 50, marginBottom: 12 }} placeholder="Optional prompt to guide transcription style..." value={transcribePrompt} onChange={e => setTranscribePrompt(e.target.value)} />
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

              {/* Temperature (all models) */}
              <div>
                <label style={S.label}>Temperature: {transcribeOpts.temperature ?? 0}</label>
                <input type="range" min={0} max={1} step={0.1} value={transcribeOpts.temperature ?? 0} onChange={e => setTranscribeOpts(p => ({...p, temperature: +e.target.value}))} style={{ width: '100%' }} />
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
          const btnSt = (sel) => ({ padding: '5px 10px', background: sel ? 'rgba(34,212,123,0.2)' : '#111827', border: sel ? '1px solid rgba(34,212,123,0.4)' : '1px solid #333', borderRadius: 6, color: sel ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 });
          return (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 400 }}>
            {/* Model selector + settings */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <ModelSelector models={TEXT_MODELS} value={chatModel} onChange={v => { setChatModel(v); setChatOpts({}); }} style={{ flex: 1, minWidth: 180, marginBottom: 0 }} />
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
                    background: msg.role === 'user' ? 'rgba(34,212,123,0.2)' : '#111827',
                    border: msg.role === 'user' ? '1px solid rgba(34,212,123,0.3)' : '1px solid #1f2937',
                  }}>
                    {msg.role === 'assistant' && <div style={{ fontSize: 10, color: '#22d47b', marginBottom: 4, fontWeight: 600 }}>{TEXT_MODELS.find(m => m.id === msg.model)?.name || 'AI'}</div>}
                    <div style={{ fontSize: 14, color: '#ddd', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.content}</div>
                  </div>
                </div>
              ))}
              {chatStreaming && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: '#111827', border: '1px solid #1f2937' }}>
                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #333', borderTopColor: '#22d47b', borderRadius: '50%', display: 'inline-block' }} />
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

        {/* ══ TRAIN TAB ══ */}
        {tab === 'train' && (
          <div>
            <div style={{ background: 'rgba(34,212,123,0.08)', border: '1px solid rgba(34,212,123,0.2)', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
              🧪 <strong style={{ color: '#fff' }}>Train Your Own LoRA Model</strong> — Upload 10-20 images of a subject (person, style, object), set a trigger word, and train a custom FLUX LoRA model. Training takes ~5-10 minutes using Replicate's fast trainer and costs ~$1-3 on your Replicate account.
            </div>

            {/* Model Name */}
            <div style={S.field}>
              <label style={S.label}>Model Name</label>
              <input style={S.input} placeholder="e.g. my-face-model" value={trainModelName} onChange={e => setTrainModelName(e.target.value)} />
              <p style={{ fontSize: 11, color: '#666', margin: '4px 0 0' }}>Lowercase, no spaces. This creates a model on your Replicate account.</p>
            </div>

            {/* Trigger Word */}
            <div style={S.field}>
              <label style={S.label}>Trigger Word</label>
              <input style={S.input} placeholder="e.g. RKKSH, MYDOG, ARTSTYLE" value={trainTrigger} onChange={e => setTrainTrigger(e.target.value)} />
              <p style={{ fontSize: 11, color: '#666', margin: '4px 0 0' }}>Use this word in prompts to activate your model. Pick something unique (not a real word).</p>
            </div>

            {/* Training Steps */}
            <div style={S.field}>
              <label style={S.label}>Training Steps: {trainSteps}</label>
              <input type="range" min={500} max={4000} step={100} value={trainSteps} onChange={e => setTrainSteps(Number(e.target.value))} style={{ width: '100%' }} />
              <p style={{ fontSize: 11, color: '#666', margin: '4px 0 0' }}>More steps = better quality but longer training. 1000-1500 is recommended.</p>
            </div>

            {/* Image Upload */}
            <div style={S.field}>
              <label style={S.label}>Training Images ({trainImages.length} uploaded)</label>
              <label style={{ display: 'block', padding: '24px 16px', background: '#0d0d1a', border: '2px dashed #333', borderRadius: 10, textAlign: 'center', cursor: 'pointer', color: '#888', fontSize: 13 }}>
                📤 Click to select images (10-20 recommended)
                <input type="file" accept="image/*" multiple onChange={handleTrainImages} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Image Previews */}
            {trainImages.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {trainImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid #333' }}>
                    <img src={img.data} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => setTrainImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Start Training Button */}
            <button onClick={startTraining} disabled={loading || trainPolling} style={{ ...S.generateBtn, opacity: (loading || trainPolling) ? 0.5 : 1, marginBottom: 16 }}>
              {trainPolling ? '⏳ Training in Progress...' : '🧪 Start Training'}
            </button>

            {/* Training Status */}
            {trainStatus && (
              <div style={{ background: '#111827', borderRadius: 10, padding: 16, border: '1px solid #1f2937', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Training Status</span>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: trainStatus.status === 'succeeded' ? 'rgba(74,222,128,0.15)' : trainStatus.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(34,212,123,0.15)', color: trainStatus.status === 'succeeded' ? '#4ade80' : trainStatus.status === 'failed' ? '#ef4444' : '#22d47b' }}>
                    {trainStatus.status}
                  </span>
                </div>
                {trainStatus.logs && <pre style={{ fontSize: 11, color: '#888', background: '#0a0a18', borderRadius: 6, padding: 10, overflow: 'auto', maxHeight: 200, margin: '8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{trainStatus.logs}</pre>}
                {trainStatus.status === 'succeeded' && (
                  <div style={{ marginTop: 8, padding: 10, background: 'rgba(74,222,128,0.08)', borderRadius: 8, border: '1px solid rgba(74,222,128,0.2)' }}>
                    <p style={{ fontSize: 13, color: '#4ade80', margin: 0 }}>✅ Training complete! Your model <strong>{trainStatus.destination}</strong> is ready.</p>
                    <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>Go to <strong style={{ color: '#22d47b', cursor: 'pointer' }} onClick={() => setTab('image')}>Text to Image</strong> tab → select your model from the dropdown → use trigger word <strong style={{ color: '#fff' }}>"{trainTrigger}"</strong> in your prompt.</p>
                    <p style={{ fontSize: 11, color: '#666', margin: '4px 0 0' }}>Example: "{trainTrigger} as an astronaut on Mars, cinematic lighting"</p>
                  </div>
                )}
              </div>
            )}

            {/* Trained Models History */}
            {trainHistory.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, color: '#aaa', marginBottom: 10 }}>🎯 Your Trained Models</h3>
                {trainHistory.map((m, i) => (
                  <div key={i} style={{ background: '#111827', borderRadius: 8, padding: 12, border: '1px solid #1f2937', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, color: '#fff', margin: 0, fontWeight: 600 }}>{m.name}</p>
                      <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>Trigger: <strong style={{ color: '#22d47b' }}>{m.trigger}</strong> · {new Date(m.trainedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => { fetch(`${API_BASE}/api/trained-models/${encodeURIComponent(m.name)}`, { method: 'DELETE', headers: { 'x-auth-token': accessToken } }).then(r => r.json()).then(d => { if (d.models) setTrainHistory(d.models); }).catch(() => {}); setTrainHistory(prev => prev.filter((_, j) => j !== i)); }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14 }}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {/* ══ FACE SWAP TAB ══ */}
        {tab === 'faceswap' && (
          <div>
            <ModelSelector models={FACESWAP_MODELS} value={faceswapModel} onChange={v => setFaceswapModel(v)} />
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Source Image</label>
                {faceswapSource ? (<div style={{ position: 'relative', display: 'inline-block' }}><img src={faceswapSource} alt="" style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} /><button onClick={() => setFaceswapSource(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '30px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)' }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f5bc;&#xfe0f;</div>Source image<br/><span style={{ fontSize: 11, color: '#555' }}>Image with body/scene</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setFaceswapSource(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Target Face</label>
                {faceswapTarget ? (<div style={{ position: 'relative', display: 'inline-block' }}><img src={faceswapTarget} alt="" style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} /><button onClick={() => setFaceswapTarget(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '30px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)' }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f600;</div>Face photo<br/><span style={{ fontSize: 11, color: '#555' }}>Clear face to swap in</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setFaceswapTarget(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
              </div>
            </div>
            <button onClick={generateFaceSwap} disabled={loading} style={{ ...S.btn, width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 10, opacity: loading ? 0.6 : 1 }}>{loading ? (tabJobs[0]?.status || 'Processing...') : 'Swap Faces'}</button>
          </div>
        )}
        {/* ══ IMAGE UPSCALE TAB ══ */}
        {tab === 'upscale' && (
          <div>
            <ModelSelector models={UPSCALE_MODELS} value={upscaleModel} onChange={v => setUpscaleModel(v)} />
            <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Image to Upscale</label>
            {upscaleImage ? (<div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}><img src={upscaleImage} alt="" style={{ maxHeight: 200, borderRadius: 8, border: '1px solid #333' }} /><button onClick={() => setUpscaleImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '40px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)', marginBottom: 14 }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f50d;</div>Upload image to upscale<br/><span style={{ fontSize: 11, color: '#555' }}>Enhance resolution up to 10x</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setUpscaleImage(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
            <div style={{ marginBottom: 14 }}><label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Scale Factor: {upscaleScale}x</label><input type="range" min="2" max="10" value={upscaleScale} onChange={e => setUpscaleScale(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <button onClick={generateUpscale} disabled={loading} style={{ ...S.btn, width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 10, opacity: loading ? 0.6 : 1 }}>{loading ? (tabJobs[0]?.status || 'Processing...') : 'Upscale Image'}</button>
          </div>
        )}
        {/* ══ PORTRAIT STUDIO TAB ══ */}
        {tab === 'skin' && (
          <div>
            <ModelSelector models={SKIN_MODELS} value={skinModel} onChange={v => setSkinModel(v)} />
            <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Portrait Image</label>
            {skinImage ? (<div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}><img src={skinImage} alt="" style={{ maxHeight: 200, borderRadius: 8, border: '1px solid #333' }} /><button onClick={() => setSkinImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '40px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)', marginBottom: 14 }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f464;</div>Upload portrait<br/><span style={{ fontSize: 11, color: '#555' }}>Face photo for enhancement</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setSkinImage(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
            <div style={{ marginBottom: 14 }}><label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Prompt (optional)</label><input type="text" value={skinPrompt} onChange={e => setSkinPrompt(e.target.value)} placeholder="e.g. change haircut, professional lighting..." style={{ ...S.input, width: '100%' }} /></div>
            <button onClick={generateSkin} disabled={loading} style={{ ...S.btn, width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 10, opacity: loading ? 0.6 : 1 }}>{loading ? (tabJobs[0]?.status || 'Processing...') : 'Process Portrait'}</button>
          </div>
        )}
        {/* ══ V2V EDIT VIDEO TAB ══ */}
        {tab === 'v2v' && (
          <div>
            <ModelSelector models={V2V_MODELS} value={v2vModel} onChange={v => setV2vModel(v)} />
            <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Source Video</label>
            {v2vVideo ? (<div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}><video src={v2vVideo} style={{ maxHeight: 200, borderRadius: 8, border: '1px solid #333' }} controls muted /><button onClick={() => setV2vVideo(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '40px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)', marginBottom: 14 }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f3ac;</div>Upload video to edit<br/><span style={{ fontSize: 11, color: '#555' }}>Video to transform with AI</span><input type="file" accept="video/*" onChange={e => { const f = e.target.files?.[0]; if (f) setV2vVideo(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
            <div style={{ marginBottom: 14 }}><label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Edit Prompt</label><textarea value={v2vPrompt} onChange={e => setV2vPrompt(e.target.value)} placeholder="Describe how to transform the video..." rows={3} style={{ ...S.input, width: '100%', resize: 'vertical' }} /></div>
            <button onClick={generateV2V} disabled={loading} style={{ ...S.btn, width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 10, opacity: loading ? 0.6 : 1 }}>{loading ? (tabJobs[0]?.status || 'Processing...') : 'Edit Video'}</button>
          </div>
        )}
        {/* ══ VIDEO FACE SWAP TAB ══ */}
        {tab === 'videofs' && (
          <div>
            <ModelSelector models={VIDEOFS_MODELS} value={vfsModel} onChange={v => setVfsModel(v)} />
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Source Video</label>
                {vfsVideo ? (<div style={{ position: 'relative', display: 'inline-block' }}><video src={vfsVideo} style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} controls muted /><button onClick={() => setVfsVideo(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '30px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)' }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f3ac;</div>Upload video<br/><span style={{ fontSize: 11, color: '#555' }}>Video with face to replace</span><input type="file" accept="video/*" onChange={e => { const f = e.target.files?.[0]; if (f) setVfsVideo(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...S.label, marginBottom: 6, display: 'block' }}>Face Image</label>
                {vfsFaceImage ? (<div style={{ position: 'relative', display: 'inline-block' }}><img src={vfsFaceImage} alt="" style={{ maxHeight: 160, borderRadius: 8, border: '1px solid #333' }} /><button onClick={() => setVfsFaceImage(null)} style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}>&#x2715;</button></div>) : (<label style={{ display: 'block', padding: '30px 12px', border: '2px dashed rgba(138,92,246,0.4)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', color: '#aaa', background: 'rgba(10,10,24,0.6)' }}><div style={{ fontSize: 32, marginBottom: 6 }}>&#x1f600;</div>Face image<br/><span style={{ fontSize: 11, color: '#555' }}>Clear face photo works best</span><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setVfsFaceImage(URL.createObjectURL(f)); }} style={{ display: 'none' }} /></label>)}
              </div>
            </div>
            <button onClick={generateVideoFS} disabled={loading} style={{ ...S.btn, width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 10, opacity: loading ? 0.6 : 1 }}>{loading ? (tabJobs[0]?.status || 'Processing...') : 'Swap Face in Video'}</button>
          </div>
        )}


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
          </ToolScreen>
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
  page: { minHeight: '100vh', background: '#060608', color: '#f0f0f5', fontFamily: "'Outfit', system-ui, -apple-system, sans-serif", WebkitTextSizeAdjust: '100%' },
  gradientText: { fontSize: 26, fontWeight: 700, color: '#22d47b', marginTop: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50, gap: 8 },
  container: { maxWidth: 900, margin: '0 auto', padding: '16px 10px' },
  tabs: { display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, paddingRight: 30, WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' },
  card: { maxWidth: 420, margin: '16px auto', padding: '24px 18px', background: '#111827', borderRadius: 14, border: '1px solid #1f2937', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 5, fontWeight: 500 },
  input: { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f0f5', fontSize: 16, boxSizing: 'border-box', outline: 'none', WebkitAppearance: 'none', fontFamily: "'Outfit', system-ui, sans-serif" },
  select: { padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f0f5', fontSize: 14, cursor: 'pointer', outline: 'none', WebkitAppearance: 'none', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Outfit', system-ui, sans-serif" },
  btn: { width: '100%', padding: '13px', background: '#22d47b', border: 'none', borderRadius: 8, color: '#060608', fontSize: 15, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', boxShadow: '0 0 20px rgba(34,212,123,0.2)' },
  btnSm: { padding: '6px 14px', background: '#111827', border: '1px solid #333', borderRadius: 6, color: '#ccc', fontSize: 13, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' },
  link: { color: '#22d47b', cursor: 'pointer', fontWeight: 600 },
  eyeIcon: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16, userSelect: 'none' },
  errorBox: { padding: '12px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 14, color: '#fca5a5', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  successBox: { padding: '12px 16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, marginBottom: 14, color: '#86efac', fontSize: 14 },
  closeBtn: { position: 'absolute', top: 12, right: 12, background: '#1f2937', border: 'none', color: '#888', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: 10, marginTop: 16 },
  gridCard: { background: '#111827', borderRadius: 10, overflow: 'hidden', border: '1px solid #1f2937', cursor: 'pointer', transition: 'border-color 0.2s' },
};

export default App;

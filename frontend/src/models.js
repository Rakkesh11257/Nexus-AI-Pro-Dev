// ─── Model Configs ───

export const IMAGE_MODELS = [
  { id: 'prunaai/wan-2.2-image', name: 'Wan 2.2 Image', desc: 'Unrestricted T2I', maxSteps: 50, nsfw: true },
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
export const I2I_MODELS = [
  { id: 'qwen/qwen-image', name: 'Qwen Image', desc: 'LoRA + img2img', nsfw: false },
  { id: 'google/nano-banana-pro', name: 'Google Nano Banana Pro', desc: 'Google img2img', nsfw: false },
  { id: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4', name: 'Stable Diffusion 1.5', desc: 'Classic img2img', nsfw: false, useVersion: true },
  { id: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc', name: 'SDXL 1.0', desc: 'SDXL img2img', nsfw: false, useVersion: true },
];
// I2V models with per-model config
export const I2V_MODELS = [
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
export const T2V_MODELS = [
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
export const ASPECTS = [
  { id: '1:1', w: 1024, h: 1024 },
  { id: '16:9', w: 1344, h: 768 },
  { id: '9:16', w: 768, h: 1344 },
  { id: '4:3', w: 1152, h: 896 },
  { id: '3:4', w: 896, h: 1152 },
];
// Motion Control models
export const MOTION_MODELS = [
  { id: 'kwaivgi/kling-v2.6-motion-control', name: 'Kling V2.6 Motion Control', desc: 'Motion transfer from video',
    params: { prompt: true, image: true, video: true, character_orientation: ['image','video'], mode: ['std','pro'], keep_original_sound: true } },
  { id: 'wan-video/wan-2.2-animate-animation', name: 'Wan 2.2 Animate', desc: 'Character animation',
    params: { video: true, character_image: true, resolution: ['720','480'], refert_num: { default: 1, options: [1, 5] }, fps: { min: 5, max: 60, default: 24 }, go_fast: true, seed: true, merge_audio: true } },
];
// Audio Generation models
export const AUDIO_MODELS = [
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
export const TRANSCRIBE_MODELS = [
  { id: 'openai/gpt-4o-transcribe', name: 'GPT-4o Transcribe', desc: 'OpenAI latest transcription',
    params: { audio_file: true, prompt: true, language: true, temperature: { min: 0, max: 1, default: 0 } } },
  { id: 'openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e', name: 'OpenAI Whisper', desc: 'Classic speech-to-text', useVersion: true,
    params: { audio: true, transcription: ['plain text','srt','vtt'], translate: false, language: true, temperature: { default: 0 }, condition_on_previous_text: true } },
];
// Text/Chat models
export const TEXT_MODELS = [
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

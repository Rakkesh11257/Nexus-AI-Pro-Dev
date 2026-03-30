// ??? NSFW Templates Config ???
// RunPod Endpoint: g7urwu4013wh2d
// Fixed defaults: 5s, 480p, 4 steps, 50 credits
// Prompts are editable by user Ñ these are pre-filled starting points
// Thumbnails: place preview.mp4 inside /public/templates/<folder>/

export const RUNPOD_ENDPOINT_ID = 'g7urwu4013wh2d';
export const RUNPOD_API_KEY = 'rpa_UZ5AYUBZBA13CJI4RI58ZX8AUS55IZZHV3ZC9MGDmol6ku';
export const NSFW_TEMPLATE_CREDITS = 50;

export const NSFW_DEFAULTS = {
  duration: 5,
  quality: 480,
  steps: 4,
  split_step: 2,
  lora_strength: 0.85,
  blocks_to_swap: 0,
};

export const NSFW_TEMPLATES = [
  {
    id: 'missionary',
    label: 'Missionary',
    emoji: '?',
    position: 'missionary',
    folder: 'missionary',
    previewVideo: '/templates/missionary/preview.mp4',
    prompt: 'nsfwsks missionary position, woman lying on her back with legs raised, man on top, both fully nude, intense eye contact, orgasm expressions, passionate moaning, cinematic lighting, realistic skin texture, high detail, 8K quality',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['couple', 'bed', 'classic'],
  },
  {
    id: 'doggy',
    label: 'Doggy Style',
    emoji: '?',
    position: 'doggy',
    folder: 'doggy',
    previewVideo: '/templates/doggy/preview.mp4',
    prompt: 'nsfwsks doggy style position, woman on all fours, man behind her, both fully nude, deep penetration, intense expressions, arched back, hair flowing, cinematic lighting, photorealistic, high detail, 8K quality',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['couple', 'from behind', 'intense'],
  },
  {
    id: 'cowgirl',
    label: 'Cowgirl',
    emoji: '?',
    position: 'cowgirl',
    folder: 'cowgirl',
    previewVideo: '/templates/cowgirl/preview.mp4',
    prompt: 'nsfwsks cowgirl position, woman on top riding, man lying below, both fully nude, woman bouncing with hands on chest, seductive expressions, moaning, breasts moving, cinematic lighting, photorealistic, high detail, 8K quality',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['couple', 'woman on top', 'riding'],
  },
  {
    id: 'reverse_cowgirl',
    label: 'Reverse Cowgirl',
    emoji: '?',
    position: 'reverse_cowgirl',
    folder: 'reverse_cowgirl',
    previewVideo: '/templates/reverse_cowgirl/preview.mp4',
    prompt: 'nsfwsks reverse cowgirl position, woman on top facing away from man, riding intensely, both fully nude, arched back showing curves, hands on thighs, moaning expressions, cinematic lighting, photorealistic, high detail, 8K quality',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['couple', 'woman on top', 'facing away'],
  },
  {
    id: 'spooning',
    label: 'Spooning',
    emoji: '?',
    position: 'spooning',
    folder: 'spooning',
    previewVideo: '/templates/spooning/preview.mp4',
    prompt: 'nsfwsks spooning sex position, both lying on side, man behind woman, both fully nude, intimate and sensual, slow deep movements, woman arching back, soft moaning expression, warm bedroom lighting, photorealistic skin, high detail, 8K quality',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['couple', 'lying', 'intimate'],
  },
  {
    id: 'blowjob',
    label: 'Oral',
    emoji: '?',
    position: 'blowjob',
    folder: 'blowjob',
    previewVideo: '/templates/blowjob/preview.mp4',
    prompt: 'nsfwsks oral sex, woman on knees performing blowjob, looking up with eye contact, fully nude, sensual expressions, hands on thighs, soft lighting, photorealistic skin texture, detailed, 8K quality',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['oral', 'intimate', 'sensual'],
  },
  {
    id: 'general_nsfw',
    label: 'General NSFW',
    emoji: '?',
    position: 'general_nsfw',
    folder: 'general_nsfw',
    previewVideo: '/templates/general_nsfw/preview.mp4',
    prompt: 'nsfwsks fully nude woman, sensual pose, beautiful curves, realistic skin texture, seductive expression, cinematic lighting, photorealistic, high detail, 8K quality, boudoir style',
    negativePrompt: 'low quality, bad anatomy, distorted, watermark, text, logo, blurry, ugly, extra limbs',
    tags: ['solo', 'nude', 'sensual'],
  },
];

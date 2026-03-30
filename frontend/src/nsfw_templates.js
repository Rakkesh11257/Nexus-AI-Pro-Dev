// NSFW Templates Config
// RunPod Endpoint: g7urwu4013wh2d
// Fixed defaults: 5s, 480p, 4 steps, 50 credits
// No LoRA - base NSFW model only, positions handled by prompt
// Thumbnails: place preview.mp4 inside /public/templates/<folder>/

export const RUNPOD_ENDPOINT_ID = 'g7urwu4013wh2d';
export const RUNPOD_API_KEY = 'rpa_UZ5AYUBZBA13CJI4RI58ZX8AUS55IZZHV3ZC9MGDmol6ku';
export const NSFW_TEMPLATE_CREDITS = 50;

export const NSFW_DEFAULTS = {
  duration: 5,
  quality: 480,
  steps: 4,
  split_step: 2,
  lora_strength: 0,
  blocks_to_swap: 0,
};

export const NSFW_TEMPLATES = [
  {
    id: 'missionary',
    label: 'Missionary',
    emoji: '\ud83d\udd25',
    folder: 'missionary',
    previewVideo: '/templates/missionary/preview.mp4',
    prompt: 'nsfwsks missionary position sex scene, woman lying on her back with legs spread and raised, man on top thrusting, both fully nude, intense passionate eye contact, orgasm expressions, moaning, sweating bodies, rhythmic motion, cinematic bedroom lighting, realistic skin texture with pores and highlights, professional boudoir cinematography, shallow depth of field, 8K quality, photorealistic',
    tags: ['couple', 'bed', 'classic'],
  },
  {
    id: 'doggy',
    label: 'Doggy Style',
    emoji: '\ud83d\udd25',
    folder: 'doggy',
    previewVideo: '/templates/doggy/preview.mp4',
    prompt: 'nsfwsks doggy style sex position from behind, woman bent over on all fours hands on bed, man behind her thrusting deep, both fully nude, woman arching back with hair flowing, intense deep penetration, loud moaning expression, bodies moving rhythmically, cinematic warm lighting, photorealistic skin textures, professional cinematography, 8K quality, hyperdetailed',
    tags: ['couple', 'from behind', 'intense'],
  },
  {
    id: 'cowgirl',
    label: 'Cowgirl',
    emoji: '\ud83d\udd25',
    folder: 'cowgirl',
    previewVideo: '/templates/cowgirl/preview.mp4',
    prompt: 'nsfwsks cowgirl position, woman sitting on top riding man, bouncing up and down, both fully nude, woman with hands on his chest, beautiful round breasts bouncing, seductive moaning expression, man lying below holding her hips, rhythmic riding motion, cinematic golden hour bedroom lighting, photorealistic skin texture, 8K quality, masterpiece composition',
    tags: ['couple', 'woman on top', 'riding'],
  },
  {
    id: 'reverse_cowgirl',
    label: 'Reverse Cowgirl',
    emoji: '\ud83d\udd25',
    folder: 'reverse_cowgirl',
    previewVideo: '/templates/reverse_cowgirl/preview.mp4',
    prompt: 'nsfwsks reverse cowgirl position, woman on top facing away from man, riding intensely showing back and curves, both fully nude, woman arched back bouncing, hands on his thighs for support, moaning with pleasure, man lying below, rhythmic motion, cinematic warm lighting, photorealistic detailed skin, professional boudoir photography style, 8K quality',
    tags: ['couple', 'woman on top', 'facing away'],
  },
  {
    id: 'spooning',
    label: 'Spooning',
    emoji: '\ud83d\udd25',
    folder: 'spooning',
    previewVideo: '/templates/spooning/preview.mp4',
    prompt: 'nsfwsks spooning sex position, couple lying on their sides, man behind woman, both fully nude, slow deep intimate thrusting, woman arching back into man, soft moaning expression, intertwined bodies, warm romantic bedroom lighting, soft golden tones, photorealistic skin texture with natural highlights, intimate sensual atmosphere, 8K quality',
    tags: ['couple', 'lying', 'intimate'],
  },
  {
    id: 'blowjob',
    label: 'Oral',
    emoji: '\ud83d\udd25',
    folder: 'blowjob',
    previewVideo: '/templates/blowjob/preview.mp4',
    prompt: 'nsfwsks oral sex scene, woman on her knees performing blowjob, looking up with sultry eye contact, fully nude, sensual expression, hands positioned naturally, man standing, soft warm lighting from side, photorealistic skin texture and details, professional cinematography, shallow depth of field, 8K quality',
    tags: ['oral', 'intimate', 'sensual'],
  },
  {
    id: 'general_nsfw',
    label: 'General NSFW',
    emoji: '\ud83d\udd25',
    folder: 'general_nsfw',
    previewVideo: '/templates/general_nsfw/preview.mp4',
    prompt: 'nsfwsks fully nude woman, sensual slow movement, beautiful feminine curves, realistic detailed skin texture with pores and highlights, seductive confident expression looking at camera, cinematic warm golden lighting, professional boudoir photography, shallow depth of field, 8K quality, photorealistic masterpiece',
    tags: ['solo', 'nude', 'sensual'],
  },
];

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const POST_INTERVAL_HOURS = parseInt(process.env.POST_INTERVAL_HOURS) || 3;
const SIGNUP_LINK = process.env.SIGNUP_LINK || 'https://nexusaipro.com';

// ═══════════════════════════════════════
// MODELS CONFIG
// ═══════════════════════════════════════
const MODELS = {
  sdxl_lightning: {
    id: 'bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe',
    type: 'image',
    inputKey: 'prompt',
    extraParams: { width: 1024, height: 1024, num_outputs: 1, num_inference_steps: 4, guidance_scale: 0, scheduler: 'K_EULER', disable_safety_checker: true },
  },
  wan_image: {
    id: 'prunaai/wan-2.2-image',
    type: 'image',
    inputKey: 'prompt',
    extraParams: { width: 1024, height: 1024 },
  },
  wan_t2v: {
    id: 'wan-video/wan-2.2-t2v-fast',
    type: 'video',
    inputKey: 'prompt',
    extraParams: { resolution: '480p', num_frames: 81 },
    needsImage: false,
  },
};

// Schedule: Out of 8 daily posts, mix them
// 3x SDXL Lightning images, 3x Wan 2.2 images, 2x Wan 2.2 T2V videos
// 8 posts/day: 3x SDXL, 3x Wan Image, 2x Wan T2V
const POST_SCHEDULE = [
  'sdxl_lightning', 'wan_image', 'sdxl_lightning',
  'wan_t2v', 'wan_image', 'sdxl_lightning',
  'wan_image', 'wan_t2v',
];

// ═══════════════════════════════════════
// NSFW PROMPTS (50+ diverse prompts)
// ═══════════════════════════════════════
const NSFW_IMAGE_PROMPTS = [
  // Indian / South Asian women
  "Beautiful Indian woman with long black hair, traditional gold jewelry, fully nude, standing in a luxurious palace bedroom with silk curtains, soft golden lighting, photorealistic skin texture, detailed brown nipples visible, navel visible, 8K quality, masterpiece",
  "Gorgeous South Asian bride removing her red saree, revealing her nude body, ornate gold necklace and bangles still on, dimly lit bridal suite, candles in background, sensual pose, photorealistic, ultra detailed skin, 8K",
  "Stunning Bollywood actress lookalike, wet body after shower, towel dropping revealing full nude figure, marble bathroom, steam effects, water droplets on skin, brown nipples and navel visible, professional photography, 8K",
  "Beautiful Indian college girl, long hair, removing her kurta top, topless with round breasts visible, sitting on bed in hostel room, natural lighting from window, shy seductive expression, photorealistic, detailed",
  "Gorgeous Kerala woman with jasmine flowers in hair, completely nude standing in outdoor rain shower, tropical garden background, water flowing over curves, brown skin glowing, artistic nude photography, 8K",

  // Asian women
  "Beautiful Japanese woman in hot spring onsen, standing up from water fully nude, steam rising, traditional wooden bath house, porcelain skin with water droplets, delicate features, soft natural lighting, 8K masterpiece",
  "Stunning Korean model, flawless skin, lying on white silk sheets completely nude, minimalist modern bedroom, soft window light, elegant pose showing full body, professional boudoir photography, ultra HD",
  "Gorgeous Thai woman on tropical beach at sunset, nude body silhouetted against orange sky, walking out of ocean waves, wet glistening skin, paradise setting, cinematic photography, 8K",
  "Beautiful Chinese woman in traditional silk robe falling off shoulders, revealing nude body underneath, ancient Chinese pavilion background, moonlight, cherry blossoms, artistic sensual photography, 8K",

  // European / Western women  
  "Stunning blonde woman lying on luxury yacht deck, completely nude sunbathing, Mediterranean sea in background, tanned skin with tan lines, aviator sunglasses, summer vibes, professional photography, 8K",
  "Beautiful redhead woman with freckles, nude in a rustic countryside cottage, morning sunlight through lace curtains, lying in vintage bed with white sheets, natural beauty, soft warm tones, photorealistic, 8K",
  "Gorgeous brunette fitness model, toned athletic body fully nude, standing in modern gym locker room, mirror reflection showing front and back, confident pose, professional lighting, ultra detailed, 8K",
  "Elegant French woman, pixie haircut, nude in Parisian apartment with Eiffel Tower view from window, holding coffee cup, morning light, artistic nude photography, vintage aesthetic, 8K",

  // Latina women
  "Beautiful Brazilian woman with curvy body, fully nude on Copacabana beach at golden hour, sand on skin, ocean waves at feet, long dark wavy hair blowing in wind, photorealistic, cinematic, 8K",
  "Gorgeous Colombian woman with hourglass figure, nude in tropical jungle waterfall, water cascading over body, lush green foliage, natural paradise setting, exotic beauty, professional photography, 8K",

  // African women
  "Stunning African goddess with dark chocolate skin, fully nude, traditional gold headpiece and arm bands, standing in savanna at golden hour, powerful confident pose, artistic photography, dramatic lighting, 8K",
  "Beautiful Ethiopian model with graceful features, nude body with oiled glowing dark skin, minimalist white studio background, elegant artistic pose, professional high fashion nude photography, 8K",

  // Fantasy / Themed
  "Beautiful elf queen with pointed ears, fully nude in enchanted forest, bioluminescent flowers and fireflies around her, mystical blue and green lighting, fantasy art, ethereal beauty, long silver hair, 8K ultra detailed",
  "Gorgeous vampire queen, pale skin, nude in gothic castle throne room, red velvet drapes, candlelight, dark sensual atmosphere, ruby eyes, long black hair, dark fantasy photography, 8K",
  "Beautiful mermaid transformation, half human emerging from ocean, nude upper body with shells in hair, moonlit ocean surface, magical water effects, fantasy art, photorealistic, 8K",
  "Stunning angel with white feathered wings, fully nude hovering in cloudy sky, divine golden light, ethereal beauty, flowing golden hair, renaissance painting style, ultra detailed, 8K",
  "Cyberpunk girl fully nude in neon-lit futuristic apartment, holographic displays, rain outside window, neon pink and blue lighting reflecting on skin, futuristic aesthetic, photorealistic, 8K",

  // Scenarios
  "Beautiful woman stepping out of luxury sports car at night, designer heels, removing elegant black dress revealing nude body, city lights bokeh background, glamorous photography, 8K",
  "Gorgeous woman in artist studio, nude model posing for painting, paint splashes on body, canvas and brushes around, north-facing window light, creative artistic setting, photorealistic, 8K",
  "Stunning woman skinny dipping in mountain lake, crystal clear water revealing nude body underwater, snow-capped mountains, pine forest, nature photography, breathtaking scenery, 8K",
  "Beautiful librarian removing glasses and unbuttoning blouse, revealing nude body, surrounded by old books on wooden shelves, warm lamp light, intellectual seductive vibe, photorealistic, 8K",
  "Gorgeous nurse removing uniform in hospital locker room, revealing lingerie then full nude body, clean clinical setting with warm personal moment, photorealistic, 8K",

  // Artistic / Studio
  "Professional nude photography, beautiful woman lying on black velvet, strategic lighting highlighting curves, high contrast black and white, artistic shadows, gallery quality, ultra detailed, 8K",
  "Watercolor effect nude woman, colorful paint running down body, white studio background, abstract art meets photography, creative body art, professional quality, 8K",
  "Oil painting style nude woman reclining on chaise lounge, classical art inspired, warm golden palette, Botticelli inspired beauty, renaissance aesthetic, ultra detailed, 8K masterpiece",
  "Silhouette nude photography, woman behind frosted glass shower door, steam and water droplets on glass, mysterious and sensual, artistic minimalist, professional photography, 8K",

  // Couples / Romantic  
  "Beautiful couple in luxury penthouse, woman fully nude embracing muscular man from behind, city skyline through floor-to-ceiling windows at night, romantic intimate moment, warm lighting, cinematic, 8K",
  "Gorgeous woman nude in bed with silk sheets partially covering, looking seductively at camera, rose petals scattered, candlelit bedroom, romantic atmosphere, photorealistic, 8K",

  // Specific body focus prompts
  "Beautiful woman with perfect hourglass figure, fully nude front view, hands in hair, confident stance, studio lighting, white background, detailed skin texture, brown nipples visible, flat tummy with navel, photorealistic, 8K",
  "Gorgeous curvy woman, nude back view looking over shoulder, long hair cascading down back, showing full figure from behind, soft studio lighting, artistic photography, photorealistic, 8K",
  "Stunning fitness model, toned abs and legs, fully nude in yoga pose, zen garden setting, morning light, peaceful sensual atmosphere, detailed muscle definition, photorealistic, 8K",

  // Seasonal / Themed
  "Beautiful woman nude by Christmas fireplace, warm fire glow on skin, stockings hanging, cozy cabin, snowfall through window, festive sensual, red and gold tones, photorealistic, 8K",
  "Gorgeous woman nude in spring flower field, cherry blossoms falling, lying in meadow of wildflowers, natural sunlight, pastoral beauty, romantic photography, 8K",
  "Stunning woman emerging from pool at summer party, wet nude body, water dripping, pool lights creating blue glow on skin, nighttime, party vibes, photorealistic, 8K",

  // Additional variety
  "Beautiful twin sisters, both fully nude, mirror image poses facing each other, minimalist white studio, matching bodies, artistic symmetry, professional photography, ultra detailed, 8K",
  "Gorgeous woman in Japanese hot spring ryokan, removing yukata robe, nude body visible, traditional wooden architecture, misty atmosphere, cultural sensual beauty, photorealistic, 8K",
  "Stunning woman nude on motorcycle, vintage Harley Davidson in desert highway, sunset, leather boots only, badass sensual vibes, wind in hair, cinematic photography, 8K",
  "Beautiful belly dancer removing costume piece by piece, final reveal fully nude, ornate Middle Eastern palace interior, gold accents, dramatic lighting, exotic beauty, 8K",
  "Gorgeous woman floating nude in Dead Sea, salt crystals on skin, stark desert landscape, blue sky, unique natural setting, documentary style artistic nude, photorealistic, 8K",
  "Stunning woman in penthouse jacuzzi, bubbles partially covering nude body, champagne glass in hand, city lights panorama, luxury lifestyle, evening photography, 8K",
  "Beautiful woman waking up nude in luxury hotel suite, stretching in bed, morning sunlight streaming through sheer curtains, white bedding, natural beauty moment, photorealistic, 8K",
  "Gorgeous woman nude under waterfall in tropical jungle, exotic flowers and butterflies, crystal clear water, paradise found, nature photography, vivid colors, 8K masterpiece",
  "Stunning woman in traditional Japanese bath house, washing nude body, wooden bucket, steam rising, peaceful zen atmosphere, artistic cultural nude, photorealistic, 8K",
  "Beautiful woman nude in Victorian clawfoot bathtub, bubbles, vintage bathroom, ornate mirror, candlelight, period aesthetic meets modern photography, warm tones, 8K",
];

// Video-specific prompts (simpler, motion-focused)
const NSFW_VIDEO_PROMPTS = [
  "Beautiful woman slowly removing silk robe revealing nude body, luxury bedroom, soft lighting, sensual slow motion, cinematic",
  "Gorgeous woman walking nude through shallow ocean waves at sunset, golden light on wet skin, slow motion hair flip, cinematic beach scene",
  "Stunning woman in shower, water running over nude body, steam rising, slow motion water droplets, artistic bathroom scene",
  "Beautiful woman lying on bed with silk sheets, slowly rolling over revealing nude figure, candlelit room, intimate cinematic moment",
  "Gorgeous woman stepping into hot spring pool, nude body entering warm water, steam and mist, Japanese onsen, peaceful slow motion",
  "Stunning woman doing yoga stretches fully nude, sunrise on rooftop, city skyline background, graceful slow movements, artistic",
  "Beautiful woman nude swimming underwater in crystal clear pool, elegant movements, light rays through water, cinematic slow motion",
  "Gorgeous woman applying oil to nude body, hands gliding over skin, soft studio lighting, sensual self-care moment, slow motion",
  "Stunning woman walking nude through rain, wet city street at night, neon reflections on wet skin, cinematic noir atmosphere",
  "Beautiful woman nude in bathtub with rose petals, water slowly overflowing, candlelight, romantic atmosphere, cinematic slow motion",
  "Gorgeous Indian woman in silk saree slowly unwrapping to reveal nude body, traditional room with diyas, warm golden lighting, sensual dance movements",
  "Stunning woman emerging from swimming pool at night, water cascading off nude body, pool lights creating blue glow, slow motion cinematic",
  "Beautiful woman dancing nude by fireplace, flames casting warm shadows on body, cozy cabin, snow outside window, intimate moment",
  "Gorgeous woman lying on beach towel, waves washing over nude body, sunset colors, tropical paradise, relaxing slow motion",
  "Stunning fitness woman nude doing stretches, toned muscles visible, modern studio, dramatic side lighting, artistic body in motion",
];

// ═══════════════════════════════════════
// CAPTION TEMPLATES
// ═══════════════════════════════════════
const CAPTIONS_IMAGE = [
  "🔥 AI Generated Masterpiece\n\n✨ Created with Nexus AI Pro\n🎨 Model: {model}\n\n👉 Create your own: {link}\n\n#AIArt #AIGenerated #NexusAIPro #NSFW #AIImage",
  "🎨 Stunning AI Art\n\n💫 Powered by Nexus AI Pro\n🖼️ Model: {model}\n\n🚀 Try it free: {link}\n\n#AIArt #NexusAI #AIGenerated #DigitalArt #NSFW",
  "✨ AI Magic\n\n🔮 Generated by Nexus AI Pro\n📸 Model: {model}\n\n🔗 Start creating: {link}\n\n#AIGenerated #NexusAIPro #AIArt #NSFW #Art",
  "💎 Premium AI Generation\n\n⚡ Made with Nexus AI Pro\n🎭 Model: {model}\n\n👉 Sign up free: {link}\n\n#AIArt #NSFW #AIImage #NexusAI #Creative",
  "🌟 AI Perfection\n\n🤖 Created using Nexus AI Pro\n💡 Model: {model}\n\n✨ Try now: {link}\n\n#NexusAIPro #AIGenerated #AIArt #NSFW #Trending",
];

const CAPTIONS_VIDEO = [
  "🎬 AI Generated Video\n\n🎥 Created with Nexus AI Pro\n⚡ Model: {model}\n\n👉 Make your own videos: {link}\n\n#AIVideo #AIGenerated #NexusAIPro #NSFW",
  "🔥 AI Video Magic\n\n🎞️ Powered by Nexus AI Pro\n✨ Model: {model}\n\n🚀 Try video generation: {link}\n\n#AIVideo #NexusAI #NSFW #AIGenerated",
  "✨ Stunning AI Video\n\n🎬 Made with Nexus AI Pro\n💫 Model: {model}\n\n🔗 Create videos free: {link}\n\n#AIVideo #AIGenerated #NexusAIPro #NSFW #Trending",
];

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════
let postIndex = 0;
const LOG_FILE = path.join(__dirname, 'bot.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════
// REPLICATE API
// ═══════════════════════════════════════
async function createPrediction(modelId, input) {
  let url, body;

  // Some models need version-based endpoint, others use model-based
  if (modelId.includes(':')) {
    // Version-based: model:version_hash
    const versionHash = modelId.split(':')[1];
    url = 'https://api.replicate.com/v1/predictions';
    body = { version: versionHash, input };
  } else {
    // Model-based: owner/model
    url = `https://api.replicate.com/v1/models/${modelId}/predictions`;
    body = { input };
  }

  log(`>>> API URL: ${url}`);
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (resp.status >= 400) {
    throw new Error(`Replicate error ${resp.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function pollPrediction(predictionId, maxWaitMs = 300000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const resp = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
    });
    const data = await resp.json();

    if (data.status === 'succeeded') {
      return data.output;
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${JSON.stringify(data.error)}`);
    }
    // Still processing, wait 3 seconds
    await sleep(3000);
  }
  throw new Error('Prediction timed out');
}

async function generateContent(modelConfig, prompt) {
  const input = {
    [modelConfig.inputKey]: prompt,
    ...modelConfig.extraParams,
  };

  log(`>>> Creating prediction: ${modelConfig.id}`);
  log(`>>> Prompt: ${prompt.substring(0, 100)}...`);

  const prediction = await createPrediction(modelConfig.id, input);
  log(`>>> Prediction created: ${prediction.id}`);

  const output = await pollPrediction(prediction.id);
  log(`>>> Prediction complete, output: ${typeof output === 'string' ? output.substring(0, 100) : JSON.stringify(output).substring(0, 100)}`);

  // Output can be a URL string or array of URLs
  if (Array.isArray(output)) {
    return output[0];
  }
  return output;
}

// ═══════════════════════════════════════
// TELEGRAM API
// ═══════════════════════════════════════
async function sendTelegramPhoto(photoUrl, caption) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
    }),
  });
  const data = await resp.json();
  if (!data.ok) {
    throw new Error(`Telegram sendPhoto error: ${JSON.stringify(data)}`);
  }
  return data;
}

async function sendTelegramVideo(videoUrl, caption) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      video: videoUrl,
      caption: caption,
      parse_mode: 'HTML',
      supports_streaming: true,
    }),
  });
  const data = await resp.json();
  if (!data.ok) {
    // Sometimes video URL needs to be downloaded first
    // Try sending as document
    log('>>> sendVideo failed, trying as animation...');
    const url2 = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`;
    const resp2 = await fetch(url2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        animation: videoUrl,
        caption: caption,
        parse_mode: 'HTML',
      }),
    });
    const data2 = await resp2.json();
    if (!data2.ok) {
      // Last resort: send as document
      log('>>> sendAnimation failed, trying as document...');
      const url3 = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
      const resp3 = await fetch(url3, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL_ID,
          document: videoUrl,
          caption: caption,
          parse_mode: 'HTML',
        }),
      });
      const data3 = await resp3.json();
      if (!data3.ok) {
        throw new Error(`Telegram send error: ${JSON.stringify(data3)}`);
      }
      return data3;
    }
    return data2;
  }
  return data;
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });
  return resp.json();
}

// ═══════════════════════════════════════
// MAIN POST FUNCTION
// ═══════════════════════════════════════
async function createAndPost() {
  try {
    // Get current model from schedule
    const modelKey = POST_SCHEDULE[postIndex % POST_SCHEDULE.length];
    const modelConfig = MODELS[modelKey];
    postIndex++;

    log(`\n${'='.repeat(50)}`);
    log(`POST #${postIndex} - Model: ${modelKey} (${modelConfig.type})`);
    log(`${'='.repeat(50)}`);

    // Pick random prompt based on content type
    let prompt;
    if (modelConfig.type === 'video') {
      prompt = getRandomItem(NSFW_VIDEO_PROMPTS);
    } else {
      prompt = getRandomItem(NSFW_IMAGE_PROMPTS);
    }

    // Add NSFW base prompt enhancement (same as server.js)
    const nsfwBase = 'Fully nude woman with no clothing at all, completely naked body fully exposed to camera. ' +
      'Beautiful round breasts with detailed brown areolas and erect nipples clearly visible. ' +
      'Smooth flat stomach with attractive navel piercing visible. ' +
      'Clean shaved intimate area fully exposed and clearly visible between slightly parted thighs. ' +
      'Gorgeous feminine curves, hourglass figure with wide hips and slim waist. ' +
      'Soft glowing skin with natural body highlights, photorealistic skin texture and pores. ' +
      'Seductive confident pose looking at camera with sultry expression. ' +
      'Professional boudoir photography lighting, soft warm golden hour tones, shallow depth of field. ' +
      'Ultra high resolution, 8K quality, hyperdetailed, masterpiece composition. ';
    const enhancedPrompt = nsfwBase + prompt;

    // Generate content
    const contentUrl = await generateContent(modelConfig, enhancedPrompt);

    if (!contentUrl) {
      log('>>> ERROR: No content URL returned');
      return;
    }

    // Build caption
    let caption;
    const modelDisplayName = modelKey.replace(/_/g, ' ').toUpperCase();
    if (modelConfig.type === 'video') {
      caption = getRandomItem(CAPTIONS_VIDEO);
    } else {
      caption = getRandomItem(CAPTIONS_IMAGE);
    }
    caption = caption.replace('{model}', modelDisplayName).replace('{link}', SIGNUP_LINK);

    // Send to Telegram
    if (modelConfig.type === 'video') {
      await sendTelegramVideo(contentUrl, caption);
    } else {
      await sendTelegramPhoto(contentUrl, caption);
    }

    log(`>>> ✅ Successfully posted to ${TELEGRAM_CHANNEL_ID}`);
    log(`>>> Content URL: ${contentUrl}`);
    log(`>>> Type: ${modelConfig.type}`);
    log(`>>> Model: ${modelKey}`);

  } catch (err) {
    log(`>>> ❌ ERROR: ${err.message}`);
    log(`>>> Stack: ${err.stack}`);
  }
}

// ═══════════════════════════════════════
// SCHEDULER
// ═══════════════════════════════════════
async function startBot() {
  log('\n' + '═'.repeat(60));
  log('🚀 NEXUS AI PRO - TELEGRAM AUTO-POST BOT STARTED');
  log('═'.repeat(60));
  log(`📢 Channel: ${TELEGRAM_CHANNEL_ID}`);
  log(`⏰ Posting every ${POST_INTERVAL_HOURS} hours (${24 / POST_INTERVAL_HOURS} posts/day)`);
  log(`🎨 Models: SDXL Lightning, Wan 2.2 Image, Wan 2.2 T2V`);
  log(`📝 Image prompts: ${NSFW_IMAGE_PROMPTS.length}`);
  log(`📝 Video prompts: ${NSFW_VIDEO_PROMPTS.length}`);
  log('═'.repeat(60));

  // Post immediately on start
  log('\n>>> Creating first post...');
  await createAndPost();

  // Then schedule regular posts
  const intervalMs = POST_INTERVAL_HOURS * 60 * 60 * 1000;
  setInterval(async () => {
    log('\n>>> Scheduled post triggered...');
    await createAndPost();
  }, intervalMs);

  log(`\n>>> Next post in ${POST_INTERVAL_HOURS} hours`);
  log('>>> Bot running... Press Ctrl+C to stop\n');
}

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
startBot().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});

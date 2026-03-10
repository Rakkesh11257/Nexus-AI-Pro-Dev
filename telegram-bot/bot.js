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
const SIGNUP_LINK = process.env.SIGNUP_LINK || 'https://app.nexus-ai-pro.com';

// ═══════════════════════════════════════
// MODELS CONFIG
// ═══════════════════════════════════════
const MODELS = {
  sdxl_lightning: {
    id: 'bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe',
    type: 'image',
    inputKey: 'prompt',
    extraParams: { width: 1024, height: 1024, num_outputs: 1, num_inference_steps: 4, scheduler: 'K_EULER', disable_safety_checker: true },
  },
  flux_pro: {
    id: 'black-forest-labs/flux-1.1-pro',
    type: 'image',
    inputKey: 'prompt',
    extraParams: { width: 1024, height: 1024 },
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
  },
};

// 8 posts/day rotation
const POST_SCHEDULE = [
  'sdxl_lightning', 'wan_image', 'flux_pro',
  'wan_t2v', 'sdxl_lightning', 'wan_image',
  'flux_pro', 'wan_t2v',
];

// ═══════════════════════════════════════
// IMAGE PROMPTS — Diverse, High Quality
// ═══════════════════════════════════════
const IMAGE_PROMPTS = [
  // ── Portraits & People ──
  "Stunning portrait of a young Indian woman wearing traditional Rajasthani jewelry and colorful bandhani dupatta, golden hour desert sunset behind her, wind blowing fabric, ornate nose ring and maang tikka catching light, National Geographic quality photography, 8K",
  "Elegant Japanese geisha in a serene bamboo garden at twilight, white face paint with red lips, elaborate kanzashi hair ornaments, silk kimono with crane patterns, soft bokeh cherry blossoms falling, cinematic portrait, 8K",
  "Cyberpunk street samurai girl with neon-lit cybernetic arm, standing in rain-soaked Tokyo alley, holographic billboards reflecting in puddles, leather jacket with glowing circuits, moody blade runner atmosphere, 8K",
  "Beautiful African queen portrait with elaborate gold face paint and headpiece, rich dark skin glowing in studio lighting, tribal jewelry with amber and turquoise stones, powerful regal expression, Vogue editorial photography, 8K",
  "Ethereal forest elf woman with pointed ears and silver hair flowing like moonlight, bioluminescent flowers in enchanted dark forest, mystical green fog, intricate elven armor with leaf motifs, fantasy art masterpiece, 8K",
  "Fierce Viking shieldmaiden with braided red hair and blue war paint, standing on dramatic Norwegian cliff overlooking fjord, fur cloak blowing in wind, ancient sword and round shield, stormy sky, cinematic epic, 8K",
  "Stunning Indian Bharatanatyam dancer mid-performance, elaborate temple jewelry and silk costume, dramatic mudra hand gesture, carved stone temple backdrop with oil lamps, motion blur of ankle bells, 8K",
  "Mysterious Egyptian queen Cleopatra in golden throne room, kohl-lined eyes, lapis lazuli and gold necklace, translucent linen gown, hieroglyphic walls, incense smoke catching light, historical fantasy art, 8K",
  "Beautiful Latina woman in Day of the Dead sugar skull makeup, surrounded by marigold flowers and candles, ornate floral headpiece, Mexican cemetery at dusk, vibrant colors against moody lighting, 8K",
  "Futuristic astronaut woman removing helmet on alien planet, exotic bioluminescent landscape with twin moons, reflection in visor, sci-fi spacesuit with mission patches, awe-struck expression, 8K",

  // ── Landscapes & Scenery ──
  "Ancient lost temple hidden in dense Vietnamese jungle, massive banyan tree roots consuming stone walls, shafts of golden sunlight piercing canopy, mist hanging low, moss covered Buddha statues, Indiana Jones adventure feeling, 8K",
  "Surreal floating islands in a cotton candy pink and purple sky at sunset, waterfalls cascading into clouds below, tiny glowing villages on each island, fantasy landscape, Studio Ghibli meets reality, 8K",
  "Frozen Viking longship trapped in Arctic ice under spectacular aurora borealis, green and purple lights dancing in starry sky, ice crystals sparkling, photorealistic fantasy landscape, 8K",
  "Massive cyberpunk megacity at night from rooftop perspective, endless neon lights stretching to horizon, flying cars leaving light trails, holographic advertisements, rain and fog, blade runner vibes, 8K",
  "Ancient Mayan pyramid in dense jungle during golden hour, dramatic sunbeams through storm clouds, jaguar sitting majestically on temple steps, exotic birds in canopy, archaeological adventure, 8K",
  "Enchanted Japanese torii gate path through autumn forest, thousands of red gates stretching into misty distance, golden maple leaves falling, lone figure with umbrella walking, magical atmosphere, 8K",
  "Dramatic Varanasi ghats at dawn, thousands of oil lamps floating on Ganges river, ancient temples in golden morning mist, holy men in meditation, boats silhouetted, spiritual India, 8K",
  "Bioluminescent ocean cave with crystal formations, glowing blue water reflecting on ceiling, underwater portal to another dimension visible in depths, fantasy seascape, ethereal atmosphere, 8K",

  // ── Fantasy & Sci-Fi ──
  "Massive steampunk clockwork dragon made of brass and copper gears, breathing fire in Victorian London sky, Big Ben and airships in background, cogs and steam billowing, detailed mechanical art, 8K",
  "Ancient wizard in crystal cave library, thousands of glowing spell books floating around him, long silver beard, ornate robes with constellation patterns, magical particles in air, fantasy masterpiece, 8K",
  "Giant mech robot standing in destroyed Tokyo street, cherry blossoms falling around it contrasting with destruction, pilot visible in cockpit, sunset dramatic lighting, anime meets photorealism, 8K",
  "Phoenix bird made of pure golden fire rising from volcanic crater, feathers of living flame spreading across crimson sky, molten lava below, mythological rebirth moment, epic fantasy art, 8K",
  "Underwater steampunk city with glass domes and brass submarines, bioluminescent jellyfish floating between buildings, coral growing on Victorian architecture, deep ocean blue, fantastical worldbuilding, 8K",
  "Samurai warrior facing enormous Chinese dragon in stormy mountain pass, lightning illuminating both figures, rain and cherry blossoms swirling, katana glowing with spiritual energy, epic confrontation, 8K",

  // ── Animals & Nature ──
  "Majestic Bengal tiger walking through misty Ranthambore ruins at dawn, ancient crumbling walls with vines, golden eyes piercing through fog, powerful muscles visible, wildlife photography masterpiece, 8K",
  "Surreal scene of massive blue whale swimming through clouds above a mountain range, aurora borealis in sky, tiny village below looking up in wonder, magical realism, dreamlike atmosphere, 8K",
  "Pack of wolves howling on snowy cliff under full supermoon, breath visible in cold air, Northern Lights dancing behind them, pine forest below, dramatic wildlife scene, cinematic photography, 8K",
  "Microscopic world made massive — a water droplet on a leaf surface looks like an alien planet, refracted light creating rainbow galaxy inside, extreme macro photography meets sci-fi, 8K",

  // ── Art & Abstract ──
  "Hyper-detailed mechanical pocket watch exploding in slow motion, thousands of tiny golden gears and springs flying outward, frozen in time, dark background with dramatic lighting, product photography meets art, 8K",
  "Living oil painting — Van Gogh's Starry Night coming alive, swirling stars becoming real galaxies, cypress tree growing out of canvas into 3D space, paint dripping from edges, mind-bending art, 8K",
  "Impossible Escher-like architecture filled with people walking on staircases in every direction, gravity-defying marble palace, MC Escher meets photorealism, brain-melting optical illusion, 8K",
  "Portrait made entirely of flowers — woman's face composed of thousands of tiny blooms, roses for lips, forget-me-nots for eyes, ivy for hair, garden growing into human form, botanical art, 8K",
  
  // ── Cultural & Historical ──
  "Grand Mughal emperor's court in full session, ornate marble Diwan-i-Khas with jeweled Peacock Throne, courtiers in silk, musicians playing, sunlight through carved jali screens, historical epic, 8K",
  "Ancient Greek philosopher academy, marble columns and olive trees, Plato teaching students in amphitheater, Mediterranean golden light, scrolls and geometric instruments, classical civilization, 8K",
  "Silk Road caravan crossing Gobi desert at sunset, hundreds of camels loaded with exotic goods, merchants in colorful robes, dramatic sand dunes stretching endlessly, golden hour epic, 8K",
  "Traditional Indian Kathakali dancer in full elaborate green face makeup and costume, dramatic expression, coconut oil lamp lighting, Kerala temple festival atmosphere, cultural photography, 8K",
];

// Video-specific prompts
const VIDEO_PROMPTS = [
  "Beautiful Indian woman in flowing red silk saree dancing gracefully in ancient temple courtyard, gold jewelry catching sunlight, jasmine flowers in hair, classical dance movements, oil lamps flickering, cinematic slow motion",
  "Majestic Bengal tiger walking through misty jungle at dawn, powerful muscles rippling, golden eyes alert, morning sunbeams through dense canopy, leaves rustling, wildlife documentary cinematic",
  "Samurai warrior drawing katana in slow motion during cherry blossom storm, petals swirling around blade, Japanese temple garden, dramatic wind, silk robes flowing, cinematic martial arts",
  "Massive dragon emerging from volcanic mountain, spreading wings against crimson sunset sky, fire breathing, epic scale with tiny castle below, rocks crumbling, fantasy cinematic",
  "Futuristic cyberpunk city street at night in rain, neon signs reflecting in puddles, flying cars passing overhead, lone figure with umbrella walking, blade runner atmosphere, cinematic",
  "Ancient Egyptian pharaoh's treasure chamber opening for first time, golden artifacts catching torchlight, dust particles in air beam, archaeological discovery moment, Indiana Jones vibes, cinematic",
  "Northern Lights dancing over frozen Icelandic landscape, green and purple aurora reflecting in still lake, snow-covered mountains, time-lapse style movement, ethereal atmosphere, cinematic",
  "Indian festival of Holi celebration, slow motion colored powder explosions in air, joyful people dancing, vibrant rainbow clouds of gulal, traditional music energy, festive cinematic",
  "Underwater coral reef scene, colorful tropical fish swimming through crystal clear water, sea turtle gliding past camera, sunlight rays dancing through water, nature documentary, cinematic",
  "Traditional Indian Kathakali dancer performing dramatic scene, elaborate colorful costume and makeup, expressive eye and hand movements, stage with oil lamps, cultural performance, cinematic",
  "Enormous wave crashing on Hawaiian shore during golden sunset, surfer riding inside barrel, spray catching golden light, slow motion water droplets, extreme sports cinematic",
  "Ancient library with thousands of floating magical books, pages turning by themselves, golden dust particles in sunbeam, wizard walking through, enchanted atmosphere, fantasy cinematic",
  "Indian bride walking through marigold flower shower at wedding ceremony, elaborate red and gold outfit, jewelry sparkling, family celebrating, petals in slow motion, Bollywood cinematic",
  "Space station orbiting Earth at sunrise, solar panels unfolding, astronaut doing spacewalk, blue planet below with cloud formations, stars in background, sci-fi documentary cinematic",
  "Traditional Japanese tea ceremony in zen garden, cherry blossoms gently falling, steam rising from matcha bowl, precise graceful movements, bamboo water fountain, peaceful meditative cinematic",
];

// ═══════════════════════════════════════
// CAPTION TEMPLATES
// ═══════════════════════════════════════
const CAPTIONS_IMAGE = [
  "🎨 Nexus AI Pro Creation\n\n✨ 100% AI Generated Art\n🖼️ Model: {model}\n\n⚠️ Disclaimer: This is not real — it is AI-generated art created by Nexus AI Pro.\n\n👉 Create your own: {link}\n\n#AIArt #AIGenerated #NexusAIPro #DigitalArt #Trending #AICreation #NotReal #AIArtwork",
  "🔥 Nexus AI Pro Creation\n\n💫 AI-Generated Masterpiece\n🎭 Model: {model}\n\n⚠️ Disclaimer: This image is entirely AI-generated and not real. Created with Nexus AI Pro.\n\n🚀 Try free — 35 credits on signup: {link}\n\n#AIArt #NexusAIPro #AIImage #CreativeAI #ArtificialIntelligence #NotReal #AIGenerated",
  "✨ Nexus AI Pro Creation\n\n🤖 Powered by 63+ AI Models\n📸 Model: {model}\n\n⚠️ Disclaimer: This is AI-generated art, not a real photograph. Made with Nexus AI Pro.\n\n🔗 Start creating free: {link}\n\n#AIGenerated #NexusAIPro #AIArt #DigitalCreation #Trending #NotReal #AICreation",
  "💎 Nexus AI Pro Creation\n\n⚡ Premium AI-Generated Art\n🎨 Model: {model}\n\n⚠️ Disclaimer: Not real — AI-generated content created by Nexus AI Pro.\n\n👉 Sign up free — no credit card: {link}\n\n#AIArt #AIImage #NexusAIPro #GenerativeAI #Creative #NotReal #AIGenerated",
  "🌟 Nexus AI Pro Creation\n\n🏛️ Stunning AI-Generated Art\n💡 Model: {model}\n\n⚠️ Disclaimer: This is not real. It is AI-generated art created with Nexus AI Pro.\n\n✨ Try now: {link}\n\n#NexusAIPro #AIGenerated #AIArt #Trending #DigitalArt #NotReal #AICreation",
  "🪄 Nexus AI Pro Creation\n\n🎨 One prompt, endless possibilities\n⚡ Model: {model}\n\n⚠️ Disclaimer: AI-generated art — not real. Created with Nexus AI Pro.\n\n👉 Generate yours free: {link}\n\n#AIArt #NexusAIPro #AIGenerated #CreativeAI #ArtOfTheDay #NotReal #AICreation",
];

const CAPTIONS_VIDEO = [
  "🎬 Nexus AI Pro Creation\n\n🎥 AI-Generated Video\n⚡ Model: {model}\n\n⚠️ Disclaimer: This video is not real — it is entirely AI-generated by Nexus AI Pro.\n\n👉 Make your own AI videos: {link}\n\n#AIVideo #AIGenerated #NexusAIPro #DigitalArt #NotReal #AICreation",
  "🔥 Nexus AI Pro Creation\n\n🎞️ AI-Generated Video Art\n✨ Model: {model}\n\n⚠️ Disclaimer: Not real — AI-generated video content. Created with Nexus AI Pro.\n\n🚀 Try video generation free: {link}\n\n#AIVideo #NexusAIPro #AIGenerated #Trending #NotReal #AICreation",
  "✨ Nexus AI Pro Creation\n\n🎬 Stunning AI-Generated Video\n💫 Model: {model}\n\n⚠️ Disclaimer: This is AI-generated content, not real footage. Powered by Nexus AI Pro — 63+ models.\n\n🔗 Create videos free: {link}\n\n#AIVideo #AIGenerated #NexusAIPro #CreativeAI #Trending #NotReal #AICreation",
];

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════
let postIndex = 0;
const usedPromptIndices = { image: new Set(), video: new Set() };
const LOG_FILE = path.join(__dirname, 'bot.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// Get random prompt without repeating until all are used
function getUniquePrompt(arr, type) {
  const used = usedPromptIndices[type];
  if (used.size >= arr.length) used.clear(); // Reset when all used
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (used.has(idx));
  used.add(idx);
  return arr[idx];
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSeed() {
  return Math.floor(Math.random() * 2147483647);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════
// REPLICATE API
// ═══════════════════════════════════════
async function createPrediction(modelId, input) {
  let url, body;

  if (modelId.includes(':')) {
    const versionHash = modelId.split(':')[1];
    url = 'https://api.replicate.com/v1/predictions';
    body = { version: versionHash, input };
  } else {
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

    if (data.status === 'succeeded') return data.output;
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${JSON.stringify(data.error)}`);
    }
    await sleep(3000);
  }
  throw new Error('Prediction timed out');
}

async function generateContent(modelConfig, prompt) {
  const input = {
    [modelConfig.inputKey]: prompt,
    ...modelConfig.extraParams,
    seed: randomSeed(), // Random seed every time for unique outputs
  };

  log(`>>> Creating prediction: ${modelConfig.id}`);
  log(`>>> Prompt: ${prompt.substring(0, 120)}...`);
  log(`>>> Seed: ${input.seed}`);

  const prediction = await createPrediction(modelConfig.id, input);
  log(`>>> Prediction created: ${prediction.id}`);

  const output = await pollPrediction(prediction.id);
  log(`>>> Prediction complete`);

  if (Array.isArray(output)) return output[0];
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
  if (!data.ok) throw new Error(`Telegram sendPhoto error: ${JSON.stringify(data)}`);
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
    log('>>> sendVideo failed, trying as animation...');
    const url2 = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`;
    const resp2 = await fetch(url2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHANNEL_ID, animation: videoUrl, caption, parse_mode: 'HTML' }),
    });
    const data2 = await resp2.json();
    if (!data2.ok) {
      const url3 = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
      const resp3 = await fetch(url3, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHANNEL_ID, document: videoUrl, caption, parse_mode: 'HTML' }),
      });
      const data3 = await resp3.json();
      if (!data3.ok) throw new Error(`Telegram send error: ${JSON.stringify(data3)}`);
      return data3;
    }
    return data2;
  }
  return data;
}

// ═══════════════════════════════════════
// MAIN POST FUNCTION
// ═══════════════════════════════════════
async function createAndPost() {
  try {
    const modelKey = POST_SCHEDULE[postIndex % POST_SCHEDULE.length];
    const modelConfig = MODELS[modelKey];
    postIndex++;

    log(`\n${'='.repeat(50)}`);
    log(`POST #${postIndex} - Model: ${modelKey} (${modelConfig.type})`);
    log(`${'='.repeat(50)}`);

    let prompt;
    if (modelConfig.type === 'video') {
      prompt = getUniquePrompt(VIDEO_PROMPTS, 'video');
    } else {
      prompt = getUniquePrompt(IMAGE_PROMPTS, 'image');
    }

    const contentUrl = await generateContent(modelConfig, prompt);

    if (!contentUrl) {
      log('>>> ERROR: No content URL returned');
      return;
    }

    let caption;
    const modelDisplayName = modelKey === 'sdxl_lightning' ? 'SDXL Lightning' :
      modelKey === 'flux_pro' ? 'FLUX 1.1 Pro' :
      modelKey === 'wan_image' ? 'Wan 2.2' :
      modelKey === 'wan_t2v' ? 'Wan 2.2 Video' : modelKey;

    if (modelConfig.type === 'video') {
      caption = getRandomItem(CAPTIONS_VIDEO);
    } else {
      caption = getRandomItem(CAPTIONS_IMAGE);
    }
    caption = caption.replace('{model}', modelDisplayName).replace('{link}', SIGNUP_LINK);

    if (modelConfig.type === 'video') {
      await sendTelegramVideo(contentUrl, caption);
    } else {
      await sendTelegramPhoto(contentUrl, caption);
    }

    log(`>>> ✅ Successfully posted to ${TELEGRAM_CHANNEL_ID}`);
    log(`>>> Type: ${modelConfig.type} | Model: ${modelKey}`);

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
  log('🚀 NEXUS AI PRO - TELEGRAM AUTO-POST BOT v2.0');
  log('═'.repeat(60));
  log(`📢 Channel: ${TELEGRAM_CHANNEL_ID}`);
  log(`⏰ Posting every ${POST_INTERVAL_HOURS} hours`);
  log(`🎨 Models: SDXL Lightning, FLUX Pro, Wan 2.2 Image, Wan 2.2 T2V`);
  log(`📝 Image prompts: ${IMAGE_PROMPTS.length}`);
  log(`📝 Video prompts: ${VIDEO_PROMPTS.length}`);
  log(`🎯 Unique prompt rotation (no repeats until all used)`);
  log('═'.repeat(60));

  log('\n>>> Creating first post...');
  await createAndPost();

  const intervalMs = POST_INTERVAL_HOURS * 60 * 60 * 1000;
  setInterval(async () => {
    log('\n>>> Scheduled post triggered...');
    await createAndPost();
  }, intervalMs);

  log(`\n>>> Next post in ${POST_INTERVAL_HOURS} hours`);
  log('>>> Bot running... Press Ctrl+C to stop\n');
}

startBot().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});

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

// 8 posts/day: 3x SDXL, 3x Wan Image, 2x Wan T2V
const POST_SCHEDULE = [
  'sdxl_lightning', 'wan_image', 'sdxl_lightning',
  'wan_t2v', 'wan_image', 'sdxl_lightning',
  'wan_image', 'wan_t2v',
];

// ═══════════════════════════════════════
// INDIAN TRADITIONAL NSFW PROMPTS (50+)
// ═══════════════════════════════════════
const NSFW_IMAGE_PROMPTS = [
  // ── Bridal / Wedding Night ──
  "Beautiful Indian bride with red bindi on forehead, jasmine gajra flowers in long black hair, heavy gold maang tikka and jhumka earrings, removing red silk bridal saree revealing nude body, ornate gold necklace and bangles still adorning her, dimly lit bridal suite with rose petals and diyas, mehndi on hands and feet, shy seductive smile, photorealistic, 8K masterpiece",
  "Gorgeous newly wed Indian woman, sindoor in hair parting, red bindi, jasmine flowers pinned in thick braided hair, nude body draped only in gold waist chain and anklets, sitting on red silk bedsheets in traditional bedroom, brass oil lamps glowing, wedding night atmosphere, photorealistic, ultra detailed, 8K",
  "Stunning Indian bride after wedding ceremony, mangalsutra necklace resting between bare breasts, red bindi on forehead, jasmine gajra in hair, nude body with mehndi patterns on hands and feet, gold bangles and toe rings, lying on flower decorated bed, warm candlelight, intimate bridal boudoir, 8K",
  "Beautiful Tamil bride with large red kumkum bindi, fresh jasmine flower strings woven in long oiled black hair, heavy temple gold jewelry on nude body, traditional kolam patterns on floor, brass deepam lamp lighting, silk saree pooled at her feet, South Indian bridal beauty, photorealistic, 8K",
  "Gorgeous Rajasthani bride with ornate borla maang tikka, red bindi, jasmine in hair, removing ghagra choli revealing curves, gold aad necklace and ivory bangles on nude body, haveli bedroom with mirror work walls, warm lamp light, royal Rajput bridal beauty, 8K",

  // ── Saree Draping / Removing ──
  "Beautiful Indian woman with red bindi and jasmine flowers in hair, slowly unwrapping silk Kanjeevaram saree, revealing nude body underneath, gold temple jewelry adorning neck and waist, traditional Tamil Nadu home with brass decor, oil lamp light, elegant sensual moment, photorealistic, 8K",
  "Gorgeous woman with bindi on forehead, jasmine gajra in thick braid, transparent white cotton saree clinging to wet nude body after rain, gold waist chain and anklets visible through fabric, standing in courtyard with tulsi plant, monsoon atmosphere, artistic Indian photography, 8K",
  "Stunning Indian woman with kumkum bindi, jasmine flowers tucked behind ear, green silk saree slipping off one shoulder revealing bare breast, gold choker necklace, standing by carved wooden window in old Kerala home, natural sunlight, tasteful sensual portrait, 8K",
  "Beautiful Bengali woman with red and white shakha pola bangles, large red bindi, jasmine in hair, red bordered white saree falling off body revealing nude figure, terracotta room with alpona floor art, Durga Puja season, warm festive lighting, photorealistic, 8K",
  "Gorgeous Maharashtrian woman with crescent bindi, jasmine veni in hair bun, green nauvari saree unwrapping from body, gold tanmani necklace on bare chest, traditional wada house interior, Kolhapuri aesthetic, warm natural light, photorealistic, 8K",

  // ── Temple / Devotional Aesthetic ──
  "Beautiful Indian temple dancer with large red bindi, elaborate jasmine gajra crown in hair, classical bharatanatyam jewelry on fully nude body, gold waist belt and ankle bells, carved granite temple pillars background, oil lamp lit, divine feminine beauty, artistic photography, 8K",
  "Gorgeous Devadasi inspired Indian woman, ornate bindi, fresh jasmine garlands draped over nude body, heavy antique gold temple jewelry, standing in ancient stone temple corridor, warm lamplight casting shadows on carved walls, sacred feminine art, photorealistic, 8K",
  "Stunning South Indian woman with traditional pottu bindi, jasmine flowers cascading from hair to shoulders, nude body adorned only with temple gold jewelry and flower garlands, Chola bronze statue in background, oil lamp lit sanctum aesthetic, divine beauty, 8K",
  "Beautiful Odissi dancer with red bindi and silver tikka, jasmine in elaborate hair bun, removing dance costume revealing nude body, silver filigree jewelry, Konark temple inspired carved stone background, dramatic side lighting, classical Indian art photography, 8K",

  // ── Bath / Water Scenes ──
  "Beautiful Indian woman with waterproof bindi, wet jasmine flowers in hair, bathing nude in traditional brass uruli tub filled with flower petals, Kerala ayurvedic bath house, coconut oil glistening on brown skin, tropical green plants around, steam rising, photorealistic, 8K",
  "Gorgeous Indian woman with bindi, jasmine in long wet hair, standing nude under outdoor stone shower in Rajasthani haveli courtyard, water cascading over curves, gold anklets and toe rings, sandstone architecture, golden hour sunlight, artistic photography, 8K",
  "Stunning Tamil woman with kumkum bindi, jasmine gajra in wet braid, bathing nude in temple tank pond, lotus flowers floating around, ancient stone steps and pillared mandapam, morning mist, sacred bathing ritual aesthetic, photorealistic, 8K",
  "Beautiful Indian woman with red bindi, soaked jasmine flowers in hair, nude body emerging from river at sunrise, wet brown skin glowing golden, ghats and temple spires in background, Varanasi inspired setting, spiritual and sensual, cinematic photography, 8K",
  "Gorgeous Kerala woman with small bindi, jasmine tucked in hair, nude body being massaged with coconut oil on wooden table, traditional ayurvedic spa setting, banana leaves and brass vessels, warm oil glistening on skin, relaxing atmosphere, photorealistic, 8K",

  // ── Festival / Celebration ──
  "Beautiful Indian woman celebrating Holi, colored powder on nude body, red bindi smeared with colors, jasmine flowers in messy hair, vibrant pink purple yellow gulal on brown skin, joyful expression, outdoor courtyard, festive energy, photorealistic, 8K",
  "Gorgeous Indian woman during Diwali night, red bindi glowing in lamplight, jasmine in hair, nude body illuminated by rows of clay diyas, gold jewelry sparkling, rooftop celebration, sparklers and city lights in background, festive sensual atmosphere, 8K",
  "Stunning woman with bindi and jasmine flowers, nude body decorated with turmeric and sandalwood paste for traditional haldi ceremony, gold ornaments, banana leaf and brass kalash nearby, outdoor mandap setting, warm afternoon light, ritual beauty, 8K",
  "Beautiful Indian woman during Navratri, elaborate bindi art, jasmine and marigold flowers in hair, removing embroidered chaniya choli during garba night, nude body with dandiya sticks nearby, colorful tent with mirror work, festive lighting, 8K",
  "Gorgeous Pongal celebration, Tamil woman with bindi and jasmine, nude body decorated with turmeric, cooking pot overflowing with rice nearby, sugarcane and kolam patterns on floor, rural South Indian home, morning sunlight, harvest festival beauty, 8K",

  // ── Rural / Village ──
  "Beautiful Indian village woman with simple red bindi, fresh jasmine in oiled long braid, nude body carrying brass water pot on hip, standing by village well, mud walls and thatched roof hut, morning golden light, rural Indian beauty, photorealistic, 8K",
  "Gorgeous tribal Indian woman with forehead bindi, wild jasmine flowers in untied hair, nude body with traditional tribal silver jewelry and tattoos, standing in forest clearing, bamboo and banana trees, natural raw beauty, documentary style photography, 8K",
  "Stunning Rajasthani village woman with mirror work bindi, jasmine in hair under colorful odhni veil falling away, nude body with silver anklets and bangles, standing by blue painted wall in Jodhpur, desert sunlight, vibrant cultural beauty, photorealistic, 8K",
  "Beautiful South Indian village woman with large kumkum bindi, jasmine veni in long thick hair, nude body with simple gold chain, standing in paddy field at sunset, palm trees and water channels, Kerala backwater landscape, golden hour, 8K",

  // ── Royal / Palace ──  
  "Beautiful Mughal queen with jeweled bindi, jasmine and rose in elaborate hairstyle, fully nude reclining on silk cushions in marble palace chamber, miniature painting style, ornate jali screens with moonlight, royal harem aesthetic, gold and gemstone jewelry, 8K masterpiece",
  "Gorgeous Rajput princess with rajputi bindi, jasmine garlands in hair, nude body adorned with kundan jewelry and pearl strings, standing in palace balcony overlooking lake, Udaipur palace inspired architecture, sunset light, royal elegance, photorealistic, 8K",
  "Stunning Chola queen with large gold bindi, jasmine crown, nude body with heavy antique gold jewelry and silk waist cloth slipping off, seated on carved wooden throne, palace durbar hall with oil paintings, regal power and beauty, 8K",
  "Beautiful Nizam princess with crescent bindi, jasmine and mogra in hair, nude body with hyderabadi pearl jewelry, reclining in zenana palace room, chikankari fabric and ittar perfume bottles nearby, Lucknowi nawabi aesthetic, warm light, 8K",

  // ── Modern Indian ──
  "Beautiful modern Indian woman with fashionable small bindi, jasmine tucked behind ear, nude body with contemporary gold jewelry, standing in luxury Mumbai high rise apartment, city skyline at night through glass windows, urban Indian beauty, professional photography, 8K",
  "Gorgeous Indian yoga instructor with tilak bindi, jasmine in top knot bun, nude body in yoga pose on rooftop, Himalayan mountains in background, sunrise golden light, toned fit body, spiritual and sensual, modern wellness aesthetic, 8K",
  "Stunning Bollywood style Indian woman with glamorous bindi, jasmine in styled waves, nude body on white luxury bedsheets, modern penthouse bedroom, vanity mirror with lights, Bollywood diva vibes, professional boudoir photography, 8K",
  "Beautiful Indian tech girl with small trendy bindi, jasmine flower pin in hair, removing business blazer and silk blouse revealing nude body, modern Bangalore apartment, evening city lights, confident independent woman, photorealistic, 8K",
  "Gorgeous Indian influencer with crystal bindi, jasmine chain in hair, nude body posing for self-portrait with vintage camera, aesthetic apartment with plants and fairy lights, Instagram lifestyle aesthetic, warm tones, 8K",

  // ── Monsoon / Rain ──
  "Beautiful Indian woman with rain-smeared red bindi, wet jasmine flowers in drenched hair, completely nude in monsoon rain on terrace, water streaming over brown curves, lightning in dark sky, old Indian building rooftop, dramatic monsoon photography, 8K",
  "Gorgeous woman with bindi, soaked jasmine in hair, nude body dancing in courtyard rain, splashing in puddles, wet skin glistening, traditional haveli courtyard with carved arches, romantic monsoon atmosphere, cinematic Indian photography, 8K",
  "Stunning Indian woman with kumkum bindi, wet jasmine gajra, nude body standing under waterfall in Western Ghats forest, lush green tropical vegetation, moss covered rocks, crystal clear water on brown skin, nature photography, 8K",

  // ── Night / Moonlight ──
  "Beautiful Indian woman with chandanbindi, jasmine flowers glowing white in moonlight, nude body on palace terrace under full moon, marble railing and mahal domes silhouetted, silver moonlight on skin, romantic Rajasthani night, 8K",
  "Gorgeous Indian woman with bindi, jasmine in hair, nude body lying on silk bedspread on rooftop under stars, desert night sky with milky way, oil lamp flickering nearby, Jaisalmer golden sandstone, magical night photography, 8K",

  // ── Artistic / Classical ──
  "Beautiful Indian woman with traditional bindi and jasmine, posed as Ravi Varma painting come to life, nude body with classical draping half falling, gold jewelry, oil painting texture and lighting, gallery masterpiece quality, Indian classical art meets photography, 8K",
  "Gorgeous Indian woman with ornate bindi, jasmine in braided hair, nude body in Ajanta cave painting pose, ancient Buddhist cave interior, earth tone frescoes on walls, oil lamp lighting, historical art photography, 8K masterpiece",
  "Stunning Indian woman with red bindi and jasmine, nude body with classical Tanjore painting gold leaf accents on skin, temple jewelry, rich red and gold color palette, South Indian art aesthetic, professional artistic photography, 8K",
  "Beautiful Indian woman with kumkum bindi, jasmine flowers, nude body as living Chola bronze sculpture, copper skin tone, classical dance mudra hand pose, dramatic single light source, art gallery setting, sculptural beauty, 8K",

  // ── Intimate / Romantic ──
  "Beautiful Indian woman with smudged bindi after lovemaking, jasmine flowers scattered on pillow, nude body tangled in silk sheets, traditional Indian bedroom with carved headboard, post-intimate afterglow, warm skin, soft romantic lighting, photorealistic, 8K",
  "Gorgeous Indian woman with bindi, jasmine in loose hair, nude body on bed looking at camera seductively, red rose petals scattered, brass diya lamps flickering, sandalwood incense smoke, romantic suhaag raat bedroom, warm tones, 8K",
  "Stunning newlywed Indian woman with fresh sindoor and bindi, jasmine gajra coming undone, nude body with bangles and payal anklets only, lying on marigold flower bed, first night romantic setting, intimate warm photography, 8K",
];

// Video-specific prompts (Indian traditional, motion-focused)
const NSFW_VIDEO_PROMPTS = [
  "Beautiful Indian woman with red bindi and jasmine flowers in hair, slowly unwrapping red silk saree revealing nude body, gold jewelry glinting, traditional bedroom with diyas, warm golden lighting, sensual slow motion, cinematic",
  "Gorgeous Indian bride with bindi and jasmine gajra, removing wedding jewelry piece by piece then bridal outfit, revealing nude figure, candlelit room with rose petals, intimate slow motion, cinematic",
  "Stunning Indian woman with kumkum bindi, jasmine in wet hair, nude body bathing under brass shower in traditional bathroom, water cascading over brown skin, oil lamps flickering, slow motion water droplets, artistic",
  "Beautiful Indian woman with bindi, jasmine flowers in long hair, dancing classical moves then slowly removing silk costume revealing nude body, temple pillars background, oil lamp lit, graceful slow motion",
  "Gorgeous Indian woman with bindi and jasmine, nude body walking through monsoon rain in courtyard, wet skin glistening, sari fabric blowing in wind, romantic rainy atmosphere, cinematic slow motion",
  "Stunning Indian woman with red bindi, jasmine in braided hair, slowly applying oil to nude body with hands, gold bangles jingling, traditional wooden room, warm afternoon light, sensual self-care slow motion",
  "Beautiful Indian woman with bindi, jasmine tucked in hair, nude body entering flower petal filled brass bathtub, steam rising, Kerala spa setting, slow motion water and petals, peaceful cinematic",
  "Gorgeous Indian woman with ornate bindi, jasmine crown, nude body doing slow yoga stretches on palace terrace, sunrise over Indian landscape, gold jewelry catching light, graceful body movements, artistic",
  "Stunning Indian woman with kumkum bindi, jasmine in hair, lying nude on silk sheets slowly turning to camera, diya lamps around bed, flower garlands, intimate bedroom atmosphere, cinematic slow motion",
  "Beautiful Indian woman with bindi and jasmine flowers, nude body dancing in Holi colors, colored powder floating in slow motion, vibrant festival atmosphere, joyful sensual expression, cinematic",
  "Gorgeous Indian woman with red bindi, wet jasmine in hair, emerging nude from temple pond with lotus flowers, water dripping from body in slow motion, morning mist, sacred beauty, cinematic",
  "Stunning Indian woman with bindi, jasmine gajra, removing ghagra choli garment slowly revealing nude body, Rajasthani palace room with mirror work, warm lantern light, bridal slow motion",
  "Beautiful Indian village woman with simple bindi, jasmine in oiled braid, nude body pouring water over herself from brass pot, outdoor village bathing area, golden hour sunlight, rural beauty slow motion",
  "Gorgeous Indian woman with crystal bindi, jasmine in styled hair, nude body reclining on luxury bed slowly pulling silk sheet, modern Mumbai apartment, city lights through window, contemporary Indian beauty",
  "Stunning Indian woman with traditional bindi, jasmine garland, nude body performing aarti with diya lamp, flame casting warm shadows on curves, temple bell sound atmosphere, devotional sensual slow motion",
];

// ═══════════════════════════════════════
// CAPTION TEMPLATES (with AI disclaimer)
// ═══════════════════════════════════════
const CAPTIONS_IMAGE = [
  "🔥 AI-Generated Indian Art\n\n🤖 100% AI Created — No real persons depicted\n✨ Powered by Nexus AI Pro\n🎨 Model: {model}\n\n👉 Create your own AI art: {link}\n\n#AIArt #AIGenerated #NexusAIPro #IndianArt #AIImage #DigitalArt",
  "🎨 AI Indian Beauty\n\n🤖 Entirely AI Generated — Not a real person\n💫 Made with Nexus AI Pro\n🖼️ Model: {model}\n\n🚀 Try free: {link}\n\n#AIArt #NexusAI #AIGenerated #IndianBeauty #TraditionalArt",
  "✨ AI Traditional Art\n\n🤖 This is AI art — No real humans\n🔮 Generated by Nexus AI Pro\n📸 Model: {model}\n\n🔗 Start creating: {link}\n\n#AIGenerated #NexusAIPro #AIArt #IndianCulture #DigitalArt",
  "💎 Premium AI Creation\n\n🤖 100% AI — No real person depicted\n⚡ Created with Nexus AI Pro\n🎭 Model: {model}\n\n👉 Sign up free: {link}\n\n#AIArt #AIImage #NexusAI #IndianTraditional #Creative",
  "🌟 AI Masterpiece\n\n🤖 Fully AI Generated Art\n🏛️ Created using Nexus AI Pro\n💡 Model: {model}\n\n✨ Try now: {link}\n\n#NexusAIPro #AIGenerated #AIArt #IndianAesthetics #Trending",
  "🪷 AI Indian Aesthetic\n\n🤖 Not real — 100% AI generated\n🎨 Nexus AI Pro creation\n⚡ Model: {model}\n\n👉 Generate yours: {link}\n\n#AIArt #IndianArt #NexusAIPro #AIGenerated #TraditionalBeauty",
];

const CAPTIONS_VIDEO = [
  "🎬 AI-Generated Video\n\n🤖 100% AI Created — No real persons\n🎥 Powered by Nexus AI Pro\n⚡ Model: {model}\n\n👉 Make your own AI videos: {link}\n\n#AIVideo #AIGenerated #NexusAIPro #IndianArt",
  "🔥 AI Video Art\n\n🤖 Entirely AI Generated\n🎞️ Made with Nexus AI Pro\n✨ Model: {model}\n\n🚀 Try video generation: {link}\n\n#AIVideo #NexusAI #AIGenerated #IndianBeauty",
  "✨ Stunning AI Video\n\n🤖 Not real — AI generated art\n🎬 Nexus AI Pro creation\n💫 Model: {model}\n\n🔗 Create videos free: {link}\n\n#AIVideo #AIGenerated #NexusAIPro #DigitalArt #Trending",
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

    if (data.status === 'succeeded') {
      return data.output;
    }
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
  };

  log(`>>> Creating prediction: ${modelConfig.id}`);
  log(`>>> Prompt: ${prompt.substring(0, 100)}...`);

  const prediction = await createPrediction(modelConfig.id, input);
  log(`>>> Prediction created: ${prediction.id}`);

  const output = await pollPrediction(prediction.id);
  log(`>>> Prediction complete, output: ${typeof output === 'string' ? output.substring(0, 100) : JSON.stringify(output).substring(0, 100)}`);

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
      prompt = getRandomItem(NSFW_VIDEO_PROMPTS);
    } else {
      prompt = getRandomItem(NSFW_IMAGE_PROMPTS);
    }

    // NSFW base enhancement with Indian traditional elements
    const nsfwBase = 'Fully nude Indian woman with no clothing at all, completely naked body fully exposed. ' +
      'Red bindi on forehead, fresh jasmine gajra flowers in long black hair. ' +
      'Beautiful round breasts with detailed dark brown areolas and nipples clearly visible. ' +
      'Smooth flat stomach with attractive navel visible. ' +
      'Clean shaved intimate area fully exposed between slightly parted thighs. ' +
      'Gorgeous feminine curves, hourglass figure with wide hips and slim waist. ' +
      'Rich brown Indian skin with natural glow, photorealistic skin texture. ' +
      'Traditional gold Indian jewelry adorning body. ' +
      'Seductive confident expression with kajal lined eyes. ' +
      'Professional boudoir photography, soft warm golden lighting, 8K quality, masterpiece. ';
    const enhancedPrompt = nsfwBase + prompt;

    const contentUrl = await generateContent(modelConfig, enhancedPrompt);

    if (!contentUrl) {
      log('>>> ERROR: No content URL returned');
      return;
    }

    let caption;
    const modelDisplayName = modelKey.replace(/_/g, ' ').toUpperCase();
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
  log(`🪷 Theme: Indian Traditional with Bindi & Jasmine`);
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

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
startBot().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});

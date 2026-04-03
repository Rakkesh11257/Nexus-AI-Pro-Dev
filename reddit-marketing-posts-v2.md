============================================================
NEXUS AI Pro — REDDIT MARKETING POSTS (Rule-Compliant)
============================================================

STRATEGY: Value-first posts. No direct links to paid tools.
Instead, provide genuinely useful content. When people ask
"what tool is this?" in comments, THEN you mention it naturally.

IMPORTANT TIPS:
- Space posts 2+ days apart across different subreddits
- Use a personal Reddit account with existing karma
- Engage in the community for a few days before posting
- Never drop a link in the main post for subs that ban self-promo
- Let people come to you — answer "what tool?" questions in comments
- Include actual screenshots or screen recordings (crucial for credibility)
- For subs that allow Show & Tell / self-promo threads, use those


============================================================
POST 1: r/StableDiffusion (Rule-compliant — no links, no promo)
============================================================
FLAIR: Discussion

TITLE: I compared SDXL Lightning vs Flux vs Recraft V3 for the same prompt — here's what I found

BODY:
I ran the same prompt through 5 different models to see how they handle it differently. The prompt was: "a cyberpunk street food vendor in Tokyo at night, neon signs reflecting in puddles, cinematic lighting"

[ATTACH: Side-by-side screenshot grid of all 5 outputs]

Results:
- SDXL Lightning: Fast (under 3 seconds) but the details are softer. Good for quick iterations. Colors are punchy though.
- Flux Schnell: Best composition overall. The neon reflections in puddles actually looked believable. Slower but worth it.
- Recraft V3: Surprisingly good at text in the neon signs. The "ramen" sign was actually readable. Other models mangled it.
- Consistent Character: Not ideal for this kind of prompt but I tested it anyway. More suited for character-focused stuff.
- Juggernaut XL: Good middle ground. Not as fast as Lightning but better detail.

My takeaway: For speed, SDXL Lightning. For quality, Flux. For anything involving readable text, Recraft V3.

What models are you all using most these days? Curious if anyone has found something that handles reflections and wet surfaces well.

---
COMMENT STRATEGY: When someone asks "what did you use to run all these?"
Reply naturally: "I've been using a web app called NEXUS AI Pro that has all these
models in one place. Saves me from juggling multiple tools. Happy to share
the name if anyone wants to try it."


============================================================
POST 2: r/aivideo (Check sub rules first)
============================================================
FLAIR: Comparison / Discussion

TITLE: Honest comparison: I generated the same scene with Wan 2.5, Kling V2.6, and MiniMax — here's what each does best

BODY:
Prompt: "A woman walking through a Japanese garden in autumn, leaves falling, gentle breeze, golden hour lighting"

I tested this across three models to see how they handle natural motion and lighting.

[ATTACH: Short screen recording showing all 3 outputs side by side, or upload to streamable/imgur]

Wan 2.5:
- Motion is smooth and natural
- Leaf physics look decent
- Built-in audio added wind/nature sounds automatically
- Took about 45 seconds

Kling V2.6:
- Best camera work — had a subtle dolly motion
- Hair and clothing movement was more realistic
- Slowest of the three
- No audio

MiniMax:
- Fastest generation
- Good enough for social media content
- Motion was slightly less natural but honestly fine for most use cases
- Cheapest option

For quick content creation: MiniMax
For quality: Kling V2.6
For best all-round: Wan 2.5

Anyone else doing model comparisons? Would love to see how Veo 3.1 stacks up — I've only tested it a few times.

---
COMMENT STRATEGY: Same approach. Answer "what platform?" questions
naturally in comments.


============================================================
POST 3: r/beermoney (Self-promo rules vary — check sidebar)
============================================================
NOTE: r/beermoney typically allows sharing earning opportunities
as long as you're transparent. Check their current rules.

TITLE: Earning passive income from an AI tool referral program — $1 per payment, recurring

BODY:
Found this a few weeks ago and it's been working better than most referral programs I've tried.

There's an AI platform (NEXUS AI Pro) that does image generation, video generation, face swaps, voice cloning etc. They have a referral program where you earn $1 every time someone you referred makes any payment. Not just the first payment — every payment, forever. No cap.

Why it actually converts:
- People you refer get 45 free credits immediately (no card needed)
- The free credits are enough to actually try things and get hooked
- AI image/video generation is trending hard right now
- Once people try video gen they tend to keep buying credits

The math if you share it in AI communities:
- 10 paying referrals = $10/month recurring
- 100 paying referrals = $100/month recurring
- 1,000 paying referrals = $1,000/month recurring

Payouts via UPI, PayPal, or bank transfer. Minimum $1.

I've been sharing in Telegram AI groups and a couple of Discord servers. Getting steady signups.

Link: app.nexus-ai-pro.com (the referral link is generated automatically when you sign up)

Full disclosure: I use the tool myself and also earn from the referral program. It's not life-changing money yet but it's genuinely passive since existing referrals keep paying.

---
NOTE: r/beermoney is one of the few subs where you CAN share
referral links/earning opportunities openly. Just be transparent.


============================================================
POST 4: r/SideProject (Usually allows Show & Tell)
============================================================
FLAIR: Show & Tell / Built This

TITLE: I built an AI platform with 63+ models and 1,400+ users in 2 months — lessons learned on pricing for emerging markets

BODY:
I've been building NEXUS AI Pro — a web app that gives people access to 63+ AI models through one interface. Image generation, video generation, face swap, upscale, voice clone, AI chat — all credit-based.

Not here to promote (you can find it easily if you want) — I want to share what I learned about pricing because I think it's useful for anyone building for global markets.

Lesson 1: Show local currency
I was showing everything in USD. Conversions were terrible. The moment I added ₹ pricing for Indian users (detected by timezone), conversions jumped. People don't want to do mental math.

Lesson 2: Credits > Subscriptions for emerging markets
Indian and SEA users overwhelmingly prefer pay-as-you-go over subscriptions. A ₹149 credit pack converts way better than a ₹999/month subscription even though the per-unit cost is higher.

Lesson 3: Referral programs with recurring payouts work
I pay referrers $1 on every payment their referred users make. Forever. This sounds expensive but the LTV of a retained user far exceeds the $1 commission. And the referrers become your marketing team.

Lesson 4: Free credits need to be enough to get hooked
I started with 10 free credits. Bumped it to 25 (45 for referred users). The higher free tier actually improved paid conversion because people had enough credits to see real results and want more.

Lesson 5: Mobile-first isn't optional
70% of my users are on mobile. I built it as a PWA. If your onboarding doesn't work perfectly on a phone screen, you're losing most of your audience.

Tech stack: React/Vite, Node.js/Express, AWS Cognito, DynamoDB, Razorpay (India) + credit packs (international), Replicate API for AI inference.

Happy to answer questions about the architecture or business model.


============================================================
POST 5: r/developersIndia
============================================================
FLAIR: Showoff Saturday (post on Saturday) or General Discussion

TITLE: Built a full-stack AI SaaS on AWS with Razorpay integration — would love feedback from Indian devs

BODY:
Hey everyone. I've been building an AI generation platform as a side project. Wanted to share the tech stack and get feedback, especially on the India-specific parts.

What it does:
- 63+ AI models (image gen, video gen, face swap, upscale, voice clone, chat)
- Credit-based pricing
- Razorpay for INR payments (UPI, cards, netbanking)
- PWA for mobile users

Tech stack:
- Frontend: React + Vite (single file SPA, PWA with service worker)
- Backend: Node.js/Express
- Auth: AWS Cognito (ap-south-1)
- Database: DynamoDB
- AI inference: Replicate API (relay model — I don't host any models myself)
- Payments: Razorpay (INR subscriptions + credit packs)
- Hosting: Vultr Mumbai VPS + Nginx + PM2
- DNS/SSL: Let's Encrypt

Challenges I faced:
1. Razorpay subscription plans are INR-only. For international users I had to build a separate credit pack flow.
2. Service worker caching causes stale builds after deploy. Still haven't fully solved this — I'm manually bumping cache names.
3. DynamoDB's scan for 1,400+ users is slow and expensive. Need to add GSIs.
4. The frontend is a 4,200-line monolith (App.jsx). I know. I'll split it eventually.

Things that worked well:
- Cognito handles auth beautifully with minimal code
- Replicate's prediction API is simple — create prediction, poll for result
- PM2 cluster mode handles traffic fine on a single VPS
- Razorpay's webhook system is reliable

Looking for feedback on:
- Better patterns for handling dual-currency pricing
- How to gracefully handle service worker cache invalidation
- Anyone else using Replicate API at scale? How do you handle rate limits?

Site is at app.nexus-ai-pro.com if anyone wants to check out the UI/UX on mobile.


============================================================
POST 6: r/Entrepreneur or r/microsaas
============================================================
FLAIR: varies

TITLE: $0 marketing budget, 1,400 users in 2 months — how a referral program became my only growth channel

BODY:
I launched an AI generation tool 2 months ago. No ads, no influencers, no Product Hunt launch. Just organic Reddit posts and a referral program.

The referral mechanic:
- Every user gets a unique referral link on signup
- Referred users get 45 free credits (vs 25 normal)
- Referrers earn $1 on EVERY payment the referred user makes — forever
- No cap, no expiry

Why this works:
1. The incentive is aligned. Referrers want their people to stick around and keep paying.
2. AI tools sell themselves. Give someone 45 free credits to generate AI images/videos and they usually come back.
3. The $1 recurring payout sounds small but scales. Someone with 100 active referrals earns $100/month doing nothing.
4. Payouts are cheap for me because the LTV of a retained user is much higher than the commission.

What I'd do differently:
- I should have launched the referral program from day 1, not week 3
- The referral dashboard should show earnings more prominently (I'm fixing this)
- I need to give referrers better shareable content (images, comparison posts)

Numbers:
- 1,400+ registered users
- ~8% free-to-paid conversion
- Most revenue from credit pack purchases, not subscriptions
- Average user session: 8-12 minutes

Not sharing the link here (check my profile if curious). More interested in hearing from others who've used referral programs for growth. What commission structures have worked for you?


============================================================
POSTING SCHEDULE
============================================================
Day 1 (Saturday): Post 5 — r/developersIndia (Showoff Saturday)
Day 3: Post 1 — r/StableDiffusion (comparison post, no links)
Day 5: Post 3 — r/beermoney (referral opportunity)
Day 7: Post 4 — r/SideProject (builder story)
Day 9: Post 2 — r/aivideo (model comparison)
Day 11: Post 6 — r/Entrepreneur (growth story)


============================================================
GOLDEN RULES
============================================================
1. NEVER put a link in the main post for subs that ban self-promo
2. Let people ask for the link in comments — then share naturally
3. Always include screenshots/recordings — text-only posts get ignored
4. Reply to EVERY comment within a few hours
5. Be genuinely helpful — answer technical questions in detail
6. Admit limitations and flaws openly — it builds trust
7. Don't use the same Reddit account for all posts
8. Build karma in each sub before posting (comment on others' posts first)
9. If a post gets removed, don't repost — move to the next sub
10. Track which posts drive the most signups via referral link analytics

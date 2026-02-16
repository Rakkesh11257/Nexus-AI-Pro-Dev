#!/usr/bin/env python3
"""
Fetch all Replicate model schemas for NEXUS AI Pro.
Splits output into 8 files of 6 models each.
Usage: python3 fetch_schemas.py YOUR_REPLICATE_API_TOKEN
"""
import sys, json, requests

if len(sys.argv) < 2:
    print("Usage: python3 fetch_schemas.py YOUR_REPLICATE_API_TOKEN")
    sys.exit(1)

TOKEN = sys.argv[1]
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

MODELS = [
    # Batch 1 (Create Image part 1)
    "prunaai/wan-2.2-image",
    "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe",
    "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
    "black-forest-labs/flux-schnell",
    "black-forest-labs/flux-dev",
    "black-forest-labs/flux-1.1-pro",

    # Batch 2 (Create Image part 2)
    "black-forest-labs/flux-1.1-pro-ultra",
    "google/nano-banana-pro",
    "prunaai/flux-fast",
    "ideogram-ai/ideogram-v3-quality",
    "stability-ai/stable-diffusion-3.5-large",
    "sdxl-based/consistent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",

    # Batch 3 (Edit Image + Face Swap)
    "zsxkib/instant-id:2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789",
    "minimax/image-01",
    "zedge/instantid:ba2d5293be8794a05841a6f6eed81e810340142c3c25fab4838ff2b5d9574420",
    "qwen/qwen-image",
    "cdingram/face-swap:d1d6ea8c8be89d664a07a457526f7128109dee7030fdac424788d762c71ed111",
    "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",

    # Batch 4 (Upscale + Portrait Studio + I2V start)
    "nightmareai/real-esrgan",
    "philz1337x/crystal-upscaler",
    "fofr/kontext-make-person-real:3f0b0f59a22997052c144a76457f113f7c35f6573b9f994f14367ec35f96254d",
    "flux-kontext-apps/change-haircut",
    "zsxkib/ic-light:d41bcb10d8c159868f4cfbd7c6a2ca01484f7d39e4613419d5952c61562f1ba7",
    "wan-video/wan-2.2-i2v-fast",

    # Batch 5 (I2V continued)
    "wavespeedai/wan-2.1-i2v-720p",
    "wan-video/wan-2.5-i2v",
    "wan-video/wan-2.5-i2v-fast",
    "google/veo-3.1-fast",
    "kwaivgi/kling-v2.5-turbo-pro",
    "wan-video/wan-2.2-t2v-fast",

    # Batch 6 (T2V)
    "wavespeedai/wan-2.1-t2v-720p",
    "wan-video/wan-2.5-t2v",
    "wan-video/wan-2.5-t2v-fast",
    "openai/sora-2-pro",
    "minimax/video-01",
    "minimax/video-01-live",

    # Batch 7 (T2V + V2V)
    "haiper-ai/haiper-video-2",
    "runwayml/gen4-aleph",
    "xai/grok-imagine-video",
    "kwaivgi/kling-o1",
    "xrunda/hello:104b4a39315349db50880757bc8c1c996c5309e3aa11286b0a3c84dab81fd440",
    "openai/gpt-5",

    # Batch 8 (Chat/Text)
    "google/gemini-3-pro",
    "anthropic/claude-4.5-sonnet",
    "xai/grok-4",
    "deepseek-ai/deepseek-v3.1",
]

def fetch_schema(model_id):
    try:
        if ":" in model_id:
            owner_name = model_id.split(":")[0]
            version = model_id.split(":")[1]
            owner, name = owner_name.split("/")
            url = f"https://api.replicate.com/v1/models/{owner}/{name}/versions/{version}"
            r = requests.get(url, headers=HEADERS)
            if r.status_code == 200:
                data = r.json()
                schema = data.get("openapi_schema", {}).get("components", {}).get("schemas", {}).get("Input", {})
                if not schema:
                    schema = data.get("openapi_schema", {}).get("components", {}).get("schemas", {}).get("PredictionRequest", {}).get("properties", {}).get("input", {})
                return schema
            else:
                return {"error": f"HTTP {r.status_code}: {r.text[:200]}"}
        else:
            owner, name = model_id.split("/")
            url = f"https://api.replicate.com/v1/models/{owner}/{name}"
            r = requests.get(url, headers=HEADERS)
            if r.status_code == 200:
                data = r.json()
                latest = data.get("latest_version", {})
                schema = latest.get("openapi_schema", {}).get("components", {}).get("schemas", {}).get("Input", {})
                if not schema:
                    schema = latest.get("openapi_schema", {}).get("components", {}).get("schemas", {}).get("PredictionRequest", {}).get("properties", {}).get("input", {})
                return schema
            else:
                return {"error": f"HTTP {r.status_code}: {r.text[:200]}"}
    except Exception as e:
        return {"error": str(e)}

BATCH_SIZE = 6
base_path = "/Users/rakkeshraja/Downloads/nexus-ai-pro-final-2/schemas"

import os
os.makedirs(base_path, exist_ok=True)

total = len(MODELS)
batch_num = 0

for i in range(0, total, BATCH_SIZE):
    batch_num += 1
    batch = MODELS[i:i+BATCH_SIZE]
    batch_results = {}

    print(f"\n--- Batch {batch_num} ({len(batch)} models) ---")
    for model_id in batch:
        print(f"  Fetching: {model_id} ... ", end="", flush=True)
        schema = fetch_schema(model_id)
        batch_results[model_id] = schema
        if "error" in (schema or {}):
            print(f"ERROR")
        else:
            print("OK")

    output_file = os.path.join(base_path, f"batch_{batch_num}.json")
    with open(output_file, "w") as f:
        json.dump(batch_results, f, indent=2)
    print(f"  Saved: {output_file}")

print(f"\n✅ Done! {total} models saved in {batch_num} batch files at:\n{base_path}/")

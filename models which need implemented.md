Okay, I will compile the provided documentation into a single-page format. I'll organize it with general API usage instructions first, followed by details for each specific model.

```markdown
# Fal AI Model Documentation

This document provides a comprehensive overview and API reference for various models available through the Fal AI platform.

## Table of Contents

1.  [General API Usage](#general-api-usage)
    *   [1.1. Install the Client](#11-install-the-client)
    *   [1.2. Setup your API Key](#12-setup-your-api-key)
    *   [1.3. Authentication](#13-authentication)
    *   [1.4. Handling Long-Running Requests (Queue)](#14-handling-long-running-requests-queue)
    *   [1.5. Handling Files](#15-handling-files)
2.  [Model Specific Documentation](#model-specific-documentation)
    *   [FLUX.1 Kontext [pro] (Image Editing)](#flux1-kontext-pro-image-editing)
    *   [FLUX.1 Kontext [Max] (Image Editing)](#flux1-kontext-max-image-editing)
    *   [FLUX.1 Kontext [Max] (Multi-Image Editing)](#flux1-kontext-max-multi-image-editing)
    *   [FLUX.1 Kontext [Max] (Text-to-Image Generation)](#flux1-kontext-max-text-to-image-generation)
    *   [FLUX.1 Kontext [pro] (Text-to-Image Generation)](#flux1-kontext-pro-text-to-image-generation)
    *   [Imagen 4 (Image Generation)](#imagen-4-image-generation)
    *   [Bagel (Image Generation)](#bagel-image-generation)
    *   [Bagel (Image Editing)](#bagel-image-editing)
    *   [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video)
    *   [Kling 1.6 (pro) Image to Video](#kling-16-pro-image-to-video)
    *   [Kling 1.6 (pro) Text to Video](#kling-16-pro-text-to-video)
    *   [Kling Standard Multi-Image to Video](#kling-standard-multi-image-to-video)
    *   [Kling 1.6 (std) Image to Video](#kling-16-std-image-to-video)
    *   [Kling 1.6 (std) Text to Video](#kling-16-std-text-to-video)
    *   [Dreamo (Image Generation)](#dreamo-image-generation)
    *   [FramePack F1 (Video Generation)](#framepack-f1-video-generation)
    *   [FramePack Regular (Video Generation)](#framepack-regular-video-generation)
    *   [FramePack Flf2V (Video Generation)](#framepack-flf2v-video-generation)
    *   [Ideogram V3 (Image Generation)](#ideogram-v3-image-generation)
    *   [Ideogram V3 Edit (Image Inpainting)](#ideogram-v3-edit-image-inpainting)
    *   [Ideogram V3 Reframe (Image Outpainting/Expanding)](#ideogram-v3-reframe-image-outpaintingexpanding)
    *   [Ideogram V3 Remix (Image-to-Image)](#ideogram-v3-remix-image-to-image)
    *   [Ideogram V3 Replace Background](#ideogram-v3-replace-background)
3.  [Common Data Structures](#common-data-structures)
    *   [File / Image (Generic)](#file--image-generic)
    *   [fal__toolkit__image__image__Image](#fal__toolkit__image__image__image)
    *   [registry__image__fast_sdxl__models__Image](#registry__image__fast_sdxl__models__image)
    *   [ImageSize](#imagesize)

---

## 1. General API Usage

This section covers common aspects of interacting with Fal AI models, including client installation, authentication, and handling API requests.

### 1.1. Install the Client

The client provides a convenient way to interact with the model API.

```bash
# npm
npm install --save @fal-ai/client

# yarn
yarn add @fal-ai/client

# pnpm
pnpm add @fal-ai/client

# bun
bun add @fal-ai/client
```

**Migrate to @fal-ai/client:**
The `@fal-ai/serverless-client` package has been deprecated in favor of `@fal-ai/client`. Please check the [migration guide](https://www.fal.ai/docs/client/migration-guide) for more information.

### 1.2. Setup your API Key

Set `FAL_KEY` as an environment variable in your runtime.

```bash
export FAL_KEY="YOUR_API_KEY"
```

### 1.3. Authentication

The API uses an API Key for authentication. It is recommended you set the `FAL_KEY` environment variable in your runtime when possible.

**API Key Configuration**

In case your app is running in an environment where you cannot set environment variables, you can set the API Key manually as a client configuration.

```javascript
import { fal } from "@fal-ai/client";

fal.config({
  credentials: "YOUR_FAL_KEY"
});
```

**Protect your API Key**
When running code on the client-side (e.g. in a browser, mobile app or GUI applications), make sure to not expose your `FAL_KEY`. Instead, use a server-side proxy to make requests to the API. For more information, check out Fal AI's server-side integration guide.

### 1.4. Handling Long-Running Requests (Queue)

For long-running requests, such as training jobs or models with slower inference times, it is recommended to use the queue mechanism. This allows you to submit a request and then poll for its status or use webhooks to receive notifications upon completion.

**1.4.1. Submitting a Request (Real-time / Subscribe)**

The client API handles the API submit protocol. It will handle the request status updates and return the result when the request is completed. Replace `"FAL_AI_MODEL_ID"` with the specific model ID you are using (e.g., `"fal-ai/flux-pro/kontext"`).

```javascript
import { fal } from "@fal-ai/client";

async function runModel() {
  const result = await fal.subscribe("FAL_AI_MODEL_ID", { // Replace with actual model ID
    input: {
      // Model-specific input parameters
      prompt: "Example prompt",
      // ... other parameters
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  console.log(result.data); // Or result directly, depending on model structure
  console.log(result.requestId);
}

runModel();
```

**1.4.2. Submitting to the Queue (Asynchronous)**

The client API provides a convenient way to submit requests to the model queue.

```javascript
import { fal } from "@fal-ai/client";

async function submitToQueue() {
  const { request_id } = await fal.queue.submit("FAL_AI_MODEL_ID", { // Replace with actual model ID
    input: {
      // Model-specific input parameters
      prompt: "Example prompt for queue",
      // ... other parameters
    },
    webhookUrl: "https://optional.webhook.url/for/results", // Optional
  });
  console.log("Request ID:", request_id);
  return request_id;
}

submitToQueue();
```

**1.4.3. Fetch Request Status**

You can fetch the status of a request to check if it is completed or still in progress.

```javascript
import { fal } from "@fal-ai/client";

async function checkStatus(requestId) {
  const status = await fal.queue.status("FAL_AI_MODEL_ID", { // Replace with actual model ID
    requestId: requestId, // e.g., "764cabcf-b745-4b3e-ae38-1200304cf45b"
    logs: true, // Optional
  });
  console.log(status);
}
```

**1.4.4. Get the Result**

Once the request is completed, you can fetch the result. See the specific model's Output Schema for the expected result format.

```javascript
import { fal } from "@fal-ai/client";

async function getResult(requestId) {
  const result = await fal.queue.result("FAL_AI_MODEL_ID", { // Replace with actual model ID
    requestId: requestId, // e.g., "764cabcf-b745-4b3e-ae38-1200304cf45b"
  });
  console.log(result.data); // Or result directly, depending on model structure
  console.log(result.requestId);
}
```

### 1.5. Handling Files

Some attributes in the API accept file URLs as input. Whenever that's the case you can pass your own URL or a Base64 data URI.

**Data URI (base64)**
You can pass a Base64 data URI as a file input. The API will handle the file decoding for you. Keep in mind that for large files, this alternative although convenient can impact the request performance.
Example: `"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."`

**Hosted files (URL)**
You can also pass your own URLs as long as they are publicly accessible. Be aware that some hosts might block cross-site requests, rate-limit, or consider the request as a bot.

**Uploading files**
Fal AI provides a convenient file storage that allows you to upload files and use them in your requests. You can upload files using the client API and use the returned URL in your requests.

```javascript
import { fal } from "@fal-ai/client";

async function uploadMyFile() {
  const file = new File(["Hello, World!"], "hello.txt", { type: "text/plain" });
  const url = await fal.storage.upload(file);
  console.log("Uploaded file URL:", url);
  return url;
}
```

**Auto uploads**
The client will auto-upload the file for you if you pass a binary object (e.g. `File`, `Blob`, `Buffer`).

Read more about file handling in Fal AI's file upload guide.

---

## 2. Model Specific Documentation

### FLUX.1 Kontext [pro] (Image Editing)
ID: `fal-ai/flux-pro/kontext`

**About:**
FLUX.1 Kontext [pro] is a frontier image editing model. Kontext makes editing images easy! Specify what you want to change and Kontext will follow. It is capable of understanding the context of the image, making it easier to edit them without having to describe in details what you want to do.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
  input: {
    prompt: "Put a donut next to the flour.",
    image_url: "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): The prompt to describe the edit.
*   `image_url` (string, required): Image prompt for the omni model.
*   `seed` (integer, optional): The same seed and the same prompt given to the same version of the model will output the same image every time.
*   `guidance_scale` (float, optional): The CFG scale. Default value: `3.5`.
*   `sync_mode` (boolean, optional): If true, waits for image generation before returning.
*   `num_images` (integer, optional): Number of images to generate. Default value: `1`.
*   `safety_tolerance` (SafetyToleranceEnum, optional): Safety level (1-6). Default: `"2"`. Values: `1, 2, 3, 4, 5, 6`. (API only)
*   `output_format` (OutputFormatEnum, optional): Image format. Default: `"jpeg"`. Values: `jpeg, png`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Values: `21:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:21`.

*Example Input:*
```json
{
  "prompt": "Put a donut next to the flour.",
  "guidance_scale": 3.5,
  "num_images": 1,
  "safety_tolerance": "2",
  "output_format": "jpeg",
  "image_url": "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png"
}
```

**Output:**
*   `images` (list<`fal__toolkit__image__image__Image`>): The generated image files info.
*   `timings` (Timings, object): Timing information.
*   `seed` (integer): Seed used for generation.
*   `has_nsfw_concepts` (list<boolean>): Whether generated images contain NSFW concepts.
*   `prompt` (string): The prompt used.

*Example Output:*
```json
{
  "images": [
    {
      "height": 1024,
      "url": "https://fal.media/files/tiger/7dSJbIU_Ni-0Zp9eaLsvR_fe56916811d84ac69c6ffc0d32dca151.jpg",
      "width": 1024,
      "content_type": "image/jpeg" // Added for consistency with fal__toolkit__image__image__Image
    }
  ],
  "prompt": "Put a donut next to the flour." // Example if prompt is echoed
}
```

**Other types for FLUX.1 Kontext [pro] (Image Editing):**
*   Refer to [Common Data Structures](#common-data-structures) for:
    *   `fal__toolkit__image__image__Image`
    *   `ImageSize`
*   `FluxProRedux`:
    *   `prompt` (string, optional): Prompt. Default: `""`.
    *   `image_size` (`ImageSize` | Enum, optional): Size. Default: `landscape_4_3`. Enum values: `square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9`. Custom: `{"width": 1280, "height": 720}`.
    *   `num_inference_steps` (integer, optional): Steps. Default: `28`.
    *   `seed` (integer, optional): Seed.
    *   `guidance_scale` (float, optional): CFG. Default: `3.5`.
    *   `sync_mode` (boolean, optional): Sync mode.
    *   `num_images` (integer, optional): Num images. Default: `1`.
    *   `safety_tolerance` (SafetyToleranceEnum, optional): Safety. Default: `"2"`. (API only)
    *   `output_format` (OutputFormatEnum, optional): Format. Default: `"jpeg"`.
    *   `image_url` (string, optional): Image URL (must match mask dimensions).
*   `FluxProUltraTextToImageInputRedux`:
    *   `prompt` (string, optional): Prompt. Default: `""`.
    *   `seed` (integer, optional): Seed.
    *   `sync_mode` (boolean, optional): Sync mode.
    *   `num_images` (integer, optional): Num images. Default: `1`.
    *   `enable_safety_checker` (boolean, optional): Safety checker. Default: `true`.
    *   `safety_tolerance` (SafetyToleranceEnum, optional): Safety. Default: `"2"`. (API only)
    *   `output_format` (OutputFormatEnum, optional): Format. Default: `"jpeg"`.
    *   `aspect_ratio` (Enum | string, optional): Aspect ratio. Default: `16:9`.
    *   `raw` (boolean, optional): Generate less processed images.
    *   `image_url` (string, optional): Image URL (must match mask dimensions).
    *   `image_prompt_strength` (float, optional): Image prompt strength (0-1). Default: `0.1`.
*   `FluxProTextToImageInputWithAR`:
    *   `prompt` (string, required): Prompt.
    *   `seed` (integer, optional): Seed.
    *   `guidance_scale` (float, optional): CFG. Default: `3.5`.
    *   `sync_mode` (boolean, optional): Sync mode.
    *   `num_images` (integer, optional): Num images. Default: `1`.
    *   `safety_tolerance` (SafetyToleranceEnum, optional): Safety. Default: `"2"`. (API only)
    *   `output_format` (OutputFormatEnum, optional): Format. Default: `"jpeg"`.
    *   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Default: `"1:1"`.

---

### FLUX.1 Kontext [Max] (Image Editing)
ID: `fal-ai/flux-pro/kontext/max`

**About:**
FLUX.1 Kontext [Max] is a more powerful version of Kontext that can handle more complex image editing tasks.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux-pro/kontext/max", {
  input: {
    prompt: "Put a donut next to the flour.",
    image_url: "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:** (Identical to FLUX.1 Kontext [pro] (Image Editing), see above for Input, Output, and Other types. The primary difference is the model ID and its underlying capabilities.)

---

### FLUX.1 Kontext [Max] (Multi-Image Editing)
ID: `fal-ai/flux-pro/kontext/max/multi`

**About:**
Experimental version of FLUX.1 Kontext [Max] with multiple images.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux-pro/kontext/max/multi", {
  input: {
    prompt: "Put the little duckling on top of the woman's t-shirt.",
    image_urls: ["https://v3.fal.media/files/penguin/XoW0qavfF-ahg-jX4BMyL_image.webp", "https://v3.fal.media/files/tiger/bml6YA7DWJXOigadvxk75_image.webp"]
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): The prompt to describe the edit.
*   `image_urls` (list<string>, required): List of image URLs for the omni model.
*   `seed` (integer, optional): Seed.
*   `guidance_scale` (float, optional): CFG scale. Default: `3.5`.
*   `sync_mode` (boolean, optional): Sync mode.
*   `num_images` (integer, optional): Num images. Default: `1`.
*   `safety_tolerance` (SafetyToleranceEnum, optional): Safety level (1-6). Default: `"2"`. (API only)
*   `output_format` (OutputFormatEnum, optional): Image format. Default: `"jpeg"`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio.

*Example Input:*
```json
{
  "prompt": "Put the little duckling on top of the woman's t-shirt.",
  "guidance_scale": 3.5,
  "num_images": 1,
  "safety_tolerance": "2",
  "output_format": "jpeg",
  "image_urls": [
    "https://v3.fal.media/files/penguin/XoW0qavfF-ahg-jX4BMyL_image.webp",
    "https://v3.fal.media/files/tiger/bml6YA7DWJXOigadvxk75_image.webp"
  ]
}
```

**Output:**
*   `images` (list<`registry__image__fast_sdxl__models__Image`>): Generated image files info.
*   `timings` (Timings, object): Timing information.
*   `seed` (integer): Seed used.
*   `has_nsfw_concepts` (list<boolean>): NSFW concepts.
*   `prompt` (string): Prompt used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "...", // Example URL
      "width": 1024,
      "height": 1024,
      "content_type": "image/jpeg"
    }
  ],
  "prompt": "Put the little duckling on top of the woman's t-shirt."
}
```

**Other types for FLUX.1 Kontext [Max] (Multi-Image Editing):**
*   Refer to [Common Data Structures](#common-data-structures) for:
    *   `registry__image__fast_sdxl__models__Image`
    *   `fal__toolkit__image__image__Image`
    *   `ImageSize`
*   `FluxProRedux`, `FluxProUltraTextToImageInputRedux`, `FluxProTextToImageInputWithAR` (See definitions under [FLUX.1 Kontext [pro] (Image Editing)](#flux1-kontext-pro-image-editing))

---

### FLUX.1 Kontext [Max] (Text-to-Image Generation)
ID: `fal-ai/flux-pro/kontext/max/text-to-image`

**About:**
FLUX.1 Kontext [Max] -- Frontier image generation model.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux-pro/kontext/max/text-to-image", {
  input: {
    prompt: "Extreme close-up of a single tiger eye, direct frontal view. Detailed iris and pupil. Sharp focus on eye texture and color. Natural lighting to capture authentic eye shine and depth. The word \"FLUX\" is painted over it in big, white brush strokes with visible texture."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): Prompt to generate an image from.
*   `seed` (integer, optional): Seed.
*   `guidance_scale` (float, optional): CFG scale. Default: `3.5`.
*   `sync_mode` (boolean, optional): Sync mode.
*   `num_images` (integer, optional): Num images. Default: `1`.
*   `safety_tolerance` (SafetyToleranceEnum, optional): Safety level (1-6). Default: `"2"`. (API only)
*   `output_format` (OutputFormatEnum, optional): Image format. Default: `"jpeg"`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Default: `"1:1"`.

*Example Input:*
```json
{
  "prompt": "Extreme close-up of a single tiger eye...",
  "guidance_scale": 3.5,
  "num_images": 1,
  "safety_tolerance": "2",
  "output_format": "jpeg",
  "aspect_ratio": "1:1"
}
```

**Output:**
*   `images` (list<`registry__image__fast_sdxl__models__Image`>): Generated image files info.
*   `timings` (Timings, object): Timing information.
*   `seed` (integer): Seed used.
*   `has_nsfw_concepts` (list<boolean>): NSFW concepts.
*   `prompt` (string): Prompt used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "...", // Example URL
      "width": 1024,
      "height": 1024,
      "content_type": "image/jpeg"
    }
  ],
  "prompt": "Extreme close-up of a single tiger eye..."
}
```

**Other types for FLUX.1 Kontext [Max] (Text-to-Image Generation):**
*   Refer to [Common Data Structures](#common-data-structures) for:
    *   `registry__image__fast_sdxl__models__Image`
    *   `fal__toolkit__image__image__Image`
    *   `ImageSize`
*   `FluxProRedux`, `FluxProUltraTextToImageInputRedux` (See definitions under [FLUX.1 Kontext [pro] (Image Editing)](#flux1-kontext-pro-image-editing))

---

### FLUX.1 Kontext [pro] (Text-to-Image Generation)
ID: `fal-ai/flux-pro/kontext/text-to-image`

**About:**
FLUX.1 Kontext [pro] -- Frontier image generation model.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux-pro/kontext/text-to-image", {
  input: {
    prompt: "Extreme close-up of a single tiger eye..."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:** (Identical to FLUX.1 Kontext [Max] (Text-to-Image Generation), see above for Input, Output, and Other types. The primary difference is the model ID and its underlying capabilities.)

---

### Imagen 4 (Image Generation)
ID: `fal-ai/imagen4/preview`

**About:**
Generate images using Google's Imagen 4 model. Imagen 4 is designed to generate high-quality images with enhanced detail, richer lighting, and fewer artifacts. It excels at capturing fine details, diverse art styles, understanding natural language, and maintaining high visual quality.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/imagen4/preview", {
  input: {
    prompt: "Capture an intimate close-up bathed in warm, soft, late-afternoon sunlight..."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): Text prompt describing what you want to see.
*   `negative_prompt` (string, optional): Description of what to discourage. Default: `""`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Default: `"1:1"`. Values: `1:1, 16:9, 9:16, 3:4, 4:3`.
*   `num_images` (integer, optional): Number of images (1-4). Default: `1`.
*   `seed` (integer, optional): Random seed.

*Example Input:*
```json
{
  "prompt": "Capture an intimate close-up...",
  "aspect_ratio": "1:1",
  "num_images": 1
}
```

**Output:**
*   `images` (list<`File`>): Generated images. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used for generation.

*Example Output:*
```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png",
      "content_type": "image/png" // Example
    }
  ],
  "seed": 42
}
```

**Other types for Imagen 4:**
*   Refer to [Common Data Structures](#common-data-structures) for `File`.

---

### Bagel (Image Generation)
ID: `fal-ai/bagel`

**About:**
Run Bagel model for image generation.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/bagel", {
  input: {
    prompt: "A luminous ancient temple floating among cosmic clouds..."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): Prompt to generate an image from.
*   `seed` (integer, optional): Seed to use.
*   `use_thought` (boolean, optional): If true, model "thinks" to improve quality (increases time/cost).
*   `enable_safety_checker` (boolean, optional): Enable safety checker. Default: `true`.

*Example Input:*
```json
{
  "prompt": "A luminous ancient temple floating among cosmic clouds...",
  "enable_safety_checker": true
}
```

**Output:**
*   `images` (list<`Image`>): Generated images. (See `Image` type under [Bagel (Image Editing)](#bagel-image-editing) or a generic `Image` if identical)
*   `timings` (Timings, object): Timing information.
*   `seed` (integer): Seed used.
*   `has_nsfw_concepts` (list<boolean>): NSFW concepts.
*   `prompt` (string): Prompt used.

*Example Output:*
```json
{
  "images": [
    {
      "file_size": 423052,
      "height": 1024,
      "file_name": "wRhCPSyiKTiLnnWvUpGIl.jpeg",
      "content_type": "image/jpeg",
      "url": "https://storage.googleapis.com/falserverless/bagel/wRhCPSyiKTiLnnWvUpGIl.jpeg",
      "width": 1024
    }
  ],
  "prompt": "A luminous ancient temple floating among cosmic clouds..."
}
```
**Other types for Bagel (Image Generation):**
*   `Image`:
    *   `url` (string): URL of the file.
    *   `content_type` (string): Mime type.
    *   `file_name` (string): File name.
    *   `file_size` (integer): Size in bytes.
    *   `file_data` (string, optional): Base64 file data.
    *   `width` (integer): Image width.
    *   `height` (integer): Image height.

---

### Bagel (Image Editing)
ID: `fal-ai/bagel/edit`

**About:**
Edit images using the Bagel model.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/bagel/edit", {
  input: {
    prompt: "Change the cosmic cloud background to a clear blue sky...",
    image_url: "https://storage.googleapis.com/falserverless/bagel/wRhCPSyiKTiLnnWvUpGIl.jpeg"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): Prompt to edit the image with.
*   `image_url` (string, required): The image to edit.
*   `seed` (integer, optional): Seed to use.
*   `use_thought` (boolean, optional): If true, model "thinks" to improve quality.
*   `enable_safety_checker` (boolean, optional): Enable safety checker. Default: `true`.

*Example Input:*
```json
{
  "prompt": "Change the cosmic cloud background...",
  "enable_safety_checker": true,
  "image_url": "https://storage.googleapis.com/falserverless/bagel/wRhCPSyiKTiLnnWvUpGIl.jpeg"
}
```

**Output:**
*   `images` (list<`Image`>): Edited images. (See `Image` type below)
*   `timings` (Timings, object): Timing information.
*   `seed` (integer): Seed used.
*   `has_nsfw_concepts` (list<boolean>): NSFW concepts.
*   `prompt` (string): Prompt used.

*Example Output:*
```json
{
  "images": [
    {
      "file_size": 423052,
      "height": 1024,
      "file_name": "hQnndOMvGSt2UsYAiV3vs.jpeg",
      "content_type": "image/jpeg",
      "url": "https://storage.googleapis.com/falserverless/bagel/hQnndOMvGSt2UsYAiV3vs.jpeg",
      "width": 1024
    }
  ],
  "prompt": "Change the cosmic cloud background..."
}
```

**Other types for Bagel (Image Editing):**
*   `Image`:
    *   `url` (string): URL of the file.
    *   `content_type` (string): Mime type.
    *   `file_name` (string): File name.
    *   `file_size` (integer): Size in bytes.
    *   `file_data` (string, optional): Base64 file data.
    *   `width` (integer): Image width.
    *   `height` (integer): Image height.

---

### Kling Pro Multi-Image to Video
ID: `fal-ai/kling-video/v1.6/pro/elements`

**About:**
Kling Pro Multi-Image to Video API. Generates videos from multiple input images (up to 4), ordered as they appear.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/elements", {
  input: {
    prompt: "A cute girl and a baby cow sleeping together on a bed",
    input_image_urls: ["https://.../first_image.jpeg", "https://.../second_image.png"]
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`MultiImageToVideoRequest`):**
*   `prompt` (string, required): Text prompt.
*   `input_image_urls` (list<string>, required): List of image URLs (up to 4).
*   `duration` (DurationEnum, optional): Video duration in seconds. Default: `"5"`. Values: `5, 10`.
*   `aspect_ratio` (AspectRatioEnum, optional): Video aspect ratio. Default: `"16:9"`. Values: `16:9, 9:16, 1:1`.
*   `negative_prompt` (string, optional): Negative prompt. Default: `"blur, distort, and low quality"`.

*Example Input:*
```json
{
  "prompt": "A cute girl and a baby cow sleeping together on a bed",
  "input_image_urls": [
    "https://storage.googleapis.com/falserverless/web-examples/kling-elements/first_image.jpeg",
    "https://storage.googleapis.com/falserverless/web-examples/kling-elements/second_image.png"
  ],
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality"
}
```

**Output:**
*   `video` (`File`): The generated video. (See [Common Data Structures](#file--image-generic))

*Example Output:*
```json
{
  "video": {
    "file_size": 3910577,
    "file_name": "output.mp4",
    "content_type": "video/mp4",
    "url": "https://v3.fal.media/files/penguin/twy6u1yv09NvqsX0mMFM2_output.mp4"
  }
}
```

**Other types for Kling Models (Commonly referenced, full definitions below for the first one listing them):**
*   Refer to [Common Data Structures](#common-data-structures) for `File`.
*   `CameraControl`:
    *   `movement_type` (MovementTypeEnum): `horizontal, vertical, pan, tilt, roll, zoom`.
    *   `movement_value` (integer): Movement value.
*   `Trajectory`:
    *   `x` (integer): X coordinate.
    *   `y` (integer): Y coordinate.
*   `DynamicMask`:
    *   `mask_url` (string): Mask URL.
    *   `trajectories` (list<`Trajectory`>): List of trajectories.
*   `TextToVideoV21MasterRequest`, `V1TextToVideoRequest`, `ImageToVideoRequest`, `ProImageToVideoRequest`, `LipsyncA2VRequest`, `ImageToVideoV21MasterRequest`, `ImageToVideoV21StandardRequest`, `ImageToVideoV21ProRequest`, `LipsyncT2VRequest`, `V1ImageToVideoRequest`, `TextToVideoRequest`, `VideoEffectsRequest`, `TextToVideoV2MasterRequest`, `ImageToVideoV2MasterRequest` are other request structures potentially used internally or by related endpoints but not the primary input for this specific model ID. Their fields generally include:
    *   `prompt` (string)
    *   `image_url` / `input_image_urls` (string / list<string>)
    *   `duration` (Enum: `5, 10`)
    *   `aspect_ratio` (Enum: `16:9, 9:16, 1:1`)
    *   `negative_prompt` (string)
    *   `cfg_scale` (float, default 0.5)
    *   `camera_control` (Enum) / `advanced_camera_control` (`CameraControl`)
    *   `tail_image_url` (string)
    *   `static_mask_url` (string)
    *   `dynamic_masks` (list<`DynamicMask`>)
    *   `video_url` (string), `audio_url` (string) / `text` (string), `voice_id` (Enum), `voice_language` (Enum), `voice_speed` (float) for Lipsync.
    *   `effect_scene` (Enum) for VideoEffects.

---

### Kling 1.6 (pro) Image to Video
ID: `fal-ai/kling-video/v1.6/pro/image-to-video`

**About:**
Kling 1.6 (pro) Image to Video API.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
  input: {
    prompt: "Snowflakes fall as a car moves along the road.",
    image_url: "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`ProImageToVideoRequest`):**
*   `prompt` (string, required): Text prompt.
*   `image_url` (string, required): Input image URL.
*   `duration` (DurationEnum, optional): Video duration. Default: `"5"`. Values: `5, 10`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Default: `"16:9"`. Values: `16:9, 9:16, 1:1`.
*   `tail_image_url` (string, optional): URL of image for end of video.
*   `negative_prompt` (string, optional): Negative prompt. Default: `"blur, distort, and low quality"`.
*   `cfg_scale` (float, optional): CFG scale. Default: `0.5`.

*Example Input:*
```json
{
  "prompt": "Snowflakes fall as a car moves along the road.",
  "image_url": "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg",
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```

**Output:**
*   `video` (`File`): The generated video. (See [Common Data Structures](#file--image-generic))

*Example Output:*
```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/kling/kling_i2v_output.mp4"
  }
}
```
**Other types for Kling 1.6 (pro) Image to Video:** See "Other types for Kling Models" under [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video).

---

### Kling 1.6 (pro) Text to Video
ID: `fal-ai/kling-video/v1.6/pro/text-to-video`

**About:**
Kling 1.6 (pro) Text to Video API.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/text-to-video", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street..."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`TextToVideoRequest` or similar, e.g., `TextToVideoV2MasterRequest`):**
*   `prompt` (string, required): Text prompt.
*   `duration` (DurationEnum, optional): Video duration. Default: `"5"`. Values: `5, 10`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Default: `"16:9"`. Values: `16:9, 9:16, 1:1`.
*   `negative_prompt` (string, optional): Negative prompt. Default: `"blur, distort, and low quality"`.
*   `cfg_scale` (float, optional): CFG scale. Default: `0.5`.

*Example Input:*
```json
{
  "prompt": "A stylish woman walks down a Tokyo street...",
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```

**Output:**
*   `video` (`File`): The generated video. (See [Common Data Structures](#file--image-generic))

*Example Output:*
```json
{
  "video": {
    "url": "https://v2.fal.media/files/fb33a862b94d4d7195e610e4cbc5d392_output.mp4"
  }
}
```
**Other types for Kling 1.6 (pro) Text to Video:** See "Other types for Kling Models" under [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video).

---

### Kling Standard Multi-Image to Video
ID: `fal-ai/kling-video/v1.6/standard/elements`

**About:**
Kling Standard Multi-Image to Video API. Generates videos from multiple input images (up to 4).

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/elements", {
  input: {
    prompt: "A cute girl and a baby cow sleeping together on a bed",
    input_image_urls: ["https://.../first_image.jpeg", "https://.../second_image.png"]
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:** (Identical to [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video) Input/Output schema. The difference is the model ID and potentially performance/quality tier.)
**Other types:** See "Other types for Kling Models" under [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video).

---

### Kling 1.6 (std) Image to Video
ID: `fal-ai/kling-video/v1.6/standard/image-to-video`

**About:**
Kling 1.6 (std) Image to Video API.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/image-to-video", {
  input: {
    prompt: "Snowflakes fall as a car moves forward along the road.",
    image_url: "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```
**Schema:**
The input for this standard version is `ImageToVideoRequest` (or a similar standard variant like `ImageToVideoV21StandardRequest`). It typically lacks the `tail_image_url` present in the `ProImageToVideoRequest`.
*   `prompt` (string, required): Text prompt.
*   `image_url` (string, required): Input image URL.
*   `duration` (DurationEnum, optional): Video duration. Default: `"5"`. Values: `5, 10`.
*   `aspect_ratio` (AspectRatioEnum, optional): Aspect ratio. Default: `"16:9"`. Values: `16:9, 9:16, 1:1`.
*   `negative_prompt` (string, optional): Negative prompt. Default: `"blur, distort, and low quality"`.
*   `cfg_scale` (float, optional): CFG scale. Default: `0.5`.

*Example Input:*
```json
{
  "prompt": "Snowflakes fall as a car moves forward along the road.",
  "image_url": "https://storage.googleapis.com/falserverless/kling/kling_input.jpeg",
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5
}
```
**Output:** (Identical to [Kling 1.6 (pro) Image to Video](#kling-16-pro-image-to-video) Output schema.)
**Other types:** See "Other types for Kling Models" under [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video).

---

### Kling 1.6 (std) Text to Video
ID: `fal-ai/kling-video/v1.6/standard/text-to-video`

**About:**
Kling 1.6 (std) Text to Video API.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/text-to-video", {
  input: {
    prompt: "A stylish woman walks down a Tokyo street..."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:** (Identical to [Kling 1.6 (pro) Text to Video](#kling-16-pro-text-to-video) Input/Output schema. The difference is the model ID and potentially performance/quality tier.)
**Other types:** See "Other types for Kling Models" under [Kling Pro Multi-Image to Video](#kling-pro-multi-image-to-video).

---

### Dreamo (Image Generation)
ID: `fal-ai/dreamo`

**About:**
Generate images with Dreamo, allowing reference images for style and identity.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/dreamo", {
  input: {
    prompt: "Two people hugging inside a forest"
    // Potentially add first_image_url, second_image_url for reference
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input:**
*   `prompt` (string, required): Prompt to generate image from.
*   `first_image_url` (string, optional): URL of first reference image.
*   `second_image_url` (string, optional): URL of second reference image.
*   `first_reference_task` (FirstReferenceTaskEnum, optional): Task for first ref image. Default: `"ip"`. Values: `ip, id, style`.
*   `second_reference_task` (SecondReferenceTaskEnum, optional): Task for second ref image. Default: `"ip"`. Values: `ip, id, style`.
*   `image_size` (`ImageSize` | Enum, optional): Image size. Default: `square_hd`. Values: `square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9`. Custom: `{"width": 1280, "height": 720}`.
*   `num_inference_steps` (integer, optional): Inference steps. Default: `12`.
*   `seed` (integer, optional): Seed.
*   `guidance_scale` (float, optional): CFG scale. Default: `3.5`.
*   `negative_prompt` (string, optional): Negative prompt. Default: `""`.
*   `sync_mode` (boolean, optional): Sync mode.
*   `ref_resolution` (integer, optional): Resolution for reference images. Default: `512`.
*   `true_cfg` (float, optional): Weight of CFG loss. Default: `1`.
*   `enable_safety_checker` (boolean, optional): Enable safety checker. Default: `true`.

*Example Input:*
```json
{
  "prompt": "Two people hugging inside a forest",
  "first_image_url": "https://v3.fal.media/files/rabbit/I3exImt_zOYaiZv8caeGP_Pz4CnQ12tCUuDIhEQkmbD_ae4193792924495e89c516e6b492ed2b_1.jpg",
  "second_image_url": "https://v3.fal.media/files/penguin/F3Yqprwlv-yaeusxAS0bS_image.webp",
  "first_reference_task": "ip",
  "second_reference_task": "ip",
  "image_size": "square_hd",
  "num_inference_steps": 12,
  "guidance_scale": 3.5,
  "negative_prompt": "bad quality, worst quality, text, signature, watermark, extra limbs",
  "ref_resolution": 512,
  "true_cfg": 1,
  "enable_safety_checker": true
}
```

**Output:**
*   `images` (list<`Image`>): URLs of generated images. (See `Image` definition below)
*   `timings` (Timings, object): Timing info.
*   `seed` (integer): Seed used.
*   `has_nsfw_concepts` (list<boolean>): NSFW concepts.
*   `prompt` (string): Prompt used.

*Example Output:*
```json
{
  "images": [
    {
      "height": 1024,
      "content_type": "image/jpeg",
      "url": "https://v3.fal.media/files/elephant/Qqd29dv20375fBbN1233_.png",
      "width": 1024
    }
  ],
  "prompt": "Two people hugging inside a forest"
}
```

**Other types for Dreamo:**
*   Refer to [Common Data Structures](#common-data-structures) for `ImageSize`.
*   `Image`: (Identical to `Image` type under Bagel, or [Common Data Structures](#file--image-generic) if using generic fields)
    *   `url` (string): URL of the file.
    *   `content_type` (string): Mime type.
    *   `file_name` (string, optional): File name.
    *   `file_size` (integer, optional): Size in bytes.
    *   `file_data` (string, optional): Base64 file data.
    *   `width` (integer): Image width.
    *   `height` (integer): Image height.

---

### FramePack F1 (Video Generation)
ID: `fal-ai/framepack/f1`

**About:**
Generate Video F1 Endpoint using FramePack.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/framepack/f1", {
  input: {
    prompt: "A mesmerising video of a deep sea jellyfish...",
    image_url: "https://storage.googleapis.com/falserverless/framepack/framepack.jpg"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`FramePackF1Request` / `FramePackRequest`):**
*   `prompt` (string, required): Text prompt (max 500 chars).
*   `negative_prompt` (string, optional): Negative prompt. Default: `""`.
*   `image_url` (string, required): URL of image input.
*   `seed` (integer, optional): Seed.
*   `aspect_ratio` (AspectRatio(W:H)Enum, optional): Aspect ratio. Default: `"16:9"`. Values: `16:9, 9:16`.
*   `resolution` (ResolutionEnum, optional): Video resolution. Default: `"480p"`. Values: `720p, 480p`. (720p costs 1.5x more)
*   `cfg_scale` (float, optional): CFG scale. Default: `1`.
*   `guidance_scale` (float, optional): Guidance scale. Default: `10`.
*   `num_frames` (integer, optional): Number of frames. Default: `180`.
*   `enable_safety_checker` (boolean, optional): Enable safety checker.

*Example Input:*
```json
{
  "prompt": "A mesmerising video of a deep sea jellyfish...",
  "negative_prompt": "Ugly, blurry distorted, bad quality",
  "image_url": "https://storage.googleapis.com/falserverless/framepack/framepack.jpg",
  "aspect_ratio": "16:9",
  "resolution": "480p",
  "cfg_scale": 1,
  "guidance_scale": 10,
  "num_frames": 180,
  "enable_safety_checker": true
}
```

**Output (`FramePackF1Response` / `FramePackResponse`):**
*   `video` (`File`): Generated video. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/framepack/TfJPbwm6_D60dcWEv9LVX_output_video.mp4"
  },
  "seed": 12345
}
```
**Other types for FramePack F1:**
*   Refer to [Common Data Structures](#common-data-structures) for `File`.
*   `FramePackF2LFRequest`: Same as `FramePackRequest` but `num_frames` default is `240`, and adds:
    *   `end_image_url` (string, required): URL of end image.
    *   `strength` (float, optional): Influence of final frame. Default: `0.8`.
*   `FramePackFLF2VResponse`:
    *   `video` (`File`)
    *   `seed` (integer)

---

### FramePack Regular (Video Generation)
ID: `fal-ai/framepack`

**About:**
Generate Video Regular Endpoint using FramePack.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/framepack", {
  input: {
    prompt: "A mesmerising video of a deep sea jellyfish...",
    image_url: "https://storage.googleapis.com/falserverless/framepack/framepack.jpg"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:** (Identical to [FramePack F1](#framepack-f1-video-generation) Input/Output schema and Other types. The difference is the model ID, potentially referring to a different base model or tier.)

---

### FramePack Flf2V (Video Generation)
ID: `fal-ai/framepack/flf2v`

**About:**
Generate Video Flf2V (First-Last-Frame to Video) Endpoint using FramePack.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/framepack/flf2v", {
  input: {
    prompt: "A tabby cat is confidely strolling toward the camera...",
    image_url: "https://.../first_frame.png",
    end_image_url: "https://.../last_frame.png"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`FramePackF2LFRequest`):**
*   `prompt` (string, required): Text prompt (max 500 chars).
*   `negative_prompt` (string, optional): Negative prompt. Default: `""`.
*   `image_url` (string, required): URL of the first image input.
*   `end_image_url` (string, required): URL of the end image input.
*   `seed` (integer, optional): Seed.
*   `aspect_ratio` (AspectRatio(W:H)Enum, optional): Aspect ratio. Default: `"16:9"`. Values: `16:9, 9:16`.
*   `resolution` (ResolutionEnum, optional): Video resolution. Default: `"480p"`. Values: `720p, 480p`.
*   `cfg_scale` (float, optional): CFG scale. Default: `1`.
*   `guidance_scale` (float, optional): Guidance scale. Default: `10`.
*   `num_frames` (integer, optional): Number of frames. Default: `240`.
*   `enable_safety_checker` (boolean, optional): Enable safety checker.
*   `strength` (float, optional): Influence of the final frame. Default: `0.8`.

*Example Input:*
```json
{
  "prompt": "A tabby cat is confidely strolling...",
  "negative_prompt": "Ugly, blurry distorted, bad quality",
  "image_url": "https://storage.googleapis.com/falserverless/web-examples/wan_flf/first_frame.png",
  "aspect_ratio": "16:9",
  "resolution": "480p",
  "cfg_scale": 1,
  "guidance_scale": 10,
  "num_frames": 240,
  "enable_safety_checker": true,
  "end_image_url": "https://storage.googleapis.com/falserverless/web-examples/wan_flf/last_frame.png",
  "strength": 0.8
}
```

**Output (`FramePackFLF2VResponse`):**
*   `video` (`File`): Generated video. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/flf2v.mp4"
  },
  "seed": 12345
}
```
**Other types for FramePack Flf2V:**
*   Refer to [Common Data Structures](#common-data-structures) for `File`.
*   `FramePackResponse`, `FramePackF1Response`, `FramePackF1Request`, `FramePackRequest` (See definitions under [FramePack F1](#framepack-f1-video-generation))

---

### Ideogram V3 (Image Generation)
ID: `fal-ai/ideogram/v3`

**About:**
Ideogram V3 for image generation.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/ideogram/v3", {
  input: {
    prompt: "The Bone Forest stretched across the horizon..."
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`BaseTextToImageInputV3`):**
*   `prompt` (string, required): Prompt for generation.
*   `image_urls` (list<string>, optional): Style reference images (max 10MB total, JPEG/PNG/WebP).
*   `rendering_speed` (RenderingSpeedEnum, optional): Speed. Default: `"BALANCED"`. Values: `TURBO, BALANCED, QUALITY`.
*   `color_palette` (`ColorPalette`, optional): Color palette (preset name or explicit members).
*   `style_codes` (list<string>, optional): List of 8-char hex style codes. (Cannot use with `style_reference_images` or `style`).
*   `style` (Enum, optional): Style type. Values: `AUTO, GENERAL, REALISTIC, DESIGN`. (Cannot use with `style_codes`).
*   `expand_prompt` (boolean, optional): Use MagicPrompt. Default: `true`.
*   `num_images` (integer, optional): Number of images. Default: `1`.
*   `seed` (integer, optional): Seed.
*   `image_size` (`ImageSize` | Enum, optional): Resolution. Default: `square_hd`. Values: `square_hd, square, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9`. Custom: `{"width": 1280, "height": 720}`.
*   `negative_prompt` (string, optional): Negative prompt. Default: `""`.

*Example Input:*
```json
{
  "rendering_speed": "BALANCED",
  "expand_prompt": true,
  "num_images": 1,
  "prompt": "The Bone Forest stretched across the horizon...",
  "image_size": "square_hd"
}
```

**Output:**
*   `images` (list<`File`>): Generated images. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/penguin/lHdRabS80guysb8Zw1kul_image.png"
    }
  ],
  "seed": 123456
}
```

**Other types for Ideogram V3 Models:**
*   Refer to [Common Data Structures](#common-data-structures) for:
    *   `File`
    *   `ImageSize`
*   `RGBColor`:
    *   `r` (integer): Red value.
    *   `g` (integer): Green value.
    *   `b` (integer): Blue value.
*   `ColorPaletteMember`:
    *   `rgb` (`RGBColor`): RGB color.
    *   `color_weight` (float, optional): Weight in palette. Default: `0.5`.
*   `ColorPalette`:
    *   `members` (list<`ColorPaletteMember`>, optional): List of color members.
    *   `name` (Enum, optional): Preset name. Values: `EMBER, FRESH, JUNGLE, MAGIC, MELON, MOSAIC, PASTEL, ULTRAMARINE`.
*   `ReplaceBackgroundInputV3`, `RemixImageInputV3`, `EditImageInputV3`, `ReframeImageInputV3` (These are input types for other Ideogram V3 endpoints, defined under their respective sections).
*   `ReplaceBackgroundOutputV3`, `RemixOutputV3`, `EditOutputV3`, `ReframeOutputV3` (These are output types for other Ideogram V3 endpoints).

---

### Ideogram V3 Edit (Image Inpainting)
ID: `fal-ai/ideogram/v3/edit`

**About:**
Ideogram V3 Edit for inpainting masked areas of an image.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/ideogram/v3/edit", {
  input: {
    prompt: "black bag",
    image_url: "https://.../output.png",
    mask_url: "https://.../mask.png"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`EditImageInputV3`):**
*   `prompt` (string, required): Prompt to fill masked part.
*   `image_url` (string, required): Image URL (must match mask dimensions).
*   `mask_url` (string, required): Mask URL (must match image dimensions).
*   `image_urls` (list<string>, optional): Style reference images.
*   `rendering_speed` (RenderingSpeedEnum, optional): Speed. Default: `"BALANCED"`.
*   `color_palette` (`ColorPalette`, optional): Color palette.
*   `style_codes` (list<string>, optional): Style codes.
*   `expand_prompt` (boolean, optional): Use MagicPrompt. Default: `true`.
*   `num_images` (integer, optional): Number of images. Default: `1`.
*   `seed` (integer, optional): Seed.

*Example Input:*
```json
{
  "rendering_speed": "BALANCED",
  "expand_prompt": true,
  "num_images": 1,
  "prompt": "black bag",
  "image_url": "https://v3.fal.media/files/panda/-LC_gNNV3wUHaGMQT3klE_output.png",
  "mask_url": "https://v3.fal.media/files/kangaroo/1dd3zEL5MXQ3Kb4-mRi9d_indir%20(20).png"
}
```

**Output (`EditOutputV3`):**
*   `images` (list<`File`>): Generated images. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/panda/xr7EI_0X5kM8fDOjjcMei_image.png"
    }
  ],
  "seed": 123456
}
```
**Other types for Ideogram V3 Edit:** See "Other types for Ideogram V3 Models" under [Ideogram V3 (Image Generation)](#ideogram-v3-image-generation).

---

### Ideogram V3 Reframe (Image Outpainting/Expanding)
ID: `fal-ai/ideogram/v3/reframe`

**About:**
Ideogram V3 Reframe for outpainting or expanding an image.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/ideogram/v3/reframe", {
  input: {
    image_url: "https://v3.fal.media/files/lion/0qJs_qW8nz0wYsXhFa6Tk.png",
    image_size: "square_hd"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`ReframeImageInputV3`):**
*   `image_url` (string, required): Image URL to reframe.
*   `image_size` (`ImageSize` | Enum, required): Resolution for reframed output. (See [Common Data Structures](#imagesize))
*   `image_urls` (list<string>, optional): Style reference images.
*   `rendering_speed` (RenderingSpeedEnum, optional): Speed. Default: `"BALANCED"`.
*   `color_palette` (`ColorPalette`, optional): Color palette.
*   `style_codes` (list<string>, optional): Style codes.
*   `style` (Enum, optional): Style type.
*   `num_images` (integer, optional): Number of images. Default: `1`.
*   `seed` (integer, optional): Seed.

*Example Input:*
```json
{
  "rendering_speed": "BALANCED",
  "num_images": 1,
  "image_url": "https://v3.fal.media/files/lion/0qJs_qW8nz0wYsXhFa6Tk.png",
  "image_size": "square_hd"
}
```

**Output (`ReframeOutputV3`):**
*   `images` (list<`File`>): Generated images. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/zebra/LVW4AhVs3sCxsVKdg3EfT_image.png"
    }
  ],
  "seed": 123456
}
```
**Other types for Ideogram V3 Reframe:** See "Other types for Ideogram V3 Models" under [Ideogram V3 (Image Generation)](#ideogram-v3-image-generation).

---

### Ideogram V3 Remix (Image-to-Image)
ID: `fal-ai/ideogram/v3/remix`

**About:**
Ideogram V3 Remix for image-to-image transformation.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/ideogram/v3/remix", {
  input: {
    prompt: "Old ancient city day light",
    image_url: "https://v3.fal.media/files/lion/9-Yt8JfTw4OxrAjiUzwP9_output.png"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`RemixImageInputV3`):**
*   `prompt` (string, required): Prompt to remix the image with.
*   `image_url` (string, required): Image URL to remix.
*   `strength` (float, optional): Strength of input image in remix. Default: `0.8`.
*   `image_size` (`ImageSize` | Enum, optional): Resolution. Default: `square_hd`. (See [Common Data Structures](#imagesize))
*   `negative_prompt` (string, optional): Negative prompt. Default: `""`.
*   `image_urls` (list<string>, optional): Style reference images.
*   `rendering_speed` (RenderingSpeedEnum, optional): Speed. Default: `"BALANCED"`.
*   `color_palette` (`ColorPalette`, optional): Color palette.
*   `style_codes` (list<string>, optional): Style codes.
*   `style` (Enum, optional): Style type.
*   `expand_prompt` (boolean, optional): Use MagicPrompt. Default: `true`.
*   `num_images` (integer, optional): Number of images. Default: `1`.
*   `seed` (integer, optional): Seed.

*Example Input:*
```json
{
  "rendering_speed": "BALANCED",
  "expand_prompt": true,
  "num_images": 1,
  "prompt": "Old ancient city day light",
  "image_url": "https://v3.fal.media/files/lion/9-Yt8JfTw4OxrAjiUzwP9_output.png",
  "strength": 0.8,
  "image_size": "square_hd"
}
```

**Output (`RemixOutputV3`):**
*   `images` (list<`File`>): Generated images. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/koala/eYZG26O54NTdWzdpDWBL-_image.png"
    }
  ],
  "seed": 123456
}
```
**Other types for Ideogram V3 Remix:** See "Other types for Ideogram V3 Models" under [Ideogram V3 (Image Generation)](#ideogram-v3-image-generation).

---

### Ideogram V3 Replace Background
ID: `fal-ai/ideogram/v3/replace-background`

**About:**
Ideogram V3 Replace Background.

**Calling the API Example:**
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/ideogram/v3/replace-background", {
  input: {
    prompt: "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
    image_url: "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
  },
  logs: true,
  onQueueUpdate: (update) => { /* ... */ },
});
console.log(result.data);
```

**Schema:**

**Input (`ReplaceBackgroundInputV3`):**
*   `prompt` (string, required): Prompt for the new background.
*   `image_url` (string, required): Image URL whose background needs to be replaced.
*   `image_urls` (list<string>, optional): Style reference images.
*   `rendering_speed` (RenderingSpeedEnum, optional): Speed. Default: `"BALANCED"`.
*   `color_palette` (`ColorPalette`, optional): Color palette.
*   `style_codes` (list<string>, optional): Style codes.
*   `style` (Enum, optional): Style type.
*   `expand_prompt` (boolean, optional): Use MagicPrompt. Default: `true`.
*   `num_images` (integer, optional): Number of images. Default: `1`.
*   `seed` (integer, optional): Seed.

*Example Input:*
```json
{
  "rendering_speed": "BALANCED",
  "expand_prompt": true,
  "num_images": 1,
  "prompt": "A beautiful sunset over mountains that writes Ideogram v3 in fal.ai",
  "image_url": "https://v3.fal.media/files/rabbit/F6dvKPFL9VzKiM8asJOgm_MJj6yUB6rGjTsv_1YHIcA_image.webp"
}
```

**Output (`ReplaceBackgroundOutputV3`):**
*   `images` (list<`File`>): Generated images. (See [Common Data Structures](#file--image-generic))
*   `seed` (integer): Seed used.

*Example Output:*
```json
{
  "images": [
    {
      "url": "https://v3.fal.media/files/lion/AUfCjtLkLOsdc9zEFrV-5_image.png"
    }
  ],
  "seed": 123456
}
```
**Other types for Ideogram V3 Replace Background:** See "Other types for Ideogram V3 Models" under [Ideogram V3 (Image Generation)](#ideogram-v3-image-generation).

---

## 3. Common Data Structures

This section defines data structures that are commonly used across multiple models.

### File / Image (Generic)
A generic structure representing a file, often an image or video.
*   `url` (string): The URL where the file can be downloaded from.
*   `content_type` (string): The mime type of the file (e.g., "image/jpeg", "video/mp4").
*   `file_name` (string, optional): The name of the file. It will be auto-generated if not provided.
*   `file_size` (integer, optional): The size of the file in bytes.
*   `file_data` (string, optional): Base64 encoded file data (usually for uploads or direct embedding).
*   `width` (integer, optional): The width of the image in pixels (if applicable).
*   `height` (integer, optional): The height of the image in pixels (if applicable).

### fal__toolkit__image__image__Image
Used by FLUX models.
*   `url` (string): The URL where the file can be downloaded from.
*   `content_type` (string): The mime type of the file.
*   `file_name` (string, optional): The name of the file.
*   `file_size` (integer, optional): The size of the file in bytes.
*   `file_data` (string, optional): File data (Base64).
*   `width` (integer): The width of the image in pixels.
*   `height` (integer): The height of the image in pixels.

### registry__image__fast_sdxl__models__Image
Used by some FLUX models.
*   `url` (string): URL of the image.
*   `width` (integer): Width of the image.
*   `height` (integer): Height of the image.
*   `content_type` (string): Content type. Default: `"image/jpeg"`.

### ImageSize
Used by FLUX and Ideogram models for specifying dimensions.
*   `width` (integer): The width of the generated image. Default value: `512` (context-dependent).
*   `height` (integer): The height of the generated image. Default value: `512` (context-dependent).
Can also be an enum string like `square_hd`, `landscape_4_3`, etc., depending on the model.

---
```

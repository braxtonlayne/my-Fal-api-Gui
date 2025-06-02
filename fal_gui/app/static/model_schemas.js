// Defines the input schemas for various FAL AI models.
// This structure is used by script.js to dynamically generate UI controls
// and to understand the parameters each model accepts.
const MODEL_SCHEMAS = {
    "fal-ai/flux-pro/kontext": {
        "description": "FLUX.1 Kontext [pro] is a frontier image editing model. Specify what you want to change and Kontext will follow.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Edit Prompt",
                "required": true,
                "description": "The prompt to describe the edit."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "Image prompt for the omni model. This will be uploaded and converted to a URL."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "The same seed and the same prompt given to the same version of the model will output the same image every time."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale (CFG)",
                "defaultValue": 3.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "The CFG scale."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "output_format",
                "type": "enum",
                "label": "Output Format",
                "defaultValue": "jpeg",
                "options": [
                    {"value": "jpeg", "label": "JPEG"},
                    {"value": "png", "label": "PNG"}
                ],
                "description": "Image format."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "description": "Aspect ratio of the output image. Note: The input image is not resized, this affects the output canvas if different from input.",
                "options": [
                    {"value": "21:9", "label": "21:9"},
                    {"value": "16:9", "label": "16:9"},
                    {"value": "4:3", "label": "4:3"},
                    {"value": "3:2", "label": "3:2"},
                    {"value": "1:1", "label": "1:1 (Square)"},
                    {"value": "2:3", "label": "2:3"},
                    {"value": "3:4", "label": "3:4"},
                    {"value": "9:16", "label": "9:16"},
                    {"value": "9:21", "label": "9:21"}
                ]
            },
            {
                "name": "safety_tolerance",
                "type": "enum",
                "label": "Safety Tolerance",
                "defaultValue": "2",
                "options": [
                    {"value": "1", "label": "Level 1 (Strictest)"},
                    {"value": "2", "label": "Level 2 (Default)"},
                    {"value": "3", "label": "Level 3"},
                    {"value": "4", "label": "Level 4"},
                    {"value": "5", "label": "Level 5"},
                    {"value": "6", "label": "Level 6 (Most Permissive)"}
                ],
                "description": "Adjusts the safety filtering level. Higher values are more permissive. Default: 2.",
                "required": false
            }
        ]
    },
    "fal-ai/flux-pro/kontext/max": {
        "description": "FLUX.1 Kontext [Max] is a more powerful version of Kontext for complex image editing.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Edit Prompt",
                "required": true,
                "description": "The prompt to describe the edit."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "Image prompt for the omni model."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 3.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "The CFG scale."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "output_format",
                "type": "enum",
                "label": "Output Format",
                "defaultValue": "jpeg",
                "options": [
                    {"value": "jpeg", "label": "JPEG"},
                    {"value": "png", "label": "PNG"}
                ],
                "description": "Image format."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "options": [
                    {"value": "21:9", "label": "21:9"},
                    {"value": "16:9", "label": "16:9"},
                    {"value": "4:3", "label": "4:3"},
                    {"value": "3:2", "label": "3:2"},
                    {"value": "1:1", "label": "1:1 (Square)"},
                    {"value": "2:3", "label": "2:3"},
                    {"value": "3:4", "label": "3:4"},
                    {"value": "9:16", "label": "9:16"},
                    {"value": "9:21", "label": "9:21"}
                ],
                "description": "Aspect ratio of the output image."
            },
            {
                "name": "safety_tolerance",
                "type": "enum",
                "label": "Safety Tolerance",
                "defaultValue": "2",
                "options": [
                    {"value": "1", "label": "Level 1 (Strictest)"},
                    {"value": "2", "label": "Level 2 (Default)"},
                    {"value": "3", "label": "Level 3"},
                    {"value": "4", "label": "Level 4"},
                    {"value": "5", "label": "Level 5"},
                    {"value": "6", "label": "Level 6 (Most Permissive)"}
                ],
                "description": "Adjusts the safety filtering level. Higher values are more permissive. Default: 2.",
                "required": false
            }
        ]
    },
    "fal-ai/flux-pro/kontext/max/multi": {
        "description": "Experimental version of FLUX.1 Kontext [Max] with multiple image inputs.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Edit Prompt",
                "required": true,
                "description": "The prompt to describe the edit."
            },
            {
                "name": "image_urls",
                "type": "array_of_files", // Special handling needed in UI
                "label": "Input Images",
                "required": true,
                "accept": "image/*",
                "description": "List of image URLs for the omni model (up to N images based on model)."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 3.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "The CFG scale."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate per edit."
            },
            {
                "name": "output_format",
                "type": "enum",
                "label": "Output Format",
                "defaultValue": "jpeg",
                "options": [
                    {"value": "jpeg", "label": "JPEG"},
                    {"value": "png", "label": "PNG"}
                ],
                "description": "Image format."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                 "options": [
                    {"value": "21:9", "label": "21:9"},
                    {"value": "16:9", "label": "16:9"},
                    {"value": "4:3", "label": "4:3"},
                    {"value": "3:2", "label": "3:2"},
                    {"value": "1:1", "label": "1:1 (Square)"},
                    {"value": "2:3", "label": "2:3"},
                    {"value": "3:4", "label": "3:4"},
                    {"value": "9:16", "label": "9:16"},
                    {"value": "9:21", "label": "9:21"}
                ],
                "description": "Aspect ratio of the output image."
            }
        ]
    },
    "fal-ai/flux-pro/kontext/max/text-to-image": {
        "description": "FLUX.1 Kontext [Max] -- Frontier image generation model.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Prompt to generate an image from."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 3.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "The CFG scale."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "output_format",
                "type": "enum",
                "label": "Output Format",
                "defaultValue": "jpeg",
                "options": [
                    {"value": "jpeg", "label": "JPEG"},
                    {"value": "png", "label": "PNG"}
                ],
                "description": "Image format."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "1:1",
                "options": [
                    {"value": "21:9", "label": "21:9"},
                    {"value": "16:9", "label": "16:9"},
                    {"value": "4:3", "label": "4:3"},
                    {"value": "3:2", "label": "3:2"},
                    {"value": "1:1", "label": "1:1 (Square)"},
                    {"value": "2:3", "label": "2:3"},
                    {"value": "3:4", "label": "3:4"},
                    {"value": "9:16", "label": "9:16"},
                    {"value": "9:21", "label": "9:21"}
                ],
                "description": "Aspect ratio of the output image."
            },
            {
                "name": "safety_tolerance",
                "type": "enum",
                "label": "Safety Tolerance",
                "defaultValue": "2",
                "options": [
                    {"value": "1", "label": "Level 1 (Strictest)"},
                    {"value": "2", "label": "Level 2 (Default)"},
                    {"value": "3", "label": "Level 3"},
                    {"value": "4", "label": "Level 4"},
                    {"value": "5", "label": "Level 5"},
                    {"value": "6", "label": "Level 6 (Most Permissive)"}
                ],
                "description": "Adjusts the safety filtering level. Higher values are more permissive. Default: 2.",
                "required": false
            }
        ]
    },
    "fal-ai/flux-pro/kontext/text-to-image": {
        "description": "FLUX.1 Kontext [pro] -- Frontier image generation model.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Prompt to generate an image from."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 3.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "The CFG scale."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "output_format",
                "type": "enum",
                "label": "Output Format",
                "defaultValue": "jpeg",
                "options": [
                    {"value": "jpeg", "label": "JPEG"},
                    {"value": "png", "label": "PNG"}
                ],
                "description": "Image format."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "1:1",
                 "options": [
                    {"value": "21:9", "label": "21:9"},
                    {"value": "16:9", "label": "16:9"},
                    {"value": "4:3", "label": "4:3"},
                    {"value": "3:2", "label": "3:2"},
                    {"value": "1:1", "label": "1:1 (Square)"},
                    {"value": "2:3", "label": "2:3"},
                    {"value": "3:4", "label": "3:4"},
                    {"value": "9:16", "label": "9:16"},
                    {"value": "9:21", "label": "9:21"}
                ],
                "description": "Aspect ratio of the output image."
            },
            {
                "name": "safety_tolerance",
                "type": "enum",
                "label": "Safety Tolerance",
                "defaultValue": "2",
                "options": [
                    {"value": "1", "label": "Level 1 (Strictest)"},
                    {"value": "2", "label": "Level 2 (Default)"},
                    {"value": "3", "label": "Level 3"},
                    {"value": "4", "label": "Level 4"},
                    {"value": "5", "label": "Level 5"},
                    {"value": "6", "label": "Level 6 (Most Permissive)"}
                ],
                "description": "Adjusts the safety filtering level. Higher values are more permissive. Default: 2.",
                "required": false
            }
        ]
    },
    "fal-ai/imagen4/preview": {
        "description": "Generate images using Google's Imagen 4 model. Excels at capturing fine details and diverse art styles.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt describing what you want to see."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Description of what to discourage."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "1:1",
                "options": [
                    {"value": "1:1", "label": "1:1 (Square)"},
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "3:4", "label": "3:4"},
                    {"value": "4:3", "label": "4:3"}
                ],
                "description": "Aspect ratio of the output image."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate (1-4)."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Random seed for reproducibility."
            }
        ]
    },
    "fal-ai/bagel": {
        "description": "Run Bagel model for image generation.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Prompt to generate an image from."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed to use for reproducibility."
            },
            {
                "name": "use_thought",
                "type": "boolean",
                "label": "Use Thought",
                "defaultValue": false,
                "description": "If true, model 'thinks' to improve quality (increases time/cost)."
            }
            // enable_safety_checker handled globally
        ]
    },
    "fal-ai/bagel/edit": {
        "description": "Edit images using the Bagel model.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Edit Prompt",
                "required": true,
                "description": "Prompt to edit the image with."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "The image to edit."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed to use for reproducibility."
            },
            {
                "name": "use_thought",
                "type": "boolean",
                "label": "Use Thought",
                "defaultValue": false,
                "description": "If true, model 'thinks' to improve quality."
            }
            // enable_safety_checker handled globally
        ]
    },
    "fal-ai/kling-video/v1.6/pro/elements": {
        "description": "Kling Pro Multi-Image to Video API. Generates videos from multiple input images (up to 4), ordered as they appear.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt for the video."
            },
            {
                "name": "input_image_urls",
                "type": "array_of_files",
                "label": "Input Images (up to 4)",
                "required": true,
                "accept": "image/*",
                "description": "List of image URLs. Images will be used in the order provided."
            },
            {
                "name": "duration",
                "type": "enum",
                "label": "Duration (seconds)",
                "defaultValue": "5",
                "options": [
                    {"value": "5", "label": "5 seconds"},
                    {"value": "10", "label": "10 seconds"}
                ],
                "description": "Video duration in seconds."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                "options": [
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "1:1", "label": "1:1 (Square)"}
                ],
                "description": "Video aspect ratio."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "blur, distort, and low quality",
                "description": "Negative prompt to guide generation away from certain features."
            }
        ]
    },
    "fal-ai/kling-video/v1.6/pro/image-to-video": {
        "description": "Kling 1.6 (pro) Image to Video API.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt describing the desired video content or animation."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "The starting image for the video."
            },
            {
                "name": "duration",
                "type": "enum",
                "label": "Duration (seconds)",
                "defaultValue": "5",
                "options": [
                    {"value": "5", "label": "5 seconds"},
                    {"value": "10", "label": "10 seconds"}
                ],
                "description": "Video duration."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                 "options": [
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "1:1", "label": "1:1 (Square)"}
                ],
                "description": "Video aspect ratio. Should match input image if possible."
            },
            {
                "name": "tail_image_url",
                "type": "file",
                "label": "End Image (Optional)",
                "accept": "image/*",
                "description": "Optional URL of an image to be used as the end frame of the video."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "blur, distort, and low quality",
                "description": "Discourage certain features."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 0.5, // As per docs
                "min": 0.0,
                "max": 20.0, // Educated guess
                "step": 0.1,
                "description": "Classifier-Free Guidance scale."
            }
        ]
    },
    "fal-ai/kling-video/v1.6/pro/text-to-video": {
        "description": "Kling 1.6 (pro) Text to Video API.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt to generate video from."
            },
            {
                "name": "duration",
                "type": "enum",
                "label": "Duration (seconds)",
                "defaultValue": "5",
                "options": [
                    {"value": "5", "label": "5 seconds"},
                    {"value": "10", "label": "10 seconds"}
                ],
                "description": "Video duration."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                 "options": [
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "1:1", "label": "1:1 (Square)"}
                ],
                "description": "Video aspect ratio."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "blur, distort, and low quality",
                "description": "Discourage certain features."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 0.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "Classifier-Free Guidance scale."
            }
        ]
    },
    "fal-ai/kling-video/v1.6/standard/elements": {
        "description": "Kling Standard Multi-Image to Video API. Generates videos from multiple input images (up to 4).",
        "parameters": [ // Identical to pro/elements
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt for the video."
            },
            {
                "name": "input_image_urls",
                "type": "array_of_files",
                "label": "Input Images (up to 4)",
                "required": true,
                "accept": "image/*",
                "description": "List of image URLs. Images will be used in the order provided."
            },
            {
                "name": "duration",
                "type": "enum",
                "label": "Duration (seconds)",
                "defaultValue": "5",
                "options": [
                    {"value": "5", "label": "5 seconds"},
                    {"value": "10", "label": "10 seconds"}
                ],
                "description": "Video duration in seconds."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                "options": [
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "1:1", "label": "1:1 (Square)"}
                ],
                "description": "Video aspect ratio."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "blur, distort, and low quality",
                "description": "Negative prompt to guide generation away from certain features."
            }
        ]
    },
    "fal-ai/kling-video/v1.6/standard/image-to-video": {
        "description": "Kling 1.6 (std) Image to Video API.",
        "parameters": [ // Similar to pro/image-to-video but typically without tail_image_url for standard tier
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt describing the desired video content or animation."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "The starting image for the video."
            },
            {
                "name": "duration",
                "type": "enum",
                "label": "Duration (seconds)",
                "defaultValue": "5",
                "options": [
                    {"value": "5", "label": "5 seconds"},
                    {"value": "10", "label": "10 seconds"}
                ],
                "description": "Video duration."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                 "options": [
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "1:1", "label": "1:1 (Square)"}
                ],
                "description": "Video aspect ratio. Should match input image if possible."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "blur, distort, and low quality",
                "description": "Discourage certain features."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 0.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "Classifier-Free Guidance scale."
            }
        ]
    },
    "fal-ai/kling-video/v1.6/standard/text-to-video": {
        "description": "Kling 1.6 (std) Text to Video API.",
        "parameters": [ // Identical to pro/text-to-video
             {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Text prompt to generate video from."
            },
            {
                "name": "duration",
                "type": "enum",
                "label": "Duration (seconds)",
                "defaultValue": "5",
                "options": [
                    {"value": "5", "label": "5 seconds"},
                    {"value": "10", "label": "10 seconds"}
                ],
                "description": "Video duration."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                 "options": [
                    {"value": "16:9", "label": "16:9 (Widescreen)"},
                    {"value": "9:16", "label": "9:16 (Portrait)"},
                    {"value": "1:1", "label": "1:1 (Square)"}
                ],
                "description": "Video aspect ratio."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "blur, distort, and low quality",
                "description": "Discourage certain features."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 0.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "Classifier-Free Guidance scale."
            }
        ]
    },
    "fal-ai/dreamo": {
        "description": "Generate images with Dreamo, allowing reference images for style and identity.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Prompt to generate image from."
            },
            {
                "name": "first_image_url",
                "type": "file",
                "label": "First Reference Image (Optional)",
                "accept": "image/*",
                "description": "URL of first reference image."
            },
            {
                "name": "second_image_url",
                "type": "file",
                "label": "Second Reference Image (Optional)",
                "accept": "image/*",
                "description": "URL of second reference image."
            },
            {
                "name": "first_reference_task",
                "type": "enum",
                "label": "Task for First Reference",
                "defaultValue": "ip",
                "options": [
                    {"value": "ip", "label": "Image Prompt (ip)"},
                    {"value": "id", "label": "Identity (id)"},
                    {"value": "style", "label": "Style"}
                ],
                "description": "Task for the first reference image."
            },
            {
                "name": "second_reference_task",
                "type": "enum",
                "label": "Task for Second Reference",
                "defaultValue": "ip",
                "options": [
                    {"value": "ip", "label": "Image Prompt (ip)"},
                    {"value": "id", "label": "Identity (id)"},
                    {"value": "style", "label": "Style"}
                ],
                "description": "Task for the second reference image."
            },
            {
                "name": "image_size",
                "type": "enum", // Or a more complex type if custom width/height is frequently used
                "label": "Image Size",
                "defaultValue": "square_hd",
                "options": [
                    {"value": "square_hd", "label": "Square HD (1024x1024)"}, // Assuming HD means 1024
                    {"value": "square", "label": "Square (e.g., 512x512)"},
                    {"value": "portrait_4_3", "label": "Portrait 4:3"},
                    {"value": "portrait_16_9", "label": "Portrait 16:9"},
                    {"value": "landscape_4_3", "label": "Landscape 4:3"},
                    {"value": "landscape_16_9", "label": "Landscape 16:9"}
                ],
                "description": "Size of the generated image. Custom width/height can be specified in advanced mode."
            },
            {
                "name": "num_inference_steps",
                "type": "integer",
                "label": "Inference Steps",
                "defaultValue": 12,
                "min": 1,
                "max": 100, // Educated guess
                "description": "Number of inference steps."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 3.5,
                "min": 0.0,
                "max": 20.0,
                "step": 0.1,
                "description": "Classifier-Free Guidance scale."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Negative prompt."
            },
            {
                "name": "ref_resolution",
                "type": "integer",
                "label": "Reference Resolution",
                "defaultValue": 512,
                "description": "Resolution for reference images."
            },
            {
                "name": "true_cfg",
                "type": "float",
                "label": "True CFG",
                "defaultValue": 1.0,
                "description": "Weight of CFG loss."
            }
            // enable_safety_checker handled globally
        ]
    },
    "fal-ai/framepack/f1": {
        "description": "Generate Video F1 Endpoint using FramePack.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "maxLength": 500,
                "description": "Text prompt (max 500 chars)."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Negative prompt."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "URL of the image input."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                "options": [
                    {"value": "16:9", "label": "16:9"},
                    {"value": "9:16", "label": "9:16"}
                ],
                "description": "Aspect ratio of the video."
            },
            {
                "name": "resolution",
                "type": "enum",
                "label": "Resolution",
                "defaultValue": "480p",
                "options": [
                    {"value": "480p", "label": "480p"},
                    {"value": "720p", "label": "720p (1.5x cost)"}
                ],
                "description": "Video resolution."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 1.0,
                "description": "Classifier-Free Guidance scale."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 10.0,
                "description": "Guidance scale for generation."
            },
            {
                "name": "num_frames",
                "type": "integer",
                "label": "Number of Frames",
                "defaultValue": 180,
                "description": "Number of frames in the video."
            }
            // enable_safety_checker handled globally
        ]
    },
    "fal-ai/framepack": { // Assumed to be "Regular"
        "description": "Generate Video Regular Endpoint using FramePack.",
        "parameters": [ // Identical to framepack/f1
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "maxLength": 500,
                "description": "Text prompt (max 500 chars)."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Negative prompt."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "URL of the image input."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                "options": [
                    {"value": "16:9", "label": "16:9"},
                    {"value": "9:16", "label": "9:16"}
                ],
                "description": "Aspect ratio of the video."
            },
            {
                "name": "resolution",
                "type": "enum",
                "label": "Resolution",
                "defaultValue": "480p",
                "options": [
                    {"value": "480p", "label": "480p"},
                    {"value": "720p", "label": "720p (1.5x cost)"}
                ],
                "description": "Video resolution."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 1.0,
                "description": "Classifier-Free Guidance scale."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 10.0,
                "description": "Guidance scale for generation."
            },
            {
                "name": "num_frames",
                "type": "integer",
                "label": "Number of Frames",
                "defaultValue": 180,
                "description": "Number of frames in the video."
            }
        ]
    },
    "fal-ai/framepack/flf2v": {
        "description": "Generate Video Flf2V (First-Last-Frame to Video) Endpoint using FramePack.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "maxLength": 500,
                "description": "Text prompt (max 500 chars)."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Negative prompt."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "First Input Image",
                "required": true,
                "accept": "image/*",
                "description": "URL of the first image input."
            },
            {
                "name": "end_image_url",
                "type": "file",
                "label": "End Input Image",
                "required": true,
                "accept": "image/*",
                "description": "URL of the end image input."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "aspect_ratio",
                "type": "enum",
                "label": "Aspect Ratio",
                "defaultValue": "16:9",
                "options": [
                    {"value": "16:9", "label": "16:9"},
                    {"value": "9:16", "label": "9:16"}
                ],
                "description": "Aspect ratio of the video."
            },
            {
                "name": "resolution",
                "type": "enum",
                "label": "Resolution",
                "defaultValue": "480p",
                "options": [
                    {"value": "480p", "label": "480p"},
                    {"value": "720p", "label": "720p"}
                ],
                "description": "Video resolution."
            },
            {
                "name": "cfg_scale",
                "type": "float",
                "label": "CFG Scale",
                "defaultValue": 1.0,
                "description": "Classifier-Free Guidance scale."
            },
            {
                "name": "guidance_scale",
                "type": "float",
                "label": "Guidance Scale",
                "defaultValue": 10.0,
                "description": "Guidance scale for generation."
            },
            {
                "name": "num_frames",
                "type": "integer",
                "label": "Number of Frames",
                "defaultValue": 240, // Default for Flf2V
                "description": "Number of frames in the video."
            },
            {
                "name": "strength",
                "type": "float",
                "label": "End Image Strength",
                "defaultValue": 0.8,
                "min": 0.0,
                "max": 1.0,
                "step": 0.05,
                "description": "Influence of the final frame on the generation."
            }
            // enable_safety_checker handled globally
        ]
    },
    "fal-ai/ideogram/v3": {
        "description": "Ideogram V3 for image generation.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Prompt",
                "required": true,
                "description": "Prompt for generation."
            },
            {
                "name": "image_urls", // Style reference images
                "type": "array_of_files",
                "label": "Style Reference Images (Optional)",
                "accept": "image/jpeg,image/png,image/webp",
                "description": "Style reference images (max 10MB total, JPEG/PNG/WebP)."
            },
            {
                "name": "rendering_speed",
                "type": "enum",
                "label": "Rendering Speed",
                "defaultValue": "BALANCED",
                "options": [
                    {"value": "TURBO", "label": "Turbo"},
                    {"value": "BALANCED", "label": "Balanced"},
                    {"value": "QUALITY", "label": "Quality"}
                ],
                "description": "Controls speed vs quality."
            },
            // color_palette is complex, representing as string for preset for now
            {
                "name": "color_palette_preset", // Simplified from color_palette object
                "type": "enum",
                "label": "Color Palette Preset (Optional)",
                "options": [
                    {"value": "", "label": "None"},
                    {"value": "EMBER", "label": "Ember"},
                    {"value": "FRESH", "label": "Fresh"},
                    {"value": "JUNGLE", "label": "Jungle"},
                    {"value": "MAGIC", "label": "Magic"},
                    {"value": "MELON", "label": "Melon"},
                    {"value": "MOSAIC", "label": "Mosaic"},
                    {"value": "PASTEL", "label": "Pastel"},
                    {"value": "ULTRAMARINE", "label": "Ultramarine"}
                ],
                "description": "Apply a preset color palette. Custom palettes via API."
            },
            {
                "name": "style_codes", // Array of strings
                "type": "string", // Simplified to comma-separated string for UI
                "label": "Style Codes (Optional)",
                "description": "List of 8-char hex style codes (comma-separated). Cannot use with Style or Style Reference Images."
            },
            {
                "name": "style",
                "type": "enum",
                "label": "Style (Optional)",
                "options": [
                    {"value": "", "label": "Default (Auto if style_codes not used)"},
                    {"value": "AUTO", "label": "Auto"},
                    {"value": "GENERAL", "label": "General"},
                    {"value": "REALISTIC", "label": "Realistic"},
                    {"value": "DESIGN", "label": "Design"}
                ],
                "description": "Overall style type. Cannot use with style_codes."
            },
            {
                "name": "expand_prompt",
                "type": "boolean",
                "label": "Use MagicPrompt",
                "defaultValue": true,
                "description": "Expand the prompt using MagicPrompt."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4, // Assumption
                "description": "Number of images to generate."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            },
            {
                "name": "image_size",
                "type": "enum",
                "label": "Image Size",
                "defaultValue": "square_hd",
                 "options": [
                    {"value": "square_hd", "label": "Square HD (1024x1024)"},
                    {"value": "square", "label": "Square (e.g. 512x512)"},
                    {"value": "portrait_4_3", "label": "Portrait 4:3"},
                    {"value": "portrait_16_9", "label": "Portrait 16:9"},
                    {"value": "landscape_4_3", "label": "Landscape 4:3"},
                    {"value": "landscape_16_9", "label": "Landscape 16:9"}
                ],
                "description": "Resolution of the output image."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Negative prompt."
            }
        ]
    },
    "fal-ai/ideogram/v3/edit": {
        "description": "Ideogram V3 Edit for inpainting masked areas of an image.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Inpaint Prompt",
                "required": true,
                "description": "Prompt to fill the masked part of the image."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "Image URL (must match mask dimensions)."
            },
            {
                "name": "mask_url",
                "type": "file", // User will draw mask on canvas, then it's uploaded
                "label": "Mask Image",
                "required": true,
                "accept": "image/png", // Masks are often PNGs
                "description": "Mask URL (must match image dimensions). White areas are inpainted."
            },
            {
                "name": "image_urls", // Style reference images
                "type": "array_of_files",
                "label": "Style Reference Images (Optional)",
                "accept": "image/jpeg,image/png,image/webp",
                "description": "Style reference images."
            },
            {
                "name": "rendering_speed",
                "type": "enum",
                "label": "Rendering Speed",
                "defaultValue": "BALANCED",
                 "options": [
                    {"value": "TURBO", "label": "Turbo"},
                    {"value": "BALANCED", "label": "Balanced"},
                    {"value": "QUALITY", "label": "Quality"}
                ],
                "description": "Controls speed vs quality."
            },
            {
                "name": "color_palette_preset",
                "type": "enum",
                "label": "Color Palette Preset (Optional)",
                 "options": [
                    {"value": "", "label": "None"},
                    {"value": "EMBER", "label": "Ember"},
                    {"value": "FRESH", "label": "Fresh"},
                    {"value": "JUNGLE", "label": "Jungle"},
                    {"value": "MAGIC", "label": "Magic"},
                    {"value": "MELON", "label": "Melon"},
                    {"value": "MOSAIC", "label": "Mosaic"},
                    {"value": "PASTEL", "label": "Pastel"},
                    {"value": "ULTRAMARINE", "label": "Ultramarine"}
                ],
                "description": "Apply a preset color palette."
            },
            {
                "name": "style_codes",
                "type": "string",
                "label": "Style Codes (Optional)",
                "description": "List of 8-char hex style codes (comma-separated)."
            },
            {
                "name": "expand_prompt",
                "type": "boolean",
                "label": "Use MagicPrompt",
                "defaultValue": true,
                "description": "Expand the prompt using MagicPrompt."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            }
        ]
    },
    "fal-ai/ideogram/v3/reframe": {
        "description": "Ideogram V3 Reframe for outpainting or expanding an image.",
        "parameters": [
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "Image URL to reframe/outpaint."
            },
            {
                "name": "image_size", // Target output size
                "type": "enum",
                "label": "Target Output Size",
                "required": true,
                "defaultValue": "square_hd",
                 "options": [
                    {"value": "square_hd", "label": "Square HD (1024x1024)"},
                    {"value": "square", "label": "Square (e.g. 512x512)"},
                    {"value": "portrait_4_3", "label": "Portrait 4:3"},
                    {"value": "portrait_16_9", "label": "Portrait 16:9"},
                    {"value": "landscape_4_3", "label": "Landscape 4:3"},
                    {"value": "landscape_16_9", "label": "Landscape 16:9"}
                ],
                "description": "Resolution for the reframed output image."
            },
            {
                "name": "image_urls", // Style reference images
                "type": "array_of_files",
                "label": "Style Reference Images (Optional)",
                "accept": "image/jpeg,image/png,image/webp",
                "description": "Style reference images."
            },
            {
                "name": "rendering_speed",
                "type": "enum",
                "label": "Rendering Speed",
                "defaultValue": "BALANCED",
                 "options": [
                    {"value": "TURBO", "label": "Turbo"},
                    {"value": "BALANCED", "label": "Balanced"},
                    {"value": "QUALITY", "label": "Quality"}
                ],
                "description": "Controls speed vs quality."
            },
            {
                "name": "color_palette_preset",
                "type": "enum",
                "label": "Color Palette Preset (Optional)",
                 "options": [
                    {"value": "", "label": "None"},
                    {"value": "EMBER", "label": "Ember"},
                    {"value": "FRESH", "label": "Fresh"},
                    {"value": "JUNGLE", "label": "Jungle"},
                    {"value": "MAGIC", "label": "Magic"},
                    {"value": "MELON", "label": "Melon"},
                    {"value": "MOSAIC", "label": "Mosaic"},
                    {"value": "PASTEL", "label": "Pastel"},
                    {"value": "ULTRAMARINE", "label": "Ultramarine"}
                ],
                "description": "Apply a preset color palette."
            },
            {
                "name": "style_codes",
                "type": "string",
                "label": "Style Codes (Optional)",
                "description": "List of 8-char hex style codes (comma-separated)."
            },
            {
                "name": "style",
                "type": "enum",
                "label": "Style (Optional)",
                "options": [
                    {"value": "", "label": "Default (Auto if style_codes not used)"},
                    {"value": "AUTO", "label": "Auto"},
                    {"value": "GENERAL", "label": "General"},
                    {"value": "REALISTIC", "label": "Realistic"},
                    {"value": "DESIGN", "label": "Design"}
                ],
                "description": "Overall style type."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            }
        ]
    },
    "fal-ai/ideogram/v3/remix": {
        "description": "Ideogram V3 Remix for image-to-image transformation.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "Remix Prompt",
                "required": true,
                "description": "Prompt to remix the image with."
            },
            {
                "name": "image_url", // Input image to remix
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "Image URL to remix."
            },
            {
                "name": "strength",
                "type": "float",
                "label": "Image Strength",
                "defaultValue": 0.8,
                "min": 0.0,
                "max": 1.0,
                "step": 0.05,
                "description": "Strength of input image in the remix (0.0 to 1.0)."
            },
            {
                "name": "image_size",
                "type": "enum",
                "label": "Output Image Size",
                "defaultValue": "square_hd",
                 "options": [
                    {"value": "square_hd", "label": "Square HD (1024x1024)"},
                    {"value": "square", "label": "Square (e.g. 512x512)"},
                    {"value": "portrait_4_3", "label": "Portrait 4:3"},
                    {"value": "portrait_16_9", "label": "Portrait 16:9"},
                    {"value": "landscape_4_3", "label": "Landscape 4:3"},
                    {"value": "landscape_16_9", "label": "Landscape 16:9"}
                ],
                "description": "Resolution of the output image."
            },
            {
                "name": "negative_prompt",
                "type": "string",
                "label": "Negative Prompt",
                "defaultValue": "",
                "description": "Negative prompt."
            },
            {
                "name": "image_urls", // Style reference images
                "type": "array_of_files",
                "label": "Style Reference Images (Optional)",
                "accept": "image/jpeg,image/png,image/webp",
                "description": "Style reference images."
            },
            {
                "name": "rendering_speed",
                "type": "enum",
                "label": "Rendering Speed",
                "defaultValue": "BALANCED",
                 "options": [
                    {"value": "TURBO", "label": "Turbo"},
                    {"value": "BALANCED", "label": "Balanced"},
                    {"value": "QUALITY", "label": "Quality"}
                ],
                "description": "Controls speed vs quality."
            },
            {
                "name": "color_palette_preset",
                "type": "enum",
                "label": "Color Palette Preset (Optional)",
                 "options": [
                    {"value": "", "label": "None"},
                    {"value": "EMBER", "label": "Ember"},
                    {"value": "FRESH", "label": "Fresh"},
                    {"value": "JUNGLE", "label": "Jungle"},
                    {"value": "MAGIC", "label": "Magic"},
                    {"value": "MELON", "label": "Melon"},
                    {"value": "MOSAIC", "label": "Mosaic"},
                    {"value": "PASTEL", "label": "Pastel"},
                    {"value": "ULTRAMARINE", "label": "Ultramarine"}
                ],
                "description": "Apply a preset color palette."
            },
            {
                "name": "style_codes",
                "type": "string",
                "label": "Style Codes (Optional)",
                "description": "List of 8-char hex style codes (comma-separated)."
            },
            {
                "name": "style",
                "type": "enum",
                "label": "Style (Optional)",
                 "options": [
                    {"value": "", "label": "Default (Auto if style_codes not used)"},
                    {"value": "AUTO", "label": "Auto"},
                    {"value": "GENERAL", "label": "General"},
                    {"value": "REALISTIC", "label": "Realistic"},
                    {"value": "DESIGN", "label": "Design"}
                ],
                "description": "Overall style type."
            },
            {
                "name": "expand_prompt",
                "type": "boolean",
                "label": "Use MagicPrompt",
                "defaultValue": true,
                "description": "Expand the prompt using MagicPrompt."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            }
        ]
    },
    "fal-ai/ideogram/v3/replace-background": {
        "description": "Ideogram V3 Replace Background.",
        "parameters": [
            {
                "name": "prompt",
                "type": "string",
                "label": "New Background Prompt",
                "required": true,
                "description": "Prompt for the new background."
            },
            {
                "name": "image_url",
                "type": "file",
                "label": "Input Image",
                "required": true,
                "accept": "image/*",
                "description": "Image URL whose background needs to be replaced."
            },
            {
                "name": "image_urls", // Style reference images
                "type": "array_of_files",
                "label": "Style Reference Images (Optional)",
                "accept": "image/jpeg,image/png,image/webp",
                "description": "Style reference images for the new background."
            },
            {
                "name": "rendering_speed",
                "type": "enum",
                "label": "Rendering Speed",
                "defaultValue": "BALANCED",
                 "options": [
                    {"value": "TURBO", "label": "Turbo"},
                    {"value": "BALANCED", "label": "Balanced"},
                    {"value": "QUALITY", "label": "Quality"}
                ],
                "description": "Controls speed vs quality."
            },
            {
                "name": "color_palette_preset",
                "type": "enum",
                "label": "Color Palette Preset (Optional)",
                "options": [
                    {"value": "", "label": "None"},
                    {"value": "EMBER", "label": "Ember"},
                    {"value": "FRESH", "label": "Fresh"},
                    {"value": "JUNGLE", "label": "Jungle"},
                    {"value": "MAGIC", "label": "Magic"},
                    {"value": "MELON", "label": "Melon"},
                    {"value": "MOSAIC", "label": "Mosaic"},
                    {"value": "PASTEL", "label": "Pastel"},
                    {"value": "ULTRAMARINE", "label": "Ultramarine"}
                ],
                "description": "Apply a preset color palette to the background."
            },
            {
                "name": "style_codes",
                "type": "string",
                "label": "Style Codes (Optional)",
                "description": "List of 8-char hex style codes for the background (comma-separated)."
            },
            {
                "name": "style",
                "type": "enum",
                "label": "Style (Optional)",
                "options": [
                    {"value": "", "label": "Default (Auto if style_codes not used)"},
                    {"value": "AUTO", "label": "Auto"},
                    {"value": "GENERAL", "label": "General"},
                    {"value": "REALISTIC", "label": "Realistic"},
                    {"value": "DESIGN", "label": "Design"}
                ],
                "description": "Overall style type for the background."
            },
            {
                "name": "expand_prompt",
                "type": "boolean",
                "label": "Use MagicPrompt",
                "defaultValue": true,
                "description": "Expand the prompt for the background using MagicPrompt."
            },
            {
                "name": "num_images",
                "type": "integer",
                "label": "Number of Images",
                "defaultValue": 1,
                "min": 1,
                "max": 4,
                "description": "Number of images to generate."
            },
            {
                "name": "seed",
                "type": "integer",
                "label": "Seed",
                "description": "Seed for reproducibility."
            }
        ]
    }
};

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import requests
import time
import os
import base64

app = Flask(__name__)
# IMPORTANT: Change this secret key for production!
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'super_secret_key_for_dev_change_me')

# Model URL Dictionaries
TXT2IMG_MODEL_URLS = {
    "fal-ai/fast-sdxl": "https://fal.ai/api/fast-sdxl/run",
    "fal-ai/sdxl": "https://fal.ai/api/sdxl/run",
    "fal-ai/fast-turbo-diffusion": "https://fal.ai/api/fast-turbo-diffusion/run",
    "fal-ai/ip-adapter-faceid-plus-lora": "https://fal.ai/api/ip-adapter-faceid-plus-lora/run", # Also in IMG_EDIT
    "fal-ai/flux-pro/kontext/max/text-to-image": "https://fal.ai/api/fal-ai/flux-pro/kontext/max/text-to-image/run",
    "fal-ai/flux-pro/kontext/text-to-image": "https://fal.ai/api/fal-ai/flux-pro/kontext/text-to-image/run",
    "fal-ai/imagen4/preview": "https://fal.ai/api/fal-ai/imagen4/preview/run",
    "fal-ai/bagel": "https://fal.ai/api/fal-ai/bagel/run",
    "fal-ai/dreamo": "https://fal.ai/api/fal-ai/dreamo/run",
    "fal-ai/ideogram/v3": "https://fal.ai/api/fal-ai/ideogram/v3/run",
}

IMG_EDIT_MODEL_URLS = {
    # Image Editing / Image-to-Image
    "fal-ai/sdxl-i2i-placeholder": "https://fal.ai/api/sdxl-img2img-placeholder/run", # Placeholder
    "fal-ai/ip-adapter-faceid-plus-lora": "https://fal.ai/api/ip-adapter-faceid-plus-lora/run", # Versatile
    "fal-ai/flux-pro/kontext": "https://fal.ai/api/fal-ai/flux-pro/kontext/run",
    "fal-ai/flux-pro/kontext/max": "https://fal.ai/api/fal-ai/flux-pro/kontext/max/run",
    "fal-ai/flux-pro/kontext/max/multi": "https://fal.ai/api/fal-ai/flux-pro/kontext/max/multi/run",
    "fal-ai/bagel/edit": "https://fal.ai/api/fal-ai/bagel/edit/run",
    "fal-ai/ideogram/v3/remix": "https://fal.ai/api/fal-ai/ideogram/v3/remix/run", # Image-to-Image

    # Inpainting
    "fal-ai/sdxl-inpainting-placeholder": "https://fal.ai/api/sdxl-inpainting-placeholder/run", # Placeholder
    "fal-ai/stable-diffusion-v1-5-inpainting": "https://fal.ai/api/stable-diffusion-v1-5-inpainting/run",
    "fal-ai/ideogram/v3/edit": "https://fal.ai/api/fal-ai/ideogram/v3/edit/run", # Inpainting

    # Outpainting / Expanding
    "fal-ai/ideogram/v3/reframe": "https://fal.ai/api/fal-ai/ideogram/v3/reframe/run",

    # Background Replacement / Removal
    "fal-ai/transparent-background-placeholder": "https://fal.ai/api/transparent-background/run", # Placeholder
    "fal-ai/remove-background": "https://fal.ai/api/remove-background/run",
    "fal-ai/ideogram/v3/replace-background": "https://fal.ai/api/fal-ai/ideogram/v3/replace-background/run",

    # Upscaling
    "fal-ai/esrgan-placeholder": "https://fal.ai/api/esrgan/run", # Placeholder
    "fal-ai/real-esrgan-animevideo": "https://fal.ai/api/real-esrgan-animevideo/run",
    "fal-ai/swinir": "https://fal.ai/api/swinir/run",
}

VIDEO_MODEL_URLS = {
    "fal-ai/kling-video/v1.6/pro/elements": "https://fal.ai/api/fal-ai/kling-video/v1.6/pro/elements/run",
    "fal-ai/kling-video/v1.6/pro/image-to-video": "https://fal.ai/api/fal-ai/kling-video/v1.6/pro/image-to-video/run",
    "fal-ai/kling-video/v1.6/pro/text-to-video": "https://fal.ai/api/fal-ai/kling-video/v1.6/pro/text-to-video/run",
    "fal-ai/kling-video/v1.6/standard/elements": "https://fal.ai/api/fal-ai/kling-video/v1.6/standard/elements/run",
    "fal-ai/kling-video/v1.6/standard/image-to-video": "https://fal.ai/api/fal-ai/kling-video/v1.6/standard/image-to-video/run",
    "fal-ai/kling-video/v1.6/standard/text-to-video": "https://fal.ai/api/fal-ai/kling-video/v1.6/standard/text-to-video/run",
    "fal-ai/framepack/f1": "https://fal.ai/api/fal-ai/framepack/f1/run",
    "fal-ai/framepack": "https://fal.ai/api/fal-ai/framepack/run",
    "fal-ai/framepack/flf2v": "https://fal.ai/api/fal-ai/framepack/flf2v/run",
}

# For simplicity, consolidating older specific category dicts into IMG_EDIT_MODEL_URLS
# The frontend might need updates to categorize these if granular control is needed again.
# For now, process_common_image_request will try to find models in relevant dicts.
IMG2IMG_MODEL_URLS = {k: v for k, v in IMG_EDIT_MODEL_URLS.items() if "i2i" in k or "remix" in k or "ip-adapter" in k or "flux-pro/kontext" in k and "text-to-image" not in k} # Filter relevant
INPAINT_MODEL_URLS = {k: v for k, v in IMG_EDIT_MODEL_URLS.items() if "inpaint" in k or "edit" in k and "ideogram" in k} # Filter relevant
UPSCALE_MODEL_URLS = {k: v for k, v in IMG_EDIT_MODEL_URLS.items() if "esrgan" in k or "swinir" in k} # Filter relevant
BG_REMOVE_MODEL_URLS = {k: v for k, v in IMG_EDIT_MODEL_URLS.items() if "background" in k} # Filter relevant


MODEL_SAFETY_PARAMS = {
    "fal-ai/flux": "safety_tolerance",  # string "1"-"6"
    # "fal-ai/imagen4": None, # No direct client-side safety param found in schema
    "fal-ai/bagel": "enable_safety_checker",  # boolean
    # "fal-ai/kling-video": None, # No direct client-side safety param found in schema
    "fal-ai/dreamo": "enable_safety_checker",  # boolean
    "fal-ai/framepack": "enable_safety_checker", # boolean
    # "fal-ai/ideogram": None, # No direct client-side safety param found in schema
}

# MODEL_SAFETY_PARAMS maps model prefixes to the specific safety parameter name they use.
# The `api_generate` and `process_common_image_request` functions use this map
# to include the correct safety parameter in the payload to Fal AI, based on the
# user's selected global `safety_level` ("none", "default", "strict").
# For "safety_tolerance" (e.g., FLUX models), "none" omits the param, "strict" uses "1", "default" uses "2".
# For "enable_safety_checker" (e.g., Bagel), "none" sets it to false, "default"/"strict" set it to true.

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/save_api_key', methods=['POST'])
def save_api_key():
    data = request.get_json()
    api_key = data.get('api_key')
    if api_key:
        session['FAL_API_KEY'] = api_key
        return jsonify({"message": "API Key saved successfully"}), 200
    return jsonify({"error": "API Key is required"}), 400

@app.route('/api/clear_api_key', methods=['POST'])
def clear_api_key():
    session.pop('FAL_API_KEY', None)
    return jsonify({"message": "API Key cleared successfully"}), 200

@app.route('/api/get_api_key_status', methods=['GET'])
def get_api_key_status():
    if 'FAL_API_KEY' in session and session['FAL_API_KEY']:
        return jsonify({"is_set": True}), 200
    return jsonify({"is_set": False}), 200

@app.route('/api/generate', methods=['POST'])
def api_generate():
    fal_api_key = session.get('FAL_API_KEY')
    if not fal_api_key:
        return jsonify({"error": "API Key not set. Please save your API Key."}), 401

    try:
        data = request.get_json()
        initial_request_params = data.copy()

        model_id = data.get('model_id', "fal-ai/fast-sdxl") # Get model_id early for checks
        safety_level = data.get('safety_level', 'default')

        # Prompt validation can be model-specific, handled by FAL or schema on frontend.
        # Some video models might not require a 'prompt' field in the traditional sense.
        # Example: if 'prompt' not in data and model_is_text_dependent(model_id): return error
        
        # General check for prompt if it's a known text-to-image model, can be refined
        is_txt2img_type = model_id in TXT2IMG_MODEL_URLS
        is_txt2video_type = model_id in VIDEO_MODEL_URLS and "text-to-video" in model_id # Heuristic

        if (is_txt2img_type or is_txt2video_type) and not data.get('prompt'):
            return jsonify({"error": "Prompt is required for this model type"}), 400

        # Removed the more complex prompt check here as frontend should guide based on schema.
        # if not data.get('prompt') and model_id not in VIDEO_MODEL_URLS:
        #     if not (model_id in TXT2IMG_MODEL_URLS or model_id in VIDEO_MODEL_URLS and "text-to-video" in model_id):
        #          return jsonify({"error": "Prompt is required for this model type"}), 400

        # Determine which dictionary to use
             # For text-to-video, prompt is still essential but might be part of a larger schema.
             # This check is primarily for text-to-image.
            if not (model_id in TXT2IMG_MODEL_URLS or model_id in VIDEO_MODEL_URLS and "text-to-video" in model_id):
                 return jsonify({"error": "Prompt is required for this model type"}), 400

        # Determine which dictionary to use
        if model_id in TXT2IMG_MODEL_URLS:
            selected_model_url = TXT2IMG_MODEL_URLS.get(model_id)
        elif model_id in VIDEO_MODEL_URLS: # Check video models (e.g. text-to-video)
            selected_model_url = VIDEO_MODEL_URLS.get(model_id)
        else:
            return jsonify({"error": f"Invalid model selected or not supported by this endpoint: {model_id}"}), 400

        if not selected_model_url: # Should be caught by the check above, but as a safeguard
            return jsonify({"error": f"Model URL not found for: {model_id}"}), 400

        fal_payload = {k: v for k, v in data.items() if k not in ['model_id', 'safety_level'] and v is not None}

        # Add safety parameters
        for prefix, param_name in MODEL_SAFETY_PARAMS.items():
            if model_id.startswith(prefix):
                if param_name == "safety_tolerance":
                    if safety_level == "none":
                        pass # Do not add the parameter
                    elif safety_level == "strict":
                        fal_payload[param_name] = "1"
                    else: # default
                        fal_payload[param_name] = "2"
                elif param_name == "enable_safety_checker":
                    if safety_level == "none":
                        fal_payload[param_name] = False
                    else: # default or strict
                        fal_payload[param_name] = True
                break

        log_payload = {k: v[:100]+"..." if isinstance(v, str) and k.endswith("_url") and len(v)>100 else v for k,v in fal_payload.items()}
        app.logger.info(f"Sending payload to {selected_model_url}: {log_payload}")
        headers = {"Authorization": f"Key {fal_api_key}", "Content-Type": "application/json", "Accept": "application/json"}
        response = requests.post(selected_model_url, json=fal_payload, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        app.logger.debug(f"Initial FAL response: {response_data}")

        # Handle direct completion
        if response_data.get('status') == 'COMPLETED':
            output_content = extract_output_content(response_data.get('output'))
            if output_content["url"]:
                final_response = {"params": initial_request_params}
                if output_content["type"] == "video":
                    final_response["video_url"] = output_content["url"]
                else:
                    final_response["image_url"] = output_content["url"]
                return jsonify(final_response)
            # If COMPLETED but no URL, it might be an error or different structure
            # Fall through to polling if status_url is present, otherwise error out

        status_url = response_data.get('status_url')
        if not status_url: # If no status_url and not completed, it's an error or unexpected response
            return jsonify({"error": "Failed to get status_url or direct result from FAL API", "details": response_data}), 500

        MAX_RETRIES, RETRY_INTERVAL = 60, 5 # Increased for potentially longer video jobs
        for i in range(MAX_RETRIES):
            app.logger.info(f"Polling attempt {i+1}/{MAX_RETRIES} for URL: {status_url}")
            poll_response = requests.get(status_url, headers=headers)
            poll_response.raise_for_status()
            poll_data = poll_response.json()
            status = poll_data.get('status')
            app.logger.debug(f"Polling status: {status}, Data: {poll_data}")

            if status == 'COMPLETED':
                output_content = extract_output_content(poll_data.get('output'))
                if output_content["url"]:
                    final_response = {"params": initial_request_params}
                    if output_content["type"] == "video":
                        final_response["video_url"] = output_content["url"]
                    else:
                        final_response["image_url"] = output_content["url"]
                    return jsonify(final_response)
                return jsonify({"error": "Content URL not found in completed response", "details": poll_data}), 500
            elif status == 'FAILED':
                return jsonify({"error": "Generation failed on FAL", "details": poll_data.get('error', poll_data.get('detail', poll_data))}), 500
            elif status in ['IN_PROGRESS', 'QUEUED', 'SUBMITTED']:
                time.sleep(RETRY_INTERVAL)
            else: # Unknown or unexpected status
                # Allow more retries before failing for unknown status, as some might be transitional
                if i > MAX_RETRIES * 0.75 : return jsonify({"error": f"Unknown or stalled FAL status: {status}", "details": poll_data}), 500
                time.sleep(RETRY_INTERVAL)
        
        return jsonify({"error": "Polling timed out waiting for FAL response"}), 500

    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if hasattr(e.response, 'json') and callable(e.response.json) else e.response.text
        return jsonify({"error": f"FAL API Error: {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error: {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/generate: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred."}), 500

def extract_output_content(output_data):
    """
    Extracts image or video URL from the 'output' field of a Fal AI response.
    It intelligently checks various common structures where the URL might be located,
    including direct URL strings, lists of file objects, or dictionaries containing
    keys like 'images', 'video', 'image_url', or a generic 'url'.
    It also attempts to determine if the content is an 'image' or 'video',
    defaulting to 'image' if ambiguous but a URL is found.

    Args:
        output_data: The content of the 'output' field from the Fal AI response.

    Returns:
        A dict: {"type": "image"|"video"|"unknown", "url": "..."}
    """
    content_url = None
    content_type = "unknown"

    if not output_data:
        return {"type": content_type, "url": content_url}

    if isinstance(output_data, str) and output_data.startswith("http"):
        content_url = output_data
        if ".mp4" in content_url or ".mov" in content_url or ".webm" in content_url: # Simple check
            content_type = "video"
        else:
            content_type = "image"
    elif isinstance(output_data, list) and len(output_data) > 0 and isinstance(output_data[0], dict):
        # Common pattern: list of file-like objects
        item = output_data[0]
        content_url = item.get('url')
        if item.get('content_type','').startswith('video'):
            content_type = "video"
        elif item.get('content_type','').startswith('image'):
            content_type = "image"
        elif content_url and (".mp4" in content_url or ".mov" in content_url): # Check URL if content_type missing
             content_type = "video"
        elif content_url: # Default to image if URL present but no type
            content_type = "image"

    elif isinstance(output_data, dict):
        if output_data.get('video') and isinstance(output_data['video'], dict) and output_data['video'].get('url'):
            content_url = output_data['video']['url']
            content_type = "video"
        elif output_data.get('images') and isinstance(output_data['images'], list) and len(output_data['images']) > 0 and output_data['images'][0].get('url'):
            content_url = output_data['images'][0]['url']
            content_type = "image"
        elif output_data.get('image_url'): # Direct image_url field
            content_url = output_data['image_url']
            content_type = "image"
        elif output_data.get('url'): # Output itself might be a file-like object
            content_url = output_data.get('url')
            if output_data.get('content_type','').startswith('video'):
                content_type = "video"
            elif output_data.get('content_type','').startswith('image'):
                 content_type = "image"
            elif content_url and (".mp4" in content_url or ".mov" in content_url):
                 content_type = "video"
            elif content_url:
                content_type = "image"

    return {"type": content_type, "url": content_url}


def process_common_image_request(request_type_name, relevant_model_dicts):
    fal_api_key = session.get('FAL_API_KEY')
    if not fal_api_key:
        return jsonify({"error": "API Key not set."}), 401

    # Video models might not always require an 'image' file (e.g. text-to-video is handled by /api/generate)
    # This function primarily handles image inputs or image-to-video.
    is_video_model_type = any(model_id in VIDEO_MODEL_URLS for model_id in request.form.getlist('model_id')) # A bit of a guess
    
    # Consolidate file checking logic
    image_file = None
    image_file_key_options = ['image', 'original_image'] # 'image' is common, 'original_image' for inpaint
    if request_type_name == "inpaint" and 'original_image' in request.files :
        image_file = request.files.get('original_image')
    elif 'image' in request.files:
        image_file = request.files.get('image')

    # Some model types might not need an image (e.g. if it's a video generation task not requiring initial image)
    # This needs careful handling based on how VIDEO_MODEL_URLS are used in common processor
    model_id = request.form.get('model_id')
    if not image_file and model_id not in VIDEO_MODEL_URLS : # if it's not a video model that might take no image
         # Re-check if specific type like inpaint *does* require it
        if request_type_name == "inpaint" or (model_id in IMG_EDIT_MODEL_URLS and model_id not in BG_REMOVE_MODEL_URLS): # BG Remove can sometimes take no image if API supports it
            return jsonify({"error": f"No image file provided for {request_type_name}"}), 400
    
    if image_file and image_file.filename == '':
         return jsonify({"error": f"No image selected for {request_type_name}"}), 400

    initial_request_params = {k: v for k, v in request.form.items()}
    safety_level = request.form.get('safety_level', 'default')

    # Find the model URL from the provided dictionaries
    selected_model_url = None
    if isinstance(relevant_model_dicts, dict): # Single dictionary provided
        relevant_model_dicts = [relevant_model_dicts]
    
    for model_dict in relevant_model_dicts:
        if model_id in model_dict:
            selected_model_url = model_dict[model_id]
            break

    if not selected_model_url: # Fallback search in all known non-text image/video dicts
        for fallback_model_sources_list in [IMG_EDIT_MODEL_URLS, VIDEO_MODEL_URLS, TXT2IMG_MODEL_URLS]: # Wider search
            if model_id in fallback_model_sources_list:
                selected_model_url = fallback_model_sources_list[model_id]
                break

    if not selected_model_url:
        return jsonify({"error": f"Invalid {request_type_name} model: {model_id}"}), 400

    fal_payload = {}
    if image_file:
        try:
            image_data_url = f"data:{image_file.mimetype};base64,{base64.b64encode(image_file.read()).decode('utf-8')}"
            # Determine the correct key for the image URL based on model type or specific model ID needs
            if model_id == "fal-ai/ip-adapter-faceid-plus-lora": # Example of model-specific key
                fal_payload["face_image_url"] = image_data_url
            elif "image-to-video" in model_id or "elements" in model_id : # Common for video
                 fal_payload["image_url"] = image_data_url
            else: # Default for most image editing
                fal_payload["image_url"] = image_data_url
        except Exception as e:
            app.logger.error(f"Error processing image for {request_type_name}: {e}")
            return jsonify({"error": "Could not process image file."}), 500

    if request_type_name == "inpaint":
        fal_payload["mask_url"] = request.form.get('mask_image_data_url')
        if not fal_payload["mask_url"]: return jsonify({"error": "Mask is required for inpaint."}), 400
        # Ensure original image is named correctly for inpainting models if not using generic 'image_url'
        if "image_url" in fal_payload and model_id in INPAINT_MODEL_URLS: # Or specific inpaint model IDs
            fal_payload["original_image_url"] = fal_payload.pop("image_url")


    # Add other relevant parameters from form to fal_payload
    # This is now more generic.
    for key, value in request.form.items():
        if key in ['model_id', 'safety_level', 'mask_image_data_url', 'image', 'original_image'] or key in fal_payload:
            continue # Already handled or not for FAL payload / already set by file processing

        # Attempt to convert to numeric if possible, otherwise keep as string
        try:
            if '.' in value:
                fal_payload[key] = float(value)
            else:
                fal_payload[key] = int(value)
        except ValueError:
            fal_payload[key] = value

    # Handle array_of_files, e.g., 'input_image_urls' for multi-image models
    # This assumes client sends multiple files under a key like 'input_image_urls' (matching schema)
    # or a JSON stringified array of data URLs under a field like 'input_image_urls_json_array'
    
    # Example for direct multiple file uploads under one key (e.g., 'input_image_urls')
    # The frontend script.js was modified to append multiple files under the same key for 'array_of_files'
    # Check if any schema parameter expects an array of files
    # This is a simplified check; a more robust way might involve inspecting model schema
    multi_file_param_names = ["input_image_urls", "image_urls"] # Add other potential names for multi-file inputs
    # This section handles parameters that are expected to be an array of files,
    # such as 'input_image_urls' for models that take multiple images.
    # It uses request.files.getlist() to get all files associated with the parameter name.
    # Each file is then converted to a base64 data URL and stored as a list in fal_payload.
    for param_name in multi_file_param_names:
        if param_name in request.files:
            uploaded_files = request.files.getlist(param_name)
            if uploaded_files and uploaded_files[0].filename: # Check if list not empty and first file has name
                data_urls = []
                for file_item in uploaded_files:
                    try:
                        data_urls.append(f"data:{file_item.mimetype};base64,{base64.b64encode(file_item.read()).decode('utf-8')}")
                    except Exception as e:
                        app.logger.error(f"Error processing file {file_item.filename} for {param_name}: {e}")
                        # Decide if to error out or just skip this file
                if data_urls:
                    fal_payload[param_name] = data_urls
                    app.logger.info(f"Processed {len(data_urls)} files for parameter '{param_name}' into data URLs.")
                    # Remove single image_url if multi-image is primary for this model type (e.g. some Kling elements)
                    if model_id.startswith("fal-ai/kling-video") and param_name == "input_image_urls":
                        fal_payload.pop("image_url", None)


    # Filter out None values from payload that might have been added if form field was empty
    fal_payload = {k:v for k,v in fal_payload.items() if v is not None and (isinstance(v, bool) or v != '')}


    # Add safety parameters
    for prefix, param_name in MODEL_SAFETY_PARAMS.items():
        if model_id.startswith(prefix):
            if param_name == "safety_tolerance":
                if safety_level == "none": pass
                elif safety_level == "strict": fal_payload[param_name] = "1"
                else: fal_payload[param_name] = "2"
            elif param_name == "enable_safety_checker":
                if safety_level == "none": fal_payload[param_name] = False
                else: fal_payload[param_name] = True
            break
    
    log_payload = {k: v[:100]+"..." if isinstance(v, str) and (k.endswith("_url") or k.endswith("DataUrl")) and len(v)>100 else v for k,v in fal_payload.items()}
    app.logger.info(f"Sending {request_type_name} payload to {selected_model_url}: {log_payload}")
    headers = {"Authorization": f"Key {fal_api_key}", "Content-Type": "application/json", "Accept": "application/json"}
    
    response = requests.post(selected_model_url, json=fal_payload, headers=headers)
    response.raise_for_status()
    response_data = response.json()
    app.logger.debug(f"Initial FAL {request_type_name} response: {response_data}")

    # Handle direct completion
    if response_data.get('status') == 'COMPLETED':
        output_content = extract_output_content(response_data.get('output'))
        if output_content["url"]:
            final_response = {"params": initial_request_params}
            if output_content["type"] == "video":
                final_response["video_url"] = output_content["url"]
            else:
                final_response["image_url"] = output_content["url"]
            return jsonify(final_response)

    status_url = response_data.get('status_url')
    if not status_url:
        return jsonify({"error": f"No status_url from FAL for {request_type_name}", "details": response_data}), 500

    MAX_RETRIES, RETRY_INTERVAL = (60, 5) # Unified polling for all types, can be long
    for i in range(MAX_RETRIES):
        app.logger.info(f"Polling {request_type_name} attempt {i+1}/{MAX_RETRIES} for URL: {status_url}")
        poll_response = requests.get(status_url, headers=headers)
        poll_response.raise_for_status()
        poll_data = poll_response.json()
        status = poll_data.get('status')
        app.logger.debug(f"{request_type_name} polling status: {status}, Data: {poll_data}")

        if status == 'COMPLETED':
            output_content = extract_output_content(poll_data.get('output'))
            if output_content["url"]:
                final_response = {"params": initial_request_params}
                if output_content["type"] == "video":
                    final_response["video_url"] = output_content["url"]
                else:
                    final_response["image_url"] = output_content["url"]
                return jsonify(final_response)
            return jsonify({"error": f"Content URL not found in {request_type_name} completed response", "details": poll_data}), 500
        elif status == 'FAILED':
            return jsonify({"error": f"{request_type_name} failed on FAL", "details": poll_data.get('error', poll_data.get('detail', poll_data))}), 500
        elif status in ['IN_PROGRESS', 'QUEUED', 'SUBMITTED']:
            time.sleep(RETRY_INTERVAL)
        else:
            if i > MAX_RETRIES * 0.75: return jsonify({"error": f"Unknown or stalled FAL status for {request_type_name}: {status}", "details": poll_data}), 500
            time.sleep(RETRY_INTERVAL)
            
    return jsonify({"error": f"Polling timed out for {request_type_name}"}), 500


@app.route('/api/image_to_image', methods=['POST'])
def api_image_to_image():
    try:
        # Pass relevant dictionaries for image-to-image, could include editing models
        # and specific video models that take an image input.
        relevant_dicts = [IMG_EDIT_MODEL_URLS, VIDEO_MODEL_URLS]
        return process_common_image_request("image_to_image", relevant_dicts)
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if hasattr(e.response, 'json') and callable(e.response.json) else e.response.text
        return jsonify({"error": f"FAL API Error (Img2Img): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (Img2Img): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/image_to_image: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (Img2Img)."}), 500

@app.route('/api/inpaint', methods=['POST'])
def api_inpaint():
    try:
        # Inpaint models are within IMG_EDIT_MODEL_URLS
        return process_common_image_request("inpaint", [IMG_EDIT_MODEL_URLS])
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if hasattr(e.response, 'json') and callable(e.response.json) else e.response.text
        return jsonify({"error": f"FAL API Error (Inpaint): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (Inpaint): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/inpaint: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (Inpaint)."}), 500

@app.route('/api/upscale', methods=['POST'])
def api_upscale():
    try:
        # Upscale models are within IMG_EDIT_MODEL_URLS
        return process_common_image_request("upscale", [IMG_EDIT_MODEL_URLS])
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if hasattr(e.response, 'json') and callable(e.response.json) else e.response.text
        return jsonify({"error": f"FAL API Error (Upscale): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (Upscale): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/upscale: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (Upscale)."}), 500

@app.route('/api/remove_background', methods=['POST'])
def api_remove_background():
    try:
        # Background removal models are within IMG_EDIT_MODEL_URLS
        return process_common_image_request("remove_background", [IMG_EDIT_MODEL_URLS])
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if hasattr(e.response, 'json') and callable(e.response.json) else e.response.text
        return jsonify({"error": f"FAL API Error (BG Remove): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (BG Remove): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/remove_background: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (BG Remove)."}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

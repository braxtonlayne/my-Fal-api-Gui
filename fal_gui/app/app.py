from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import requests
import time
import os
import base64

app = Flask(__name__)
# IMPORTANT: Change this secret key for production!
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'super_secret_key_for_dev_change_me')

# Dictionary to map model IDs from frontend to actual FAL API URLs
MODEL_URLS = {
    "fal-ai/fast-sdxl": "https://fal.ai/api/fast-sdxl/run",
    "fal-ai/sdxl": "https://fal.ai/api/sdxl/run",
    "fal-ai/fast-turbo-diffusion": "https://fal.ai/api/fast-turbo-diffusion/run",
    "fal-ai/ip-adapter-faceid-plus-lora": "https://fal.ai/api/ip-adapter-faceid-plus-lora/run",
}

IMG2IMG_MODEL_URLS = {
    "fal-ai/sdxl-i2i-placeholder": "https://fal.ai/api/sdxl-img2img-placeholder/run",
    "fal-ai/ip-adapter-faceid-plus-lora": "https://fal.ai/api/ip-adapter-faceid-plus-lora/run",
}

INPAINT_MODEL_URLS = {
    "fal-ai/sdxl-inpainting-placeholder": "https://fal.ai/api/sdxl-inpainting-placeholder/run",
    "fal-ai/stable-diffusion-v1-5-inpainting": "https://fal.ai/api/stable-diffusion-v1-5-inpainting/run",
}

UPSCALE_MODEL_URLS = {
    "fal-ai/esrgan-placeholder": "https://fal.ai/api/esrgan/run",
    "fal-ai/real-esrgan-animevideo": "https://fal.ai/api/real-esrgan-animevideo/run",
    "fal-ai/swinir": "https://fal.ai/api/swinir/run",
}

BG_REMOVE_MODEL_URLS = {
    "fal-ai/transparent-background-placeholder": "https://fal.ai/api/transparent-background/run",
    "fal-ai/remove-background": "https://fal.ai/api/remove-background/run",
}


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
        # Store initial request params to return them later with the result
        initial_request_params = data.copy() # Make a copy to avoid modification issues

        prompt = data.get('prompt')
        model_id = data.get('model_id', "fal-ai/fast-sdxl")

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        selected_model_url = MODEL_URLS.get(model_id)
        if not selected_model_url:
            return jsonify({"error": f"Invalid model selected: {model_id}"}), 400

        fal_payload = {k: v for k, v in data.items() if k not in ['model_id'] and v is not None} # Filter out nulls for FAL

        app.logger.info(f"Sending payload to {selected_model_url}: {fal_payload}")
        headers = {"Authorization": f"Key {fal_api_key}", "Content-Type": "application/json"}
        response = requests.post(selected_model_url, json=fal_payload, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        app.logger.debug(f"Initial FAL response: {response_data}")

        if response_data.get('status') == 'COMPLETED' and response_data.get('output') and isinstance(response_data['output'], dict) and response_data['output'].get('images'):
            image_url = response_data['output']['images'][0].get('url')
            if image_url:
                return jsonify({"image_url": image_url, "params": initial_request_params})

        status_url = response_data.get('status_url')
        if not status_url:
            return jsonify({"error": "Failed to get status_url or direct result from FAL API", "details": response_data}), 500

        MAX_RETRIES, RETRY_INTERVAL = 30, 3
        for i in range(MAX_RETRIES):
            # (Polling logic as before)
            app.logger.info(f"Polling attempt {i+1}/{MAX_RETRIES} for URL: {status_url}")
            poll_response = requests.get(status_url, headers=headers)
            poll_response.raise_for_status()
            poll_data = poll_response.json()
            status = poll_data.get('status')
            app.logger.debug(f"Polling status: {status}, Data: {poll_data}")

            if status == 'COMPLETED':
                if poll_data.get('output') and isinstance(poll_data['output'], dict) and poll_data['output'].get('images'):
                    image_url = poll_data['output']['images'][0].get('url')
                    if image_url:
                        return jsonify({"image_url": image_url, "params": initial_request_params})
                return jsonify({"error": "Image URL not found in completed response", "details": poll_data}), 500
            elif status == 'FAILED':
                return jsonify({"error": "Image generation failed on FAL", "details": poll_data.get('error') or poll_data.get('detail') or poll_data}), 500
            elif status in ['IN_PROGRESS', 'QUEUED', 'SUBMITTED']:
                time.sleep(RETRY_INTERVAL)
            else:
                if i > MAX_RETRIES // 2: return jsonify({"error": f"Unknown FAL status: {status}", "details": poll_data}), 500
                time.sleep(RETRY_INTERVAL)

        return jsonify({"error": "Polling timed out waiting for FAL response"}), 500

    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if e.response.content else e.response.text
        return jsonify({"error": f"FAL API Error: {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error: {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/generate: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred."}), 500


def process_common_image_request(request_type_name, model_dict):
    fal_api_key = session.get('FAL_API_KEY')
    if not fal_api_key:
        return jsonify({"error": "API Key not set."}), 401

    if 'image' not in request.files and request_type_name not in ["inpaint"]: # Inpaint has original_image
         if 'original_image' not in request.files and request_type_name == "inpaint":
            return jsonify({"error": f"No image file provided for {request_type_name}"}), 400

    image_file_key = 'image'
    if request_type_name == "inpaint" and 'original_image' in request.files:
        image_file_key = 'original_image'

    image_file = request.files.get(image_file_key)

    if not image_file or image_file.filename == '':
        return jsonify({"error": f"No image selected for {request_type_name}"}), 400

    # Build initial_request_params from form data
    initial_request_params = {k: v for k, v in request.form.items()}
    model_id = request.form.get('model_id')

    selected_model_url = model_dict.get(model_id)
    if not selected_model_url: # Fallback for versatile models like IP-Adapter
        selected_model_url = MODEL_URLS.get(model_id) or IMG2IMG_MODEL_URLS.get(model_id)
        if not selected_model_url:
            return jsonify({"error": f"Invalid {request_type_name} model: {model_id}"}), 400

    try:
        image_data_url = f"data:{image_file.mimetype};base64,{base64.b64encode(image_file.read()).decode('utf-8')}"
    except Exception as e:
        app.logger.error(f"Error processing image for {request_type_name}: {e}")
        return jsonify({"error": "Could not process image file."}), 500

    fal_payload = {"image_url": image_data_url}
    if request_type_name == "inpaint":
        fal_payload["mask_url"] = request.form.get('mask_image_data_url')
        if not fal_payload["mask_url"]: return jsonify({"error": "Mask is required for inpaint."}),400

    # Add other relevant parameters from form to fal_payload, converting types as needed
    for key in ['prompt', 'strength', 'seed', 'guidance_scale', 'num_inference_steps']:
        if key in request.form:
            value = request.form.get(key)
            try:
                if key in ['strength', 'guidance_scale']: fal_payload[key] = float(value)
                elif key in ['seed', 'num_inference_steps']: fal_payload[key] = int(value)
                else: fal_payload[key] = value
            except ValueError:
                return jsonify({"error": f"Invalid value for {key}"}), 400

    # Model-specific payload adjustments (example for IP-Adapter)
    if model_id == "fal-ai/ip-adapter-faceid-plus-lora" and request_type_name == "image_to_image":
        fal_payload.pop("image_url", None)
        fal_payload["face_image_url"] = image_data_url

    log_payload = {k: v[:100]+"..." if isinstance(v, str) and k.endswith("_url") and len(v)>100 else v for k,v in fal_payload.items()}
    app.logger.info(f"Sending {request_type_name} payload to {selected_model_url}: {log_payload}")
    headers = {"Authorization": f"Key {fal_api_key}", "Content-Type": "application/json", "Accept": "application/json"}

    response = requests.post(selected_model_url, json=fal_payload, headers=headers)
    response.raise_for_status()
    response_data = response.json()
    app.logger.debug(f"Initial FAL {request_type_name} response: {response_data}")

    # Handle direct completion
    completed_output = response_data.get('output')
    image_url_found = None
    if response_data.get('status') == 'COMPLETED' and completed_output:
        if isinstance(completed_output, list) and len(completed_output) > 0 and isinstance(completed_output[0], dict) and completed_output[0].get('url'):
            image_url_found = completed_output[0]['url']
        elif isinstance(completed_output, dict): # Covers standard output.images and direct image_url for bg_remove
            image_url_found = completed_output.get('image_url') or (completed_output.get('images')[0].get('url') if completed_output.get('images') else None)
        elif isinstance(completed_output, str) and completed_output.startswith("http"): # Direct URL (upscalers)
             image_url_found = completed_output
        if image_url_found:
            return jsonify({"image_url": image_url_found, "params": initial_request_params})

    status_url = response_data.get('status_url')
    if not status_url:
        return jsonify({"error": f"No status_url from FAL for {request_type_name}", "details": response_data}), 500

    MAX_RETRIES, RETRY_INTERVAL = (40, 4) if request_type_name in ["image_to_image", "inpaint"] else (30,3)
    for i in range(MAX_RETRIES):
        # (Polling logic as before)
        app.logger.info(f"Polling {request_type_name} attempt {i+1}/{MAX_RETRIES} for URL: {status_url}")
        poll_response = requests.get(status_url, headers=headers)
        poll_response.raise_for_status()
        poll_data = poll_response.json()
        status = poll_data.get('status')
        app.logger.debug(f"{request_type_name} polling status: {status}")

        if status == 'COMPLETED':
            completed_output = poll_data.get('output')
            image_url_found = None
            if isinstance(completed_output, list) and len(completed_output) > 0 and isinstance(completed_output[0], dict) and completed_output[0].get('url'):
                image_url_found = completed_output[0]['url']
            elif isinstance(completed_output, dict):
                image_url_found = completed_output.get('image_url') or (completed_output.get('images')[0].get('url') if completed_output.get('images') else None)
            elif isinstance(completed_output, str) and completed_output.startswith("http"):
                 image_url_found = completed_output
            if image_url_found:
                return jsonify({"image_url": image_url_found, "params": initial_request_params})
            return jsonify({"error": f"Image URL not found in {request_type_name} completed response", "details": poll_data}), 500
        elif status == 'FAILED':
            return jsonify({"error": f"{request_type_name} failed on FAL", "details": poll_data.get('error') or poll_data.get('detail') or poll_data}), 500
        elif status in ['IN_PROGRESS', 'QUEUED', 'SUBMITTED']:
            time.sleep(RETRY_INTERVAL)
        else:
            if i > MAX_RETRIES // 2: return jsonify({"error": f"Unknown FAL status for {request_type_name}: {status}", "details": poll_data}), 500
            time.sleep(RETRY_INTERVAL)

    return jsonify({"error": f"Polling timed out for {request_type_name}"}), 500


@app.route('/api/image_to_image', methods=['POST'])
def api_image_to_image():
    try:
        return process_common_image_request("image_to_image", IMG2IMG_MODEL_URLS)
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if e.response.content else e.response.text
        return jsonify({"error": f"FAL API Error (Img2Img): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (Img2Img): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/image_to_image: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (Img2Img)."}), 500

@app.route('/api/inpaint', methods=['POST'])
def api_inpaint():
    try:
        return process_common_image_request("inpaint", INPAINT_MODEL_URLS)
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if e.response.content else e.response.text
        return jsonify({"error": f"FAL API Error (Inpaint): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (Inpaint): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/inpaint: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (Inpaint)."}), 500

@app.route('/api/upscale', methods=['POST'])
def api_upscale():
    try:
        return process_common_image_request("upscale", UPSCALE_MODEL_URLS)
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if e.response.content else e.response.text
        return jsonify({"error": f"FAL API Error (Upscale): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (Upscale): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/upscale: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (Upscale)."}), 500

@app.route('/api/remove_background', methods=['POST'])
def api_remove_background():
    try:
        return process_common_image_request("remove_background", BG_REMOVE_MODEL_URLS)
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json() if e.response.content else e.response.text
        return jsonify({"error": f"FAL API Error (BG Remove): {e.response.status_code}", "details": error_details}), e.response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Network error (BG Remove): {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error in /api/remove_background: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected server error occurred (BG Remove)."}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearApiKeyButton = document.getElementById('clearApiKey');
    const apiKeyStatusArea = document.getElementById('apiKeyStatus');
    
    // Mode selection
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const txt2imgControls = document.getElementById('txt2imgControls');
    const img2imgControls = document.getElementById('img2imgControls');
    const inpaintControls = document.getElementById('inpaintControls');
    const upscaleControls = document.getElementById('upscaleControls');
    const bgRemoveControls = document.getElementById('bgRemoveControls');
    const videoControls = document.getElementById('videoControls');

    // Dynamic control containers
    const dynamicContainers = {
        txt2img: document.getElementById('dynamicTxt2ImgControlsContainer'),
        img2img: document.getElementById('dynamicImg2ImgControlsContainer'),
        inpaint: document.getElementById('dynamicInpaintControlsContainer'),
        upscale: document.getElementById('dynamicUpscaleControlsContainer'),
        bgremove: document.getElementById('dynamicBgRemoveControlsContainer'),
        video: document.getElementById('dynamicVideoControlsContainer')
    };

    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');

    // Model Selectors (references for all modes)
    const modelSelectElements = {
        txt2img: document.getElementById('modelSelection'),
        img2img: document.getElementById('img2imgModelSelection'),
        inpaint: document.getElementById('inpaintModelSelection'),
        upscale: document.getElementById('upscaleModelSelection'),
        bgremove: document.getElementById('bgRemoveModelSelection'),
        video: document.getElementById('videoModelSelection')
    };

    // Generate Buttons (references for all modes)
    const generateButton = document.getElementById('generateButton');
    const generateImg2ImgButton = document.getElementById('generateImg2ImgButton');
    const generateInpaintButton = document.getElementById('generateInpaintButton');
    const generateUpscaleButton = document.getElementById('generateUpscaleButton');
    const generateBgRemoveButton = document.getElementById('generateBgRemoveButton');
    const generateVideoButton = document.getElementById('generateVideoButton');

    // Inpainting specific (some static elements might remain if they control the canvas directly)
    const inpaintImageUpload = document.getElementById('inpaintImageUpload'); // Static canvas loader
    const imageCanvas = document.getElementById('imageCanvas');
    const maskCanvas = document.getElementById('maskCanvas');
    const brushSizeInput = document.getElementById('brushSize');
    const brushSizeValueSpan = document.getElementById('brushSizeValue');
    const clearMaskButton = document.getElementById('clearMaskButton');
    let imageCtx, maskCtx;
    let isDrawing = false;
    let lastX, lastY;
    let currentBrushSize = brushSizeInput ? parseInt(brushSizeInput.value) : 30;
    let originalInpaintImageForUpload = null; // File object for the image on canvas

    if (imageCanvas) imageCtx = imageCanvas.getContext('2d');
    if (maskCanvas) maskCtx = maskCanvas.getContext('2d');

    // General UI elements
    const generalStatusArea = document.getElementById('statusArea');
    const imageResultArea = document.getElementById('imageResultArea'); 
    
    let currentGenerationParams = {}; 
    let currentMode = 'txt2img';

    // History
    let generationHistory = [];
    const HISTORY_STORAGE_KEY = 'falGenerationHistory';
    const historyGallery = document.getElementById('historyGallery');
    const clearHistoryButton = document.getElementById('clearHistoryButton');

    // --- Random Seed Buttons (kept from original, assuming they target dynamic fields if applicable) ---
    // These might need adjustment if the seed input IDs change with dynamic rendering.
    // For now, assuming `param-${mode}-seed` will be the ID for dynamic seed inputs.
    // Or, they could be removed if each dynamic form includes its own random button next to seed.
    // For simplicity, I'll remove the old specific random seed buttons.
    // Random seed functionality can be part of the dynamic control generation if desired.

    // --- Mode Switching Logic ---
    const controlSections = {
        txt2img: txt2imgControls,
        img2img: img2imgControls,
        inpaint: inpaintControls,
        upscale: upscaleControls,
        bgremove: bgRemoveControls,
        video: videoControls
    };

    function displayControlsForMode(mode) {
        currentMode = mode;
        Object.values(controlSections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        if (controlSections[mode]) {
            controlSections[mode].style.display = 'block';
            generalStatusArea.textContent = `${mode.toUpperCase()} mode selected.`;

            const currentModelSelect = modelSelectElements[mode];
            if (currentModelSelect && currentModelSelect.options.length > 0) {
                renderModelControls(currentModelSelect.value || currentModelSelect.options[0].value, mode);
            } else if (currentModelSelect) {
                 const container = getDynamicControlsContainer(mode);
                 if (container) container.innerHTML = '<p>No models loaded for this category. Check schemas or population logic.</p>';
            } else {
                console.warn(`Model select element for mode "${mode}" not found.`);
                const container = getDynamicControlsContainer(mode);
                if (container) container.innerHTML = '<p>Controls for this mode are not fully set up (missing model selector).</p>';
            }
        } else {
            generalStatusArea.textContent = `Mode ${mode.toUpperCase()} selected. Control section not found.`;
            console.error(`Control section for mode "${mode}" not found.`);
        }
        if(imageResultArea) imageResultArea.innerHTML = '';
        generalStatusArea.style.color = 'inherit';
    }

    modeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            displayControlsForMode(event.target.value);
        });
    });
    
    for (const modeKey in modelSelectElements) {
        const selectElement = modelSelectElements[modeKey];
        if (selectElement) {
            selectElement.addEventListener('change', (event) => {
                if (currentMode === modeKey) {
                    renderModelControls(event.target.value, modeKey);
                }
            });
        }
    }

    // --- Inpainting Canvas (Static parts of Inpaint UI) ---
    if (inpaintImageUpload) {
        inpaintImageUpload.addEventListener('change', function(event) { // Base image for inpainting
            if (event.target.files && event.target.files[0]) {
                originalInpaintImageForUpload = event.target.files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        imageCanvas.width = 512; imageCanvas.height = 512;
                        maskCanvas.width = 512; maskCanvas.height = 512;
                        const hRatio = imageCanvas.width / img.width;
                        const vRatio = imageCanvas.height / img.height;
                        const ratio = Math.min(hRatio, vRatio);
                        const centerShift_x = (imageCanvas.width - img.width * ratio) / 2;
                        const centerShift_y = (imageCanvas.height - img.height * ratio) / 2;
                        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                        imageCtx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                        clearMask();
                    }
                    img.src = e.target.result;
                }
                reader.readAsDataURL(event.target.files[0]);
            }
        });
    }
    if (brushSizeInput) {
        brushSizeInput.addEventListener('input', (event) => {
            currentBrushSize = parseInt(event.target.value);
            if(brushSizeValueSpan) brushSizeValueSpan.textContent = `${currentBrushSize}px`;
        });
    }
    function drawOnMask(e) {
        if (!isDrawing || !maskCtx) return;
        maskCtx.strokeStyle = 'black';
        maskCtx.lineWidth = currentBrushSize;
        maskCtx.lineCap = 'round'; maskCtx.lineJoin = 'round';
        const rect = maskCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        maskCtx.lineTo(x, y); maskCtx.stroke();
        maskCtx.beginPath(); maskCtx.moveTo(x, y);
    }
    if (maskCanvas) {
        maskCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = maskCanvas.getBoundingClientRect();
            lastX = e.clientX - rect.left; lastY = e.clientY - rect.top;
            maskCtx.beginPath(); maskCtx.moveTo(lastX, lastY);
        });
        maskCanvas.addEventListener('mousemove', drawOnMask);
        maskCanvas.addEventListener('mouseup', () => isDrawing = false);
        maskCanvas.addEventListener('mouseout', () => isDrawing = false);
    }
    function clearMask() { if (maskCtx) maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height); }
    if (clearMaskButton) clearMaskButton.addEventListener('click', clearMask);

    // --- API Key Management ---
    const updateApiKeyUI = (isSet, message = '') => {
        if (isSet) {
            apiKeyInput.value = '********'; // Mask the key
            apiKeyInput.disabled = true;
            saveApiKeyButton.disabled = true;
            apiKeyStatusArea.textContent = message || 'API Key is set on the server.';
            apiKeyStatusArea.style.color = 'green';
        } else {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'Enter your FAL API Key';
            apiKeyInput.disabled = false;
            saveApiKeyButton.disabled = false;
            apiKeyStatusArea.textContent = message || 'API Key is not set. Please save your key.';
            apiKeyStatusArea.style.color = 'orange';
        }
    };

    const checkApiKeyStatus = async () => {
        try {
            const response = await fetch('/api/get_api_key_status');
            const data = await response.json();
            updateApiKeyUI(data.is_set);
            if (data.is_set) {
                 generalStatusArea.textContent = 'Ready to generate.'; // Simplified message
                 generalStatusArea.style.color = 'blue';
            } else {
                generalStatusArea.textContent = 'Please set your API Key before generating.'; // Simplified message
                generalStatusArea.style.color = 'red';
            }
        } catch (error) {
            console.error('Error checking API key status:', error);
            apiKeyStatusArea.textContent = 'Could not verify API Key status.';
            apiKeyStatusArea.style.color = 'red';
            generalStatusArea.textContent = 'Error checking API key status. Backend might be down.';
            generalStatusArea.style.color = 'red';
        }
    };

    if (saveApiKeyButton) {
        saveApiKeyButton.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey || apiKey === '********') { // Prevent saving placeholder
                apiKeyStatusArea.textContent = 'Please enter a valid API Key to save.';
                apiKeyStatusArea.style.color = 'red';
                return;
            }

            try {
                const response = await fetch('/api/save_api_key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ api_key: apiKey }),
                });
                const result = await response.json();
                if (response.ok) {
                    updateApiKeyUI(true, result.message);
                    generalStatusArea.textContent = 'API Key saved. Ready to generate.'; // Simplified message
                    generalStatusArea.style.color = 'green';
                } else {
                    updateApiKeyUI(false, `Error: ${result.error || 'Could not save API Key'}`);
                }
            } catch (error) {
                console.error('Error saving API key:', error);
                updateApiKeyUI(false, `Network error: ${error.message}`);
            }
        });
    }

    if (clearApiKeyButton) {
        clearApiKeyButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/clear_api_key', { method: 'POST' });
                const result = await response.json();
                if (response.ok) {
                    updateApiKeyUI(false, result.message);
                     generalStatusArea.textContent = 'API Key cleared. Please set your API Key to generate.'; // Simplified message
                     generalStatusArea.style.color = 'orange';
                } else {
                    apiKeyStatusArea.textContent = `Error: ${result.error || 'Could not clear API Key'}`;
                    apiKeyStatusArea.style.color = 'red';
                }
            } catch (error) {
                console.error('Error clearing API key:', error);
                apiKeyStatusArea.textContent = `Network error: ${error.message}`;
                apiKeyStatusArea.style.color = 'red';
            }
        });
    }

    localStorage.removeItem('falApiKey'); // Clear old key storage (Confirming it's present)

    // --- Dynamic Control Rendering & Population ---
    // Populates model selection dropdowns based on MODEL_SCHEMAS.
    function populateModelSelectors() {
        if (typeof MODEL_SCHEMAS === 'undefined') {
            console.error("MODEL_SCHEMAS not loaded."); return;
        }
        Object.values(modelSelectElements).forEach(select => { if (select) select.innerHTML = ''; });
        for (const modelId in MODEL_SCHEMAS) {
            const schema = MODEL_SCHEMAS[modelId];
            const option = document.createElement('option');
            option.value = modelId;
            const displayName = schema.name || modelId;
            const descSnippet = schema.description ? `(${schema.description.substring(0,40)}...)` : '';
            option.textContent = `${displayName} ${descSnippet}`;

            if (modelId.includes('/kling-video/') || modelId.includes('/framepack/')) {
                if (modelSelectElements.video) modelSelectElements.video.appendChild(option.cloneNode(true));
            } else if (modelId.includes('/ideogram/v3/edit') || modelId.includes('inpaint')) {
                if (modelSelectElements.inpaint) modelSelectElements.inpaint.appendChild(option.cloneNode(true));
            } else if (modelId.includes('upscal') || modelId.includes('esrgan') || modelId.includes('swinir')) {
                if (modelSelectElements.upscale) modelSelectElements.upscale.appendChild(option.cloneNode(true));
            } else if (modelId.includes('background') || modelId.includes('ideogram/v3/replace-background')) {
                if (modelSelectElements.bgremove) modelSelectElements.bgremove.appendChild(option.cloneNode(true));
            } else if (modelId.includes('img2img') || modelId.includes('image-to-image') || modelId.includes('i2i') ||
                       modelId.includes('remix') || modelId.includes('ip-adapter') ||
                       (modelId.includes('flux-pro/kontext') && !modelId.includes('text-to-image')) ||
                       modelId.includes('bagel/edit')) {
                 if (modelSelectElements.img2img) modelSelectElements.img2img.appendChild(option.cloneNode(true));
            } else if (modelId.includes('text-to-image') || modelId.includes('sdxl') || modelId.includes('turbo') ||
                       modelId.includes('imagen4') || (modelId.includes('bagel') && !modelId.includes('edit')) ||
                       modelId.includes('dreamo') || (modelId.includes('ideogram/v3') && !modelId.includes('/edit') && !modelId.includes('/reframe') && !modelId.includes('/remix') && !modelId.includes('/replace-background'))) {
                if (modelSelectElements.txt2img) modelSelectElements.txt2img.appendChild(option.cloneNode(true));
            } else {
                if (modelSelectElements.txt2img) modelSelectElements.txt2img.appendChild(option.cloneNode(true));
            }
        }
    }
    // Generates UI controls for a given model within the specified mode's container.
    function renderModelControls(modelId, mode) {
        const container = getDynamicControlsContainer(mode);
        if (!container) { console.error(`Dynamic container for mode ${mode} not found.`); return; }
        container.innerHTML = '';
        if (typeof MODEL_SCHEMAS === 'undefined' || !MODEL_SCHEMAS || !MODEL_SCHEMAS[modelId] || !MODEL_SCHEMAS[modelId].parameters) {
            container.innerHTML = `<p style="color: orange;">Schema not found for model: ${modelId}.</p>`; return;
        }
        const params = MODEL_SCHEMAS[modelId].parameters;
        params.forEach(param => {
            const paramDiv = document.createElement('div'); paramDiv.className = 'param-control-item';
            const label = document.createElement('label');
            label.htmlFor = `param-${mode}-${param.name}`;
            label.textContent = `${param.label || param.name}:`;
            if (param.required) { const rs = document.createElement('span'); rs.textContent = ' *'; rs.style.color = 'red'; label.appendChild(rs); }
            paramDiv.appendChild(label);
            let inputElement;
            switch (param.type) {
                case 'enum':
                    inputElement = document.createElement('select');
                    if (param.options && Array.isArray(param.options)) {
                        param.options.forEach(opt => { const o = document.createElement('option'); o.value = opt.value; o.textContent = opt.label || opt.value; inputElement.appendChild(o); });
                    }
                    if (param.defaultValue !== undefined) inputElement.value = param.defaultValue;
                    break;
                case 'boolean':
                    inputElement = document.createElement('input'); inputElement.type = 'checkbox';
                    if (param.defaultValue !== undefined) inputElement.checked = Boolean(param.defaultValue);
                    break;
                case 'integer': case 'float':
                    inputElement = document.createElement('input'); inputElement.type = 'number';
                    if (param.min !== undefined) inputElement.min = param.min;
                    if (param.max !== undefined) inputElement.max = param.max;
                    if (param.step !== undefined) inputElement.step = param.step;
                    if (param.defaultValue !== undefined) inputElement.value = param.defaultValue;
                    break;
                case 'file':
                    inputElement = document.createElement('input'); inputElement.type = 'file';
                    if (param.accept) inputElement.accept = param.accept;
                    if (param.accept && (param.accept.startsWith('image/') || param.accept.startsWith('video/'))) {
                        const pc = document.createElement('div'); pc.className = 'input-file-preview-container';
                        let pe = param.accept.startsWith('image/') ? document.createElement('img') : document.createElement('video');
                        if(pe.tagName === 'VIDEO') { pe.muted = true; pe.autoplay = false; pe.controls = true; }
                        Object.assign(pe.style, {maxWidth: '200px', maxHeight: '150px', display: 'none', marginTop: '5px'});
                        pc.appendChild(pe);
                        inputElement.addEventListener('change', (e) => {
                            if (e.target.files && e.target.files[0]) {
                                const r = new FileReader();
                                r.onload = (re) => { pe.src = re.target.result; pe.style.display = 'block'; if (pe.tagName === 'VIDEO') pe.load(); }
                                r.readAsDataURL(e.target.files[0]);
                            } else { pe.src = '#'; pe.style.display = 'none'; }
                        });
                        paramDiv.appendChild(pc);
                    }
                    break;
                case 'array_of_files':
                    inputElement = document.createElement('input'); inputElement.type = 'file'; inputElement.multiple = true;
                    if (param.accept) inputElement.accept = param.accept;
                    break;
                default: // string or textarea
                    if (param.name.toLowerCase().includes('prompt') || (param.description && param.description.length > 70)) {
                        inputElement = document.createElement('textarea'); inputElement.rows = 3;
                    } else {
                        inputElement = document.createElement('input'); inputElement.type = 'text';
                    }
                    if (param.defaultValue) inputElement.value = param.defaultValue;
            }
            inputElement.id = `param-${mode}-${param.name}`; inputElement.name = param.name;
            if (param.placeholder && inputElement.type !== 'select') inputElement.placeholder = param.placeholder;
            else if (param.description && (inputElement.type === 'text' || inputElement.tagName.toLowerCase() === 'textarea') && !inputElement.placeholder) {
                inputElement.placeholder = param.description.substring(0, 50) + (param.description.length > 50 ? "..." : "");
            }
            paramDiv.appendChild(inputElement);
            if (param.description) { const d = document.createElement('small'); d.textContent = param.description; Object.assign(d.style, {display:'block', color:'#555', marginTop:'2px'}); paramDiv.appendChild(d); }
            container.appendChild(paramDiv);
        });
    }
    function getDynamicControlsContainer(mode) { return dynamicContainers[mode] || null; }

    // --- Global Loading State & Result Display ---
    function setLoadingState(isLoading, message = 'Loading...') {
        if (!loadingOverlay || !loadingMessage) return;

        const allGenerateButtons = [
            generateButton, generateImg2ImgButton, generateInpaintButton,
            generateUpscaleButton, generateBgRemoveButton, generateVideoButton // Added generateVideoButton
        ];

        if (isLoading) {
            loadingMessage.textContent = message;
            loadingOverlay.style.display = 'flex';
            allGenerateButtons.forEach(btn => { if(btn) btn.disabled = true; });
            if(generalStatusArea) generalStatusArea.textContent = message; // Also update status area
            if(generalStatusArea) generalStatusArea.style.color = 'blue';
        } else {
            loadingOverlay.style.display = 'none';
            allGenerateButtons.forEach(btn => { if(btn) btn.disabled = false; });
            // Don't clear generalStatusArea here if it might contain a success/error message
            // If generalStatusArea was purely for loading, you could clear it:
            // if(generalStatusArea && generalStatusArea.textContent === message) generalStatusArea.textContent = '';
        }
    }
    // Updated to handle video_url and contentType
    function displayResultItem(resultData, params, mode, isFromHistory = false) { // resultData is {image_url} or {video_url}
        if (!imageResultArea) return;
        imageResultArea.innerHTML = ''; 
        const item = document.createElement('div'); item.className = 'result-item';
        Object.assign(item.style, { border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: '#fff', width: 'fit-content', maxWidth: '532px' });
        let contentUrl, contentType = 'image';
        if (resultData.video_url) {
            contentUrl = resultData.video_url; contentType = 'video';
            const video = document.createElement('video'); video.src = contentUrl;
            Object.assign(video, { alt: `Generated Video (${params.prompt || 'Processed Content'})`, className: 'result-video', controls: true, autoplay: true, muted: true, loop: true });
            Object.assign(video.style, { maxWidth: '512px', maxHeight: '512px', display: 'block', marginBottom: '10px' });
            item.appendChild(video);
        } else if (resultData.image_url) {
            contentUrl = resultData.image_url; contentType = 'image';
            const img = document.createElement('img'); img.src = contentUrl;
            Object.assign(img, { alt: `Generated Image (${params.prompt || 'Processed Content'})`, className: 'result-image' });
            Object.assign(img.style, { maxWidth: '512px', maxHeight: '512px', display: 'block', marginBottom: '10px' });
            item.appendChild(img);
        } else { return; } /* No URL */
        const paramsDiv = document.createElement('div'); paramsDiv.className = 'result-params';
        Object.assign(paramsDiv.style, { fontSize: '0.9em', marginBottom: '10px' });
        let paramsHTML = `<p><strong>Mode:</strong> <span class="param-mode">${mode}</span></p>`;
        if (params.model_id) paramsHTML += `<p><strong>Model:</strong> <span class="param-model">${params.model_id}</span></p>`;
        if (params.prompt) paramsHTML += `<p><strong>Prompt:</strong> <span class="param-prompt">${params.prompt}</span></p>`;
        // Add other relevant params to display...
        paramsDiv.innerHTML = paramsHTML; item.appendChild(paramsDiv);
        const actionsDiv = document.createElement('div'); actionsDiv.className = 'result-actions';
        Object.assign(actionsDiv.style, { display: 'flex', gap: '10px' });
        const downloadBtn = document.createElement('button'); downloadBtn.className = 'download-btn'; downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = contentUrl;
            let filename = "generated_content";
            if (params.prompt) {
                filename = `${params.prompt.substring(0,30).replace(/\s+/g, '_')}_${params.seed || 'random'}`;
            } else if (params.model_id) {
                filename = `${mode}_${params.model_id.replace(/[\/\s]/g, '_')}`;
            }
            filename += (contentType === 'video' ? '.mp4' : '.png');
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        actionsDiv.appendChild(downloadBtn);

        if (contentType === 'image') { // Only add image-specific actions for images
            ['Use for Img2Img', 'Send to Inpaint', 'Send to Upscale'].forEach(actionText => {
                let targetMode = '';
                if (actionText === 'Use for Img2Img') targetMode = 'img2img';
                else if (actionText === 'Send to Inpaint') targetMode = 'inpaint';
                else if (actionText === 'Send to Upscale') targetMode = 'upscale';

                if (mode === targetMode) return; // Don't show button if already in target mode

                const btn = document.createElement('button'); btn.textContent = actionText;
                btn.onclick = async () => {
                    try {
                        const response = await fetch(contentUrl);
                        const blob = await response.blob();
                        const fileName = `loaded_from_result.${blob.type.split('/')[1] || 'png'}`;
                        const file = new File([blob], fileName, { type: blob.type });

                        displayControlsForMode(targetMode); // Switch mode and render controls

                        // Wait a brief moment for DOM updates after displayControlsForMode
                        await new Promise(resolve => setTimeout(resolve, 100));

                        // If targetMode is 'inpaint', special handling for static canvas
                        if (targetMode === 'inpaint' && inpaintImageUpload) {
                             originalInpaintImageForUpload = file; // Store for direct use by inpaint logic
                             const dataTransfer = new DataTransfer();
                             dataTransfer.items.add(file);
                             inpaintImageUpload.files = dataTransfer.files;
                             const changeEvent = new Event('change', { bubbles: true });
                             inpaintImageUpload.dispatchEvent(changeEvent); // Triggers canvas update
                             if (params.prompt) {
                                const inpaintPromptEl = document.getElementById(`param-inpaint-prompt`);
                                if (inpaintPromptEl) inpaintPromptEl.value = params.prompt;
                             }
                        } else {
                            // Generic dynamic input population for other modes (img2img, upscale)
                            const currentModelSelect = modelSelectElements[targetMode];
                            if (!currentModelSelect || !currentModelSelect.value) {
                                console.error(`Model select for ${targetMode} not found or no model selected.`);
                                generalStatusArea.textContent = `Could not set image for ${targetMode}: model not selected.`;
                                generalStatusArea.style.color = 'red';
                                return;
                            }
                            const selectedModelId = currentModelSelect.value;
                            const modelSchema = MODEL_SCHEMAS[selectedModelId];

                            if (!modelSchema || !modelSchema.parameters) {
                                console.error(`Schema not found for model ${selectedModelId}`);
                                generalStatusArea.textContent = `Could not set image: schema missing for ${selectedModelId}.`;
                                generalStatusArea.style.color = 'red';
                                return;
                            }

                            // Find the primary file input parameter (heuristic)
                            const fileParamInfo = modelSchema.parameters.find(p => p.type === 'file' && (p.name.includes('image') || p.name.includes('init_image') || p.name.includes('file') || p.name.includes('url'))) || modelSchema.parameters.find(p => p.type === 'file');

                            if (fileParamInfo) {
                                const fileInputId = `param-${targetMode}-${fileParamInfo.name}`;
                                const fileInputElement = document.getElementById(fileInputId);
                                if (fileInputElement) {
                                    const dataTransfer = new DataTransfer();
                                    dataTransfer.items.add(file);
                                    fileInputElement.files = dataTransfer.files;
                                    const changeEvent = new Event('change', { bubbles: true });
                                    fileInputElement.dispatchEvent(changeEvent); // Trigger preview
                                } else {
                                    console.error(`File input ${fileInputId} not found for ${targetMode}.`);
                                    generalStatusArea.textContent = `File input not found for ${targetMode}.`;
                                    generalStatusArea.style.color = 'red';
                                }
                                // Carry over prompt if target mode has a prompt input
                                const promptParamInfo = modelSchema.parameters.find(p => p.name === 'prompt');
                                if (params.prompt && promptParamInfo) {
                                    const promptElement = document.getElementById(`param-${targetMode}-prompt`);
                                    if (promptElement) promptElement.value = params.prompt;
                                }
                            } else {
                                console.warn(`No suitable file parameter found for model ${selectedModelId} in ${targetMode} mode.`);
                                generalStatusArea.textContent = `Could not find a file input for ${targetMode} with model ${selectedModelId}.`;
                                generalStatusArea.style.color = 'orange';
                            }
                        }
                        generalStatusArea.textContent = `${actionText.replace("Use for", "Sent to")} mode. Image loaded.`;
                        generalStatusArea.style.color = 'green';

                    } catch (err) {
                        console.error(`Error during "${actionText}":`, err);
                        generalStatusArea.textContent = `Error setting image for ${targetMode}: ${err.message}`;
                        generalStatusArea.style.color = 'red';
                    }
                };
                actionsDiv.appendChild(btn);
            });
        }
        item.appendChild(actionsDiv); imageResultArea.appendChild(item);
        if (!isFromHistory) addToHistory(contentUrl, params, mode, contentType);
    }

    // --- History Functions (Updated) ---
    function addToHistory(itemUrl, params, mode, contentType = 'image') {
        const historyEntry = { id: Date.now().toString(), timestamp: new Date().toISOString(), itemUrl, contentType, params, mode };
        generationHistory.unshift(historyEntry);
        if (generationHistory.length > 50) generationHistory.pop();
        saveHistory(); renderHistoryGallery();
    }
    function renderHistoryGallery() {
        if (!historyGallery) return;
        historyGallery.innerHTML = '';
        if (generationHistory.length === 0) { historyGallery.innerHTML = '<p style="color: #777; font-style: italic;">No generation history yet.</p>'; return; }
        generationHistory.forEach(entry => {
            const item = document.createElement('div'); item.className = 'history-item'; item.dataset.historyId = entry.id;
            Object.assign(item.style, { width: '100px', border: '1px solid #999', padding: '5px', backgroundColor: '#fff', position: 'relative', cursor: 'pointer' });
            let media;
            if (entry.contentType === 'video') {
                media = document.createElement('div'); media.textContent = 'VIDEO';
                Object.assign(media.style, { width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccc', color: '#333', fontSize: '0.8em'});
            } else {
                media = document.createElement('img'); media.src = entry.itemUrl;
                Object.assign(media.style, { width: '100%', height: '100px', objectFit: 'cover' });
            }
            media.alt = `History: ${entry.params.prompt || entry.mode}`; media.style.display = 'block';
            item.appendChild(media);
            item.onclick = () => displayResultItem({ [entry.contentType === 'video' ? 'video_url' : 'image_url']: entry.itemUrl }, entry.params, entry.mode, true);

            const actionsContainer = document.createElement('div');
            Object.assign(actionsContainer.style, { position: 'absolute', top: '2px', right: '2px', display: 'flex', flexDirection: 'column', gap: '2px' });

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = 'X'; deleteBtn.title = "Delete from history";
            Object.assign(deleteBtn.style, { padding: '2px 4px', fontSize: '0.7em' });
            deleteBtn.onclick = (e) => { e.stopPropagation(); deleteHistoryItem(entry.id); };
            actionsContainer.appendChild(deleteBtn);

            const reloadBtn = document.createElement('button');
            reloadBtn.innerHTML = '&#x21BB;'; reloadBtn.title = "Reload parameters";
            Object.assign(reloadBtn.style, { padding: '2px 4px', fontSize: '0.7em' });
            reloadBtn.onclick = (e) => { e.stopPropagation(); reloadParamsFromHistory(entry);};
            actionsContainer.appendChild(reloadBtn);

            item.appendChild(actionsContainer);
            historyGallery.appendChild(item);
        });
    }

    function deleteHistoryItem(historyId) {
        generationHistory = generationHistory.filter(entry => entry.id !== historyId);
        saveHistory();
        renderHistoryGallery();
    }

    function loadHistory() { const s = localStorage.getItem(HISTORY_STORAGE_KEY); if(s) generationHistory = JSON.parse(s); renderHistoryGallery(); }
    function saveHistory() { localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(generationHistory)); }
    if(clearHistoryButton) clearHistoryButton.addEventListener('click', () => { if(confirm("Clear history?")){ generationHistory=[]; saveHistory(); renderHistoryGallery(); generalStatusArea.textContent = "History cleared."; generalStatusArea.style.color="orange";}});

    async function reloadParamsFromHistory(historyEntry) {
        currentMode = historyEntry.mode;
        // Activate the correct radio button for the mode
        const modeRadio = document.querySelector(`input[name="mode"][value="${currentMode}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
        }
        // This will also call renderModelControls for the currently selected model in that mode.
        displayControlsForMode(currentMode);

        // Wait for displayControlsForMode and its renderModelControls to complete
        await new Promise(resolve => setTimeout(resolve, 150));


        const params = historyEntry.params;
        if (params.model_id) {
            const modelSelect = modelSelectElements[currentMode];
            if (modelSelect) {
                modelSelect.value = params.model_id;
                // Explicitly re-render controls for the specific model_id from history,
                // as displayControlsForMode might pick the first model by default.
                renderModelControls(params.model_id, currentMode);
                // Wait again for these specific controls to render
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }

        // Populate dynamic form inputs
        const container = getDynamicControlsContainer(currentMode);
        if (container && MODEL_SCHEMAS && params.model_id && MODEL_SCHEMAS[params.model_id]) {
            MODEL_SCHEMAS[params.model_id].parameters.forEach(paramInfo => {
                const inputElement = container.querySelector(`[name="${paramInfo.name}"]`);
                if (inputElement && params[paramInfo.name] !== undefined) {
                    if (paramInfo.type === 'boolean') {
                        inputElement.checked = Boolean(params[paramInfo.name]);
                    } else if (inputElement.type === 'file') {
                        // Cannot set file input values directly for security reasons.
                        // User must re-select if a file was part of params.
                        // However, if the history item's image is to be used,
                        // the 'Send to X' buttons handle that.
                        console.warn(`Cannot automatically reload file parameter "${paramInfo.name}" from history.`);
                    } else {
                        inputElement.value = params[paramInfo.name];
                    }
                }
            });
        }

        // Display the image/video from history in the result area
        // This also allows using "Send to X" buttons from the reloaded history item
        displayResultItem({ [historyEntry.contentType === 'video' ? 'video_url' : 'image_url']: historyEntry.itemUrl }, historyEntry.params, historyEntry.mode, true);

        generalStatusArea.textContent = `Parameters reloaded from history for ${currentMode} mode. Original content displayed.`;
        generalStatusArea.style.color = 'blue';
    }


    // --- API Call Logic ---
    // Collects data from the dynamically generated form for the current mode and model.
    function gatherParamsFromDynamicForm(mode, modelId) {
        const params = { model_id: modelId };
        const container = getDynamicControlsContainer(mode);
        if (!container) { console.error("Dynamic container not found for mode:", mode); return params; }
        const schema = MODEL_SCHEMAS[modelId];
        if (!schema || !schema.parameters) { console.warn("Schema or parameters not found for model:", modelId); return params; }
        schema.parameters.forEach(paramInfo => {
            const inputElement = container.querySelector(`[name="${paramInfo.name}"]`);
            if (inputElement) {
                if (paramInfo.type === 'file' || paramInfo.type === 'array_of_files') {
                    if (inputElement.files && inputElement.files.length > 0) {
                        params[paramInfo.name] = inputElement.files.length === 1 ? inputElement.files[0] : inputElement.files;
                    }
                } else if (inputElement.type === 'checkbox') {
                    params[paramInfo.name] = inputElement.checked;
                } else if (inputElement.type === 'number' || paramInfo.type === 'integer' || paramInfo.type === 'float') {
                    const val = inputElement.value.trim();
                    if (val) params[paramInfo.name] = paramInfo.type === 'integer' ? parseInt(val) : parseFloat(val);
                } else {
                     const val = inputElement.value.trim();
                     if (val || inputElement.tagName === 'SELECT') params[paramInfo.name] = val;
                }
            }
        });
        // const safetyLevelSetting = document.getElementById('safetyLevelSetting');
        // if (safetyLevelSetting) params.safety_level = safetyLevelSetting.value;
        return params;
    }

    // Generic function for making API requests. Handles FormData/JSON, loading states, and result display.
    async function makeApiCall(endpoint, mode, modelId, additionalFormData = null) {
        const dynamicParams = gatherParamsFromDynamicForm(mode, modelId);
        let requiresFormData = false; let payload;
        const schema = MODEL_SCHEMAS[modelId];
        if (schema && schema.parameters) {
            schema.parameters.forEach(pInfo => {
                if ((pInfo.type === 'file' && dynamicParams[pInfo.name] instanceof File) ||
                    (pInfo.type === 'array_of_files' && dynamicParams[pInfo.name] instanceof FileList && dynamicParams[pInfo.name].length > 0)) {
                    requiresFormData = true;
                }
            });
        }
        if (additionalFormData) { for (const value of additionalFormData.values()) { if (value instanceof File || value instanceof Blob) { requiresFormData = true; break; } } }

        if (requiresFormData) {
            payload = new FormData();
            for (const key in dynamicParams) {
                if (dynamicParams.hasOwnProperty(key)) {
                    if (dynamicParams[key] instanceof FileList) { for (let i = 0; i < dynamicParams[key].length; i++) payload.append(key, dynamicParams[key][i]); }
                    else if (dynamicParams[key] instanceof File) payload.append(key, dynamicParams[key]);
                    else if (dynamicParams[key] !== null && dynamicParams[key] !== undefined) payload.append(key, dynamicParams[key]);
                }
            }
            if (additionalFormData) { for (const [key, value] of additionalFormData.entries()) payload.append(key, value); }
        } else {
            const jsonSafeParams = {};
            for(const key in dynamicParams) { if (!(dynamicParams[key] instanceof File) && !(dynamicParams[key] instanceof FileList)) jsonSafeParams[key] = dynamicParams[key]; }
            payload = JSON.stringify(jsonSafeParams);
        }
        
        const apiKeyStatusResponse = await fetch('/api/get_api_key_status');
        const apiKeyStatusData = await apiKeyStatusResponse.json();
        if (!apiKeyStatusData.is_set) {
            generalStatusArea.textContent = 'Error: API Key is not set.'; generalStatusArea.style.color = 'red';
            if(apiKeyInput) apiKeyInput.focus(); setLoadingState(false); return;
        }

        setLoadingState(true, `Generating ${mode}, please wait...`);
        if(imageResultArea) imageResultArea.innerHTML = '';

        try {
            const fetchOptions = { method: 'POST', body: payload };
            if (!requiresFormData) fetchOptions.headers = { 'Content-Type': 'application/json' };
            const response = await fetch(endpoint, fetchOptions);
            const result = await response.json();
            currentGenerationParams = result.params || dynamicParams;

            if (response.ok && (result.image_url || result.video_url)) {
                const contentType = result.video_url ? 'video' : 'image';
                const contentUrl = result.video_url || result.image_url;
                // Pass the result object itself to displayResultItem as it expects {image_url} or {video_url}
                displayResultItem({ [contentType === 'video' ? 'video_url' : 'image_url']: contentUrl }, currentGenerationParams, mode, false, contentType);
                generalStatusArea.textContent = `${mode} generated successfully!`;
                generalStatusArea.style.color = 'green';
            } else {
                let errorMessage = `Error: ${result.error || response.statusText || 'Unknown error'}`;
                if (result.details) errorMessage += ` - Details: ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}`;
                generalStatusArea.textContent = errorMessage; generalStatusArea.style.color = 'red';
                if (response.status === 401) updateApiKeyUI(false, "API Key missing or invalid. Please check.");
            }
        } catch (error) {
            console.error(`Fetch error during ${mode} generation:`, error);
            generalStatusArea.textContent = `Error: Network error during ${mode} generation. ${error.message}.`;
            generalStatusArea.style.color = 'red';
        } finally { setLoadingState(false); }
    }

    // --- Assigning Event Listeners to Generate Buttons ---
    // Initial setup sequence:
    populateModelSelectors();       // 1. Populate all model dropdowns
    displayControlsForMode(currentMode); // 2. Display controls for the initial mode (e.g., 'txt2img') and render its model's form.
    checkApiKeyStatus();            // 3. Check API key status (updates UI accordingly)
    loadHistory();                  // 4. Load and render generation history


    if (generateButton) { // Text-to-Image
        generateButton.addEventListener('click', () => {
            const selectedModelId = modelSelectElements.txt2img.value;
            if (!selectedModelId) { generalStatusArea.textContent = "Please select a Text-to-Image model."; generalStatusArea.style.color = "orange"; return; }
            const params = gatherParamsFromDynamicForm('txt2img', selectedModelId);
            const promptParamInfo = MODEL_SCHEMAS[selectedModelId]?.parameters.find(p => p.name === 'prompt');
            if (promptParamInfo?.required && !params.prompt) {
                 generalStatusArea.textContent = 'Error: Prompt is required for this model.';
                 generalStatusArea.style.color = 'red';
                 const promptEl = getDynamicControlsContainer('txt2img').querySelector('[name="prompt"]');
                 if(promptEl) promptEl.focus(); return;
            }
            makeApiCall('/api/generate', 'txt2img', selectedModelId);
        });
    }

    if (generateImg2ImgButton) { // Image-to-Image
        generateImg2ImgButton.addEventListener('click', () => {
            const selectedModelId = modelSelectElements.img2img.value;
            if (!selectedModelId) { generalStatusArea.textContent = "Please select an Image-to-Image model."; generalStatusArea.style.color = "orange"; return; }
            const params = gatherParamsFromDynamicForm('img2img', selectedModelId);
            let hasImageFile = false; const schema = MODEL_SCHEMAS[selectedModelId]; let mainImageParamName = 'image_url';
            if (schema?.parameters) {
                const fileParamInfo = schema.parameters.find(p => p.type === 'file' && (p.name.includes('image') || p.name.includes('face')) && p.required);
                if (fileParamInfo) { mainImageParamName = fileParamInfo.name; if (params[mainImageParamName] instanceof File || (typeof params[mainImageParamName] === 'string' && params[mainImageParamName].startsWith('data:'))) hasImageFile = true;}
                else { const anyFileParam = schema.parameters.find(p => p.type === 'file'); if (anyFileParam && params[anyFileParam.name] instanceof File) {mainImageParamName = anyFileParam.name; hasImageFile = true;}}
            }
            if (!hasImageFile) { generalStatusArea.textContent = 'Error: An input image is required for Image-to-Image.'; generalStatusArea.style.color = 'red'; return; }
            makeApiCall('/api/image_to_image', 'img2img', selectedModelId);
        });
    }

    if (generateInpaintButton) { // Inpainting
        generateInpaintButton.addEventListener('click', () => {
            const selectedModelId = modelSelectElements.inpaint.value;
            if (!selectedModelId) { generalStatusArea.textContent = "Please select an Inpainting model."; generalStatusArea.style.color = "orange"; return; }
            if (!originalInpaintImageForUpload) { generalStatusArea.textContent = 'Error: Please upload an image for inpainting.'; generalStatusArea.style.color = 'red'; return; }
            const params = gatherParamsFromDynamicForm('inpaint', selectedModelId);
            const promptParamInfo = MODEL_SCHEMAS[selectedModelId]?.parameters.find(p => p.name === 'prompt');
            if (promptParamInfo?.required && !params.prompt) { generalStatusArea.textContent = 'Error: Prompt is required for Inpainting.'; generalStatusArea.style.color = 'red'; return; }
            const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            let hasMask = false; for (let i = 3; i < maskData.data.length; i += 4) if (maskData.data[i] > 0) { hasMask = true; break; }
            if (!hasMask) { generalStatusArea.textContent = 'Please draw a mask on the image.'; generalStatusArea.style.color = 'red'; return; }
            const maskImageDataURL = maskCanvas.toDataURL('image/png');
            const additionalFormData = new FormData();
            additionalFormData.append('original_image', originalInpaintImageForUpload);
            additionalFormData.append('mask_image_data_url', maskImageDataURL);
            makeApiCall('/api/inpaint', 'inpaint', selectedModelId, additionalFormData);
        });
    }

    if (generateUpscaleButton) { // Upscaling
        generateUpscaleButton.addEventListener('click', () => {
            const selectedModelId = modelSelectElements.upscale.value;
            if (!selectedModelId) { generalStatusArea.textContent = "Please select an Upscale model."; generalStatusArea.style.color = "orange"; return; }
            const params = gatherParamsFromDynamicForm('upscale', selectedModelId);
            let hasImageFile = false; const schema = MODEL_SCHEMAS[selectedModelId]; let fileParamName = 'image';
            if (schema?.parameters) { const fp = schema.parameters.find(p=>p.type==='file'&&p.name.includes('image')&&p.required); if(fp){fileParamName=fp.name; if(params[fileParamName] instanceof File) hasImageFile=true;}}
            if (!hasImageFile && originalUpscaleImageForUpload) { params[fileParamName] = originalUpscaleImageForUpload; hasImageFile = true; } // Fallback for static upload
            if (!hasImageFile) { generalStatusArea.textContent = 'Error: An input image is required for Upscaling.'; generalStatusArea.style.color = 'red'; return; }
            makeApiCall('/api/upscale', 'upscale', selectedModelId);
        });
    }

    if (generateBgRemoveButton) { // Background Removal
        generateBgRemoveButton.addEventListener('click', () => {
            const selectedModelId = modelSelectElements.bgremove.value;
            if (!selectedModelId) { generalStatusArea.textContent = "Please select a Background Removal model."; generalStatusArea.style.color = "orange"; return; }
            const params = gatherParamsFromDynamicForm('bgremove', selectedModelId);
            let hasImageFile = false; const schema = MODEL_SCHEMAS[selectedModelId]; let fileParamName = 'image';
            if (schema?.parameters) { const fp = schema.parameters.find(p=>p.type==='file'&&p.name.includes('image')&&p.required); if(fp){fileParamName=fp.name; if(params[fileParamName] instanceof File) hasImageFile=true;}}
            if (!hasImageFile && originalBgRemoveImageForUpload) { params[fileParamName] = originalBgRemoveImageForUpload; hasImageFile = true; } // Fallback for static upload
            if (!hasImageFile) { generalStatusArea.textContent = 'Error: An input image is required for Background Removal.'; generalStatusArea.style.color = 'red'; return; }
            makeApiCall('/api/remove_background', 'bgremove', selectedModelId);
        });
    }

    if (generateVideoButton) { // Video Generation
        generateVideoButton.addEventListener('click', () => {
            const selectedModelId = modelSelectElements.video.value;
            if (!selectedModelId) { generalStatusArea.textContent = "Please select a Video model."; generalStatusArea.style.color = "orange"; return; }
            const params = gatherParamsFromDynamicForm('video', selectedModelId);
            const schema = MODEL_SCHEMAS[selectedModelId];
            let endpoint = '/api/generate'; let hasPrimaryFile = false;
            if (schema?.parameters) {
                const fileP = schema.parameters.find(p=>(p.type==='file'||p.type==='array_of_files') && p.required && p.name.includes('image')); // Heuristic for primary image(s)
                if (fileP && params[fileP.name] && (params[fileP.name] instanceof File || (params[fileP.name] instanceof FileList && params[fileP.name].length > 0))) {
                    hasPrimaryFile = true;
                }
            }
            if(hasPrimaryFile) endpoint = '/api/image_to_image'; // Assume image-input video models use this endpoint

            const promptParamInfo = schema?.parameters.find(p => p.name === 'prompt');
            if (promptParamInfo?.required && !params.prompt) {
                 generalStatusArea.textContent = 'Error: Prompt is required for this video model.'; generalStatusArea.style.color = 'red'; return;
            }
            makeApiCall(endpoint, 'video', selectedModelId);
        });
    }
});

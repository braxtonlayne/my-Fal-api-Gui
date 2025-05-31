document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearApiKeyButton = document.getElementById('clearApiKey');
    const apiKeyStatusArea = document.getElementById('apiKeyStatus'); // Dedicated status area for API key

    const promptInput = document.getElementById('promptInput');
    const negativePromptInput = document.getElementById('negativePromptInput');
    const seedInput = document.getElementById('seedInput');
    const randomSeedButton = document.getElementById('randomSeedButton');
    const guidanceScaleInput = document.getElementById('guidanceScaleInput');
    const numStepsInput = document.getElementById('numStepsInput');
    const modelSelection = document.getElementById('modelSelection');

    // Mode selection
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const txt2imgControls = document.getElementById('txt2imgControls');
    const img2imgControls = document.getElementById('img2imgControls');
    const inpaintControls = document.getElementById('inpaintControls');
    const upscaleControls = document.getElementById('upscaleControls');
    const bgRemoveControls = document.getElementById('bgRemoveControls');

    // Image-to-Image specific controls
    const img2imgModelSelection = document.getElementById('img2imgModelSelection');
    const inputImageUpload = document.getElementById('inputImageUpload');
    const inputImagePreview = document.getElementById('inputImagePreview');
    const img2imgPromptInput = document.getElementById('img2imgPromptInput');
    const imageStrengthInput = document.getElementById('imageStrengthInput');
    const img2imgSeedInput = document.getElementById('img2imgSeedInput');
    const img2imgRandomSeedButton = document.getElementById('img2imgRandomSeedButton');
    const img2imgGuidanceScaleInput = document.getElementById('img2imgGuidanceScaleInput');
    const img2imgNumStepsInput = document.getElementById('img2imgNumStepsInput');
    const generateImg2ImgButton = document.getElementById('generateImg2ImgButton');

    // Inpainting specific controls
    const inpaintModelSelection = document.getElementById('inpaintModelSelection');
    const inpaintImageUpload = document.getElementById('inpaintImageUpload');
    const imageCanvas = document.getElementById('imageCanvas');
    const maskCanvas = document.getElementById('maskCanvas');
    const brushSizeInput = document.getElementById('brushSize');
    const brushSizeValueSpan = document.getElementById('brushSizeValue');
    const clearMaskButton = document.getElementById('clearMaskButton');
    const inpaintPromptInput = document.getElementById('inpaintPromptInput');
    const inpaintSeedInput = document.getElementById('inpaintSeedInput');
    const inpaintRandomSeedButton = document.getElementById('inpaintRandomSeedButton');
    const generateInpaintButton = document.getElementById('generateInpaintButton');

    // Upscaling specific controls
    const upscaleModelSelection = document.getElementById('upscaleModelSelection');
    const upscaleImageUpload = document.getElementById('upscaleImageUpload');
    const upscaleImagePreview = document.getElementById('upscaleImagePreview');
    const generateUpscaleButton = document.getElementById('generateUpscaleButton');
    let originalUpscaleImageForUpload = null;

    // Background Removal specific controls
    const bgRemoveModelSelection = document.getElementById('bgRemoveModelSelection');
    const bgRemoveImageUpload = document.getElementById('bgRemoveImageUpload');
    const bgRemoveImagePreview = document.getElementById('bgRemoveImagePreview');
    const generateBgRemoveButton = document.getElementById('generateBgRemoveButton');
    let originalBgRemoveImageForUpload = null; // To store the original file for BG removal


    let imageCtx, maskCtx;
    let isDrawing = false;
    let lastX, lastY;
    let currentBrushSize = brushSizeInput ? parseInt(brushSizeInput.value) : 30;
    let originalInpaintImageForUpload = null;

    if (imageCanvas) imageCtx = imageCanvas.getContext('2d');
    if (maskCanvas) maskCtx = maskCanvas.getContext('2d');


    const generateButton = document.getElementById('generateButton'); // txt2img generate button
    const generalStatusArea = document.getElementById('statusArea');
    const imageResultArea = document.getElementById('imageResultArea');

    let currentGenerationParams = {};
    let currentMode = 'txt2img'; // To track the current active mode for history

    // History Feature
    let generationHistory = [];
    const HISTORY_STORAGE_KEY = 'falGenerationHistory';
    const historyGallery = document.getElementById('historyGallery');
    const clearHistoryButton = document.getElementById('clearHistoryButton');

    // Event listener for Random Seed button (txt2img)
    if (randomSeedButton) {
        randomSeedButton.addEventListener('click', () => {
            seedInput.value = Math.floor(Math.random() * 4294967295);
        });
    }
    // Event listener for Random Seed button (img2img)
    if (img2imgRandomSeedButton) {
        img2imgRandomSeedButton.addEventListener('click', () => {
            img2imgSeedInput.value = Math.floor(Math.random() * 4294967295);
        });
    }
    // Event listener for Random Seed button (inpaint)
    if (inpaintRandomSeedButton) {
        inpaintRandomSeedButton.addEventListener('click', () => {
            inpaintSeedInput.value = Math.floor(Math.random() * 4294967295);
        });
    }


    // Mode Switching Logic
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            txt2imgControls.style.display = 'none';
            img2imgControls.style.display = 'none';
            inpaintControls.style.display = 'none';
            upscaleControls.style.display = 'none';
            bgRemoveControls.style.display = 'none';
            let message = '';
            currentMode = event.target.value; // Update currentMode

            if (currentMode === 'txt2img') {
                txt2imgControls.style.display = 'block';
                message = 'Text-to-Image mode selected.';
            } else if (currentMode === 'img2img') {
                img2imgControls.style.display = 'block';
                message = 'Image-to-Image mode selected.';
            } else if (currentMode === 'inpaint') {
                inpaintControls.style.display = 'block';
                message = 'Inpainting mode selected. Upload image and draw mask.';
            } else if (currentMode === 'upscale') {
                upscaleControls.style.display = 'block';
                message = 'Upscaling mode selected. Upload image to upscale.';
            } else if (currentMode === 'bgremove') {
                bgRemoveControls.style.display = 'block';
                message = 'Background Removal mode selected. Upload image.';
            }
            generalStatusArea.textContent = message;
            if(imageResultArea) imageResultArea.innerHTML = '';
            generalStatusArea.style.color = 'inherit';
        });
    });

    // Input Image Preview Logic (for Img2Img)
    if (inputImageUpload) {
        inputImageUpload.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    inputImagePreview.src = e.target.result;
                    inputImagePreview.style.display = 'block';
                }
                reader.readAsDataURL(event.target.files[0]);
            } else {
                inputImagePreview.src = '#';
                inputImagePreview.style.display = 'none';
            }
        });
    }

    // Input Image Preview Logic (for Upscaling)
    if (upscaleImageUpload) {
        upscaleImageUpload.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                originalUpscaleImageForUpload = event.target.files[0]; // Store the file
                const reader = new FileReader();
                reader.onload = function(e) {
                    upscaleImagePreview.src = e.target.result;
                    upscaleImagePreview.style.display = 'block';
                }
                reader.readAsDataURL(event.target.files[0]);
            } else {
                upscaleImagePreview.src = '#';
                upscaleImagePreview.style.display = 'none';
                originalUpscaleImageForUpload = null;
            }
        });
    }

    // Input Image Preview Logic (for Background Removal)
    if (bgRemoveImageUpload) {
        bgRemoveImageUpload.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                originalBgRemoveImageForUpload = event.target.files[0]; // Store the file
                const reader = new FileReader();
                reader.onload = function(e) {
                    bgRemoveImagePreview.src = e.target.result;
                    bgRemoveImagePreview.style.display = 'block';
                }
                reader.readAsDataURL(event.target.files[0]);
            } else {
                bgRemoveImagePreview.src = '#';
                bgRemoveImagePreview.style.display = 'none';
                originalBgRemoveImageForUpload = null;
            }
        });
    }


    // Inpainting Canvas Setup & Logic
    if (inpaintImageUpload) {
        inpaintImageUpload.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                originalInpaintImageForUpload = event.target.files[0]; // Store the file
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        // For simplicity, fix canvas size. Could be dynamic.
                        imageCanvas.width = 512;
                        imageCanvas.height = 512;
                        maskCanvas.width = 512;
                        maskCanvas.height = 512;

                        // Scale and draw image to fit canvas
                        const hRatio = imageCanvas.width / img.width;
                        const vRatio = imageCanvas.height / img.height;
                        const ratio = Math.min(hRatio, vRatio);
                        const centerShift_x = (imageCanvas.width - img.width * ratio) / 2;
                        const centerShift_y = (imageCanvas.height - img.height * ratio) / 2;

                        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                        imageCtx.drawImage(img, 0, 0, img.width, img.height,
                                           centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                        clearMask(); // Clear previous mask
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
        maskCtx.strokeStyle = 'black'; // Mask is drawn in black on a transparent/semi-transparent canvas
        maskCtx.lineWidth = currentBrushSize;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';

        // Calculate mouse position relative to the canvas
        const rect = maskCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        maskCtx.lineTo(x, y);
        maskCtx.stroke();
        maskCtx.beginPath(); // Start a new path for the next segment
        maskCtx.moveTo(x, y);
    }

    if (maskCanvas) {
        maskCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = maskCanvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            maskCtx.beginPath(); // Begin path for drawing
            maskCtx.moveTo(lastX, lastY); // Move to starting point without drawing yet
            // A single dot for a click:
            // maskCtx.fillStyle = 'black';
            // maskCtx.fillRect(lastX - currentBrushSize / 2, lastY - currentBrushSize / 2, currentBrushSize, currentBrushSize);
        });
        maskCanvas.addEventListener('mousemove', drawOnMask);
        maskCanvas.addEventListener('mouseup', () => isDrawing = false);
        maskCanvas.addEventListener('mouseout', () => isDrawing = false); // Stop drawing if mouse leaves canvas
    }

    function clearMask() {
        if (maskCtx) {
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
    }

    if (clearMaskButton) {
        clearMaskButton.addEventListener('click', clearMask);
    }

    // Function to update API Key UI based on status
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

    // Check API Key Status on Load
    const checkApiKeyStatus = async () => {
        try {
            const response = await fetch('/api/get_api_key_status');
            const data = await response.json();
            updateApiKeyUI(data.is_set);
            if (data.is_set) {
                 generalStatusArea.textContent = 'Ready to generate images.';
                 generalStatusArea.style.color = 'blue';
            } else {
                generalStatusArea.textContent = 'Please set your API Key before generating images.';
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

    // Event listener for saving API key (to server session)
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
                    generalStatusArea.textContent = 'API Key saved. Ready to generate images.';
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

    // Event listener for clearing API key
    if (clearApiKeyButton) {
        clearApiKeyButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/clear_api_key', { method: 'POST' });
                const result = await response.json();
                if (response.ok) {
                    updateApiKeyUI(false, result.message);
                     generalStatusArea.textContent = 'API Key cleared. Please set your API Key to generate images.';
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

    // Remove any API key from localStorage from previous versions
    localStorage.removeItem('falApiKey');

    // Initial check and load history
    checkApiKeyStatus();
    loadHistory(); // Load history on page startup

    // Helper function to create and display a result item
    function displayResultItem(imageUrl, params, mode, isFromHistory = false) {
        if (!imageResultArea) return;
        imageResultArea.innerHTML = '';

        const item = document.createElement('div');
        item.className = 'result-item';
        item.style.border = '1px solid #ddd';
        item.style.padding = '10px';
        item.style.borderRadius = '5px';
        item.style.backgroundColor = '#fff';
        item.style.width = 'fit-content';
        item.style.maxWidth = '532px'; // Max width of image + padding

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Generated Image (${params.prompt || 'Upscaled/Processed'})`;
        img.className = 'result-image';
        img.style.maxWidth = '512px';
        img.style.maxHeight = '512px';
        img.style.display = 'block';
        img.style.marginBottom = '10px';
        item.appendChild(img);

        const paramsDiv = document.createElement('div');
        paramsDiv.className = 'result-params';
        paramsDiv.style.fontSize = '0.9em';
        paramsDiv.style.marginBottom = '10px';

        let paramsHTML = `<p><strong>Mode:</strong> <span class="param-mode">${mode}</span></p>`;
        if (params.model_id) paramsHTML += `<p><strong>Model:</strong> <span class="param-model">${params.model_id}</span></p>`;
        if (params.prompt) paramsHTML += `<p><strong>Prompt:</strong> <span class="param-prompt">${params.prompt}</span></p>`;
        if (params.negative_prompt) paramsHTML += `<p><strong>Negative Prompt:</strong> <span class="param-negative-prompt">${params.negative_prompt}</span></p>`;
        if (params.seed !== undefined && params.seed !== null) paramsHTML += `<p><strong>Seed:</strong> <span class="param-seed">${params.seed}</span></p>`;
        if (params.guidance_scale !== undefined && params.guidance_scale !== null) paramsHTML += `<p><strong>CFG Scale:</strong> <span class="param-cfg">${params.guidance_scale}</span></p>`;
        if (params.num_inference_steps !== undefined && params.num_inference_steps !== null) paramsHTML += `<p><strong>Steps:</strong> <span class="param-steps">${params.num_inference_steps}</span></p>`;
        if (params.strength !== undefined && params.strength !== null) paramsHTML += `<p><strong>Strength:</strong> <span class="param-strength">${params.strength}</span></p>`;
        // Add more params as needed for other modes
        paramsDiv.innerHTML = paramsHTML;
        item.appendChild(paramsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'result-actions';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '10px';

        // Download Button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            // Try to derive a filename
            let filename = "generated_image.png";
            if (params.prompt) {
                filename = `${params.prompt.substring(0,30).replace(/\s+/g, '_')}_${params.seed || 'random'}.png`;
            } else if (mode.toLowerCase() === 'upscaling') {
                filename = `upscaled_${params.model_id.replace('/', '_')}.png`;
            } else if (mode.toLowerCase() === 'background removal') {
                 filename = `bg_removed_${params.model_id.replace('/', '_')}.png`;
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        actionsDiv.appendChild(downloadBtn);

        // "Use for Img2Img" Button (only if current mode is not Img2Img and it's an image output)
        if (mode !== "Image-to-Image" && (mode === "Text-to-Image" || mode === "Inpainting" || mode === "Background Removal" || mode === "Upscaling")) {
            const useForImg2ImgBtn = document.createElement('button');
            useForImg2ImgBtn.className = 'use-as-input-btn';
            useForImg2ImgBtn.textContent = 'Use for Img2Img';
            useForImg2ImgBtn.onclick = async () => {
                try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], "generated_image_for_i2i.png", { type: blob.type });

                    // Switch to Img2Img mode
                    document.querySelector('input[name="mode"][value="img2img"]').checked = true;
                    txt2imgControls.style.display = 'none';
                    inpaintControls.style.display = 'none';
                    upscaleControls.style.display = 'none';
                    bgRemoveControls.style.display = 'none';
                    img2imgControls.style.display = 'block';
                    generalStatusArea.textContent = 'Image-to-Image mode selected. Image loaded from previous result.';

                    // Set the file to the input
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    inputImageUpload.files = dataTransfer.files;

                    // Trigger change event for preview
                    const changeEvent = new Event('change', { bubbles: true });
                    inputImageUpload.dispatchEvent(changeEvent);

                    if(params.prompt && img2imgPromptInput) img2imgPromptInput.value = params.prompt; // carry over prompt

                } catch (err) {
                    console.error("Error using image as input:", err);
                    generalStatusArea.textContent = `Error loading image for Img2Img: ${err.message}`;
                    generalStatusArea.style.color = 'red';
                }
            };
            actionsDiv.appendChild(useForImg2ImgBtn);
        }

        // "Send to Inpaint" Button
        if (mode !== "Inpainting" && (mode === "Text-to-Image" || mode === "Image-to-Image" || mode === "Background Removal" || mode === "Upscaling")) {
            const sendToInpaintBtn = document.createElement('button');
            sendToInpaintBtn.textContent = 'Send to Inpaint';
            sendToInpaintBtn.onclick = async () => {
                 try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], "generated_image_for_inpaint.png", { type: blob.type });

                    document.querySelector('input[name="mode"][value="inpaint"]').checked = true;
                    txt2imgControls.style.display = 'none';
                    img2imgControls.style.display = 'none';
                    upscaleControls.style.display = 'none';
                    bgRemoveControls.style.display = 'none';
                    inpaintControls.style.display = 'block';
                    generalStatusArea.textContent = 'Inpainting mode selected. Image loaded from previous result.';

                    originalInpaintImageForUpload = file; // Store the file for inpainting.js logic
                    const changeEvent = new Event('change', { bubbles: true }); // For inpaintImageUpload to pick it up
                    inpaintImageUpload.files = new DataTransfer().files; // Clear if any
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    inpaintImageUpload.files = dataTransfer.files;
                    inpaintImageUpload.dispatchEvent(changeEvent);

                    if(params.prompt && inpaintPromptInput) inpaintPromptInput.value = params.prompt;

                } catch (err) {
                    console.error("Error sending image to Inpaint:", err);
                    generalStatusArea.textContent = `Error loading image for Inpaint: ${err.message}`;
                    generalStatusArea.style.color = 'red';
                }
            };
            actionsDiv.appendChild(sendToInpaintBtn);
        }


        // "Send to Upscale" Button
        if (mode !== "Upscaling" && (mode === "Text-to-Image" || mode === "Image-to-Image" || mode === "Inpainting" || mode === "Background Removal")) {
             const sendToUpscaleBtn = document.createElement('button');
             sendToUpscaleBtn.textContent = 'Send to Upscale';
             sendToUpscaleBtn.onclick = async () => {
                try {
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const file = new File([blob], "generated_image_for_upscale.png", { type: blob.type });

                    document.querySelector('input[name="mode"][value="upscale"]').checked = true;
                    txt2imgControls.style.display = 'none';
                    img2imgControls.style.display = 'none';
                    inpaintControls.style.display = 'none';
                    bgRemoveControls.style.display = 'none';
                    upscaleControls.style.display = 'block';
                    generalStatusArea.textContent = 'Upscaling mode selected. Image loaded from previous result.';

                    originalUpscaleImageForUpload = file; // Store the file for upscaling.js logic
                    const changeEvent = new Event('change', { bubbles: true });
                    upscaleImageUpload.files = new DataTransfer().files; // Clear if any
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    upscaleImageUpload.files = dataTransfer.files;
                    upscaleImageUpload.dispatchEvent(changeEvent);

                } catch (err) {
                    console.error("Error sending image to Upscale:", err);
                    generalStatusArea.textContent = `Error loading image for Upscale: ${err.message}`;
                    generalStatusArea.style.color = 'red';
                }
            };
            actionsDiv.appendChild(sendToUpscaleBtn);
        }


        item.appendChild(actionsDiv);
        imageResultArea.appendChild(item);

        // Add to history only if it's a new generation, not a reload from history
        if (!isFromHistory) {
            addToHistory(imageUrl, params, mode);
        }
    }

    // --- History Functions ---
    function loadHistory() {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            generationHistory = JSON.parse(storedHistory);
        }
        renderHistoryGallery();
    }

    function saveHistory() {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(generationHistory));
    }

    function addToHistory(imageUrl, params, mode) {
        const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            imageUrl: imageUrl, // Store full res for simplicity, could be thumbnail
            params: params,
            mode: mode
        };
        generationHistory.unshift(historyEntry); // Add to the beginning
        if (generationHistory.length > 50) { // Limit history size
            generationHistory.pop();
        }
        saveHistory();
        renderHistoryGallery();
    }

    function renderHistoryGallery() {
        if (!historyGallery) return;
        historyGallery.innerHTML = ''; // Clear current gallery

        if (generationHistory.length === 0) {
            historyGallery.innerHTML = '<p style="color: #777; font-style: italic;">No generation history yet.</p>';
            return;
        }

        generationHistory.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.historyId = entry.id;
            historyItem.style.width = '100px';
            historyItem.style.border = '1px solid #999';
            historyItem.style.padding = '5px';
            historyItem.style.backgroundColor = '#fff';
            historyItem.style.position = 'relative';
            historyItem.style.cursor = 'pointer';

            const img = document.createElement('img');
            img.src = entry.imageUrl;
            img.alt = `History: ${entry.params.prompt || entry.mode}`;
            img.style.width = '100%';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            img.onclick = () => displayResultItem(entry.imageUrl, entry.params, entry.mode, true); // Display in main area, mark as from history
            historyItem.appendChild(img);

            const actionsContainer = document.createElement('div');
            actionsContainer.style.position = 'absolute';
            actionsContainer.style.top = '2px';
            actionsContainer.style.right = '2px';
            actionsContainer.style.display = 'flex';
            actionsContainer.style.flexDirection = 'column'; // Stack buttons vertically
            actionsContainer.style.gap = '2px';


            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-history-item-btn';
            deleteBtn.innerHTML = 'X'; // Simple X for delete
            deleteBtn.title = "Delete from history";
            deleteBtn.style.padding = '2px 4px';
            deleteBtn.style.fontSize = '0.7em';
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent click on parent (image)
                deleteHistoryItem(entry.id);
            };
            actionsContainer.appendChild(deleteBtn);

            const reloadBtn = document.createElement('button');
            reloadBtn.className = 'reload-history-params-btn';
            reloadBtn.innerHTML = '&#x21BB;'; // Reload symbol (⟳)
            reloadBtn.title = "Reload parameters";
            reloadBtn.style.padding = '2px 4px';
            reloadBtn.style.fontSize = '0.7em';
            reloadBtn.onclick = (e) => {
                e.stopPropagation();
                reloadParamsFromHistory(entry);
            };
            actionsContainer.appendChild(reloadBtn);

            historyItem.appendChild(actionsContainer);
            historyGallery.appendChild(historyItem);
        });
    }

    function deleteHistoryItem(historyId) {
        generationHistory = generationHistory.filter(entry => entry.id !== historyId);
        saveHistory();
        renderHistoryGallery();
    }

    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all generation history?")) {
                generationHistory = [];
                saveHistory();
                renderHistoryGallery();
                generalStatusArea.textContent = "Generation history cleared.";
                generalStatusArea.style.color = "orange";
            }
        });
    }

    function reloadParamsFromHistory(historyEntry) {
        currentMode = historyEntry.mode;
        // Activate the correct radio button for the mode
        const modeRadio = document.querySelector(`input[name="mode"][value="${currentMode}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
            // Manually trigger change to update UI sections visibility
            modeRadio.dispatchEvent(new Event('change', {bubbles: true}));
        }

        const params = historyEntry.params;
        // Populate common fields
        if (params.prompt) {
            if (currentMode === 'txt2img' && promptInput) promptInput.value = params.prompt;
            else if (currentMode === 'img2img' && img2imgPromptInput) img2imgPromptInput.value = params.prompt;
            else if (currentMode === 'inpaint' && inpaintPromptInput) inpaintPromptInput.value = params.prompt;
        }
        if (params.negative_prompt && negativePromptInput && currentMode === 'txt2img') negativePromptInput.value = params.negative_prompt;

        if (params.seed !== null && params.seed !== undefined) {
            if (currentMode === 'txt2img' && seedInput) seedInput.value = params.seed;
            else if (currentMode === 'img2img' && img2imgSeedInput) img2imgSeedInput.value = params.seed;
            else if (currentMode === 'inpaint' && inpaintSeedInput) inpaintSeedInput.value = params.seed;
        }

        if (params.model_id) {
            if (currentMode === 'txt2img' && modelSelection) modelSelection.value = params.model_id;
            else if (currentMode === 'img2img' && img2imgModelSelection) img2imgModelSelection.value = params.model_id;
            else if (currentMode === 'inpaint' && inpaintModelSelection) inpaintModelSelection.value = params.model_id;
            else if (currentMode === 'upscale' && upscaleModelSelection) upscaleModelSelection.value = params.model_id;
            else if (currentMode === 'bgremove' && bgRemoveModelSelection) bgRemoveModelSelection.value = params.model_id;
        }

        if (params.guidance_scale !== null && params.guidance_scale !== undefined) {
             if (currentMode === 'txt2img' && guidanceScaleInput) guidanceScaleInput.value = params.guidance_scale;
             else if (currentMode === 'img2img' && img2imgGuidanceScaleInput) img2imgGuidanceScaleInput.value = params.guidance_scale;
        }
        if (params.num_inference_steps !== null && params.num_inference_steps !== undefined) {
            if (currentMode === 'txt2img' && numStepsInput) numStepsInput.value = params.num_inference_steps;
            else if (currentMode === 'img2img' && img2imgNumStepsInput) img2imgNumStepsInput.value = params.num_inference_steps;
        }
        if (params.strength !== null && params.strength !== undefined && currentMode === 'img2img' && imageStrengthInput) {
            imageStrengthInput.value = params.strength;
        }

        // For modes with image inputs, it's tricky to reload the file.
        // We'll display the image in the main result area and user can use "Use as Input" from there.
        displayResultItem(historyEntry.imageUrl, historyEntry.params, historyEntry.mode, true);
        generalStatusArea.textContent = `Parameters reloaded from history for ${historyEntry.mode} mode. Original image displayed.`;
        generalStatusArea.style.color = 'blue';
    }


    // Event listener for generating Text-to-Image
    if (generateButton) {
        generateButton.addEventListener('click', async () => {
            currentGenerationParams = {
                prompt: promptInput.value.trim(),
                negative_prompt: negativePromptInput.value.trim(),
                seed: seedInput.value.trim() ? parseInt(seedInput.value.trim()) : null,
                guidance_scale: guidanceScaleInput.value.trim() ? parseFloat(guidanceScaleInput.value.trim()) : null,
                num_inference_steps: numStepsInput.value.trim() ? parseInt(numStepsInput.value.trim()) : null,
                model_id: modelSelection.value
            };

            if (!currentGenerationParams.prompt) {
                generalStatusArea.textContent = 'Please enter a prompt.';
                generalStatusArea.style.color = 'red';
                return;
            }

            const apiKeyStatusResponse = await fetch('/api/get_api_key_status');
            const apiKeyStatusData = await apiKeyStatusResponse.json();
            if (!apiKeyStatusData.is_set) {
                generalStatusArea.textContent = 'API Key is not set. Please save your API Key first.';
                generalStatusArea.style.color = 'red';
                apiKeyInput.focus();
                return;
            }

            generalStatusArea.textContent = 'Generating image, please wait...';
            generalStatusArea.style.color = 'blue';
            if(imageResultArea) imageResultArea.innerHTML = ''; // Clear previous results
            generateButton.disabled = true;
            generateButton.textContent = 'Generating...';

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentGenerationParams),
                });
                const result = await response.json();

                if (response.ok && result.image_url) {
                    displayResultItem(result.image_url, result.params || currentGenerationParams, "Text-to-Image");
                    generalStatusArea.textContent = 'Text-to-Image generated successfully!';
                    generalStatusArea.style.color = 'green';
                } else {
                    let errorMessage = `Error: ${result.error || response.statusText}`;
                    if (result.details) errorMessage += ` - Details: ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}`;
                    generalStatusArea.textContent = errorMessage;
                    generalStatusArea.style.color = 'red';
                    if (response.status === 401) updateApiKeyUI(false, "API Key missing or invalid. Please check.");
                }
            } catch (error) {
                console.error('Fetch error during text-to-image generation:', error);
                generalStatusArea.textContent = `Network error: ${error.message}. Check console.`;
                generalStatusArea.style.color = 'red';
            } finally {
                generateButton.disabled = false;
                generateButton.textContent = 'Generate Text-to-Image';
            }
        });
    }

    // Event listener for generating Image-to-Image
    if (generateImg2ImgButton) {
        generateImg2ImgButton.addEventListener('click', async () => {
            currentGenerationParams = {
                prompt: img2imgPromptInput.value.trim(),
                model_id: img2imgModelSelection.value,
                strength: imageStrengthInput.value.trim() ? parseFloat(imageStrengthInput.value.trim()) : null,
                seed: img2imgSeedInput.value.trim() ? parseInt(img2imgSeedInput.value.trim()) : null,
                guidance_scale: img2imgGuidanceScaleInput.value.trim() ? parseFloat(img2imgGuidanceScaleInput.value.trim()) : null,
                num_inference_steps: img2imgNumStepsInput.value.trim() ? parseInt(img2imgNumStepsInput.value.trim()) : null,
                // Note: The actual image file is handled separately by FormData
            };
            const imageFile = inputImageUpload.files[0];

            if (!imageFile) {
                generalStatusArea.textContent = 'Please upload an image for Image-to-Image generation.';
                generalStatusArea.style.color = 'red';
                inputImageUpload.focus();
                return;
            }
            if (!promptValue) {
                generalStatusArea.textContent = 'Please enter a prompt for Image-to-Image generation.';
                generalStatusArea.style.color = 'red';
                img2imgPromptInput.focus();
                return;
            }
             if (!currentGenerationParams.strength) {
                generalStatusArea.textContent = 'Please enter Image Strength.';
                generalStatusArea.style.color = 'red';
                imageStrengthInput.focus();
                return;
            }

            const apiKeyStatusResponse = await fetch('/api/get_api_key_status');
            const apiKeyStatusData = await apiKeyStatusResponse.json();
            if (!apiKeyStatusData.is_set) {
                generalStatusArea.textContent = 'API Key is not set. Please save your API Key first.';
                generalStatusArea.style.color = 'red';
                apiKeyInput.focus();
                return;
            }

            generalStatusArea.textContent = 'Generating Image-to-Image, please wait...';
            generalStatusArea.style.color = 'blue';
            if(imageResultArea) imageResultArea.innerHTML = '';
            generateImg2ImgButton.disabled = true;
            generateImg2ImgButton.textContent = 'Generating...';

            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('prompt', currentGenerationParams.prompt);
            formData.append('model_id', currentGenerationParams.model_id);
            formData.append('strength', currentGenerationParams.strength);
            if (currentGenerationParams.seed !== null) formData.append('seed', currentGenerationParams.seed);
            if (currentGenerationParams.guidance_scale !== null) formData.append('guidance_scale', currentGenerationParams.guidance_scale);
            if (currentGenerationParams.num_inference_steps !== null) formData.append('num_inference_steps', currentGenerationParams.num_inference_steps);

            try {
                const response = await fetch('/api/image_to_image', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();

                if (response.ok && result.image_url) {
                    displayResultItem(result.image_url, result.params || currentGenerationParams, "Image-to-Image");
                    generalStatusArea.textContent = 'Image-to-Image generated successfully!';
                    generalStatusArea.style.color = 'green';
                } else {
                    let errorMessage = `Error: ${result.error || response.statusText}`;
                    if (result.details) errorMessage += ` - Details: ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}`;
                    generalStatusArea.textContent = errorMessage;
                    generalStatusArea.style.color = 'red';
                    if (response.status === 401) updateApiKeyUI(false, "API Key missing or invalid. Please check.");
                }
            } catch (error) {
                console.error('Fetch error during Image-to-Image generation:', error);
                generalStatusArea.textContent = `Network error: ${error.message}. Check console.`;
                generalStatusArea.style.color = 'red';
            } finally {
                generateImg2ImgButton.disabled = false;
                generateImg2ImgButton.textContent = 'Generate Image-to-Image';
            }
        });
    }

    // Event listener for generating Inpainting
    if (generateInpaintButton) {
        generateInpaintButton.addEventListener('click', async () => {
            currentGenerationParams = {
                prompt: inpaintPromptInput.value.trim(),
                model_id: inpaintModelSelection.value,
                seed: inpaintSeedInput.value.trim() ? parseInt(inpaintSeedInput.value.trim()) : null,
                // Add other inpainting params if they exist in UI
            };
            // originalInpaintImageForUpload is already set by its change listener

            if (!originalInpaintImageForUpload) {
                generalStatusArea.textContent = 'Please upload an image for inpainting.';
                generalStatusArea.style.color = 'red';
                inpaintImageUpload.focus();
                return;
            }
            if (!promptValue) {
                generalStatusArea.textContent = 'Please enter a prompt for inpainting.';
                generalStatusArea.style.color = 'red';
                inpaintPromptInput.focus();
                return;
            }

            const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            let hasMask = false;
            for (let i = 3; i < maskData.data.length; i += 4) {
                if (maskData.data[i] > 0) { hasMask = true; break; }
            }
            if (!hasMask) {
                 generalStatusArea.textContent = 'Please draw a mask on the image to indicate the area to inpaint.';
                 generalStatusArea.style.color = 'red';
                 return;
            }

            const apiKeyStatusResponse = await fetch('/api/get_api_key_status');
            const apiKeyStatusData = await apiKeyStatusResponse.json();
            if (!apiKeyStatusData.is_set) {
                generalStatusArea.textContent = 'API Key is not set. Please save your API Key first.';
                generalStatusArea.style.color = 'red';
                apiKeyInput.focus();
                return;
            }

            generalStatusArea.textContent = 'Generating Inpainting, please wait...';
            generalStatusArea.style.color = 'blue';
            if(imageResultArea) imageResultArea.innerHTML = '';
            generateInpaintButton.disabled = true;
            generateInpaintButton.textContent = 'Generating...';

            const maskImageDataURL = maskCanvas.toDataURL('image/png');

            const formData = new FormData();
            formData.append('original_image', originalInpaintImageForUpload);
            formData.append('mask_image_data_url', maskImageDataURL);
            formData.append('prompt', currentGenerationParams.prompt);
            formData.append('model_id', currentGenerationParams.model_id);
            if (currentGenerationParams.seed !== null) formData.append('seed', currentGenerationParams.seed);

            try {
                const response = await fetch('/api/inpaint', { method: 'POST', body: formData });
                const result = await response.json();

                if (response.ok && result.image_url) {
                    displayResultItem(result.image_url, result.params || currentGenerationParams, "Inpainting");
                    generalStatusArea.textContent = 'Inpainting generated successfully!';
                    generalStatusArea.style.color = 'green';
                } else {
                    let errorMessage = `Error: ${result.error || response.statusText}`;
                    if (result.details) errorMessage += ` - Details: ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}`;
                    generalStatusArea.textContent = errorMessage;
                    generalStatusArea.style.color = 'red';
                    if (response.status === 401) updateApiKeyUI(false, "API Key missing or invalid. Please check.");
                }
            } catch (error) {
                console.error('Fetch error during Inpainting generation:', error);
                generalStatusArea.textContent = `Network error: ${error.message}. Check console.`;
                generalStatusArea.style.color = 'red';
            } finally {
                generateInpaintButton.disabled = false;
                generateInpaintButton.textContent = 'Generate Inpainting';
            }
        });
    }

    // Event listener for generating Upscaling
    if (generateUpscaleButton) {
        generateUpscaleButton.addEventListener('click', async () => {
            currentGenerationParams = {
                model_id: upscaleModelSelection.value,
                // Upscalers usually don't have prompts, seeds etc. but structure is ready if needed
            };
            // originalUpscaleImageForUpload is set by its change listener

            if (!originalUpscaleImageForUpload) {
                generalStatusArea.textContent = 'Please upload an image for upscaling.';
                generalStatusArea.style.color = 'red';
                upscaleImageUpload.focus();
                return;
            }

            const apiKeyStatusResponse = await fetch('/api/get_api_key_status');
            const apiKeyStatusData = await apiKeyStatusResponse.json();
            if (!apiKeyStatusData.is_set) {
                generalStatusArea.textContent = 'API Key is not set. Please save your API Key first.';
                generalStatusArea.style.color = 'red';
                apiKeyInput.focus();
                return;
            }

            generalStatusArea.textContent = 'Upscaling image, please wait...';
            generalStatusArea.style.color = 'blue';
            generatedImage.style.display = 'none';
            generateUpscaleButton.disabled = true;
            generateUpscaleButton.textContent = 'Upscaling...';

            const formData = new FormData();
            formData.append('image', originalUpscaleImageForUpload);
            formData.append('model_id', modelValue);
            // Add other parameters like 'scale_factor' if UI and backend support it

            try {
                const response = await fetch('/api/upscale', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();

                if (response.ok && result.image_url) {
                    generatedImage.src = result.image_url;
                    generatedImage.style.display = 'block';
                    generalStatusArea.textContent = 'Image upscaled successfully!';
                    generalStatusArea.style.color = 'green';
                } else {
                    let errorMessage = `Error: ${result.error || response.statusText}`;
                    if (result.details) {
                        errorMessage += ` - Details: ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}`;
                    }
                    generalStatusArea.textContent = errorMessage;
                    generalStatusArea.style.color = 'red';
                    if (response.status === 401) {
                        updateApiKeyUI(false, "API Key missing or invalid. Please check.");
                    }
                }
            } catch (error) {
                console.error('Fetch error during upscaling generation:', error);
                generalStatusArea.textContent = `Network error: ${error.message}. Check console.`;
                generalStatusArea.style.color = 'red';
            } finally {
                generateUpscaleButton.disabled = false;
                generateUpscaleButton.textContent = 'Upscale Image';
            }
        });
    }

    // Event listener for generating Background Removal
    if (generateBgRemoveButton) {
        generateBgRemoveButton.addEventListener('click', async () => {
            const modelValue = bgRemoveModelSelection.value;

            if (!originalBgRemoveImageForUpload) {
                generalStatusArea.textContent = 'Please upload an image for background removal.';
                generalStatusArea.style.color = 'red';
                bgRemoveImageUpload.focus();
                return;
            }

            const apiKeyStatusResponse = await fetch('/api/get_api_key_status');
            const apiKeyStatusData = await apiKeyStatusResponse.json();
            if (!apiKeyStatusData.is_set) {
                generalStatusArea.textContent = 'API Key is not set. Please save your API Key first.';
                generalStatusArea.style.color = 'red';
                apiKeyInput.focus();
                return;
            }

            generalStatusArea.textContent = 'Removing background, please wait...';
            generalStatusArea.style.color = 'blue';
            generatedImage.style.display = 'none';
            generateBgRemoveButton.disabled = true;
            generateBgRemoveButton.textContent = 'Processing...';

            const formData = new FormData();
            formData.append('image', originalBgRemoveImageForUpload);
            formData.append('model_id', modelValue);

            try {
                const response = await fetch('/api/remove_background', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();

                if (response.ok && result.image_url) {
                    generatedImage.src = result.image_url; // The result should be a PNG with transparency
                    generatedImage.style.display = 'block';
                    generalStatusArea.textContent = 'Background removed successfully!';
                    generalStatusArea.style.color = 'green';
                } else {
                    let errorMessage = `Error: ${result.error || response.statusText}`;
                    if (result.details) {
                        errorMessage += ` - Details: ${typeof result.details === 'object' ? JSON.stringify(result.details) : result.details}`;
                    }
                    generalStatusArea.textContent = errorMessage;
                    generalStatusArea.style.color = 'red';
                    if (response.status === 401) {
                        updateApiKeyUI(false, "API Key missing or invalid. Please check.");
                    }
                }
            } catch (error) {
                console.error('Fetch error during background removal:', error);
                generalStatusArea.textContent = `Network error: ${error.message}. Check console.`;
                generalStatusArea.style.color = 'red';
            } finally {
                generateBgRemoveButton.disabled = false;
                generateBgRemoveButton.textContent = 'Remove Background';
            }
        });
    }
});

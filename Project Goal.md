**Project Goal:**
Create a user-friendly, web-based Graphical User Interface (GUI) that interacts with the FAL AI API (fal.ai) to perform various image generation and manipulation tasks. The application should be easily runnable locally, and straightforward to self-host or deploy on cloud platforms without requiring Docker or complex containerization setups.

**Core Principles:**
1.  **User-Friendliness:** The interface must be intuitive, even for users not deeply familiar with AI model parameters.
2.  **Comprehensive FAL Model Support:** The GUI should aim to support a wide array of image generation and utility models available through FAL.
3.  **Performance & Responsiveness:** The frontend should be responsive, and interactions should provide clear feedback, especially during API calls.
4.  **Simplicity of Deployment:** The backend and frontend should be structured for easy setup and deployment. Prioritize common web technologies that are widely supported.

**I. Overall Architecture & Technology Stack:**

*   **Web-Based Application:**
    *   **Frontend:** HTML, CSS, and JavaScript. Consider using a lightweight JavaScript framework/library (e.g., Svelte, Vue.js, or even modern vanilla JS) for managing UI components and state efficiently. The frontend will primarily handle user input and display results.
    *   **Backend:** A simple web server to handle API requests to FAL.ai, manage user sessions (if needed for API key security in a hosted environment), and serve the frontend.
        *   **Recommended Backend Language/Framework:**
            *   **Python:** Flask or FastAPI (FastAPI is recommended for its async capabilities, which are useful for handling long-running FAL tasks, and automatic OpenAPI documentation).
            *   **Node.js:** Express.js.
        *   The backend will act as a proxy to the FAL API. This is crucial to protect the FAL API key, which should not be exposed in the frontend client-side code.
*   **Deployment:**
    *   **Local Execution:** Must be runnable locally with simple commands (e.g., `python app.py` or `npm start`).
    *   **Self-Hosting/Cloud Hosting:** The structure should allow easy deployment on platforms like PythonAnywhere, Heroku, Render, Vercel (for frontend if separated), or a simple Virtual Private Server (VPS) by just copying files and running the server. Avoid any Docker-specific configurations.

**II. FAL API Integration Details (Backend Responsibility):**

*   **Authentication:** The backend must securely handle the FAL API key. Users will input their API key into the GUI, and it should be stored securely (e.g., environment variable for the backend server, or securely managed if user accounts are implemented). All requests to FAL API must include the `Authorization: Key {FAL_API_KEY}` header.
*   **Model Endpoints:** The backend will make requests to the appropriate FAL model URLs based on user selections in the GUI.
*   **Request Formatting:** Construct JSON payloads according to the specific FAL model's API documentation (e.g., for prompts, image inputs, control parameters).
*   **Asynchronous Operations & Polling:**
    *   FAL API often returns a `status_url` for long-running tasks. The backend must poll this URL to get the final result or any error messages.
    *   The frontend should display progress/loading states based on feedback from the backend during this polling process.
*   **Error Handling:** Gracefully handle API errors from FAL (e.g., rate limits, invalid inputs, model errors) and relay meaningful error messages to the frontend.

**III. Frontend GUI - Layout and Sections:**

*   **Overall Layout:** A clean, modern, and responsive design. Consider a multi-panel layout:
    *   **Left Panel (Configuration):** For all input parameters, model selection, and controls.
    *   **Center/Right Panel (Workspace/Results):** For displaying input images, the inpainting/outpainting canvas, and generated output images.
    *   **Bottom/Side Panel (History/Gallery):** To show a history of generated images.
*   **Responsiveness:** The layout should adapt well to different screen sizes.

**IV. Frontend GUI - Feature Specifications:**

1.  **API Key Management (Settings/Configuration Section):**
    *   Input field for the user to enter their FAL API Key.
    *   Mechanism to save/store this key (e.g., browser's `localStorage` for local convenience, but with a clear disclaimer about browser storage security. For hosted versions, a more secure server-side session or user account approach would be better if implemented).
    *   Button to clear/update the API key.

2.  **Mode Selection:**
    *   A primary dropdown or tab system to select the main operation mode:
        *   Text-to-Image
        *   Image-to-Image (including style transfer, refinement)
        *   Inpainting
        *   Outpainting
        *   Upscaling
        *   Background Removal
        *   (Potentially others like ControlNet-style guidance if specific FAL models are targeted)

3.  **Text-to-Image Mode:**
    *   **Model Selection Dropdown:** Dynamically populated or pre-defined list of FAL text-to-image models (e.g., `fal-ai/fast-sdxl`, `fal-ai/flux/dev`, `fal-ai/recraft-v3`, `AuraFlow`, `F Lite`, `rundiffusion-fal/juggernaut-flux`).
    *   **Prompt Input:** Large multi-line text area.
    *   **Negative Prompt Input:** Separate multi-line text area.
    *   **Image Size/Aspect Ratio:** Dropdown with common options (1:1, 16:9, 4:3, etc.) and an option for custom width/height (ensure these are validated against model capabilities).
    *   **Number of Images to Generate:** Input field (e.g., 1-4).
    *   **Seed:** Input field (number). Option for a "random seed" button.
    *   **Guidance Scale (CFG Scale):** Slider or number input.
    *   **Number of Inference Steps:** Slider or number input.
    *   **Scheduler/Sampler Selection:** Dropdown if FAL models offer this.
    *   **"Generate" Button.**

4.  **Image-to-Image Mode:**
    *   **Model Selection Dropdown:** List of FAL image-to-image models (e.g., `fal-ai/recraft/v3/image-to-image`, `rundiffusion-fal/juggernaut-flux/base/image-to-image`, `FLUX.1 Redux`).
    *   **Input Image Upload:**
        *   Button to open file dialog.
        *   Drag-and-drop area.
        *   Display a preview of the uploaded image.
    *   **Prompt Input:** For guiding the transformation.
    *   **Negative Prompt Input.**
    *   **Image Strength / Denoising Strength:** Slider (0 to 1) to control influence of the input image.
    *   Other relevant parameters from Text-to-Image (Seed, Steps, CFG).
    *   **"Generate" Button.**

5.  **Inpainting Mode:**
    *   **Model Selection Dropdown:** List of FAL inpainting models (e.g., `fal-ai/inpaint`, Flux-Pro Inpainting, SDXL Inpainting).
    *   **Input Image Upload:** Same as Image-to-Image.
    *   **Image Display & Masking Canvas:**
        *   Display the uploaded image.
        *   Drawing tools:
            *   Brush tool with adjustable size (slider).
            *   Eraser tool with adjustable size.
        *   Mask color should be visually distinct.
        *   Buttons: "Clear Mask," "Undo Last Stroke (optional)."
    *   **Mask Upload Option:** Allow uploading a black-and-white mask image.
    *   **Inpainting Prompt:** Text area for what to generate in the masked area.
    *   **"Generate Inpaint" Button.**

6.  **Outpainting Mode (if supported by a FAL model like FLUX.1 Fill):**
    *   **Model Selection Dropdown.**
    *   **Input Image Upload.**
    *   **Canvas Controls:**
        *   Ability to specify direction(s) for outpainting (e.g., left, right, top, bottom).
        *   Specify pixel amount for expansion.
    *   **Outpainting Prompt:** Text area for guiding the generated content in new areas.
    *   **"Generate Outpaint" Button.**

7.  **Image Upscaling Mode:**
    *   **Model Selection Dropdown:** List of FAL upscaling models (e.g., "Creative Upscaler," "SUPIR Upscaler," "AuraSR").
    *   **Input Image Upload.**
    *   **Upscale Factor/Target Resolution:** Options based on model capabilities.
    *   **"Upscale Image" Button.**

8.  **Background Removal Mode:**
    *   **Model Selection Dropdown:** (e.g., FAL's background removal model).
    *   **Input Image Upload.**
    *   **"Remove Background" Button.** Output should ideally be a PNG with transparency.

9.  **Advanced Control Features (Conditional, based on FAL model support):**
    *   **ControlNet-like Inputs (e.g., for FLUX.1 Depth, FLUX.1 Canny):**
        *   Option to upload control maps (depth map, Canny edge image).
        *   If FAL has an "Image Preprocessors" model, integrate an option to generate these maps from the input image directly.
    *   **LoRA Selection:** If FAL API allows specifying LoRAs for models like FLUX.1, provide a mechanism to select/input LoRA identifiers and weights.

10. **Results Display:**
    *   A dedicated area to display generated images (can be a gallery view if multiple images are generated).
    *   For each image:
        *   **Download Button:** (Allow choosing format if possible, default to PNG/JPEG).
        *   **"Use as Input" Button:** Quickly send a generated image to the "Input Image" slot for Image-to-Image, Inpainting, etc.
        *   **"Upscale" Button:** Shortcut to send to Upscaling mode.
        *   Display seed and other key generation parameters used.

11. **Generation History/Gallery:**
    *   A persistent (e.g., using `localStorage` for local, or database for hosted) gallery of previously generated images.
    *   Thumbnails of images.
    *   On click, show larger preview and associated parameters (prompt, seed, model, etc.).
    *   Option to "Reload" parameters from a history item back into the input fields.
    *   Option to delete history items.

12. **User Feedback & Progress:**
    *   **Loading Indicators:** Prominently display loading animations/spinners when an API call is in progress.
    *   **Progress Messages:** Show messages like "Uploading image...", "Queued (Position #X)...", "Generating...", "Polling for results...".
    *   **Error Display:** Clearly display error messages from the backend/FAL API in a user-friendly way (e.g., a toast notification or a dedicated error message area).
    *   **Cost Estimation (Optional but nice):** If FAL provides cost-per-call or pixel data, try to display an estimated cost or credits used (requires careful handling and knowledge of FAL's billing).

13. **Queue Management (reflecting FAL's behavior):**
    *   If FAL API returns queue position, display this to the user.
    *   Provide a "Cancel Request" button (backend would need to be able to attempt to cancel, though FAL API might not support cancellation of already queued tasks directly, this could stop polling).

**V. Non-Functional Requirements:**

*   **Security:**
    *   The FAL API key must NOT be exposed in client-side JavaScript. All FAL API calls must be proxied through the backend.
    *   Basic input sanitization on the backend for any text inputs.
*   **Code Quality:**
    *   Well-commented code, especially the backend logic for FAL API interaction.
    *   Modular design for both frontend components and backend routes/functions.
*   **Error Handling:** Robust error handling on both frontend and backend.
*   **Documentation (in code comments or a separate README.md):**
    *   How to set up and run the application locally.
    *   How to configure the FAL API key.
    *   Brief overview of the architecture.
    *   Instructions for simple deployment to a PaaS or VPS.

**VI. What to Avoid:**

*   **Docker or any containerization technology:** Deployment should be as simple as copying files and running a script.
*   **Complex Build Processes:** If a frontend framework is used, ensure the build process is simple (e.g., `npm run build`) and outputs static files that the backend can serve.
*   **Databases (for local-first version):** For the initial local-focused version, `localStorage` can be used for history. If user accounts and persistent storage across devices are desired for a hosted version, then a simple database (like SQLite for self-hosted, or a managed DB for cloud) could be a later addition.
*   Over-reliance on obscure or very new libraries that might complicate setup.

**Example Workflow (Text-to-Image):**
1.  User enters API Key in settings.
2.  User navigates to "Text-to-Image" mode.
3.  User selects a model (e.g., "FLUX.1 Pro").
4.  User types a prompt: "A majestic cat astronaut exploring a cheese moon."
5.  User adjusts parameters (e.g., aspect ratio 16:9, seed 12345).
6.  User clicks "Generate."
7.  Frontend disables the "Generate" button, shows a loading spinner.
8.  Frontend sends request (prompt, parameters) to the backend.
9.  Backend validates input, adds FAL API key, and sends request to the selected FAL model endpoint.
10. FAL API responds with a `status_url`.
11. Backend starts polling the `status_url`. Frontend shows "Generating (Queue position X)..." or similar.
12. Once FAL task is complete, backend receives the image URL(s) or image data.
13. Backend sends image URL(s)/data back to the frontend.
14. Frontend displays the generated image(s), enables "Generate" button, and hides spinner.
15. User can download the image or use it as input for another task.
16. The generation details (prompt, seed, image thumbnail/URL) are added to the History panel.

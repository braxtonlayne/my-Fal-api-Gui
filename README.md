# FAL AI GUI

## Overview

The FAL AI GUI is a web-based graphical user interface designed to interact with various models available on the Fal AI platform. It provides an intuitive way for users to explore and experiment with cutting-edge AI models without needing to write code directly against the API. The application dynamically renders UI controls based on the specific parameters of each selected model and supports a range of generation modes including text-to-image, image-to-image, video generation, inpainting, upscaling, and background removal.

## Features

*   **Multiple Generation Modes:**
    *   Text-to-Image
    *   Image-to-Image
    *   Video Generation (Text-to-Video, Image-to-Video, Multi-Image to Video)
    *   Inpainting (Image Editing)
    *   Image Upscaling
    *   Background Removal
*   **Dynamic Model Controls:** UI elements for model parameters are generated dynamically based on model-specific schemas, providing tailored options for each model.
*   **Global Safety Settings:** Users can select a global safety level (Default, Strict, None) which is applied to models that support client-side safety parameters.
*   **Generation History:** Keeps a local history of generated images and videos, allowing users to review past results and reload parameters.
*   **API Key Management:** Securely saves the FAL API key in a server-side session.

## Setup and Running Locally

### Prerequisites

*   Python 3.7+
*   pip (Python package installer)

### Clone the Repository
```bash
# If you have cloned this repository:
# git clone <repository_url>
# cd <repository_directory>
```
(Note: In the current environment, the files are already present.)

### Installation

1.  Navigate to the application directory (if you cloned it).
2.  Install the required Python packages:
    ```bash
    pip install -r fal_gui/requirements.txt
    ```

### API Key Configuration

*   The FAL API key is required to use the application. Once the application is running, enter your FAL API key in the "API Key" section of the GUI. It will be saved securely in a server-side session.
*   For production deployments, it's crucial to set the `FLASK_SECRET_KEY` environment variable. This key is used by Flask to sign session cookies and other security-sensitive data. A strong, random key should be generated.
    ```bash
    export FLASK_SECRET_KEY='your_strong_random_secret_key_here'
    ```

### Running the Application

1.  Ensure you are in the root directory where the `fal_gui` folder is located.
2.  Run the Flask application:
    ```bash
    python fal_gui/app/app.py
    ```
3.  The application will start, typically in debug mode for local development.

### Accessing the Application

*   Open your web browser and navigate to: `http://localhost:5001` (or `http://127.0.0.1:5001`)

## Architecture Overview

*   **Frontend:**
    *   HTML (`index.html`): Structure of the web page.
    *   CSS (`style.css`): Styling for the user interface.
    *   JavaScript:
        *   `model_schemas.js`: Contains JavaScript objects defining the input parameters, types, descriptions, and constraints (like enums, ranges) for each supported FAL AI model. This file is crucial for dynamically generating the UI.
        *   `script.js`: Handles all client-side logic, including:
            *   Populating model selection dropdowns.
            *   Dynamically rendering UI controls based on selected model schemas from `model_schemas.js`.
            *   Collecting user input from these dynamic forms.
            *   Making API calls to the Flask backend.
            *   Displaying results (images and videos).
            *   Managing generation history.
            *   Handling API key input and status.

*   **Backend (Python Flask - `app.py`):**
    *   Acts as a proxy between the user's browser and the Fal AI API.
    *   Serves the frontend HTML, CSS, and JavaScript files.
    *   Manages the FAL API key securely in a server-side session (not exposed to the client).
    *   Provides API endpoints (`/api/...`) that the frontend calls for:
        *   Saving/clearing the API key.
        *   Performing generation tasks (text-to-image, image-to-image, video, etc.).
    *   Constructs the appropriate payload for the Fal AI API based on user input and selected model.
    *   Handles polling for results from Fal AI for asynchronous operations.
    *   Processes different types of model outputs (images, videos, potential errors) and relays them to the frontend.
    *   Implements safety parameter logic based on global settings from the UI.

## Deployment (Simple Guide)

For deploying this Flask application, you can use Platform-as-a-Service (PaaS) options or a Virtual Private Server (VPS).

*   **PaaS Options (e.g., PythonAnywhere, Heroku, Render):**
    *   These platforms often simplify deployment by handling server management.
    *   Typically, you'll need to:
        1.  Upload your application files (the `fal_gui` directory and `README.md`, `requirements.txt`).
        2.  Ensure `requirements.txt` lists all necessary dependencies (Flask, Requests).
        3.  Configure the `FLASK_SECRET_KEY` as an environment variable in the PaaS dashboard.
        4.  Specify the command to run your application. Instead of Flask's development server (`python fal_gui/app/app.py`), use a production-ready WSGI server like Gunicorn or Waitress.

*   **VPS (e.g., AWS EC2, DigitalOcean Droplets, Linode):**
    *   Provides more control but requires more setup.
    *   Steps generally involve:
        1.  Setting up the server environment (OS, Python, pip).
        2.  Copying your application files.
        3.  Installing requirements: `pip install -r fal_gui/requirements.txt`.
        4.  Setting the `FLASK_SECRET_KEY` environment variable persistently (e.g., in `.bashrc`, `.profile`, or systemd service files).
        5.  Running the application using a production WSGI server. Example with Gunicorn:
            ```bash
            # From the directory containing the fal_gui folder
            gunicorn --workers 4 --bind 0.0.0.0:8000 fal_gui.app:app
            ```
            (Adjust host, port, and number of workers as needed. `0.0.0.0` makes it accessible externally.)
        6.  Consider setting up a reverse proxy (like Nginx or Apache) to handle incoming connections, serve static files, and manage HTTPS.

**General Deployment Advice:**

*   **Turn off Debug Mode:** Ensure `app.run(debug=True)` in `app.py` is NOT used in production. WSGI servers handle this.
*   **WSGI Server:** Flask's built-in server is for development only. Gunicorn and Waitress are popular choices for production.
    *   Install Gunicorn: `pip install gunicorn`
    *   Install Waitress: `pip install waitress`
    *   Waitress example (cross-platform): `waitress-serve --host 0.0.0.0 --port 8000 fal_gui.app:app`
*   **Environment Variables:** Always manage sensitive information like `FLASK_SECRET_KEY` and potentially `FAL_KEY` (if not user-set via GUI) through environment variables, not hardcoded in the source.

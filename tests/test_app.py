import pytest
import requests
from unittest.mock import patch, MagicMock
from io import BytesIO
from fal_gui.app.app import app as flask_app # Corrected import

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    flask_app.config['SECRET_KEY'] = 'test_secret_key' # Set a dummy secret key for session
    with flask_app.test_client() as client:
        yield client

def test_api_generate_http_error_non_json_response(client):
    mock_http_error = requests.exceptions.HTTPError()
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.headers = {'Content-Type': 'text/html'}
    mock_response.text = '<html><body><h1>Not Found</h1></body></html>'
    # This mock_response.json should ideally not be called if the Content-Type check works.
    # If it IS called, it means the check failed, and it should raise an error as it would in real life
    # if trying to parse HTML as JSON.
    mock_response.json.side_effect = requests.exceptions.JSONDecodeError("Expecting value", "doc", 0)
    mock_http_error.response = mock_response

    with patch('fal_gui.app.app.requests.post', side_effect=mock_http_error) as mock_post:
        with client.session_transaction() as sess:
            sess['FAL_API_KEY'] = 'test_key'

        response = client.post('/api/generate', json={
            'model_id': 'fal-ai/fast-sdxl',
            'prompt': 'test'
        })

        assert response.status_code == 404
        assert response.json == {"error": "FAL API Error: 404", "details": "<html><body><h1>Not Found</h1></body></html>"}
        mock_post.assert_called_once() # Ensure requests.post was actually called
        # We want to ensure that `response.json()` was NOT called on the mock_response from requests.post
        # because the Content-Type was not 'application/json'. The actual `e.response.text` should have been used.
        mock_response.json.assert_not_called()

def test_api_image_to_image_http_error_non_json_response(client):
    mock_http_error = requests.exceptions.HTTPError()
    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_response.headers = {'Content-Type': 'text/html'}
    mock_response.text = '<html><body><h1>Not Found</h1></body></html>'
    mock_response.json.side_effect = requests.exceptions.JSONDecodeError("Expecting value", "doc", 0)
    mock_http_error.response = mock_response

    with patch('fal_gui.app.app.requests.post', side_effect=mock_http_error) as mock_post:
        with client.session_transaction() as sess:
            sess['FAL_API_KEY'] = 'test_key'

        data = {
            'model_id': 'fal-ai/sdxl-i2i-placeholder', # A model from IMG2IMG_MODEL_URLS
            'image': (BytesIO(b"fake image data"), 'test.jpg')
        }
        response = client.post('/api/image_to_image', data=data, content_type='multipart/form-data')

        assert response.status_code == 404
        # The error message detail comes from the specific except block in api_image_to_image
        assert response.json == {"error": "FAL API Error (Img2Img): 404", "details": "<html><body><h1>Not Found</h1></body></html>"}
        mock_post.assert_called_once()
        mock_response.json.assert_not_called()

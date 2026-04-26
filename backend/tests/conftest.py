"""Pytest configuration and shared fixtures."""

import pytest
import sys
import os
from pathlib import Path
from unittest.mock import Mock, MagicMock, patch

# Add backend directory to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# Mock environment variables before importing main
os.environ["IMGFLIP_USERNAME"] = "test_user"
os.environ["IMGFLIP_PASSWORD"] = "test_pass"
os.environ["GEMINI_API_KEY"] = "test_gemini_key"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"


@pytest.fixture
def mock_tfidf():
    """Mock TF-IDF transformer."""
    mock = MagicMock()
    mock.transform.return_value = [[0.5]]
    return mock


@pytest.fixture
def mock_clf():
    """Mock classifier."""
    mock = MagicMock()
    mock.predict_proba.return_value = [[0.7, 0.3]]  # Safe text
    return mock


@pytest.fixture
def mock_genai_client():
    """Mock Google Generative AI client."""
    mock = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Your generated caption here"
    mock.models.generate_content.return_value = mock_response
    return mock


@pytest.fixture
def meme_request_data():
    """Sample MemeRequest data for testing."""
    return {
        "idea": "When you finish your project the night before deadline",
        "caption": None,
        "texts": None,
        "template_id": None,
    }


@pytest.fixture
def template_data():
    """Sample template data from Imgflip API."""
    return [
        {
            "id": 61579,
            "name": "Drake Hotline Bling",
            "url": "https://i.imgflip.com/30b1gx.jpg",
            "width": 1200,
            "height": 1280,
            "box_count": 2,
        },
        {
            "id": 181913649,
            "name": "Distracted Boyfriend",
            "url": "https://i.imgflip.com/1ur9b0.jpg",
            "width": 1200,
            "height": 800,
            "box_count": 3,
        },
    ]


@pytest.fixture
def imgflip_response_success():
    """Successful Imgflip API response."""
    return {
        "success": True,
        "data": {
            "url": "https://i.imgflip.com/7z8hfa.jpg",
            "page_url": "https://imgflip.com/i/7z8hfa",
        },
    }


@pytest.fixture
def imgflip_response_failure():
    """Failed Imgflip API response."""
    return {
        "success": False,
        "error_message": "Invalid template_id",
    }

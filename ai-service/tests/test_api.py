"""Basic API tests for AI service."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "CityPulse AI Service"
    assert "endpoints" in data


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "models" in data
    assert "database" in data
    assert data["status"] in ["healthy", "degraded", "unhealthy"]


def test_models_endpoint():
    """Test models info endpoint."""
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "vehicle_detection" in data
    assert "road_damage_detection" in data


def test_process_video_missing_file():
    """Test video processing with missing file."""
    response = client.post("/api/process-video")
    assert response.status_code == 422  # Validation error


def test_process_video_invalid_format():
    """Test video processing with invalid format."""
    files = {"video": ("test.txt", b"fake content", "text/plain")}
    response = client.post("/api/process-video", files=files)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "model_loaded": False,
        "continue_tts_available": True
    }

def test_conversations_empty():
    response = client.get("/conversations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_conversation():
    response = client.post("/conversations/")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "New Chat"

def test_voices():
    response = client.get("/tts/voices")
    assert response.status_code == 200
    data = response.json()
    assert "voices" in data
    assert isinstance(data["voices"], list)
    assert len(data["voices"]) > 0

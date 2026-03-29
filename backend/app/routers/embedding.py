from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

# Conditional import to allow the app to run even if sentence-transformers is missing
try:
    from sentence_transformers import SentenceTransformer
    # We use a small, fast generic model for this example
    model = SentenceTransformer('all-MiniLM-L6-v2')
except ImportError:
    model = None

router = APIRouter(prefix="/embedding", tags=["Embedding"])

class EmbeddingRequest(BaseModel):
    texts: List[str]

@router.post("/generate")
async def generate_embeddings(request: EmbeddingRequest):
    if model is None:
        raise HTTPException(
            status_code=501, 
            detail="sentence-transformers is not installed. Install with `pip install sentence-transformers`"
        )
        
    if not request.texts:
        raise HTTPException(status_code=400, detail="Empty text list")
        
    try:
        # Generate embeddings
        embeddings = model.encode(request.texts)
        # Convert to list of lists of floats for JSON serialization
        results = [emb.tolist() for emb in embeddings]
        return {"embeddings": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings: {str(e)}")

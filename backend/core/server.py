from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import asyncio
import json

from core.models.llm_client import LLMClient
from core.agents.simple_agent import SimpleAgent
from core.agents.chain_of_thought_agent import ChainOfThoughtAgent
from core.pipelines.prompt_pipeline import PromptPipeline

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Toolkit API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class PreferencesModel(BaseModel):
    openai_api_key: Optional[str] = None
    claude_api_key: Optional[str] = None
    ollama_endpoint: str = "http://localhost:11434"
    default_model: str = "gpt-3.5-turbo"
    max_tokens: int = 2048
    temperature: float = 0.7


class SimplePromptRequest(BaseModel):
    prompt: str
    model: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class ChainOfThoughtRequest(BaseModel):
    problem: str
    model: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class ChainOfThoughtResponse(BaseModel):
    steps: List[str]
    final_answer: str
    reasoning_process: str


# Global state
current_preferences = PreferencesModel()
llm_client = None
pipeline = None


@app.on_startup
async def startup_event():
    """Initialize the application"""
    global current_preferences, llm_client, pipeline

    current_preferences = PreferencesModel(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        claude_api_key=os.getenv("CLAUDE_API_KEY"),
        ollama_endpoint=os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434"),
        default_model=os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo"),
        max_tokens=int(os.getenv("MAX_TOKENS", "2048")),
        temperature=float(os.getenv("TEMPERATURE", "0.7"))
    )

    llm_client = LLMClient(current_preferences)
    pipeline = PromptPipeline(llm_client)


@app.get("/")
async def root():
    return {"message": "AI Toolkit API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-12-26"}


@app.get("/preferences", response_model=PreferencesModel)
async def get_preferences():
    """Get current preferences"""
    # Don't return sensitive API keys
    safe_prefs = current_preferences.dict()
    if safe_prefs.get("openai_api_key"):
        safe_prefs["openai_api_key"] = "***" + safe_prefs["openai_api_key"][-4:]
    if safe_prefs.get("claude_api_key"):
        safe_prefs["claude_api_key"] = "***" + safe_prefs["claude_api_key"][-4:]
    return safe_prefs


@app.post("/preferences")
async def update_preferences(prefs: PreferencesModel):
    """Update preferences and save to .env"""
    global current_preferences, llm_client, pipeline

    current_preferences = prefs

    # Update .env file
    env_content = f"""OPENAI_API_KEY={prefs.openai_api_key or ""}
CLAUDE_API_KEY={prefs.claude_api_key or ""}
OLLAMA_ENDPOINT={prefs.ollama_endpoint}
DEFAULT_MODEL={prefs.default_model}
MAX_TOKENS={prefs.max_tokens}
TEMPERATURE={prefs.temperature}
"""

    os.makedirs("config", exist_ok=True)
    with open("config/.env", "w") as f:
        f.write(env_content)

    # Reinitialize clients
    llm_client = LLMClient(current_preferences)
    pipeline = PromptPipeline(llm_client)

    return {"message": "Preferences updated successfully"}


@app.post("/prompt/simple")
async def simple_prompt(request: SimplePromptRequest):
    """Process simple prompt"""
    if not pipeline:
        raise HTTPException(status_code=500, detail="Pipeline not initialized")

    try:
        model = request.model or current_preferences.default_model
        max_tokens = request.max_tokens or current_preferences.max_tokens
        temperature = request.temperature or current_preferences.temperature

        result = await pipeline.process_request("simple", {
            "prompt": request.prompt,
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature
        })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/prompt/chain-of-thought", response_model=ChainOfThoughtResponse)
async def chain_of_thought_prompt(request: ChainOfThoughtRequest):
    """Process chain of thought prompt"""
    if not pipeline:
        raise HTTPException(status_code=500, detail="Pipeline not initialized")

    try:
        model = request.model or current_preferences.default_model
        max_tokens = request.max_tokens or current_preferences.max_tokens
        temperature = request.temperature or current_preferences.temperature

        result = await pipeline.process_request("chain_of_thought", {
            "problem": request.problem,
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature
        })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def get_available_models():
    """Get available models"""
    return {
        "openai": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
        "claude": ["claude-3-sonnet", "claude-3-opus", "claude-3-haiku"],
        "ollama": ["llama2", "codellama", "mistral", "phi"]
    }


@app.get("/history")
async def get_history():
    """Get request history"""
    if pipeline:
        return {"history": pipeline.get_history(limit=50)}
    return {"history": []}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
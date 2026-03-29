from typing import AsyncGenerator, List, Dict, Any
from openai import AsyncOpenAI
import anthropic

from app.config import settings

# Initialize clients
openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
groq_client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1") if settings.groq_api_key else None
ollama_client = AsyncOpenAI(api_key="ollama", base_url="http://localhost:11434/v1") # No real key needed
anthropic_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None

async def stream_openai_format(client: AsyncOpenAI, model: str, messages: List[Dict[str, str]], temperature: float = 0.7) -> AsyncGenerator[str, None]:
    if not client:
        yield "Error: Provider API Key not configured."
        return
        
    try:
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            stream=True,
            max_tokens=1024
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except Exception as e:
        yield f" Error processing request: {str(e)}"

async def stream_anthropic(model: str, messages: List[Dict[str, str]], temperature: float = 0.7) -> AsyncGenerator[str, None]:
    if not anthropic_client:
        yield "Error: Anthropic API Key not configured."
        return
        
    claude_messages = [m for m in messages if m["role"] != "system"]
    system_message = None
    system_msgs = [m for m in messages if m["role"] == "system"]
    if system_msgs:
        system_message = system_msgs[0]["content"]

    try:
        kwargs = {
            "model": model,
            "max_tokens": 1024,
            "messages": claude_messages,
            "temperature": temperature,
        }
        if system_message:
            kwargs["system"] = system_message
            
        async with anthropic_client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text
    except Exception as e:
        yield f" Error processing request: {str(e)}"

async def generate_chat_stream(provider: str, model: str, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    """Route request to the correct LLM provider and yield streamed text chunks."""
    if provider == "groq":
        async for chunk in stream_openai_format(groq_client, model, messages):
            yield chunk
    elif provider == "openai":
        async for chunk in stream_openai_format(openai_client, model, messages):
            yield chunk
    elif provider == "local":
        async for chunk in stream_openai_format(ollama_client, model, messages):
            yield chunk
    elif provider == "anthropic":
        async for chunk in stream_anthropic(model, messages):
            yield chunk
    else:
        yield f"Error: Unknown provider {provider}."

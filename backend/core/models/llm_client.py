import openai
import anthropic
import requests
from typing import Optional, Dict, Any
import asyncio
import aiohttp
import json


class LLMClient:
    def __init__(self, preferences):
        self.preferences = preferences
        self.openai_client = None
        self.claude_client = None

        if preferences.openai_api_key:
            self.openai_client = openai.AsyncOpenAI(api_key=preferences.openai_api_key)

        if preferences.claude_api_key:
            self.claude_client = anthropic.AsyncAnthropic(api_key=preferences.claude_api_key)

    async def generate_response(self, prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate response using specified model"""

        if model.startswith("gpt"):
            return await self._openai_request(prompt, model, max_tokens, temperature)
        elif model.startswith("claude"):
            return await self._claude_request(prompt, model, max_tokens, temperature)
        elif model in ["llama2", "codellama", "mistral", "phi"]:
            return await self._ollama_request(prompt, model, max_tokens, temperature)
        else:
            raise ValueError(f"Unsupported model: {model}")

    async def _openai_request(self, prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """OpenAI API request"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")

        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

    async def _claude_request(self, prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Claude API request"""
        if not self.claude_client:
            raise ValueError("Claude API key not configured")

        try:
            response = await self.claude_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")

    async def _ollama_request(self, prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Ollama API request"""
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": temperature
                }
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                        f"{self.preferences.ollama_endpoint}/api/generate",
                        json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("response", "")
                    else:
                        raise Exception(f"Ollama API returned status {response.status}")

        except Exception as e:
            raise Exception(f"Ollama API error: {str(e)}")
class SimpleAgent:
    def __init__(self, llm_client):
        self.llm_client = llm_client

    async def process_prompt(self, prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Process simple prompt with basic enhancement"""

        enhanced_prompt = f"""Please provide a helpful, accurate, and well-structured response to the following:

{prompt}

Response:"""

        response = await self.llm_client.generate_response(
            prompt=enhanced_prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature
        )

        return response.strip()
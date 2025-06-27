from typing import List, Dict, Any
import re


class ChainOfThoughtAgent:
    def __init__(self, llm_client):
        self.llm_client = llm_client

    async def process_problem(self, problem: str, model: str, max_tokens: int, temperature: float) -> Dict[str, Any]:
        """Process using chain of thought reasoning"""

        thinking_prompt = f"""Please solve this problem using clear step-by-step reasoning:

{problem}

Please structure your response as follows:
1. Understanding: What is being asked?
2. Analysis: Break down the problem
3. Steps: Work through each part systematically
4. Conclusion: Provide your final answer

Be thorough and show your reasoning process clearly."""

        full_response = await self.llm_client.generate_response(
            prompt=thinking_prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature
        )

        # Parse response into steps
        steps, final_answer = self._parse_response(full_response)

        return {
            "steps": steps,
            "final_answer": final_answer,
            "reasoning_process": full_response
        }

    def _parse_response(self, response: str) -> tuple:
        """Parse response into steps and final answer"""
        lines = response.split('\n')
        steps = []
        final_answer = ""

        current_step = ""
        in_conclusion = False

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check for step indicators
            if re.match(r'^\d+\.', line) or any(word in line.lower() for word in
                                                ['understanding:', 'analysis:', 'step', 'first', 'second', 'third',
                                                 'next']):
                if current_step:
                    steps.append(current_step.strip())
                current_step = line
            elif any(word in line.lower() for word in ['conclusion:', 'final answer:', 'therefore:', 'result:']):
                if current_step:
                    steps.append(current_step.strip())
                in_conclusion = True
                final_answer = line
            elif in_conclusion:
                final_answer += " " + line
            elif current_step:
                current_step += " " + line

        # Add last step
        if current_step and not in_conclusion:
            steps.append(current_step.strip())

        # Fallback if parsing fails
        if not steps:
            paragraphs = [p.strip() for p in response.split('\n\n') if p.strip()]
            steps = paragraphs[:-1] if len(paragraphs) > 1 else ["Analyzing the problem..."]
            final_answer = paragraphs[-1] if paragraphs else "Analysis complete."

        return steps, final_answer.strip()
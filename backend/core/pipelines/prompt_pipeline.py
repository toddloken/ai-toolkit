from typing import Dict, Any, List
import datetime
import json


class PromptPipeline:
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.history = []

    async def process_request(self, request_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process requests through the pipeline"""

        timestamp = datetime.datetime.now().isoformat()
        request_id = f"{request_type}_{len(self.history)}"

        try:
            if request_type == "simple":
                result = await self._process_simple(data)
            elif request_type == "chain_of_thought":
                result = await self._process_cot(data)
            else:
                raise ValueError(f"Unknown request type: {request_type}")

            # Log successful request
            self._log_request(request_id, request_type, timestamp, data, result, True)
            return result

        except Exception as e:
            # Log failed request
            self._log_request(request_id, request_type, timestamp, data, {"error": str(e)}, False)
            raise

    async def _process_simple(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process simple request"""
        from core.agents.simple_agent import SimpleAgent

        agent = SimpleAgent(self.llm_client)
        response = await agent.process_prompt(**data)
        return {"response": response}

    async def _process_cot(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process chain of thought request"""
        from core.agents.chain_of_thought_agent import ChainOfThoughtAgent

        agent = ChainOfThoughtAgent(self.llm_client)
        return await agent.process_problem(**data)

    def _log_request(self, request_id: str, request_type: str, timestamp: str,
                     input_data: Dict, output_data: Dict, success: bool):
        """Log request to history"""
        log_entry = {
            "id": request_id,
            "type": request_type,
            "timestamp": timestamp,
            "input": input_data,
            "output": output_data,
            "success": success
        }
        self.history.append(log_entry)

        # Keep only last 100 entries
        if len(self.history) > 100:
            self.history = self.history[-100:]

    def get_history(self, limit: int = None) -> List[Dict[str, Any]]:
        """Get request history"""
        if limit:
            return self.history[-limit:]
        return self.history
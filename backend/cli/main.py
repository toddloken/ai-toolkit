import click
import asyncio
import os
from dotenv import load_dotenv
from core.models.llm_client import LLMClient
from core.agents.simple_agent import SimpleAgent
from core.agents.chain_of_thought_agent import ChainOfThoughtAgent

load_dotenv()


class PreferencesModel:
    def __init__(self, **kwargs):
        self.openai_api_key = kwargs.get('openai_api_key')
        self.claude_api_key = kwargs.get('claude_api_key')
        self.ollama_endpoint = kwargs.get('ollama_endpoint', 'http://localhost:11434')
        self.default_model = kwargs.get('default_model', 'gpt-3.5-turbo')
        self.max_tokens = kwargs.get('max_tokens', 2048)
        self.temperature = kwargs.get('temperature', 0.7)


@click.group()
def cli():
    """AI Toolkit CLI"""
    pass


@cli.command()
@click.option('--prompt', '-p', required=True, help='Prompt to process')
@click.option('--model', '-m', default='gpt-3.5-turbo', help='Model to use')
def simple(prompt, model):
    """Process simple prompt"""

    async def run():
        prefs = PreferencesModel(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            claude_api_key=os.getenv("CLAUDE_API_KEY"),
            default_model=model
        )

        client = LLMClient(prefs)
        agent = SimpleAgent(client)

        try:
            response = await agent.process_prompt(
                prompt=prompt, model=model, max_tokens=2048, temperature=0.7
            )
            click.echo(f"\n🤖 Response:\n{response}\n")
        except Exception as e:
            click.echo(f"❌ Error: {e}")

    asyncio.run(run())


@cli.command()
@click.option('--problem', '-p', required=True, help='Problem to solve')
@click.option('--model', '-m', default='gpt-3.5-turbo', help='Model to use')
def think(problem, model):
    """Chain of thought reasoning"""

    async def run():
        prefs = PreferencesModel(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            claude_api_key=os.getenv("CLAUDE_API_KEY"),
            default_model=model
        )

        client = LLMClient(prefs)
        agent = ChainOfThoughtAgent(client)

        try:
            result = await agent.process_problem(
                problem=problem, model=model, max_tokens=2048, temperature=0.7
            )

            click.echo(f"\n🧠 Reasoning Steps:")
            for i, step in enumerate(result['steps'], 1):
                click.echo(f"   {i}. {step}")

            click.echo(f"\n✅ Final Answer:\n{result['final_answer']}\n")

        except Exception as e:
            click.echo(f"❌ Error: {e}")

    asyncio.run(run())


@cli.command()
def config():
    """Show configuration"""
    load_dotenv()

    click.echo("\n🔧 Configuration:")
    click.echo(f"   OpenAI API: {'✅ Set' if os.getenv('OPENAI_API_KEY') else '❌ Not set'}")
    click.echo(f"   Claude API: {'✅ Set' if os.getenv('CLAUDE_API_KEY') else '❌ Not set'}")
    click.echo(f"   Ollama: {os.getenv('OLLAMA_ENDPOINT', 'http://localhost:11434')}")
    click.echo()


if __name__ == '__main__':
    cli()
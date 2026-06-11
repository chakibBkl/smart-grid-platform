import asyncio
import sys
from .main import copilot

async def main():
    print("Initializing AI Energy Copilot...")
    count = copilot.initialize()
    print(f"Knowledge base initialized with {count} documents")

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        print(f"\nQuery: {query}")
        print("-" * 50)
        result = await copilot.process_message(query)
        print(f"\nResponse: {result['reply']}")
        print(f"\nSources: {result['sources']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Intent: {result['intent']}")
    else:
        print("Usage: python -m copilot.app 'your question here'")

if __name__ == "__main__":
    asyncio.run(main())

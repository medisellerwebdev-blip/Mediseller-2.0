from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

async def test_conn():
    load_dotenv()
    mongo_url = os.getenv('MONGO_URL')
    print(f"Connecting to: {mongo_url}")
    client = AsyncIOMotorClient(mongo_url)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("MongoDB connection successful!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_conn())

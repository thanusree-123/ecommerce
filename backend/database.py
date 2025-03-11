from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://thanu:thanu@ecommercedb.bnr2c.mongodb.net/?retryWrites=true&w=majority&appName=ecommerceDB')
DB_NAME = os.getenv('DB_NAME', 'ecommerceDB')  # Changed to match app.py

# MongoDB client instance
client = None
db = None

def init_db():
    """Initialize database connection"""
    global client, db
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        print(f"Connected to MongoDB: {MONGO_URI}/{DB_NAME}")
        
        # Create indexes if needed
        db.products.create_index("name")
        db.carts.create_index("user_id", unique=True)
        
        return True
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return False

def get_db():
    """Get database instance"""
    global db
    if db is None:
        init_db()
    return db

def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")
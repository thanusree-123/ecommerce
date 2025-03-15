from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import os
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB Atlas Configuration with improved connection handling
try:
    # MongoDB Connection String - consider using environment variables for credentials
    app.config["MONGO_URI"] = "mongodb+srv://thanu:thanu@ecommercedb.bnr2c.mongodb.net/ecommerceDB?retryWrites=true&w=majority"
    
    # Initialize PyMongo with the Flask app
    mongo = PyMongo(app)
    
    # Test connection
    mongo.db.command('ping')
    logger.info("Connected to MongoDB Atlas successfully!")
    
    # Initialize collections
    products_collection = mongo.db.products
    cart_collection = mongo.db.carts
    users_collection = mongo.db.users
except Exception as e:
    logger.error(f"Failed to connect to MongoDB Atlas: {str(e)}")
    raise

# Configure upload folder for product images
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper function to verify token (Added from first code)
def verify_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    # In a real app, you would verify the JWT token here
    # For now, we'll just check if it exists
    if token:
        return token
    return None

# Error handling decorator
def handle_errors(func):
    def error_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500
    error_wrapper.__name__ = func.__name__
    return error_wrapper

# **User Registration**
@app.route('/api/auth/register', methods=['POST'])
@handle_errors
def register():
    data = request.json
    if not data.get("name") or not data.get("username") or not data.get("email") or not data.get("mobile") or not data.get("password"):
        return jsonify({"success": False, "error": "All fields are required"}), 400
    # Check if user already exists
    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"success": False, "error": "User already exists"}), 400
    
    # Validate mobile number format (10 digits)
    if not data["mobile"].isdigit() or len(data["mobile"]) != 10:
        return jsonify({"success": False, "error": "Mobile number must be 10 digits"}), 400
    
    # Validate email format (@gmail.com only)
    if not data["email"].endswith("@gmail.com"):
        return jsonify({"success": False, "error": "Only Gmail addresses are allowed"}), 400
    hashed_password = generate_password_hash(data["password"])
    user_id = users_collection.insert_one({
        "name": data["name"],
        "username": data["username"],
        "email": data["email"],
        "mobile": data["mobile"],
        "password": hashed_password
    }).inserted_id
    return jsonify({"success": True, "message": "User registered successfully", "user_id": str(user_id)}), 201

# **User Login**
# In your Flask app.py
@app.route('/api/auth/login', methods=['POST'])
@handle_errors
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401

    # Check password hash
    if not check_password_hash(user["password"], password):
        return jsonify({"success": False, "error": "Invalid credentials"}), 401

    # Return user info along with token
    user_data = {
        "_id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "role": user.get("role", "user")
    }

    return jsonify({
        "success": True, 
        "message": "Login successful", 
        "token": "dummy-token", 
        "user": user_data
    }), 200

# Products endpoints
@app.route('/api/products', methods=['GET'])
@handle_errors
def get_products():
    products = list(products_collection.find())
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify({"success": True, "products": products}), 200

@app.route('/api/products', methods=['POST'])
@handle_errors
def add_product():
    # Check for token
    token = verify_token()
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
        
    data = request.json
    if not data.get('name') or not data.get('price') or not data.get('image'):
        return jsonify({"success": False, "error": "Name, price, and image are required"}), 400

    try:
        price = float(data.get('price'))
        if price <= 0:
            return jsonify({"success": False, "error": "Price must be greater than 0"}), 400
    except ValueError:
        return jsonify({"success": False, "error": "Price must be a valid number"}), 400

    product = {
        'name': data['name'],
        'price': price,
        'image': data['image']
    }

    product_id = products_collection.insert_one(product).inserted_id

    return jsonify({
        "success": True,
        "message": "Product added successfully",
        "product_id": str(product_id)
    }), 201

@app.route('/api/products/<product_id>', methods=['DELETE'])
@handle_errors
def delete_product(product_id):
    # Check for token
    token = verify_token()
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
        
    try:
        result = products_collection.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            return jsonify({"success": False, "error": "Product not found"}), 404

        cart_collection.update_many(
            {},
            {"$pull": {"items": {"product._id": product_id}}}
        )

        return jsonify({"success": True, "message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Invalid product ID format: {str(e)}"}), 400

# Cart endpoints
# In your Flask app (app.py)

@app.route('/api/cart', methods=['GET'])
@handle_errors
def get_cart():
    # Check for token
    token = verify_token()
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    # Get user ID from token or request
    # In a real app, you'd extract the user ID from the JWT token
    # For now, we'll get it from the query parameter
    user_id = request.args.get('user_id')
    
    # Ensure we have a user ID
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 400
    
    # Get the cart using the Cart class
    cart = Cart.get_cart(user_id)
    
    # Convert ObjectId to string for JSON serialization
    if '_id' in cart:
        cart['_id'] = str(cart['_id'])
    
    return jsonify({"success": True, "cart": cart}), 200

@app.route('/api/cart/add', methods=['POST'])
@handle_errors
def add_to_cart():
    # Check for token
    token = verify_token()
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    data = request.json
    product_id = data.get('product_id')
    user_id = data.get('user_id')
    
    # Validate required fields
    if not product_id:
        return jsonify({"success": False, "error": "Product ID is required"}), 400
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 400
    
    # Add item to cart
    updated_cart = Cart.add_item(product_id, user_id)
    if not updated_cart:
        return jsonify({"success": False, "error": "Product not found"}), 404
    
    # Convert ObjectId to string for JSON serialization
    if '_id' in updated_cart:
        updated_cart['_id'] = str(updated_cart['_id'])
    
    return jsonify({"success": True, "cart": updated_cart}), 200

@app.route('/api/cart/remove', methods=['POST'])
@handle_errors
def remove_from_cart():
    # Check for token
    token = verify_token()
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    data = request.json
    product_id = data.get('product_id')
    user_id = data.get('user_id')
    
    # Validate required fields
    if not product_id:
        return jsonify({"success": False, "error": "Product ID is required"}), 400
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 400
    
    # Remove item from cart
    updated_cart = Cart.remove_item(product_id, user_id)
    
    # Convert ObjectId to string for JSON serialization
    if '_id' in updated_cart:
        updated_cart['_id'] = str(updated_cart['_id'])
    
    return jsonify({"success": True, "cart": updated_cart}), 200

@app.route('/api/cart/clear', methods=['POST'])
@handle_errors
def clear_cart():
    # Check for token
    token = verify_token()
    if not token:
        return jsonify({"success": False, "error": "Authentication required"}), 401
    
    data = request.json
    user_id = data.get('user_id')
    
    # Validate required fields
    if not user_id:
        return jsonify({"success": False, "error": "User ID is required"}), 400
    
    # Clear the cart
    updated_cart = Cart.clear_cart(user_id)
    
    # Convert ObjectId to string for JSON serialization
    if '_id' in updated_cart:
        updated_cart['_id'] = str(updated_cart['_id'])
    
    return jsonify({"success": True, "message": "Cart cleared successfully", "cart": updated_cart}), 200
# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Add this to your app.py file
class Cart:
    @staticmethod
    def get_cart(user_id):
        # Find cart for user or create a new one if it doesn't exist
        cart = cart_collection.find_one({"user_id": user_id})
        if not cart:
            cart = {"user_id": user_id, "items": []}
            cart_collection.insert_one(cart)
        
        # Convert ObjectIds to strings for all products in items
        for item in cart.get("items", []):
            if "product" in item and "_id" in item["product"]:
                item["product"]["_id"] = str(item["product"]["_id"])
                
        return cart
    
    @staticmethod
    def add_item(product_id, user_id):
        try:
            # Find the product
            product = products_collection.find_one({"_id": ObjectId(product_id)})
            if not product:
                return None
                
            # Convert ObjectId to string for serialization
            product["_id"] = str(product["_id"])
            
            # Get or create user's cart
            cart = cart_collection.find_one({"user_id": user_id})
            if not cart:
                cart = {"user_id": user_id, "items": []}
                cart_collection.insert_one(cart)
            
            # Check if product already exists in cart
            product_exists = False
            for item in cart.get("items", []):
                if item["product"]["_id"] == product_id:
                    # Increment quantity
                    item["quantity"] += 1
                    product_exists = True
                    break
            
            # If product doesn't exist in cart, add it
            if not product_exists:
                cart["items"].append({"product": product, "quantity": 1})
            
            # Update cart in database
            cart_collection.update_one(
                {"user_id": user_id},
                {"$set": {"items": cart["items"]}}
            )
            
            return Cart.get_cart(user_id)
            
        except Exception as e:
            logger.error(f"Error adding item to cart: {str(e)}")
            return {"user_id": user_id, "items": []}
    
    @staticmethod
    def remove_item(product_id, user_id):
        try:
            # Get user's cart
            cart = cart_collection.find_one({"user_id": user_id})
            if not cart:
                return {"user_id": user_id, "items": []}
            
            # Find the product in the cart
            for i, item in enumerate(cart.get("items", [])):
                if item["product"]["_id"] == product_id:
                    # If quantity > 1, decrement
                    if item["quantity"] > 1:
                        cart["items"][i]["quantity"] -= 1
                    else:
                        # Otherwise remove the product
                        cart["items"].pop(i)
                    break
            
            # Update cart in database
            cart_collection.update_one(
                {"user_id": user_id},
                {"$set": {"items": cart["items"]}}
            )
            
            return Cart.get_cart(user_id)
            
        except Exception as e:
            logger.error(f"Error removing item from cart: {str(e)}")
            return {"user_id": user_id, "items": []}
    
    @staticmethod
    def clear_cart(user_id):
        try:
            # Update cart with empty items array
            cart_collection.update_one(
                {"user_id": user_id},
                {"$set": {"items": []}}
            )
            
            return {"user_id": user_id, "items": []}
            
        except Exception as e:
            logger.error(f"Error clearing cart: {str(e)}")
            return {"user_id": user_id, "items": []}

if __name__ == "__main__":
    app.run(debug=True)

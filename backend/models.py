

from bson import ObjectId
from database import get_db

class Product:
    @staticmethod
    def get_all():
        """Get all products from the database"""
        return list(get_db().products.find())
    
    @staticmethod
    def get_by_id(product_id):
        """Get a product by its ID"""
        try:
            return get_db().products.find_one({"_id": ObjectId(product_id)})
        except:
            return None
    
    @staticmethod
    def create(product_data):
        """Create a new product"""
        # Validate required fields
        if not product_data.get('name') or not product_data.get('price'):
            raise ValueError("Product name and price are required")
        
        # Insert product into database
        result = get_db().products.insert_one(product_data)
        return str(result.inserted_id)
    
    @staticmethod
    def delete(product_id):
        """Delete a product"""
        try:
            # Delete the product
            result = get_db().products.delete_one({"_id": ObjectId(product_id)})
            
            # If product was deleted, also remove it from all carts
            if result.deleted_count > 0:
                get_db().carts.update_many(
                    {},
                    {"$pull": {"items": {"product._id": product_id}}}
                )
                
            return result.deleted_count > 0
        except:
            return False

class Cart:
    @staticmethod
    def get_cart(user_id="default_user"):
        """Get a user's cart or create it if it doesn't exist"""
        cart = get_db().carts.find_one({"user_id": user_id})
        if not cart:
            # Initialize empty cart if not exist
            cart = {"user_id": user_id, "items": []}
            get_db().carts.insert_one(cart)
        return cart
    
    @staticmethod
    def add_item(product_id, user_id="default_user"):
        """Add a product to the cart"""
        # Get the product
        product = Product.get_by_id(product_id)
        if not product:
            return None
        
        # Convert ObjectId to string for JSON serialization
        product["_id"] = str(product["_id"])
        
        # Get or create the cart
        cart = Cart.get_cart(user_id)
        
        # Find if product already exists in cart
        existing_item = None
        for item in cart.get("items", []):
            if item.get("product", {}).get("_id") == product["_id"]:
                existing_item = item
                break
        
        # Update the cart
        if existing_item:
            # Increment quantity
            get_db().carts.update_one(
                {"user_id": user_id, "items.product._id": product["_id"]},
                {"$inc": {"items.$.quantity": 1}}
            )
        else:
            # Add new item
            get_db().carts.update_one(
                {"user_id": user_id},
                {"$push": {"items": {"product": product, "quantity": 1}}}
            )
        
        # Return the updated cart
        return Cart.get_cart(user_id)
    
    @staticmethod
    def remove_item(product_id, user_id="default_user"):
        """Remove a product from the cart"""
        # Remove the item
        get_db().carts.update_one(
            {"user_id": user_id},
            {"$pull": {"items": {"product._id": product_id}}}
        )
        
        # Return the updated cart
        return Cart.get_cart(user_id)
    
    @staticmethod
    def clear_cart(user_id="default_user"):
        """Clear all items from the cart"""
        # Clear the cart
        get_db().carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": []}}
        )
        
        # Return the updated cart
        return Cart.get_cart(user_id)

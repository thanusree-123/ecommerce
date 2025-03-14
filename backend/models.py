from bson import ObjectId
from database import get_db
from models import Product  # Ensure Product model is imported

class Cart:
    @staticmethod
    def get_cart(user_id):
        """Get a user's cart or create it if it doesn't exist"""
        if not user_id:
            raise ValueError("User ID is required")

        # Fetch the cart for the specific user
        cart = get_db().carts.find_one({"user_id": user_id})
        
        if not cart:
            # If no cart exists for the user, create a new one
            cart = {"user_id": user_id, "items": []}
            get_db().carts.insert_one(cart)

        return cart

    @staticmethod
    def add_item(product_id, user_id):
        """Add a product to the user's cart"""
        if not user_id:
            raise ValueError("User ID is required")

        product = Product.get_by_id(product_id)
        if not product:
            return None  # If product doesn't exist, return None

        product["_id"] = str(product["_id"])  # Convert ObjectId for JSON
        cart = Cart.get_cart(user_id)

        # Check if product already exists in the cart
        existing_item = next((item for item in cart["items"] if item["product"]["_id"] == product["_id"]), None)

        if existing_item:
            get_db().carts.update_one(
                {"user_id": user_id, "items.product._id": product["_id"]},
                {"$inc": {"items.$.quantity": 1}}  # Increase quantity by 1
            )
        else:
            get_db().carts.update_one(
                {"user_id": user_id},
                {"$push": {"items": {"product": product, "quantity": 1}}}
            )

        return Cart.get_cart(user_id)

    @staticmethod
    def remove_item(product_id, user_id):
        """Remove a product from the cart"""
        if not user_id:
            raise ValueError("User ID is required")

        get_db().carts.update_one(
            {"user_id": user_id},
            {"$pull": {"items": {"product._id": product_id}}}
        )

        return Cart.get_cart(user_id)

    @staticmethod
    def clear_cart(user_id):
        """Clear all items from the cart"""
        if not user_id:
            raise ValueError("User ID is required")

        get_db().carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": []}}
        )

        return Cart.get_cart(user_id)

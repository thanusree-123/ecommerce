from bson import ObjectId
from database import get_db

class Cart:
    @staticmethod
    def get_cart(user_id):
        """Fetch or create a user's cart"""
        cart = get_db().carts.find_one({"user_id": user_id})
        if not cart:
            cart = {"user_id": user_id, "items": []}
            get_db().carts.insert_one(cart)
        return cart

    @staticmethod
    def add_item(product_id, user_id):
        """Add product to the cart"""
        product = Product.get_by_id(product_id)
        if not product:
            return None

        product["_id"] = str(product["_id"])

        cart = Cart.get_cart(user_id)
        existing_item = next((item for item in cart["items"] if item["product"]["_id"] == product["_id"]), None)

        if existing_item:
            get_db().carts.update_one(
                {"user_id": user_id, "items.product._id": product["_id"]},
                {"$inc": {"items.$.quantity": 1}}
            )
        else:
            get_db().carts.update_one(
                {"user_id": user_id},
                {"$push": {"items": {"product": product, "quantity": 1}}}
            )

        return Cart.get_cart(user_id)

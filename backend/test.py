import requests
import json

BASE_URL = "http://localhost:5000/api"

# Test adding a product
def test_add_product():
    product_data = {
        "name": "Test Product",
        "price": 29.99,
        "image": "https://example.com/image.jpg"
    }
    response = requests.post(f"{BASE_URL}/products", json=product_data)
    if response.status_code == 201:
        print("✅ Add product: Success")
        return response.json().get("product_id")
    else:
        print("❌ Add product: Failed")
        return None

# Test getting all products
def test_get_products():
    response = requests.get(f"{BASE_URL}/products")
    if response.status_code == 200:
        print("✅ Get products: Success")
        return response.json().get("products")
    else:
        print("❌ Get products: Failed")
        return []

# Test adding to cart
def test_add_to_cart(product_id):
    cart_data = {"product_id": product_id}
    response = requests.post(f"{BASE_URL}/cart/add", json=cart_data)
    if response.status_code == 200:
        print("✅ Add to cart: Success")
        return True
    else:
        print("❌ Add to cart: Failed")
        return False

# Test getting cart
def test_get_cart():
    response = requests.get(f"{BASE_URL}/cart")
    if response.status_code == 200:
        print("✅ Get cart: Success")
        return True
    else:
        print("❌ Get cart: Failed")
        return False

# Test removing from cart
def test_remove_from_cart(product_id):
    cart_data = {"product_id": product_id}
    response = requests.post(f"{BASE_URL}/cart/remove", json=cart_data)
    if response.status_code == 200:
        print("✅ Remove from cart: Success")
        return True
    else:
        print("❌ Remove from cart: Failed")
        return False

# Test deleting product
def test_delete_product(product_id):
    response = requests.delete(f"{BASE_URL}/products/{product_id}")
    if response.status_code == 200:
        print("✅ Delete product: Success")
        return True
    else:
        print("❌ Delete product: Failed")
        return False

# Run all tests
def run_tests():
    print("Testing E-commerce API...")
    
    # Test product functionality
    product_id = test_add_product()
    if not product_id:
        print("Cannot continue testing without product")
        return
    
    products = test_get_products()
    
    # Test cart functionality
    cart_add = test_add_to_cart(product_id)
    cart_get = test_get_cart()
    cart_remove = test_remove_from_cart(product_id)
    
    # Clean up
    product_delete = test_delete_product(product_id)
    
    print("\nTest Summary:")
    print(f"Products added: {product_id is not None}")
    print(f"Products retrieved: {len(products) > 0}")
    print(f"Cart add: {cart_add}")
    print(f"Cart get: {cart_get}")
    print(f"Cart remove: {cart_remove}")
    print(f"Product delete: {product_delete}")

if __name__ == "__main__":
    run_tests()
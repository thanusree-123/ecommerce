import React, { useState, useEffect } from "react";
import Cart from "./cart";
import ProductForm from "./ProductForm";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Fetch products from backend when component loads
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleProductDelete = (productId) => {
    fetch(`/api/products/${productId}`, {
      method: "DELETE",
    }).then(() => {
      setProducts(products.filter((product) => product.id !== productId));
    });
  };

  const handleAddProduct = (newProduct) => {
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    }).then((res) => res.json())
      .then((product) => {
        setProducts([...products, product]);
      });
  };

  return (
    <div className="App">
      <h1>E-Commerce Store</h1>
      <ProductForm addProduct={handleAddProduct} />
      <Cart cart={cart} removeFromCart={removeFromCart} />
    </div>
  );
}

export default App;

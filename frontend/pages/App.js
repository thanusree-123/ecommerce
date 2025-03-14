import React, { useState, useEffect } from "react";
import Cart from "./cart";

function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCart(data));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  return (
    <div className="App">
      <h1>E-Commerce Store</h1>
      <Cart cart={cart} removeFromCart={removeFromCart} />
    </div>
  );
}

export default App;

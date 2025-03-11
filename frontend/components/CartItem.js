import React from 'react';

function Cart({ cart, removeFromCart }) {
  return (
    <div>
      <h2>Your Cart</h2>
      <div>
        {cart.length > 0 ? (
          cart.map(item => (
            <div key={item.id}>
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
}

export default Cart;

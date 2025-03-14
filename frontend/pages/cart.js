import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import styles from '../styles/Cart.module.css';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Get logged-in user's unique ID
  const getUserId = () => {
    if (typeof window === 'undefined') return null; // Ensure it's client-side
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.email : null; // Assuming email is unique
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      router.push('/login');
      return;
    }
    fetchCart(userId);
  }, []);

  // Fetch cart data
  const fetchCart = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`https://ecommerce-00q6.onrender.com/api/cart?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.cart) {
        setCart(response.data.cart);
      } else {
        setCart({ items: [] }); // Ensure cart is always initialized
        setError('Failed to load cart data.');
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setCart({ items: [] });
      setError('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/update',
        {
          product_id: productId,
          user_id: userId,
          quantity: newQuantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchCart(userId); // Refresh cart
      } else {
        setError('Failed to update item quantity.');
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Error updating cart.');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/remove',
        {
          product_id: productId,
          user_id: userId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchCart(userId); // Refresh cart
      } else {
        setError('Failed to remove item.');
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Error removing item from cart.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading your cart...</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Your Shopping Cart</h1>
      {error && <p className={styles.error}>{error}</p>}
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.items.map((item) => (
            <li key={item.product._id}>
              {item.product.name} - {item.quantity} x ${item.product.price}
              <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
              <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
              <button onClick={() => removeItem(item.product._id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;

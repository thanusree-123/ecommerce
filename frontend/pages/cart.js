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

  // Get logged-in user's unique ID (email)
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.email : null; // Using email as a unique ID
  };

  const userId = getUserId();
  if (!userId) {
    router.push('/login'); // Redirect guests to login
    return null;
  }

  // Fetch user's cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`https://ecommerce-00q6.onrender.com/api/cart?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success) {
        setCart(response.data.cart);
      } else {
        setError('Failed to load cart data');
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

      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/update',
        { product_id: productId, user_id: userId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/remove',
        { product_id: productId, user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchCart();
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Your Shopping Cart</title>
      </Head>
      <h1 className={styles.title}>Your Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className={styles.emptyCartMessage}>
          <p>Your cart is empty</p>
          <button onClick={() => router.push('/')} className={styles.primaryButton}>
            Explore Collections
          </button>
        </div>
      ) : (
        <>
          <table className={styles.cartTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.product._id}>
                  <td>{item.product.name}</td>
                  <td>${item.product.price}</td>
                  <td>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                    {item.quantity}
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                  </td>
                  <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeItem(item.product._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Cart;

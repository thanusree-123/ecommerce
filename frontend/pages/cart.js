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

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
  const userId = user ? user._id : null;

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!userId) {
      router.push('/login');
    } else {
      fetchCart();
    }
  }, [userId]);

  // Fetch cart data from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://ecommerce-00q6.onrender.com/api/cart?user_id=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCart(response.data.cart);
      } else {
        setError('Failed to load cart data');
      }
    } catch (err) {
      setError('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/update',
        { user_id: userId, product_id: productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch {
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/remove',
        { user_id: userId, product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch {
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart total price
  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0).toFixed(2);
  };

  // Format price for display
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handle checkout process
  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Shopping Cart | Luxury Jewelry</title>
          <meta name="description" content="View and manage your jewelry selections" />
        </Head>
        <h1 className={styles.title}>Your Shopping Cart</h1>
        <div className={styles.errorAlert}>
          <p>Note: {error}</p>
        </div>
        <div className={styles.emptyCartMessage}>
          <div className={styles.emptyCartIcon}>✦</div>
          <p>Your cart is currently empty</p>
          <button onClick={() => router.push('/')} className={styles.primaryButton}>
            Explore Collections
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Shopping Cart | Luxury Jewelry</title>
          <meta name="description" content="View and manage your jewelry selections" />
        </Head>
        <h1 className={styles.title}>Your Shopping Cart</h1>
        <div className={styles.loadingSpinner}>
          <p>Loading your selections...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Shopping Cart | Luxury Jewelry</title>
        <meta name="description" content="View and manage your jewelry selections" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className={styles.emptyCartMessage}>
            <div className={styles.emptyCartIcon}>✦</div>
            <p>Your cart is empty</p>
            <button onClick={() => router.push('/')} className={styles.primaryButton}>
              Explore Collections
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartTable}>
              <table>
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
                      <td>${formatPrice(item.product.price)}</td>
                      <td>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} disabled={loading}>
                          -
                        </button>
                        {item.quantity}
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} disabled={loading}>
                          +
                        </button>
                      </td>
                      <td>${formatPrice(item.product.price * item.quantity)}</td>
                      <td>
                        <button onClick={() => removeItem(item.product._id)} disabled={loading}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.cartSummary}>
              <h3>Total: ${calculateTotal()}</h3>
              <button onClick={handleCheckout} className={styles.checkoutButton}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;

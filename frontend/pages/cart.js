import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import styles from '../styles/Cart.module.css';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  // Get user from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.email) {
        setUserId(user.email); // Use email as user_id
      } else {
        router.push('/login'); // Redirect guests to login
      }
    }
  }, []);

  // Fetch cart when userId is available
  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  // Fetch user's cart from the backend
  const fetchCart = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `https://ecommerce-00q6.onrender.com/api/cart?user_id=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setCart(response.data.cart);
      } else {
        setError('Failed to load cart data');
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Get current quantity of an item
  const getItemQuantity = (productId) => {
    const item = cart.items.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cart.items
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
      .toFixed(2);
  };

  // Update item quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (!userId) return;

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

      fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/remove',
        { product_id: productId, user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout process
  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!userId) return null; // Prevent rendering until userId is available

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Shopping Cart | Luxury Jewelry</title>
        </Head>
        <h1 className={styles.title}>Your Shopping Cart</h1>
        <div className={styles.errorAlert}>
          <p>Note: {error}</p>
        </div>
        <div className={styles.emptyCartMessage}>
          <p>Your cart is empty</p>
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
      </Head>
      <div className={styles.container}>
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
                      <td>
                        <div className={styles.productCell}>
                          <div className={styles.productImage}>
                            <img src={item.product.image} alt={item.product.name} />
                          </div>
                          <div className={styles.productName}>{item.product.name}</div>
                        </div>
                      </td>
                      <td className={styles.priceCell}>${item.product.price.toFixed(2)}</td>
                      <td className={styles.quantityCell}>
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            disabled={loading}
                          >
                            –
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            disabled={loading}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className={styles.totalCell}>
                        ${parseFloat(item.product.price * item.quantity).toFixed(2)}
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.removeButton}
                          onClick={() => removeItem(item.product._id)}
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cartSummary}>
              <div className={styles.orderSummary}>
                <div className={styles.totalAmount}>Total: ${calculateTotal()}</div>
                <button className={styles.checkoutButton} onClick={handleCheckout} disabled={loading}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;

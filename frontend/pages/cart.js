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

  // Get current user ID from localStorage
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.email; // Use _id as the unique identifier
      }
    }
    return null; // Return null if no user is logged in
  };

  // Get auth token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0).toFixed(2);
  };

  // Fetch cart data with user_id parameter
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const userId = getUserId();
      
      if (!userId || !token) {
        // Handle case where user is not logged in
        setCart({ items: [] });
        setError('Please log in to view your cart');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/cart?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setCart(response.data.cart);
        setError(null);
      } else {
        setError('Failed to load cart data');
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setCart({ items: [] });
      setError('Error connecting to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart (increment quantity)
  const addItem = async (productId) => {
    try {
      setLoading(true);
      const token = getToken();
      const userId = getUserId();
      
      if (!userId || !token) {
        setError('Please log in to update your cart');
        router.push('/login');
        return;
      }
      
      await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          product_id: productId,
          user_id: userId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh cart from server
      await fetchCart();
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart (decrement quantity or remove completely)
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const token = getToken();
      const userId = getUserId();
      
      if (!userId || !token) {
        setError('Please log in to update your cart');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/cart/remove',
        {
          product_id: productId,
          user_id: userId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.success) {
        // Update local state with server response
        setCart(response.data.cart);
      } else {
        throw new Error('Server returned an unsuccessful response');
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from cart');
      // Refresh cart from server to ensure consistent state
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    try {
      setLoading(true);
      const token = getToken();
      const userId = getUserId();
      
      if (!userId || !token) {
        setError('Please log in to update your cart');
        setLoading(false);
        return;
      }
      
      if (newQuantity <= 0) {
        // Simply remove the item if quantity is 0 or negative
        await removeItem(productId);
        return;
      }
      
      const currentQuantity = getItemQuantity(productId);
      
      // If wanting to increase quantity, add the item once
      if (newQuantity > currentQuantity) {
        await addItem(productId);
      } 
      // If wanting to decrease quantity, remove the item once
      else if (newQuantity < currentQuantity) {
        await removeItem(productId);
      }
      
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update item quantity');
      // Refresh cart on error to restore consistent state
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current quantity of an item
  const getItemQuantity = (productId) => {
    const item = cart.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Clear all items from cart
  const clearCart = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const userId = getUserId();
      
      if (!userId || !token) {
        setError('Please log in to update your cart');
        setLoading(false);
        return;
      }
      
      await axios.post(
        'http://localhost:5000/api/cart/clear',
        { user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setCart({ user_id: userId, items: [] });
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear your cart');
      // Refresh cart to ensure consistent state
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout process
  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Load cart data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is logged in
      const userId = getUserId();
      const token = getToken();
      
      if (!userId || !token) {
        setLoading(false);
        setError('Please log in to view your cart');
        return;
      }
      
      fetchCart();
    }
  }, []);

  // Format price with commas for thousands
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (error && cart.items.length === 0) {
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
          <button
            onClick={() => router.push('/')}
            className={styles.primaryButton}
          >
            Explore Collections
          </button>
          {!getUserId() && (
            <button
              onClick={() => router.push('/login')}
              className={styles.secondaryButton}
            >
              Login to Your Account
            </button>
          )}
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

        {error && (
          <div className={styles.errorAlert}>
            <p>Note: {error}</p>
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className={styles.emptyCartMessage}>
            <div className={styles.emptyCartIcon}>✦</div>
            <p>Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className={styles.primaryButton}
            >
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
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                            />
                          </div>
                          <div className={styles.productName}>
                            {item.product.name}
                          </div>
                        </div>
                      </td>
                      <td className={styles.priceCell}>
                        ${formatPrice(item.product.price)}
                      </td>
                      <td className={styles.quantityCell}>
                        <div className={styles.quantityControls}>
                          <button 
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            disabled={loading}
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            disabled={loading}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className={styles.totalCell}>
                        ${formatPrice(item.product.price * item.quantity)}
                      </td>
                      <td className={styles.actionsCell}>
                        <button 
                          className={styles.removeButton}
                          onClick={() => removeItem(item.product._id)}
                          disabled={loading}
                          aria-label="Remove item"
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
              <div className={styles.continueShoppingContainer}>
                <button
                  onClick={() => router.push('/')}
                  className={styles.secondaryButton}
                >
                  Continue Shopping
                </button>
                <button
                  onClick={clearCart}
                  className={styles.secondaryButton}
                  disabled={loading}
                >
                  Clear Cart
                </button>
              </div>
              <div className={styles.orderSummary}>
                <div className={styles.totalAmount}>Total: ${formatPrice(calculateTotal())}</div>
                <button 
                  className={styles.checkoutButton}
                  onClick={handleCheckout}
                  disabled={loading}
                >
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
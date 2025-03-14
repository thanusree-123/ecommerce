import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Cart.module.css';
import { cartAPI, authUtils } from '../utils/api';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Get the current user ID
  const getUserId = () => {
    const user = authUtils.getUser();
    return user ? user.id : 'default_user';
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0).toFixed(2);
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setLoading(true);
      
      const userId = getUserId();
      const currentQuantity = getItemQuantity(productId);
      
      if (newQuantity > currentQuantity) {
        // Add additional items to reach new quantity
        for (let i = currentQuantity; i < newQuantity; i++) {
          await cartAPI.addItem(productId);
        }
      } else if (newQuantity < currentQuantity) {
        // Remove the item completely, then add back the desired number
        await cartAPI.removeItem(productId);
        for (let i = 0; i < newQuantity; i++) {
          await cartAPI.addItem(productId);
        }
      }

      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (productId) => {
    const item = cart.items.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const removeItem = async (productId) => {
    try {
      setLoading(true);
      await cartAPI.removeItem(productId);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (!authUtils.isLoggedIn()) {
        // Handle non-logged in user
        setError('Please log in to view your cart');
        setCart({ items: [] });
        return;
      }
      
      const response = await cartAPI.get();
      
      if (response.data && response.data.success) {
        setCart(response.data.cart);
      } else {
        setError('Failed to load cart data');
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setCart({ items: [] });
      setError('Error connecting to the server. Using empty cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is logged in
      if (!authUtils.isLoggedIn()) {
        router.push('/login?redirect=cart');
        return;
      }
      
      fetchCart();
    }
  }, []);

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Shopping Cart | Luxury Jewelry</title>
          <meta
            name="description"
            content="View and manage your jewelry selections"
          />
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
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Shopping Cart | Luxury Jewelry</title>
          <meta
            name="description"
            content="View and manage your jewelry selections"
          />
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
        <meta
          name="description"
          content="View and manage your jewelry selections"
        />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Shopping Cart</h1>

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
                      <td>{item.product.name}</td>
                      <td>${formatPrice(item.product.price)}</td>
                      <td>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          disabled={loading}
                        >
                          -
                        </button>
                        {item.quantity}
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          disabled={loading}
                        >
                          +
                        </button>
                      </td>
                      <td>${formatPrice(item.product.price * item.quantity)}</td>
                      <td>
                        <button
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
              <div className={styles.cartTotal}>
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              <button 
                onClick={handleCheckout} 
                className={styles.checkoutButton}
                disabled={loading}
              >
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

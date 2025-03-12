// pages/cart.js
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

  // Calculate cart total
  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0).toFixed(2);
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity is less than 1, remove the item
      await removeItem(productId);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentQuantity = getItemQuantity(productId);
      
      if (newQuantity > currentQuantity) {
        // If increasing quantity, use the add to cart endpoint
        await axios.post(
          'https://ecommerce-00q6.onrender.com/api/cart/add',
          {
            product_id: productId,
            user_id: 'default_user'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else if (newQuantity < currentQuantity) {
        // If decreasing quantity, we need a different approach
        // First, remove the item
        await axios.post(
          'https://ecommerce-00q6.onrender.com/api/cart/remove',
          {
            product_id: productId,
            user_id: 'default_user'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Then add it back with the correct quantity by adding it newQuantity times
        for (let i = 0; i < newQuantity; i++) {
          await axios.post(
            'https://ecommerce-00q6.onrender.com/api/cart/add',
            {
              product_id: productId,
              user_id: 'default_user'
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        }
      }
      
      // Update local state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      }));
      
      // Fetch latest cart state from server to ensure consistency
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update item quantity');
      await fetchCart(); // Refresh cart on error to restore consistent state
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current quantity of an item
  const getItemQuantity = (productId) => {
    const item = cart.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/remove',
        {
          product_id: productId,
          user_id: 'default_user'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.product._id !== productId)
      }));
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart data with user_id parameter
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('https://ecommerce-00q6.onrender.com/api/cart?user_id=default_user', {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  // Handle checkout process
  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Load cart data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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

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
      await removeItem(productId);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentQuantity = getItemQuantity(productId);

      if (newQuantity > currentQuantity) {
        await axios.post(
          'https://ecommerce-00q6.onrender.com/api/cart/add',
          {
            product_id: productId,
            user_id: 'default_user',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (newQuantity < currentQuantity) {
        await axios.post(
          'https://ecommerce-00q6.onrender.com/api/cart/remove',
          {
            product_id: productId,
            user_id: 'default_user',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        for (let i = 0; i < newQuantity; i++) {
          await axios.post(
            'https://ecommerce-00q6.onrender.com/api/cart/add',
            {
              product_id: productId,
              user_id: 'default_user',
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));

      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update item quantity');
      await fetchCart();
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
      const token = localStorage.getItem('token');

      await axios.post(
        'https://ecommerce-00q6.onrender.com/api/cart/remove',
        {
          product_id: productId,
          user_id: 'default_user',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter(
          (item) => item.product._id !== productId
        ),
      }));
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
      const token = localStorage.getItem('token');

      const response = await axios.get(
        'https://ecommerce-00q6.onrender.com/api/cart?user_id=default_user',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
            <button onClick={handleCheckout}>Proceed to Checkout</button>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;

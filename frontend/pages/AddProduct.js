// pages/add-product.js
import { useState, useEffect } from 'react';
import { productAPI } from '../utils/api';
import { useRouter } from 'next/router';
import styles from './AddProduct.module.css';

const AddProduct = () => {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: '',
    price: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Check admin authorization when component mounts
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    setAuthChecking(true);
    try {
      // Get user data from localStorage
      const userString = localStorage.getItem('user');
      
      if (!userString) {
        // No user data found, redirect to login
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(userString);
      
      // Check if the user is an admin
      if (user.role !== 'admin') {
        // User is not an admin, redirect to home page
        setError('Unauthorized: Admin access only');
        setTimeout(() => {
          router.push('/');
        }, 2000);
        return;
      }
      
      // User is admin, allow access
      setIsAuthorized(true);
      fetchProducts();
    } catch (err) {
      console.error('Authentication check failed:', err);
      router.push('/login');
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Simple validation
    if (!product.name) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
      setError('Valid price is required (must be greater than 0)');
      setLoading(false);
      return;
    }

    if (!product.image) {
      setError('Product image URL is required');
      setLoading(false);
      return;
    }

    try {
      const response = await productAPI.create(product);
      
      if (response.data.success) {
        // Show success message
        setSuccess(`Product "${product.name}" added successfully!`);
        
        // Reset form to add another product
        setProduct({
          name: '',
          price: '',
          image: ''
        });
        
        // Refresh product list
        fetchProducts();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      setDeleteLoading(true);
      try {
        await productAPI.delete(productId);
        setSuccess(`Product "${productName}" deleted successfully!`);
        
        // Refresh the product list
        fetchProducts();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete product. Please try again.');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.backgroundImage}></div>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>Checking Authorization</h2>
              <p>Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAuthorized) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.backgroundImage}></div>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2>Unauthorized Access</h2>
              <p>This page is restricted to admin users only.</p>
            </div>
            <div className={styles.error}>
              {error}
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => router.push('/')}
                className={styles.submitButton}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundImage}></div>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Add New Product</h2>
            <p>Enter the details of your new product below</p>
          </div>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          {success && (
            <div className={styles.success}>
              {success}
            </div>
          )}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="price">Price</label>
              <div className={styles.priceInput}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="image">Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={product.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              
              {product.image && (
                <div className={styles.imagePreview}>
                  <p>Preview:</p>
                  <img 
                    src={product.image} 
                    alt="Product preview" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Product List with Delete Options */}
        <div className={`${styles.formCard} ${styles.productListCard}`}>
          <div className={styles.formHeader}>
            <h2>Manage Existing Products</h2>
            <p>You can delete products from the list below</p>
          </div>

          {products.length === 0 ? (
            <div className={styles.noProducts}>
              <p>No products available. Add your first product above!</p>
            </div>
          ) : (
            <div className={styles.productList}>
              {products.map((item) => (
                <div key={item._id || item.id} className={styles.productItem}>
                  <div className={styles.productImage}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{item.name}</h3>
                    <p>${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <div className={styles.productActions}>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(item._id || item.id, item.name)}
                      className={styles.deleteButton}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;

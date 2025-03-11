// pages/add-product.js
import { useState } from 'react';
import { productAPI } from '../utils/api';
import { useRouter } from 'next/router';
import styles from './AddProduct.module.css'; // You'll need to create this CSS file

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
      </div>
    </div>
  );
};

export default AddProduct;
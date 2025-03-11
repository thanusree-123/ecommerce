import { useState } from 'react';
import { addToCart } from '../utils/api';

export default function ProductCard({ product, onDelete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Default image if none provided
  const imageSrc = product.image || 'https://via.placeholder.com/300';
  
  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await addToCart(product._id);
      
      if (data.success) {
        setAddedToCart(true);
        // Reset "Added to cart" status after 2 seconds
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      } else {
        setError('Failed to add to cart');
      }
    } catch (err) {
      setError('Error adding to cart: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(product._id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <div className="relative pb-2/3 h-48">
        <img
          src={imageSrc}
          alt={product.name}
          className="absolute h-full w-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        <div className="mt-2 text-xl font-bold text-blue-600">
          ${parseFloat(product.price).toFixed(2)}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            className={`flex-grow py-2 px-3 rounded text-sm font-medium ${
              addedToCart
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></span>
                Adding...
              </span>
            ) : addedToCart ? (
              'Added to Cart ✓'
            ) : (
              'Add to Cart'
            )}
          </button>
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="py-2 px-3 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';

function ProductList({ products, addToCart, deleteProduct }) {
  return (
    <div>
      <h2>Product List</h2>
      <div>
        {products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <img src={product.image} alt={product.name} />
            <button onClick={() => addToCart(product)}>Add to Cart</button>
            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;

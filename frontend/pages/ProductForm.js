import React, { useState } from 'react';

function ProductForm({ addProduct }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = { name, price, image };
    addProduct(newProduct);
    setName("");
    setPrice("");
    setImage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a Product</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" />
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
      <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" />
      <button type="submit">Add Product</button>
    </form>
  );
}

export default ProductForm;

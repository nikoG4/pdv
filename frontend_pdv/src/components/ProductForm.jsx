// src/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';

/**
 * Componente para el formulario de creación/edición de productos.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.product - El producto a editar (para creación, dejar vacío).
 * @param {Function} props.onSave - Función a ejecutar al guardar el producto.
 */
const ProductForm = ({ product, onSave }) => {
  const [form, setForm] = useState({ id: null, name: '', description: '', price: '', stock: '' });

  useEffect(() => {
    if (product) {
      setForm(product);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ id: null, name: '', description: '', price: '', stock: '' }); // Limpia el formulario después de guardar
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <label className="block">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border"
        />
      </div>
      <div className="mb-2">
        <label className="block">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 border"
        />
      </div>
      <div className="mb-2">
        <label className="block">Price</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full p-2 border"
        />
      </div>
      <div className="mb-2">
        <label className="block">Stock</label>
        <input
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full p-2 border"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
        {form.id ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;

import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getProducts();
      setProducts(products);
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4">Product List</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Name</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.id}</td>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.price}</td>
              <td className="border px-4 py-2">{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;

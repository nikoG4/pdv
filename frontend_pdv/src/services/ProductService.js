import axiosInstance from './axiosConfig';

class ProductService {
  buildFormData(product) {
    const formData = new FormData();
    formData.append('code', product.code || '');
    formData.append('name', product.name || '');
    formData.append('description', product.description || '');
    formData.append('categoryId', product.category?.id ?? '');
    formData.append('price', product.price ?? '');
    formData.append('stockControl', product.stockControl ? 'true' : 'false');
    formData.append('removeImage', product.removeImage ? 'true' : 'false');

    if (!Number.isNaN(product.iva) && product.iva !== undefined && product.iva !== null) {
      formData.append('iva', product.iva);
    }

    if (product.imageFile) {
      formData.append('image', product.imageFile);
    }

    return formData;
  }

  // Método para obtener la lista de todos los productos con paginación
  async getAllProducts({ page = 0, size = 10, q = ""}) {
    try {
      const response = await axiosInstance.get('/products', {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching products:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  async searchProducts({ q = "", page = 0, size = 10, criteria = "default", sort = "id", direction = "ASC" } = {}) {
    try {
      const response = await axiosInstance.get('/products/search', {
        params: { q, page, size, criteria, sort, direction },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error searching products:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getProductByCode({code = "" } = {}) {
    try {
      const response = await axiosInstance.get('/products/code', {
        params: { code },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error searching products:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async save(product) {
    try {
      const response = await axiosInstance.post('/products', this.buildFormData(product), {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async update(id, product) {
    try {
      const response = await axiosInstance.put(`/products/${id}`, this.buildFormData(product), {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async delete(id) {
    try {
      await axiosInstance.delete(`/products/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getReport(params) {

    try {
      const response = await axiosInstance.get('/products/report', {
        params: { ...params }, 
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching products:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }


}



export default new ProductService();

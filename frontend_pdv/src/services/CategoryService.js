import axiosInstance from './axiosConfig';

class CategoryService {

 
  async getCategories() {
    try {
      const response = await axiosInstance.get('/categories/unpaged', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; 
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert(error.response.data);
      throw error; 
    }
  }

  async getAllCategories({ page = 0, size = 10, q = ""} = {}) {
    try {
      const response = await axiosInstance.get(`/categories?`, {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  async save(category) {
    try {
      const response = await axiosInstance.post('/categories', category, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async update(id, category) {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, category, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async delete(id) {
    try {
      await axiosInstance.delete(`/categories/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new CategoryService();

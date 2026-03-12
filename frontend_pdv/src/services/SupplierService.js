import axiosInstance from './axiosConfig';

class SupplierService {
  // Método para obtener la lista de todos los proveedores con paginación
  async getAllSuppliers({ page = 0, size = 10, q="" } = {}) {
    try {
      const response = await axiosInstance.get('/suppliers', {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  // Método para guardar un nuevo proveedor
  async save(supplier) {
    try {
      const response = await axiosInstance.post('/suppliers', supplier, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para actualizar un proveedor existente
  async update(id, supplier) {
    try {
      const response = await axiosInstance.put(`/suppliers/${id}`, supplier, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para eliminar un proveedor
  async delete(id) {
    try {
      await axiosInstance.delete(`/suppliers/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new SupplierService();

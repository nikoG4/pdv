import axiosInstance from './axiosConfig';

class SaleService {
  // Método para obtener la lista de todas las compras con paginación
  async getAllSales({ page = 0, size = 10, q = "" } = {}) {
    try {
      const response = await axiosInstance.get('/sales', {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  async save(sale) {
    try {
      const response = await axiosInstance.post('/sales', sale, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving sale:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async update(id, sale) {
    try {
      const response = await axiosInstance.put(`/sales/${id}`, sale, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating sale:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async delete(id) {
    try {
      await axiosInstance.delete(`/sales/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert(error.response.data);
      throw error;
    }
  }
  async getReport(params) {
    try {
      const response = await axiosInstance.get('/sales/report', {
        responseType: 'blob', 
        params: { ...params },
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Verificar si la respuesta es un Blob
      if (response.data instanceof Blob) {
        console.log('El PDF se recibió correctamente como Blob');
      } else {
        console.error('La respuesta no es un Blob:', response.data);
      }
  
      return response.data; // Retorna el Blob del PDF
    } catch (error) {
      console.error('Error fetching PDF report:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async print(id) {
    try {
      const response = await axiosInstance.get('/sales/print/' + id, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      return response.data; // Retorna el Blob del PDF
    } catch (error) {
      console.error('Error fetching PDF report:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new SaleService();

import axiosInstance from './axiosConfig';

class PurchaseService {
  // Método para obtener la lista de todas las compras con paginación
  async getAllPurchases({ page = 0, size = 10, q = "" } = {}) {
    try {
      const response = await axiosInstance.get('/purchases', {
        params: { page, size, q }, // Parámetros de paginación
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error fetching purchases:', error);
      alert(error.response.data);
      throw error; // Lanza el error para manejarlo en otro lugar si es necesario
    }
  }

  async save(purchase) {
    try {
      const response = await axiosInstance.post('/purchases', purchase, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async update(id, purchase) {
    try {
      const response = await axiosInstance.put(`/purchases/${id}`, purchase, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.log('Error updating purchase:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async delete(id) {
    try {
      await axiosInstance.delete(`/purchases/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert(error.response.data);
      throw error;
    }
  }
  
  async getReport(desde, hasta) {
    try {
      const response = await axiosInstance.get('/purchases/report', {
        responseType: 'blob', // Para obtener el archivo como Blob
        params: { desde, hasta },
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
  
}

export default new PurchaseService();

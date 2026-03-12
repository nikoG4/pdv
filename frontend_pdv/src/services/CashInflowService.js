import axiosInstance from './axiosConfig';

class CashInflowService {
  // Método para obtener la lista de todas las entradas de efectivo con paginación
  async getAllCashInflows({ page = 0, size = 10, q = ""} = {}) {
    try {
      const response = await axiosInstance.get('/cash-inflows', {
        params: { page, size, q },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash inflows:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para guardar una nueva entrada de efectivo
  async save(cashInflow) {
    try {
      const response = await axiosInstance.post('/cash-inflows', cashInflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving cash inflow:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para actualizar una entrada de efectivo existente
  async update(id, cashInflow) {
    try {
      const response = await axiosInstance.put(`/cash-inflows/${id}`, cashInflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cash inflow:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para eliminar una entrada de efectivo
  async delete(id) {
    try {
      await axiosInstance.delete(`/cash-inflows/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting cash inflow:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para obtener el reporte PDF
  async getReport(params) {
    try {
      const response = await axiosInstance.get('/cash-inflows/report', {
        params: params,
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new CashInflowService();

import axiosInstance from './axiosConfig';

class CashOutflowService {
  // Método para obtener la lista de todas las salidas de efectivo con paginación
  async getAllCashOutflows({ page = 0, size = 10, q = ""} = {}) {
    try {
      const response = await axiosInstance.get('/cash-outflows', {
        params: { page, size, q },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash outflows:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para guardar una nueva salida de efectivo
  async save(cashOutflow) {
    try {
      const response = await axiosInstance.post('/cash-outflows', cashOutflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving cash outflow:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para actualizar una salida de efectivo existente
  async update(id, cashOutflow) {
    try {
      const response = await axiosInstance.put(`/cash-outflows/${id}`, cashOutflow, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cash outflow:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para eliminar una salida de efectivo
  async delete(id) {
    try {
      await axiosInstance.delete(`/cash-outflows/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting cash outflow:', error);
      alert(error.response.data);
      throw error;
    }
  }

  // Método para obtener el reporte PDF
  async getReport(params) {
    try {
      const response = await axiosInstance.get('/cash-outflows/report', {
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

export default new CashOutflowService();

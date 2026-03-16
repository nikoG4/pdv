import axiosInstance from './axiosConfig';

class CashRegisterService {
  async getAllCashRegisters({ page = 0, size = 10, q = "" } = {}) {
    try {
      const response = await axiosInstance.get('/cash-registers', {
        params: { page, size, q },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash registers:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async open(cashRegister) {
    try {
      const response = await axiosInstance.post('/cash-registers', cashRegister, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error opening cash register:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async update(id, cashRegister) {
    try {
      const response = await axiosInstance.put(`/cash-registers/${id}`, cashRegister, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cash register:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async close(id, payload) {
    try {
      const response = await axiosInstance.post(`/cash-registers/${id}/close`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error closing cash register:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getCurrent() {
    try {
      const response = await axiosInstance.get('/cash-registers/current', {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status === 200 || status === 204,
      });
      return response.status === 204 ? null : response.data;
    } catch (error) {
      console.error('Error fetching current cash register:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getSummary(id) {
    try {
      const response = await axiosInstance.get(`/cash-registers/${id}/summary`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash register summary:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getMovements(id) {
    try {
      const response = await axiosInstance.get(`/cash-registers/${id}/movements`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash register movements:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getSummaryReport(id) {
    try {
      const response = await axiosInstance.get(`/cash-registers/${id}/report-summary`, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash register summary report:', error);
      alert(error.response.data);
      throw error;
    }
  }

  async getMovementsReport(id) {
    try {
      const response = await axiosInstance.get(`/cash-registers/${id}/report-movements`, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cash register movements report:', error);
      alert(error.response.data);
      throw error;
    }
  }
}

export default new CashRegisterService();

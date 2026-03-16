import axiosInstance from './axiosConfig';

const API_URL = '/api/dashboard';
const CONFIG_URL = '/api/dashboard/config';

class DashboardService {
    // Estadísticas
    getDashboardStats() {
        return axiosInstance.get(`${API_URL}/stats`);
    }

    getSalesToday() {
        return axiosInstance.get(`${API_URL}/stats/sales-today`);
    }

    getSalesMonth() {
        return axiosInstance.get(`${API_URL}/stats/sales-month`);
    }

    getTotalProducts() {
        return axiosInstance.get(`${API_URL}/stats/total-products`);
    }

    getLowStock() {
        return axiosInstance.get(`${API_URL}/stats/low-stock`);
    }

    getSalesWeekDaily() {
        return axiosInstance.get(`${API_URL}/stats/sales-week-daily`);
    }

    getTopProducts() {
        return axiosInstance.get(`${API_URL}/stats/top-products`);
    }

    // Configuración de widgets
    getConfig() {
        return axiosInstance.get(CONFIG_URL);
    }

    saveConfig(configJson) {
        return axiosInstance.post(CONFIG_URL, { configJson });
    }

    resetConfig() {
        return axiosInstance.delete(CONFIG_URL);
    }
}

export default new DashboardService();

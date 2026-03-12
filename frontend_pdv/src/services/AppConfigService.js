import axiosInstance from './axiosConfig';

const API_URL = '/app-config';

class AppConfigService {
    getCurrentConfig() {
        return axiosInstance.get(`${API_URL}/current`);
    }

    saveCurrentConfig(formData) {
        return axiosInstance.post(`${API_URL}/current`, formData);
    }
}

export default new AppConfigService();

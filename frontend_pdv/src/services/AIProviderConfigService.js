import axiosInstance from './axiosConfig';

const AIProviderConfigService = {
    getAll: async ({ page, size, q }) => {
        const response = await axiosInstance.get('/ai-provider-configs/search', {
            params: { page, size, q }
        });
        return response.data;
    },
    
    getById: async (id) => {
        const response = await axiosInstance.get(`/ai-provider-configs/${id}`);
        return response.data;
    },

    save: async (data) => {
        const response = await axiosInstance.post('/ai-provider-configs', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosInstance.put(`/ai-provider-configs/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`/ai-provider-configs/${id}`);
        return response.data;
    }
};

export default AIProviderConfigService;

import axiosInstance from './axiosConfig';

const InvoiceAIService = {
    parse: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/invoices/parse', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    confirmPurchase: async (data, supplierId) => {
        const response = await axiosInstance.post(`/invoices/confirm-purchase?supplierId=${supplierId || ''}`, data);
        return response.data;
    },

    confirmProducts: async (data) => {
        const response = await axiosInstance.post('/invoices/confirm-products', data);
        return response.data;
    }
};

export default InvoiceAIService;

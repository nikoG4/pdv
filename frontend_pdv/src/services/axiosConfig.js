import axios from 'axios';
import { getApiBaseUrl } from '../lib/backend-url';

const instance = axios.create({
  baseURL: getApiBaseUrl(),
});


instance.interceptors.request.use(config => {
  const user  = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;

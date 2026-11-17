import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:8000', // vagy http://localhost:8000/api
});

// Automatikus Bearer token hozzáadása az Authorization fejléchez
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;
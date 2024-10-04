import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api', // Base URL da sua API
});

// Interceptor para adicionar o token JWT nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Ou de sessionStorage, dependendo de onde você armazena
  if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

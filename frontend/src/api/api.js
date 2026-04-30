import axios from 'axios';
import config from 'dotenv'


const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- REAL ENDPOINTS ---
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { UserName: username, Password: password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('username', username); 
    localStorage.setItem('role', response.data.role); // Save role from backend
  }
  return response.data;
};

export const signup = async (username, password, role) => {
  const response = await api.post('/auth/sign_up', { UserName: username, Password: password, Role: role });
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/store/upload_image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const addStock = async (stockItem) => {
  // stockItem: { name, quantity, price }
  const response = await api.post('/stock/insert_stock', [stockItem]);
  return response.data;
};

export const getStocks = async () => {
  const response = await api.get('/stock/get_stocks');
  return response.data;
};

export const updateStock = async (id, quantityToAdd) => {
  const response = await api.put('/stock/update_stock', { id, quantityToAdd });
  return response.data;
};

export const logSale = async (saleData) => {
  // saleData: { username, item, quantity, price, imageUrl, date }
  const response = await api.post('/sales/log_sales', saleData);
  return response.data;
};

export const getSales = async () => {
  const response = await api.get('/sales/get_sales');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
};

export const isAdmin = () => {
  const role = localStorage.getItem('role');
  return role && role.toLowerCase() === 'admin';
};

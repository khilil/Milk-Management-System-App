import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../Apichange';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.trackMilkApi,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in AsyncStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Fetch distribution details for seller
export const fetchDistributionDetails = async (date, sellerId) => {
  try {
    if (!sellerId) {
      throw new Error('Seller ID is required');
    }
    const url = `?path=distribution_details&seller_id=${sellerId}${date ? `&date=${date}` : ''}`;
    console.log('Fetching distribution details:', `${API_CONFIG.trackMilkApi}${url}`);
    const response = await apiClient.get(url);
    console.log('API Response:', response.data); // Log response for debugging
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Unknown error from server');
    }
  } catch (error) {
    console.error('Fetch distribution details error:', error.message);
    throw new Error('Failed to fetch distribution details: ' + error.message);
  }
};

// Fetch total distributed milk for seller on a specific date
export const fetchTotalDistributed = async (date, sellerId) => {
  try {
    if (!sellerId || !date) {
      throw new Error('Seller ID and date are required');
    }
    const url = `?path=total_distributed&seller_id=${sellerId}&date=${date}`;
    console.log('Fetching total distributed:', `${API_CONFIG.trackMilkApi}${url}`);
    const response = await apiClient.get(url);
    console.log('API Response:', response.data); // Log response for debugging
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Unknown error from server');
    }
  } catch (error) {
    console.error('Fetch total distributed error:', error.message);
    throw new Error('Failed to fetch total distributed: ' + error.message);
  }
};
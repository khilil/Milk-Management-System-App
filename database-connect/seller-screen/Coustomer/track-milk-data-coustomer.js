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
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch distribution details for seller
export const fetchDistributionDetails = async (date, sellerId) => {
  try {
    const url = `?path=distribution_details&seller_id=${sellerId}${date ? `&date=${date}` : ''}`;
    console.log('Fetching distribution details:', url);
    const response = await apiClient.get(url);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Fetch distribution details error:', error);
    throw new Error('Failed to fetch distribution details: ' + error.message);
  }
};

// Fetch total distributed milk for seller on a specific date
export const fetchTotalDistributed = async (date, sellerId) => {
  try {
    const url = `?path=total_distributed&seller_id=${sellerId}&date=${date}`;
    console.log('Fetching total distributed:', url);
    const response = await apiClient.get(url);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Fetch total distributed error:', error);
    throw new Error('Failed to fetch total distributed: ' + error.message);
  }
};
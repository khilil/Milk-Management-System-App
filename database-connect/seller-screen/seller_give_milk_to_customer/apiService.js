import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../Apichange';

// API base URL
const API_BASE_URL = API_CONFIG.sellermilkdistrubiute;

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

// Fetch all customers
export const fetchCustomers = async () => {
  try {
    const response = await apiClient.get('?path=customers');
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch customers: ' + error.message);
  }
};

// Record a milk delivery
export const recordDelivery = async (deliveryData) => {
  try {
    const response = await apiClient.post('?path=delivery', deliveryData);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to record delivery: ' + error.message);
  }
};

// Delete a milk delivery
export const deleteDelivery = async (deliveryData) => {
  try {
    const response = await apiClient.delete('?path=delivery', { data: deliveryData });
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to delete delivery: ' + error.message);
  }
};

// Fetch total milk sold by seller on a specific date
export const fetchTotalMilkSold = async (sellerId, date) => {
  try {
    const response = await apiClient.get(`?path=milk_sold&seller_id=${sellerId}&date=${date}`);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch total milk sold: ' + error.message);
  }
};

// Fetch milk assignment details for seller on a specific date
export const fetchMilkAssignment = async (sellerId, date) => {
  try {
    const response = await apiClient.get(`?path=milk_assignment&seller_id=${sellerId}&date=${date}`);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch milk assignment: ' + error.message);
  }
};

// Fetch distribution details for seller
export const fetchDistributionDetails = async (sellerId, date) => {
  try {
    const url = `?path=distribution_details&seller_id=${sellerId}${date ? `&date=${date}` : ''}`;
    const response = await apiClient.get(url);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch distribution details: ' + error.message);
  }
};
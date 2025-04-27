import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

// API base URL (update with your server IP or domain)
const API_BASE_URL = API_CONFIG.trackMilkApi;

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout to prevent hanging
});

// Fetch milk distribution details for Seller ID 4
export const fetchDistributionDetails = async (date = '') => {
  try {
    const response = await apiClient.get(`?path=distribution_details${date ? `&date=${date}` : ''}`);
    if (response.data.status === 'success') {
      return response.data.data; // Return distribution array
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch distribution details: ' + (error.response?.data?.message || error.message));
  }
};

// Fetch total milk distributed by Seller ID 4 on a specific date
export const fetchTotalDistributed = async (date) => {
  try {
    const response = await apiClient.get(`?path=total_distributed&date=${date}`);
    if (response.data.status === 'success') {
      return response.data.data; // Return total quantity
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch total milk distributed: ' + (error.response?.data?.message || error.message));
  }
};
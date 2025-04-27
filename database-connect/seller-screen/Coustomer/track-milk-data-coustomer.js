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
  timeout: 10000,
});

export const fetchDistributionDetails = async (date = '', sellerId) => {
  try {
    const response = await apiClient.get(
      `?path=distribution_details&seller_id=${sellerId}${date ? `&date=${date}` : ''}`
    );
    console.log('Distribution Details Response:', response.data);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Fetch Distribution Error:', error, error.response?.data);
    throw new Error('Failed to fetch distribution details: ' + (error.response?.data?.message || error.message));
  }
};

export const fetchTotalDistributed = async (date, sellerId) => {
  try {
    const response = await apiClient.get(`?path=total_distributed&seller_id=${sellerId}&date=${date}`);
    console.log('Total Distributed Response:', response.data);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Fetch Total Distributed Error:', error, error.response?.data);
    throw new Error('Failed to fetch total milk distributed: ' + (error.response?.data?.message || error.message));
  }
};
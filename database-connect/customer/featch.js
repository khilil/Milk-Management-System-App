import axios from 'axios';
import { API_CONFIG } from '../Apichange';

const API_BASE_URL = API_CONFIG.featch_customer_data_for_thair_app;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchMonthlyConsumption = async (customerId, year, month) => {
  try {
    const response = await apiClient.get(
      `?path=monthly_consumption&customer_id=${customerId}&year=${year}&month=${month}`
    );
    console.log('Monthly Consumption Response:', response.data);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Fetch Monthly Consumption Error:', error, error.response?.data);
    throw new Error('Failed to fetch monthly consumption: ' + (error.response?.data?.message || error.message));
  }
};
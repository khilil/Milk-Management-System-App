import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

// Create Axios instance
const api = axios.create({
  baseURL: API_CONFIG.getDistributeMilkData,
  timeout: 10000, // 10-second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch milk delivery report
export const getMilkDeliveryReport = async (date) => {
  try {
    const response = await api.get('/milk_delivery_report.php', {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch deliveries');
  }
};

export default api;
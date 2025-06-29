import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

// Create Axios instance
const api = axios.create({
  baseURL: API_CONFIG.getDistributeMilkData,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch seller list or specific seller's delivery report
export const getMilkDeliveryReport = async (date, seller_id = null) => {
  try {
    const params = { date };
    if (seller_id) {
      params.seller_id = seller_id;
    }
    const response = await api.get('/getDistributeMilkData.php', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch data');
  }
};

export default api;
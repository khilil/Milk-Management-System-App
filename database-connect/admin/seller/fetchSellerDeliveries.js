import axios from 'axios';
import { API_CONFIG } from '../../Apichange'; // Adjust path if needed

const apiClient = axios.create({
  baseURL: API_CONFIG.seller_detail_page,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchSellerDeliveries = async (sellerId, date) => {
  try {
    const response = await apiClient.get('', {
      params: {
        path: 'seller_deliveries',
        seller_id: sellerId,
        date: date,
      },
    });
    console.log('Seller Deliveries Response:', response.data);
    if (response.data.status === 'success') {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to load delivery records');
    }
  } catch (error) {
    console.error('Fetch Seller Deliveries Error:', error, error.response?.data);
    throw new Error('Failed to fetch seller deliveries: ' + (error.response?.data?.message || error.message));
  }
};
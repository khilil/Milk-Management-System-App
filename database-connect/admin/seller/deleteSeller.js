import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const deleteSeller = async (sellerId) => {
  try {
    console.log('Sending DELETE request for Seller_id:', sellerId);
    const response = await axios({
      method: 'DELETE',
      url: API_CONFIG.deleteSeller,
      headers: { 'Content-Type': 'application/json' },
      data: { Seller_id: parseInt(sellerId) }, // Ensure Seller_id is an integer
      timeout: 10000, // Increased timeout to 10 seconds
    });
    console.log('DELETE response:', response.data);
    return response.data;
  } catch (error) {
    console.error('DELETE error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to deactivate seller');
  }
};

export default deleteSeller;
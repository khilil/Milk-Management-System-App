import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const deleteCustomer = async (customerId) => {
  try {
    console.log('Sending DELETE request for Customer_id:', customerId);
    const response = await axios.delete(API_CONFIG.deleteCustomer, {
      data: { Customer_id: customerId },
      timeout: 5000,
    });
    console.log('DELETE response:', response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('DELETE error: Request timed out');
      throw new Error('Request timed out. Check your network connection.');
    } else if (error.response) {
      console.error('DELETE error:', error.response.data);
      throw new Error(error.response.data.message || 'Server error occurred.');
    } else {
      console.error('DELETE error: Failed to connect');
      throw new Error('Failed to connect to server.');
    }
  }
};

export default deleteCustomer;
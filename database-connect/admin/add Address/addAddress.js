import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const addAddress = async (payload) => {
  try {
    const response = await axios.post(API_CONFIG.addAddress, payload, {
      timeout: 5000, // 5-second timeout
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Check your network connection.');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Server error occurred.');
    } else {
      throw new Error('Failed to connect to server.');
    }
  }
};

export default addAddress;
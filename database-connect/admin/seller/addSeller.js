import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const API_URL = API_CONFIG.addSellerApi;

export const addSeller = async (sellerData) => {
  try {
    const response = await axios.post(API_URL, sellerData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding seller:', error);
    throw error;
  }
};
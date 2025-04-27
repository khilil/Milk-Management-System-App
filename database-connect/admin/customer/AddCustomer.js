import axios from 'axios';
import { API_CONFIG } from '../../Apichange';



const API_URL =   API_CONFIG.BASE_URL

export const addCustomer = async (customerData) => {
  try {
    const response = await axios.post(API_URL, customerData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};
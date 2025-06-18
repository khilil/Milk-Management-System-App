import axios from 'axios';
import { API_CONFIG } from '../../Apichange';



const API_URL =   API_CONFIG.addAddress;
export const fetchAddresses = async () => {
  try {
    const response = await axios.get(`${API_URL}?path=addresses`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching addresses:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// const API_URL = API_CONFIG.BASE_URL; // Use customer.php for addCustomer
export const addCustomer = async (customerData) => {
  try {
    const response = await axios.post(API_CONFIG.BASE_URL, customerData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};
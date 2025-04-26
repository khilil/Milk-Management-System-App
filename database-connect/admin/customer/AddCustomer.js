import axios from 'axios';

const API_URL = 'http://192.168.235.171/milk_dist_system/customer/customer.php';

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
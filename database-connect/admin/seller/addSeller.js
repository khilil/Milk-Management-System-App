import axios from 'axios';

const API_URL = 'http://192.168.235.171/milk_dist_system/seller/seller.php';

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
import axios from 'axios';
import { API_CONFIG } from '../../Apichange';
const API_URL = API_CONFIG.getAddressSelect; // http://192.168.101.171/milk_dist_system/seller/getSelectAddress.php

// Fetch all addresses
export const fetchAddresses = async () => {
  try {
    const response = await axios.get(`${API_URL}/api.php?path=addresses`);
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch addresses');
    }
  } catch (error) {
    throw error.response?.data?.message || 'Network error';
  }
};




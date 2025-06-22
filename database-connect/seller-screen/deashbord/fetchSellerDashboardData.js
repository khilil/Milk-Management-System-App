import axios from 'axios';
import { API_CONFIG } from '../../Apichange';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const fetchSellerDashboardData = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found in storage');
    }
    const response = await axios.get(`${API_CONFIG.seller_deashbord}?seller_id=${userId}`, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    console.log('Seller Dashboard Response:', response.data);
    if (response.data.status === 'success') {
      return {
        seller_name: response.data.data.seller_name,
        total_assigned: response.data.data.total_assigned,
        remaining_quantity: response.data.data.remaining_quantity
      };
    } else {
      throw new Error(response.data.message || 'Failed to load dashboard data');
    }
  } catch (error) {
    console.error('Fetch Seller Dashboard Error:', error.message);
    Alert.alert('Error', error.message || 'Failed to load dashboard data');
    throw error;
  }
};
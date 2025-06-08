import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../Apichange';

const API_URL = API_CONFIG.get_payment; // Replace with your API URL

const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const fetchSellers = async () => {
  try {
    const userRole = await AsyncStorage.getItem('userRole');
    if (userRole !== 'admin') {
      throw new Error('Access denied: Admin role required');
    }
    const response = await retry(() =>
      axios.get(`${API_URL}?path=sellers&user_role=admin`, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      })
    );
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch sellers');
    }
  } catch (error) {
    console.error('Fetch Sellers Error:', error.message);
    throw new Error(error.message || 'Failed to fetch sellers');
  }
};

export const fetchPaymentsBySeller = async (sellerId) => {
  try {
    const userRole = await AsyncStorage.getItem('userRole');
    if (userRole !== 'admin') {
      throw new Error('Access denied: Admin role required');
    }
    const response = await retry(() =>
      axios.get(`${API_URL}?path=payments_by_seller&user_role=admin&seller_id=${sellerId}`, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      })
    );
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch payments');
    }
  } catch (error) {
    console.error('Fetch Payments By Seller Error:', error.message);
    throw new Error(error.message || 'Failed to fetch payments');
  }
};

export const fetchPaymentsForSeller = async (sellerId) => {
  try {
    const userRole = await AsyncStorage.getItem('userRole');
    if (userRole !== 'seller') {
      throw new Error('Access denied: Seller role required');
    }
    const response = await retry(() =>
      axios.get(`${API_URL}?path=payments_for_seller&user_role=seller&user_id=${sellerId}`, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      })
    );
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch payments');
    }
  } catch (error) {
    console.error('Fetch Payments For Seller Error:', error.message);
    throw new Error(error.message || 'Failed to fetch payments');
  }
};
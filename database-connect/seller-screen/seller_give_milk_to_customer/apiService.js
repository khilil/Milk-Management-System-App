// src/database-connect/seller-screen/seller_give_milk_to_customer/apiService.js
import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

// API base URL (update with your server IP or domain)
const API_BASE_URL = API_CONFIG.sellermilkdistrubiute;

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all customers
export const fetchCustomers = async () => {
  try {
    const response = await apiClient.get('?path=customers');
    if (response.data.status === 'success') {
      return response.data.data; // Return customer array
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch customers: ' + error.message);
  }
};

// Record a milk delivery
export const recordDelivery = async (deliveryData) => {
  try {
    const response = await apiClient.post('?path=delivery', deliveryData);
    if (response.data.status === 'success') {
      return response.data.data; // Return delivery details
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to record delivery: ' + error.message);
  }
};

// Fetch total milk sold by seller on a specific date
export const fetchTotalMilkSold = async (sellerId, date) => {
  try {
    const response = await apiClient.get(`?path=milk_sold&seller_id=${sellerId}&date=${date}`);
    if (response.data.status === 'success') {
      return response.data.data; // Return total quantity
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch total milk sold: ' + error.message);
  }
};

// Fetch milk assignment details for seller on a specific date
export const fetchMilkAssignment = async (sellerId, date) => {
  try {
    const response = await apiClient.get(`?path=milk_assignment&seller_id=${sellerId}&date=${date}`);
    if (response.data.status === 'success') {
      return response.data.data; // Return assignment details
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    throw new Error('Failed to fetch milk assignment: ' + error.message);
  }
};
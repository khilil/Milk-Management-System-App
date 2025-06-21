import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const API_URL = API_CONFIG.milkApi;

export const fetchSellers = async () => {
  try {
    const response = await axios.get(API_CONFIG.milkApi2, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    throw error.response?.data || { message: 'Failed to fetch sellers' };
  }
};

export const fetchAssignments = async (date) => {
  try {
    const encodedDate = encodeURIComponent(date);
    const response = await axios.get(`${API_URL}?date=${encodedDate}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error.response?.data || { message: 'Failed to fetch assignments' };
  }
};

export const assignMilk = async (assignmentData) => {
  try {
    const response = await axios.post(API_URL, assignmentData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning milk:', error);
    throw error.response?.data || { message: 'Failed to assign milk' };
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await axios.delete(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: { Assignment_id: assignmentId },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error.response?.data || { message: 'Failed to delete assignment' };
  }
};

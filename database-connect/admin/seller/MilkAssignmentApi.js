import axios from 'axios';

const API_URL = 'http://192.168.194.171/milk_dist_system/admin/milk_assignment.php';

export const fetchSellers = async () => {
  try {
    const response = await axios.get('http://192.168.194.171/milk_dist_system/seller/seller.php', {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    throw error;
  }
};

export const fetchAssignments = async (date) => {
  try {
    const response = await axios.get(`${API_URL}?date=${date}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
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
    throw error;
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
    throw error;
  }
};
import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const BASE_URL = API_CONFIG.admin_deashbord;

export const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin_dashboard.php`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch dashboard data: ' + error.message);
  }
};
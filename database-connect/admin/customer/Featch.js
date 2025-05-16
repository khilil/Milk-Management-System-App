import axios from 'axios';
import { Alert } from 'react-native';
import { API_CONFIG } from '../../Apichange';

const fetchCustomers = async (setCustomers, setTotalMoney, setFilteredCustomers, updateVisibleCustomers) => {
  try {
    console.log('Fetching from:', API_CONFIG.featch);
    const response = await axios.get(API_CONFIG.featch, {
      timeout: 5000,
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));

    if (response.data.status !== 'success' || !Array.isArray(response.data.data)) {
      throw new Error(response.data.message || 'Invalid response format from server');
    }

    const mappedData = response.data.data.map(customer => ({
      id: customer.Customer_id?.toString() || '',
      username: customer.Name || 'Unknown',
      phone: customer.Contact || 'N/A',
      address: customer.Address || 'N/A',
      price: parseFloat(customer.Price) || 0,
      startDate: customer.Date || new Date().toISOString(),
    }));

    console.log('Mapped Data:', mappedData);

    setCustomers(mappedData);
    const totalAmount = mappedData.reduce((sum, c) => sum + c.price, 0);
    setTotalMoney(totalAmount);
    setFilteredCustomers(mappedData);
    updateVisibleCustomers(mappedData, 1);
  } catch (error) {
    console.error('Error fetching customer data:', error.message, error.response?.data);
    Alert.alert('Error', 'Failed to fetch customers. Please check your network and try again.');
  }
};

export default fetchCustomers;
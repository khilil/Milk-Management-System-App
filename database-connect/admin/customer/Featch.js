import axios from 'axios';
import { Alert } from 'react-native';

const fetchCustomers = async (setCustomers, setTotalMoney, setFilteredCustomers, updateVisibleCustomers) => {
  try {
    const response = await axios.get('http://192.168.194.171/milk_dist_system/customer/customer.php', {
      timeout: 5000 // Add timeout to prevent hanging
    });
    const data = response.data;
    // Validate response data
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from server');
    }
    const mappedData = data.map(customer => ({
      id: customer.Customer_id?.toString() || '',
      username: customer.Name || 'Unknown',
      phone: customer.Contact || 'N/A',
      address: customer.Address || 'N/A',
      money: parseFloat(customer.Price) || 0,
      startDate: customer.Date || new Date().toISOString(),
      milkQuantity: customer.MilkQuantity || 'N/A'
    }));
    setCustomers(mappedData);
    const totalAmount = mappedData.reduce((sum, c) => sum + c.money, 0);
    setTotalMoney(totalAmount);
    setFilteredCustomers(mappedData);
    updateVisibleCustomers(mappedData, 1);
  } catch (error) {
    console.error('Error fetching customer data:', error.message);
    Alert.alert('Error', 'Failed to fetch customers. Please check your network and try again.');
  }
};

export default fetchCustomers;
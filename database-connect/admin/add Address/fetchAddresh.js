import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const fetchAddresses = async (setAddresses, setFilteredAddresses, updateVisibleAddresses) => {
  try {
    const response = await axios.get(`${API_CONFIG.addAddress}?path=addresses`, {
      timeout: 5000,
    });

    if (response.data.status !== 'success' || !Array.isArray(response.data.data)) {
      throw new Error(response.data.message || 'Invalid response format');
    }

    const mappedData = response.data.data.map(address => ({
      id: address.Address_id?.toString() || '',
      address: address.Address || 'N/A',
    }));

    setAddresses(mappedData);
    setFilteredAddresses(mappedData);
    updateVisibleAddresses(mappedData, 1);
  } catch (error) {
    console.error('Error fetching addresses:', error.message);
    throw new Error(error.message || 'Failed to fetch addresses');
  }
};

export default fetchAddresses;
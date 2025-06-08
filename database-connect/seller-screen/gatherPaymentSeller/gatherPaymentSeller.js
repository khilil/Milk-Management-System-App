import axios from 'axios';
import { API_CONFIG } from '../../Apichange';

const API_URL = `${API_CONFIG.gatherPaymentSeller}`;

export const fetchAreas = async () => {
    try {
        console.log('Fetching areas');
        const response = await axios.get(`${API_URL}?path=areas`, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });
        console.log('Fetch Areas Response:', response.data);
        if (response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch areas');
        }
    } catch (error) {
        console.error('Fetch Areas Error:', error.message, error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to fetch areas');
    }
};

export const fetchCustomersByArea = async (addressIds) => {
    try {
        console.log('Fetching customers for address IDs:', addressIds);
        const response = await axios.get(`${API_URL}?path=customers_by_area`, {
            params: { address_ids: JSON.stringify(Array.isArray(addressIds) ? addressIds : [addressIds]) },
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });
        console.log('Fetch Customers Response:', response.data);
        if (response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch customers');
        }
    } catch (error) {
        console.error('Fetch Customers Error:', error.message, error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
};

export const recordPayment = async (paymentData) => {
    try {
        console.log('Recording payment:', paymentData);
        const response = await axios.post(`${API_URL}?path=record_payment`, paymentData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });
        console.log('Record Payment Response:', response.data);
        if (response.data.status === 'success') {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to record payment');
        }
    } catch (error) {
        console.error('Record Payment Error:', error.message, error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to record payment');
    }
};

export const fetchPaymentHistory = async (customerId) => {
    try {
        console.log('Fetching payment history for customer ID:', customerId);
        const response = await axios.get(`${API_URL}?path=payment_history`, {
            params: { customer_id: customerId },
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
        });
        console.log('Fetch Payment History Response:', response.data);
        if (response.data.status === 'success') {
            // Parse Amount_collected as a number
            const history = response.data.data.map(item => ({
                ...item,
                Amount_collected: parseFloat(item.Amount_collected) || 0,
            }));
            return history;
        } else {
            throw new Error(response.data.message || 'Failed to fetch payment history');
        }
    } catch (error) {
        console.error('Fetch Payment History Error:', error.message, error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
};
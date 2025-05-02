import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { API_CONFIG } from '../../../database-connect/seller-screen/Coustomer/track-milk-data-coustomer'; // Adjust path to your API config

const CustomerMilkHistory = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch customer ID from AsyncStorage
  useEffect(() => {
    const loadCustomerId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setCustomerId(parseInt(id));
        } else {
          throw new Error('Customer ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Load Customer ID Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load customer ID. Please log in again.',
        });
      }
    };
    loadCustomerId();
  }, []);

  // Fetch distribution details when customerId or date changes
  useEffect(() => {
    if (customerId) {
      fetchDistributionDetails();
    }
  }, [customerId, date]);

  const fetchDistributionDetails = async () => {
    setLoading(true);
    try {
      const url = `${API_CONFIG.sellermilkdistrubiute}?path=customer_distribution_details&customer_id=${customerId}${
        date ? `&date=${date}` : ''
      }`;
      const response = await axios.get(url);
      if (response.data.status === 'success') {
        setDistributions(response.data.data);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Distribution details fetched successfully',
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Fetch Distribution Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch distribution details',
        onPress: () => fetchDistributionDetails(), // Retry
      });
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      const formattedDate = selected.toISOString().split('T')[0];
      setSelectedDate(selected);
      setDate(formattedDate);
    }
  };

  const clearDate = () => {
    setDate('');
    setSelectedDate(new Date());
  };

  const renderDistribution = ({ item }) => (
    <View style={styles.distributionItem}>
      <Text style={styles.distributionText}>
        Date: {new Date(item.Distribution_date).toLocaleString()}
      </Text>
      <Text style={styles.distributionText}>Seller: {item.Seller_name} (ID: {item.Seller_id})</Text>
      <Text style={styles.distributionText}>Quantity: {item.Quantity.toFixed(2)} L</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Milk Delivery History</Text>
        <TouchableOpacity onPress={fetchDistributionDetails} style={styles.refreshButton}>
          <AntDesign name="reload1" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Date Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
          <Text style={date ? styles.inputText : styles.placeholderText}>
            {date || 'Select Date (Optional)'}
          </Text>
        </TouchableOpacity>
        {date && (
          <TouchableOpacity onPress={clearDate} style={styles.clearDateButton}>
            <AntDesign name="close" size={20} color="#D32F2F" />
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Distribution List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2A5866" style={styles.loader} />
      ) : distributions.length > 0 ? (
        <FlatList
          data={distributions}
          keyExtractor={(item) => item.Delivery_id.toString()}
          renderItem={renderDistribution}
          ListHeaderComponent={
            <Text style={styles.subHeading}>
              Deliveries for Customer ID: {customerId}
            </Text>
          }
        />
      ) : (
        <Text style={styles.noResults}>No deliveries found</Text>
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A5866',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A5866',
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#2A5866',
    padding: 8,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  inputText: {
    color: '#2A5866',
    fontSize: 16,
  },
  placeholderText: {
    color: '#B0BEC5',
    fontSize: 16,
  },
  clearDateButton: {
    marginLeft: 8,
    padding: 8,
  },
  distributionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  distributionText: {
    fontSize: 14,
    color: '#2A5866',
    marginBottom: 4,
  },
  noResults: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default CustomerMilkHistory;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchCustomers, recordDelivery, fetchTotalMilkSold, fetchMilkAssignment, deleteDelivery } from '../../../database-connect/seller-screen/seller_give_milk_to_customer/apiService';

const MilkSelling = () => {
  const navigation = useNavigation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [milkQuantity, setMilkQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entries, setEntries] = useState([]);
  const [totalMilkSold, setTotalMilkSold] = useState(0);
  const [assignedMilk, setAssignedMilk] = useState(0);
  const [remainingMilk, setRemainingMilk] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [hasAssignment, setHasAssignment] = useState(true);

  // Load seller ID and entries from AsyncStorage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setSellerId(parseInt(userId));
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Seller ID not found. Please log in again.',
          });
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Load Initial Data Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load initial data',
        });
      }
    };
    loadInitialData();
  }, []);

  // Fetch customers when sellerId is available
  useEffect(() => {
    if (sellerId) {
      const loadCustomers = async () => {
        setLoading(true);
        try {
          const customerData = await fetchCustomers();
          setCustomers(customerData);
          setFilteredCustomers(customerData);
        } catch (error) {
          console.error('Fetch Customers Error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
            onPress: () => loadCustomers(),
          });
        } finally {
          setLoading(false);
        }
      };
      loadCustomers();
    }
  }, [sellerId]);


  // Fetch milk assignment and total milk sold when date or sellerId changes
  useEffect(() => {
    if (sellerId && date) {
      const loadMilkData = async () => {
        setLoading(true);
        try {
          const [assignmentData, soldData] = await Promise.all([
            fetchMilkAssignment(sellerId, date),
            fetchTotalMilkSold(sellerId, date),
          ]);
          setAssignedMilk(assignmentData.assigned_quantity);
          setRemainingMilk(assignmentData.remaining_quantity);
          setTotalMilkSold(soldData.total_quantity);
          setHasAssignment(assignmentData.assigned_quantity > 0);
        } catch (error) {
          console.error('Fetch Milk Data Error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
            onPress: () => loadMilkData(),
          });
        } finally {
          setLoading(false);
        }
      };
      loadMilkData();
    }
  }, [date, sellerId]);

  // Save entries to AsyncStorage
  useEffect(() => {
    if (entries.length > 0) {
      AsyncStorage.setItem('milkEntries', JSON.stringify(entries)).catch((error) =>
        console.error('Save Entries Error:', error)
      );
    }
  }, [entries]);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setFilteredCustomers(customers);
    setSearchText('');
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = customers.filter(
      (customer) =>
        customer.Name.toLowerCase().includes(text.toLowerCase()) ||
        customer.Customer_id.toString().includes(text)
    );
    setFilteredCustomers(filtered);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDropdownVisible(false);
  };

  const handleAddEntry = async () => {
    if (!hasAssignment) {
      Toast.show({
        type: 'info',
        text1: 'No Assignment',
        text2: 'No milk assignment for this date. Please contact the admin.',
      });
      return;
    }

    if (!selectedCustomer || !milkQuantity || !date || !sellerId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields and ensure seller is logged in',
      });
      return;
    }

    const quantityNum = parseFloat(milkQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Quantity must be a positive number',
      });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid date format. Use YYYY-MM-DD',
      });
      return;
    }

    setLoading(true);
    try {
      const deliveryData = {
        seller_id: sellerId,
        customer_id: selectedCustomer.Customer_id,
        quantity: quantityNum,
        date: date,
      };
      const result = await recordDelivery(deliveryData);
      const newEntry = {
        delivery_id: result.delivery_id,
        customer: selectedCustomer,
        milkQuantity: quantityNum,
        date,
      };
      setEntries([...entries, newEntry]);
      setTotalMilkSold((prev) => prev + quantityNum);
      setRemainingMilk(result.remaining_quantity);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Delivery recorded successfully',
      });
      clearForm();
    } catch (error) {
      console.error('Record Delivery Error:', error, error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        onPress: () => handleAddEntry(),
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSelectedCustomer(null);
    setMilkQuantity('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedDate(new Date());
  };

  const handleDeleteEntry = async (index) => {
    const entry = entries[index];
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const deleteData = {
                delivery_id: entry.delivery_id,
                seller_id: sellerId,
                customer_id: entry.customer.Customer_id,
                quantity: entry.milkQuantity,
                date: entry.date,
              };
              console.log('Deleting entry:', deleteData);
              const result = await deleteDelivery(deleteData);
              setEntries(entries.filter((_, i) => i !== index));
              setTotalMilkSold((prev) => prev - entry.milkQuantity);
              setRemainingMilk(result.remaining_quantity);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Entry deleted and database updated',
              });
            } catch (error) {
              console.error('Delete Entry Error:', error, error.response?.data);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete entry',
                onPress: () => handleDeleteEntry(index),
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    if (sellerId && date) {
      setLoading(true);
      Promise.all([
        fetchCustomers(),
        fetchMilkAssignment(sellerId, date),
        fetchTotalMilkSold(sellerId, date),
      ])
        .then(([customerData, assignmentData, soldData]) => {
          setCustomers(customerData);
          setFilteredCustomers(customerData);
          setAssignedMilk(assignmentData.assigned_quantity);
          setRemainingMilk(assignmentData.remaining_quantity);
          setTotalMilkSold(soldData.total_quantity);
          setHasAssignment(assignmentData.assigned_quantity > 0);
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Data refreshed',
          });
        })
        .catch((error) => {
          console.error('Refresh Error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
            onPress: () => handleRefresh(),
          });
        })
        .finally(() => setLoading(false));
    }
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const formattedDate = selected.toISOString().split('T')[0];
      setSelectedDate(selected);
      setDate(formattedDate);
    }
  };

  const renderCustomer = ({ item }) => (
    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectCustomer(item)}>
      <Text style={styles.dropdownText}>
        {item.Name} (ID: {item.Customer_id})
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item, index }) => (
    <View style={styles.entryItem}>
      <Text style={styles.entryText}>
        {item.date} - {item.customer.Name} (ID: {item.customer.Customer_id}) - {item.milkQuantity} L
      </Text>
      <TouchableOpacity onPress={() => handleDeleteEntry(index)}>
        <AntDesign name="delete" size={20} color="#D32F2F" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Milk Distribution</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <AntDesign name="reload1" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary for {date} (Seller ID: {sellerId || 'N/A'})</Text>
        {!hasAssignment && (
          <Text style={styles.noAssignmentText}>
            No milk assigned for this date. Contact the admin to assign milk.
          </Text>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Assigned Milk:</Text>
          <Text style={styles.summaryValue}>{assignedMilk.toFixed(2)} L</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Remaining Milk:</Text>
          <Text style={styles.summaryValue}>{remainingMilk.toFixed(2)} L</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Distributed Milk:</Text>
          <Text style={styles.summaryValue}>{totalMilkSold.toFixed(2)} L</Text>
        </View>
      </View>

      {/* Searchable Dropdown */}
      <TouchableOpacity style={styles.dropdownToggle} onPress={toggleDropdown}>
        <Text style={styles.dropdownText}>
          {selectedCustomer
            ? `${selectedCustomer.Name} (ID: ${selectedCustomer.Customer_id})`
            : 'Select Customer'}
        </Text>
        <AntDesign name={dropdownVisible ? 'up' : 'down'} size={16} color="#2A5866" />
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.input}
            placeholder="Search by Name or ID"
            value={searchText}
            onChangeText={handleSearch}
          />
          {loading ? (
            <ActivityIndicator size="small" color="#2A5866" />
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.Customer_id.toString()}
              renderItem={renderCustomer}
              ListEmptyComponent={<Text style={styles.noResults}>No customers found</Text>}
            />
          )}
        </View>
      )}

      {selectedCustomer && (
        <View style={styles.entrySection}>
          <Text style={styles.sectionTitle}>
            Selected: {selectedCustomer.Name} (ID: {selectedCustomer.Customer_id})
          </Text>

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={date ? styles.inputText : styles.placeholderText}>
              {date || 'Select Date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Milk Quantity (in Litres)"
            keyboardType="numeric"
            value={milkQuantity}
            onChangeText={setMilkQuantity}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, (loading || !hasAssignment) && styles.buttonDisabled]}
              onPress={handleAddEntry}
              disabled={loading || !hasAssignment}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Adding...' : 'Add Entry'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.heading}>Entries</Text>
      {entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderEntry}
        />
      ) : (
        <Text style={styles.noResults}>No entries yet</Text>
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
  refreshButton: {
    backgroundColor: '#2A5866',
    padding: 8,
    borderRadius: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A5866',
    marginBottom: 12,
  },
  noAssignmentText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#546E7A',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A5866',
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#2A5866',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    padding: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    elevation: 1,
  },
  inputText: {
    color: '#2A5866',
  },
  placeholderText: {
    color: '#B0BEC5',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  entrySection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A5866',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#ECEFF1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  clearButtonText: {
    color: '#2A5866',
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  entryText: {
    fontSize: 14,
    color: '#2A5866',
  },
  noResults: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MilkSelling;
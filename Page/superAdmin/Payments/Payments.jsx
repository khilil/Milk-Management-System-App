import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { fetchSellers, fetchPaymentsBySeller, fetchPaymentsForSeller } from '../../../database-connect/admin/paymentApi/paymentApi';

const PaymentScreen = () => {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Load user data and initialize
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const role = await AsyncStorage.getItem('userRole');
        const id = await AsyncStorage.getItem('userId');
        if (!role || !id) {
          throw new Error('User not logged in');
        }
        setUserRole(role);
        setUserId(parseInt(id, 10));

        if (role === 'admin') {
          // Fetch all sellers for admin
          const sellerData = await fetchSellers();
          setSellers(sellerData);
          if (sellerData.length > 0) {
            setSelectedSellerId(sellerData[0].Seller_id);
          }
        } else if (role === 'seller') {
          // Fetch payments for logged-in seller
          const paymentData = await fetchPaymentsForSeller(id);
          setPayments(paymentData);
          setFilteredPayments(paymentData);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load data',
        });
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Fetch payments when admin selects a seller
  useEffect(() => {
    if (userRole === 'admin' && selectedSellerId) {
      const loadPayments = async () => {
        try {
          setLoading(true);
          const paymentData = await fetchPaymentsBySeller(selectedSellerId);
          setPayments(paymentData);
          setFilteredPayments(paymentData);
          setCurrentPage(1);
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'Failed to load payments',
          });
        } finally {
          setLoading(false);
        }
      };
      loadPayments();
    }
  }, [selectedSellerId, userRole]);

  // Filter payments based on search and date
  useEffect(() => {
    let filtered = payments;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.Customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Contact?.includes(searchQuery)
      );
    }
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((item) => item.Payment_date.split(' ')[0] === dateStr);
    }
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedDate, payments]);

  // Update visible payments for pagination
  const updateVisiblePayments = (filtered, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDateChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  // Render table header
  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>{userRole === 'admin' ? 'Seller' : 'Customer'}</Text>
      <Text style={styles.headerText}>Contact</Text>
      <Text style={styles.headerText}>Amount</Text>
      <Text style={styles.headerText}>Status</Text>
      <Text style={styles.headerText}>Action</Text>
    </View>
  );

  // Render payment item
  const renderPaymentItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>
        {userRole === 'admin' ? item.Seller_name : item.Customer_name}
      </Text>
      <Text style={styles.cell}>{item.Contact}</Text>
      <Text style={styles.cell}>₹{parseFloat(item.Amount_collected).toFixed(2)}</Text>
      <Text
        style={[
          styles.cell,
          item.Payment_status === 'Paid'
            ? styles.paid
            : item.Payment_status === 'Pending'
            ? styles.pending
            : styles.failed,
        ]}
      >
        {item.Payment_status}
      </Text>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() =>
          Alert.alert(
            'Payment Details',
            `Name: ${userRole === 'admin' ? item.Seller_name : item.Customer_name}\n` +
              `Contact: ${item.Contact}\n` +
              `Amount: ₹${parseFloat(item.Amount_collected).toFixed(2)}\n` +
              `Status: ${item.Payment_status}\n` +
              `Date: ${item.Payment_date}\n` +
              `Method: ${item.Method || 'N/A'}`
          )
        }
      >
        <Text style={styles.viewText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  // Render pagination
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-double-left" size={24} color={currentPage === 1 ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-left" size={24} color={currentPage === 1 ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <View style={styles.pageNumbers}>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page) => (
            <TouchableOpacity
              key={page}
              style={[styles.pageButton, currentPage === page && styles.activePageButton]}
              onPress={() => handlePageChange(page)}
            >
              <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-right" size={24} color={currentPage === totalPages ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-double-right" size={24} color={currentPage === totalPages ? '#ccc' : '#fff'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>

      {/* Role-based UI */}
      {loading ? (
        <ActivityIndicator size="large" color="#2A5866" style={styles.loader} />
      ) : (
        <>
          {userRole === 'admin' && (
            <View style={styles.sellerPickerContainer}>
              <Text style={styles.label}>Select Seller</Text>
              <Picker
                selectedValue={selectedSellerId}
                onValueChange={(value) => setSelectedSellerId(value)}
                style={styles.picker}
              >
                {sellers.map((seller) => (
                  <Picker.Item
                    key={seller.Seller_id}
                    label={seller.Name}
                    value={seller.Seller_id}
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* Date Picker */}
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerText}>
              {selectedDate
                ? `Date: ${selectedDate.toISOString().split('T')[0]}`
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Name or Contact"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Payment Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableContainer}>
              {renderHeader()}
              <FlatList
                data={updateVisiblePayments(filteredPayments, currentPage)}
                keyExtractor={(item) => item.S_payment_id.toString()}
                renderItem={renderPaymentItem}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No payments found</Text>
                }
              />
            </View>
          </ScrollView>

          {filteredPayments.length > 0 && renderPagination()}
        </>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1A2A44',
  },
  sellerPickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2A44',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  datePickerButton: {
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1A2A44',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#1A2A44',
    paddingHorizontal: 10,
  },
  paid: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  pending: {
    color: '#D69E2E',
    fontWeight: 'bold',
  },
  failed: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#2A5866',
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  viewText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  navButton: {
    backgroundColor: '#2A5866',
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pageButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2A5866',
  },
  activePageButton: {
    backgroundColor: '#2A5866',
  },
  pageText: {
    fontSize: 14,
    color: '#2A5866',
    fontWeight: '600',
  },
  activePageText: {
    color: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default PaymentScreen;
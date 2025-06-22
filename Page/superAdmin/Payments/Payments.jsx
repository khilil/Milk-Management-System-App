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
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownAnim] = useState(new Animated.Value(0));
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const itemsPerPage = 6;
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
          const sellerData = await fetchSellers();
          setSellers(sellerData);
          if (sellerData.length > 0) {
            setSelectedSellerId(sellerData[0].Seller_id);
          }
        } else if (role === 'seller') {
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
          item.Customer_contact?.includes(searchQuery)
      );
    }
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((item) => item.Payment_date.split(' ')[0] === dateStr);
    }
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedDate, payments]);

  // Toggle dropdown with animation
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    Animated.timing(dropdownAnim, {
      toValue: showDropdown ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

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
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  // Render table header
  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Seller Name</Text>
      <Text style={styles.headerText}>Seller Contact</Text>
      <Text style={styles.headerText}>Amount</Text>
      <Text style={styles.headerText}>Status</Text>
      <Text style={styles.headerText}>Action</Text>
    </View>
  );

  // Render payment item
  const renderPaymentItem = ({ item, index }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <Text style={styles.cell}>{item.Seller_name || 'Unknown'}</Text>
      <Text style={styles.cell}>{item.Seller_contact || 'N/A'}</Text>
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
        onPress={() => {
          setSelectedPayment(item);
          setShowDetailsModal(true);
        }}
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
        <Icon name="chevron-double-left" size={20} color={currentPage === 1 ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#ccc' : '#fff'} />
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
        <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-double-right" size={20} color={currentPage === totalPages ? '#ccc' : '#fff'} />
      </TouchableOpacity>
    </View>
  );

  // Render custom dropdown
  const renderDropdown = () => {
    const selectedSeller = sellers.find((s) => s.Seller_id === selectedSellerId);
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
          <Text style={styles.dropdownText}>
            {selectedSeller ? selectedSeller.Name : 'Select Seller'}
          </Text>
          <Icon
            name={showDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#2A5866"
          />
        </TouchableOpacity>
        <Modal
          visible={showDropdown}
          transparent
          animationType="none"
          onRequestClose={toggleDropdown}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={toggleDropdown}>
            <Animated.View
              style={[
                styles.dropdownMenu,
                {
                  transform: [
                    {
                      translateY: dropdownAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                  opacity: dropdownAnim,
                },
              ]}
            >
              {sellers.map((seller) => (
                <TouchableOpacity
                  key={seller.Seller_id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSellerId(seller.Seller_id);
                    toggleDropdown();
                  }}
                >
                  <Text style={styles.dropdownItemText}>{seller.Name}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // Render details modal
  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDetailsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailsCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Icon name="close" size={24} color="#1A2A44" />
            </TouchableOpacity>
          </View>
          {selectedPayment && (
            <View style={styles.detailsContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>
                  Name: {selectedPayment.Customer_name || 'N/A'}
                </Text>
                <Text style={styles.detailValue}>
                  Contact: {selectedPayment.Customer_contact || 'N/A'}
                </Text>
                <Text style={styles.detailValue}>
                  Address: {selectedPayment.Address || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Seller</Text>
                <Text style={styles.detailValue}>
                  Name: {selectedPayment.Seller_name || 'Unknown'}
                </Text>
                <Text style={styles.detailValue}>
                  Contact: {selectedPayment.Seller_contact || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>
                  Amount: ₹{parseFloat(selectedPayment.Amount_collected).toFixed(2)}
                </Text>
                <Text style={styles.detailValue}>
                  Status: {selectedPayment.Payment_status}
                </Text>
                <Text style={styles.detailValue}>
                  Date: {selectedPayment.Payment_date.split(' ')[0]}
                </Text>
                <Text style={styles.detailValue}>
                  Method: {selectedPayment.Method || 'N/A'}
                </Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDetailsModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Payment Details</Text>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2A5866" />
            <Text style={styles.loaderText}>Loading Payments...</Text>
          </View>
        ) : (
          <>
            {userRole === 'admin' && renderDropdown()}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Icon name="calendar" size={20} color="#fff" style={styles.datePickerIcon} />
              <Text style={styles.datePickerText}>
                {selectedDate
                  ? `Date: ${selectedDate.toISOString().split('T')[0]}`
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Customer Name or Contact"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={20} color="#666" style={styles.clearIcon} />
                </TouchableOpacity>
              ) : null}
            </View>

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
      </View>
      {renderDetailsModal()}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2A44',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1A2A44',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
    width: '90%',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1A2A44',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  datePickerIcon: {
    marginRight: 8,
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A2A44',
    paddingVertical: 10,
  },
  clearIcon: {
    marginLeft: 8,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%', // Ensure table takes full width
    minWidth: 600,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 12,
    width: '100%', // Full width for header
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    width: '100%', // Full width for rows
    borderBottomColor: '#E5E7EB',
  },
  evenRow: {
    backgroundColor: '#F9FAFB',
  },
  oddRow: {
    backgroundColor: '#FFFFFF',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#1A2A44',
    paddingHorizontal: 10,
  },
  paid: {
    color: '#10B981',
    fontWeight: '600',
  },
  pending: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  failed: {
    color: '#EF4444',
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#2A5866',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  viewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#6B7280',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  navButton: {
    backgroundColor: '#2A5866',
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2A44',
  },
  detailsContent: {
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A5866',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#1A2A44',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
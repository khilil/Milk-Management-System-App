/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchCustomers, recordDelivery, fetchTotalMilkSold, fetchMilkAssignment, fetchDistributionDetails, deleteDelivery, fetchAddresses } from '../../../database-connect/seller-screen/seller_give_milk_to_customer/apiService';
import debounce from 'lodash.debounce';

const MilkSelling = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
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
  const [selectedAddressIds, setSelectedAddressIds] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEntries, setShowEntries] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ITEMS_PER_PAGE = 20;

  // Fade animation for tabs
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showEntries]);

  // Debug log for data and rendering
  useEffect(() => {
    console.log('Filtered Customers:', filteredCustomers.length);
    console.log('Entries:', entries.length);
    console.log('Selected Address ID:', selectedAddressId);
    console.log('Loading:', loading, 'Page:', page, 'Has More:', hasMore);
  }, [filteredCustomers, entries, selectedAddressId, loading, page, hasMore]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem('userId');
        const userRole = await AsyncStorage.getItem('userRole');
        if (userId && userRole === 'seller') {
          setSellerId(parseInt(userId));
          const storedAddressIds = await AsyncStorage.getItem(`selectedAddressIds_${userId}`);
          if (storedAddressIds) {
            const addressIds = JSON.parse(storedAddressIds);
            setSelectedAddressIds(addressIds);
            
            try {
              const addressData = await fetchAddresses(addressIds);
              setAddresses(addressData.map(addr => ({
                Address_id: addr.Address_id,
                Name: addr.Address
              })));
            } catch (error) {
              console.error('Fetch Addresses Error:', error);
              setAddresses(addressIds.map(id => ({ Address_id: id, Name: `Area ${id}` })));
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch address names',
              });
            }
            
            if (addressIds.length > 0) {
              setSelectedAddressId(addressIds[0]);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No areas selected. Please select areas first.',
              });
              navigation.navigate('AddressSelect');
            }
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'No areas selected. Please select areas first.',
            });
            navigation.navigate('AddressSelect');
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please log in as a seller.',
          });
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Load Initial Data Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load initial data',
        });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [navigation]);

  // Fetch customers with pagination
  useEffect(() => {
    if (sellerId && selectedAddressId) {
      const loadCustomers = async () => {
        setLoading(true);
        try {
          console.log('Fetching customers with address ID:', selectedAddressId, 'Page:', page);
          const customerData = await fetchCustomers([selectedAddressId]);
          const start = (page - 1) * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE;
          const paginatedData = customerData.slice(start, end);
          setCustomers(page === 1 ? paginatedData : [...customers, ...paginatedData]);
          setFilteredCustomers(page === 1 ? paginatedData : [...filteredCustomers, ...paginatedData]);
          setHasMore(end < customerData.length);
        } catch (error) {
          console.error('Fetch Customers Error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
          });
        } finally {
          setLoading(false);
        }
      };
      loadCustomers();
    }
  }, [sellerId, selectedAddressId, page]);

  // Fetch milk assignment, total milk sold, and distribution details
  useEffect(() => {
    if (sellerId && date) {
      const loadData = async () => {
        setLoading(true);
        try {
          const [assignmentData, soldData, distData] = await Promise.all([
            fetchMilkAssignment(sellerId, date),
            fetchTotalMilkSold(sellerId, date),
            fetchDistributionDetails(sellerId, date),
          ]);
          setAssignedMilk(assignmentData.assigned_quantity);
          setRemainingMilk(assignmentData.remaining_quantity);
          setTotalMilkSold(soldData.total_quantity);
          setEntries(distData.map(item => ({
            delivery_id: item.delivery_id,
            seller_id: item.seller_id,
            customer_id: item.customer_id,
            customer: { Customer_id: item.customer_id, Name: item.customer_name },
            milkQuantity: item.quantity,
            date: item.date,
          })));
        } catch (error) {
          console.error('Fetch Data Error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
          });
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [date, sellerId]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setPage(1);
      setCustomers([]);
      setFilteredCustomers([]);
      setHasMore(true);

      const userId = await AsyncStorage.getItem('userId');
      const userRole = await AsyncStorage.getItem('userRole');
      if (userId && userRole === 'seller') {
        setSellerId(parseInt(userId));
        const storedAddressIds = await AsyncStorage.getItem(`selectedAddressIds_${userId}`);
        if (storedAddressIds) {
          const addressIds = JSON.parse(storedAddressIds);
          setSelectedAddressIds(addressIds);
          
          try {
            const addressData = await fetchAddresses(addressIds);
            setAddresses(addressData.map(addr => ({
              Address_id: addr.Address_id,
              Name: addr.Address
            })));
          } catch (error) {
            console.error('Fetch Addresses Error:', error);
            setAddresses(addressIds.map(id => ({ Address_id: id, Name: `Area ${id}` })));
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to fetch address names',
            });
          }
          
          if (addressIds.length > 0) {
            setSelectedAddressId(addressIds[0]);
            const customerData = await fetchCustomers([addressIds[0]]);
            const paginatedData = customerData.slice(0, ITEMS_PER_PAGE);
            setCustomers(paginatedData);
            setFilteredCustomers(paginatedData);
            setHasMore(customerData.length > ITEMS_PER_PAGE);
          }
        }

        const [assignmentData, soldData, distData] = await Promise.all([
          fetchMilkAssignment(parseInt(userId), date),
          fetchTotalMilkSold(parseInt(userId), date),
          fetchDistributionDetails(parseInt(userId), date),
        ]);
        setAssignedMilk(assignmentData.assigned_quantity);
        setRemainingMilk(assignmentData.remaining_quantity);
        setTotalMilkSold(soldData.total_quantity);
        setEntries(distData.map(item => ({
          delivery_id: item.delivery_id,
          seller_id: item.seller_id,
          customer_id: item.customer_id,
          customer: { Customer_id: item.customer_id, Name: item.customer_name },
          milkQuantity: item.quantity,
          date: item.date,
        })));

        Toast.show({
          type: 'success',
          text1: 'Refreshed',
          text2: 'Data has been refreshed successfully',
        });
      }
    } catch (error) {
      console.error('Refresh Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to refresh data',
      });
    } finally {
      setRefreshing(false);
    }
  }, [date]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((text) => {
      const filtered = customers.filter(
        (customer) =>
          customer.Name?.toLowerCase().includes(text.toLowerCase()) ||
          customer.Customer_id?.toString().includes(text)
      );
      setFilteredCustomers(filtered);
    }, 300),
    [customers]
  );

  const handleSearch = (text) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  // Load more customers
  const loadMoreCustomers = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // Select customer for milk delivery
  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setMilkQuantity('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedDate(new Date());
    setModalVisible(true);
  }, []);

  // Record milk delivery
  const handleAddEntry = async () => {
    if (!selectedCustomer || !milkQuantity || !date || !sellerId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
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
      const distData = await fetchDistributionDetails(sellerId, date);
      setEntries(distData.map(item => ({
        delivery_id: item.delivery_id,
        seller_id: item.seller_id,
        customer_id: item.customer_id,
        customer: { Customer_id: item.customer_id, Name: item.customer_name },
        milkQuantity: item.quantity,
        date: item.date,
      })));
      setTotalMilkSold(prev => prev + quantityNum);
      setRemainingMilk(result.remaining_quantity);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Delivery recorded successfully',
      });
      setModalVisible(false);
    } catch (error) {
      console.error('Record Delivery Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete delivery entry
  const handleDeleteEntry = async (entry) => {
    setLoading(true);
    try {
      const deliveryData = {
        delivery_id: entry.delivery_id,
        seller_id: entry.seller_id,
        customer_id: entry.customer_id,
        quantity: entry.milkQuantity,
        date: entry.date,
      };
      const result = await deleteDelivery(deliveryData);
      const distData = await fetchDistributionDetails(sellerId, date);
      setEntries(distData.map(item => ({
        delivery_id: item.delivery_id,
        seller_id: item.seller_id,
        customer_id: item.customer_id,
        customer: { Customer_id: item.customer_id, Name: item.customer_name },
        milkQuantity: item.quantity,
        date: item.date,
      })));
      setTotalMilkSold(prev => prev - entry.milkQuantity);
      setRemainingMilk(result.remaining_quantity);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Entry deleted successfully',
      });
    } catch (error) {
      console.error('Delete Entry Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = useCallback((addressId) => {
    setSelectedAddressId(addressId);
    setSearchText('');
    setPage(1);
    setFilteredCustomers([]);
    setCustomers([]);
    setHasMore(true);
  }, []);

  // Handle date change
  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const formattedDate = selected.toISOString().split('T')[0];
      setSelectedDate(selected);
      setDate(formattedDate);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchText('');
    setFilteredCustomers(customers);
    searchInputRef.current?.clear();
  };

  // Set preset milk quantity
  const setPresetQuantity = (quantity) => {
    setMilkQuantity(quantity.toString());
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const quantity = parseFloat(milkQuantity) || 0;
    const pricePerLiter = selectedCustomer?.Price || 0;
    return (quantity * pricePerLiter).toFixed(2);
  };

  // Render customer item
  const renderCustomer = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => handleSelectCustomer(item)}
      activeOpacity={0.8}
    >
      <View style={styles.customerIcon}>
        <AntDesign name="user" size={20} color="#2C5282" />
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.Name}</Text>
        <Text style={styles.customerDetails}>
          ID: {item.Customer_id} | Area: {item.Address}
        </Text>
        <Text style={styles.customerContact}>Contact: {item.Contact}</Text>
      </View>
      <AntDesign name="right" size={16} color="#2C5282" />
    </TouchableOpacity>
  ), [handleSelectCustomer]);

  // Render delivery entry
  const renderEntry = useCallback(({ item }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryInfo}>
        <Text style={styles.entryText}>
          {item.date} - {item.customer.Name} (ID: {item.customer.Customer_id})
        </Text>
        <Text style={styles.entryQuantity}>{item.milkQuantity.toFixed(2)} L</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteEntry(item)} style={styles.deleteButton}>
        <AntDesign name="delete" size={20} color="#E53E3E" />
      </TouchableOpacity>
    </View>
  ), [handleDeleteEntry]);

  // Render address item
  const renderAddress = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressButton,
        selectedAddressId === item.Address_id && styles.addressButtonSelected,
      ]}
      onPress={() => handleAddressSelect(item.Address_id)}
    >
      <Text
        style={[
          styles.addressText,
          selectedAddressId === item.Address_id && styles.addressTextSelected,
        ]}
      >
        {item.Name || `Area ${item.Address_id}`}
      </Text>
    </TouchableOpacity>
  ), [handleAddressSelect, selectedAddressId]);

  // Preset quantities
  const presetQuantities = [0.5, 1, 1.5, 2, 2.5];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2A5866']}
            tintColor="#2A5866"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Milk Distribution</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddressSelect')}
          >
            <AntDesign name="enviromento" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{date} - Seller ID: {sellerId || 'N/A'}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Assigned</Text>
              <Text style={styles.summaryValue}>{assignedMilk.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={styles.summaryValue}>{remainingMilk.toFixed(2)} L</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distributed</Text>
              <Text style={styles.summaryValue}>{totalMilkSold.toFixed(2)} L</Text>
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Select Area</Text>
          <FlatList
            horizontal
            data={addresses}
            keyExtractor={(item) => item.Address_id.toString()}
            renderItem={renderAddress}
            showsHorizontalScrollIndicator={false}
            style={styles.addressList}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="#2C5282" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by Name or ID"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
              <AntDesign name="close" size={18} color="#2C5282" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, !showEntries && styles.tabActive]}
            onPress={() => {
              setShowEntries(false);
              fadeAnim.setValue(0);
            }}
          >
            <Text style={[styles.tabText, !showEntries && styles.tabTextActive]}>
              Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showEntries && styles.tabActive]}
            onPress={() => {
              setShowEntries(true);
              fadeAnim.setValue(0);
            }}
          >
            <Text style={[styles.tabText, showEntries && styles.tabTextActive]}>
              Entries
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated List */}
        <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
          {loading && page === 1 ? (
            <ActivityIndicator size="large" color="#2C5282" style={styles.loader} />
          ) : showEntries ? (
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={(item) => `entry-${item.delivery_id}`}
              ListEmptyComponent={<Text style={styles.noResults}>No entries for {date}</Text>}
              scrollEnabled={false}
            />
          ) : (
            <View>
              <FlatList
                data={filteredCustomers}
                renderItem={renderCustomer}
                keyExtractor={(item) => `customer-${item.Customer_id}`}
                ListEmptyComponent={<Text style={styles.noResults}>No customers found</Text>}
                scrollEnabled={false}
              />
              {hasMore && (
                <TouchableOpacity
                  style={[styles.loadMoreButton, loading && styles.buttonDisabled]}
                  onPress={loadMoreCustomers}
                  disabled={loading}
                >
                  <Text style={styles.loadMoreText}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Deliver to {selectedCustomer?.Name || 'N/A'} (ID: {selectedCustomer?.Customer_id || 'N/A'})
            </Text>

            {/* Price and Total Price Boxes */}
            <View style={styles.priceContainer}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Price per Liter</Text>
                <Text style={styles.priceValue}>₹{selectedCustomer?.Price || '0.00'}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Total Price</Text>
                <Text style={styles.priceValue}>₹{calculateTotalPrice()}</Text>
              </View>
            </View>

            {/* Preset Quantity Buttons */}
            <View style={styles.presetQuantityContainer}>
              {presetQuantities.map((quantity) => (
                <TouchableOpacity
                  key={quantity}
                  style={[
                    styles.presetButton,
                    parseFloat(milkQuantity) === quantity && styles.presetButtonSelected,
                  ]}
                  onPress={() => setPresetQuantity(quantity)}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      parseFloat(milkQuantity) === quantity && styles.presetButtonTextSelected,
                    ]}
                  >
                    {quantity}L
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalInput}
              onPress={() => setShowDatePicker(true)}
            >
              <AntDesign name="calendar" size={20} color="#2C5282" style={styles.inputIcon} />
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

            <View style={styles.modalInput}>
              <AntDesign name="dropbox" size={20} color="#2C5282" style={styles.inputIcon} />
              <TextInput
                style={styles.modalInputField}
                placeholder="Milk Quantity (Litres)"
                keyboardType="numeric"
                value={milkQuantity}
                onChangeText={setMilkQuantity}
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleAddEntry}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Processing...' : 'Give'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60, // Increased padding for bottom content
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2A44',
    letterSpacing: 0.2,
  },
  headerButton: {
    backgroundColor: '#2A5866',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2A44',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A5866',
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2A44',
    marginBottom: 12,
    marginTop: 8,
  },
  addressList: {
    maxHeight: 40,
  },
  addressButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#2A5866',
    borderRadius: 16,
  },
  addressButtonSelected: {
    backgroundColor: '#102D36',
  },
  addressText: {
    fontSize: 14,
    color: '#F9FCFF',
    fontWeight: '600',
  },
  addressTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    color: '#2C5282',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1A2A44',
  },
  clearSearchButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#2A5866',
  },
  tabText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContent: {
    minHeight: 100, // Minimum height for content
  },
  customerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerIcon: {
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2A44',
    marginBottom: 4,
  },
  customerDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  customerContact: {
    fontSize: 14,
    color: '#64748B',
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  entryInfo: {
    flex: 1,
  },
  entryText: {
    fontSize: 15,
    color: '#1A2A44',
    marginBottom: 4,
  },
  entryQuantity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
  },
  deleteButton: {
    padding: 8,
  },
  noResults: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 20,
  },
  loader: {
    marginVertical: 20,
    color: '#2A5866',
  },
  loadMoreButton: {
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2A44',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A5866',
  },
  presetQuantityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presetButton: {
    width: '30%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2A5866',
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  presetButtonSelected: {
    backgroundColor: '#102D36',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#F9FCFF',
    fontWeight: '600',
  },
  presetButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  modalInputField: {
    flex: 1,
    fontSize: 16,
    color: '#1A2A44',
  },
  inputIcon: {
    marginRight: 10,
    color: '#2C5282',
  },
  inputText: {
    fontSize: 16,
    color: '#1A2A44',
  },
  placeholderText: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#2A5866',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#2A5866',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MilkSelling;
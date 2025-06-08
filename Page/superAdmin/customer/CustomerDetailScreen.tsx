import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import { print } from 'react-native-print';
import { useNavigation } from '@react-navigation/native';
import { fetchMonthlyConsumption } from '../../../database-connect/customer/featch';
import { API_CONFIG } from '../../../database-connect/Apichange';
import axios from 'axios';

const CustomerDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const [customer, setCustomer] = useState(route.params?.customer || null);
  const [isAdmin, setIsAdmin] = useState(route.params?.isAdmin || false);
  const [milkRecords, setMilkRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [thisMonthPaid, setThisMonthPaid] = useState(false);
  const [previousMonthPaid, setPreviousMonthPaid] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const itemsPerPage = 5;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-based month
  const currentYear = currentDate.getFullYear();

  // Load customer data from AsyncStorage or route.params
  const loadCustomer = useCallback(async () => {
    try {
      let userData = route.params?.customer;
      if (userData) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(userData));
        setCustomer(userData);
        setIsAdmin(route.params?.isAdmin || false);
      } else {
        const storedData = await AsyncStorage.getItem('loggedInUser');
        if (storedData) {
          userData = JSON.parse(storedData);
          setCustomer(userData);
          setIsAdmin(userData.isAdmin || route.params?.isAdmin || false);
        } else {
          Alert.alert('Error', 'No user data found. Please log in.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Error', 'Failed to load user data');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [navigation, route.params?.customer, route.params?.isAdmin]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  // Set navigation options
  useEffect(() => {
    if (customer) {
      navigation.setOptions({
        headerTitle: `${customer.username || 'Customer'}'s Dashboard`,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
        headerStyle: { backgroundColor: '#2A5866' },
        headerTintColor: '#fff',
      });
    }
  }, [navigation, customer]);

  // Fetch monthly consumption and payment data
  const fetchData = useCallback(async () => {
    if (!customer?.id) {
      Alert.alert('Error', 'Invalid customer data');
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchMonthlyConsumption(customer.id, currentYear, currentMonth);
      console.log('Fetched Monthly Data:', data);
      setMonthlyData(data);
      setMilkRecords(data.current_month.daily_records || []);
      setFilteredRecords(data.current_month.daily_records || []);
      setThisMonthPaid(data.current_month.paid || false);
      setPreviousMonthPaid(data.previous_month.paid || false);
    } catch (error) {
      console.error('Fetch Monthly Consumption Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch milk records');
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCustomer();
      await fetchData();
      setCurrentPage(1);
      setDateFilter('');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [loadCustomer, fetchData]);

  // Filter records based on date input
  useEffect(() => {
    const filtered = milkRecords.filter(record => record.date.includes(dateFilter));
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [dateFilter, milkRecords]);

  // Update milk records when selected month changes
  useEffect(() => {
    if (monthlyData) {
      const records =
        selectedMonth === 'current'
          ? monthlyData.current_month.daily_records || []
          : selectedMonth === 'previous'
          ? monthlyData.previous_month.daily_records || []
          : monthlyData.next_month.daily_records || [];
      setMilkRecords(records);
      setFilteredRecords(records);
      setDateFilter('');
    }
  }, [selectedMonth, monthlyData]);

  // Calculate totals based on selected month
  const totalMilk = monthlyData
    ? selectedMonth === 'current'
      ? monthlyData.current_month.total_quantity || 0
      : selectedMonth === 'previous'
      ? monthlyData.previous_month.total_quantity || 0
      : monthlyData.next_month.total_quantity || 0
    : 0;
  const totalPrice = monthlyData
    ? selectedMonth === 'current'
      ? monthlyData.current_month.total_price || 0
      : selectedMonth === 'previous'
      ? monthlyData.previous_month.total_price || 0
      : monthlyData.next_month.total_price || 0
    : 0;
  const pricePerLiter = monthlyData
    ? monthlyData.current_month.price_per_liter || customer.price || 64
    : customer.price || 64;
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditRecord = (record) => {
    Alert.prompt(
      'Edit Quantity',
      'Enter new milk quantity:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newQuantity) => {
            if (newQuantity && !isNaN(parseFloat(newQuantity))) {
              try {
                const response = await axios.post(`${API_CONFIG.update_delivery}`, {
                  Delivery_id: record.Delivery_id,
                  Quantity: parseFloat(newQuantity),
                });
                if (response.data.status === 'success') {
                  const updatedRecords = milkRecords.map(r =>
                    r.Delivery_id === record.Delivery_id
                      ? { ...r, quantity: parseFloat(newQuantity) }
                      : r
                  );
                  setMilkRecords(updatedRecords);
                  setFilteredRecords(updatedRecords);
                  Alert.alert('Success', 'Record updated successfully');
                } else {
                  Alert.alert('Error', response.data.message || 'Failed to update record');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to update record: ' + error.message);
              }
            } else {
              Alert.alert('Error', 'Please enter a valid number.');
            }
          },
        },
      ],
      'plain-text',
      record.quantity.toString()
    );
  };

  const handleDeleteRecord = (date) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_CONFIG.delete_delivery}`, {
                headers: { 'Content-Type': 'application/json' },
                data: { Date: date, Customer_id: customer.id },
              });
              if (response.data.status === 'success') {
                const updatedRecords = milkRecords.filter(r => r.date !== date);
                setMilkRecords(updatedRecords);
                setFilteredRecords(updatedRecords);
                Alert.alert('Success', 'Record deleted successfully');
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete record');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('loggedInUser');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const downloadExcel = async () => {
    try {
      let hasPermission = true;
      let filePath = `${RNFS.DownloadDirectoryPath}/MilkRecords_${customer?.username || 'User'}_${Date.now()}.xlsx`;

      if (Platform.OS === 'android' && Platform.Version < 30) {
        const isPermitted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (!isPermitted) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Needed',
              message: 'This app needs access to your storage to save the Milk Records Excel file to your Downloads folder.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            hasPermission = false;
            filePath = `${RNFS.DocumentDirectoryPath}/MilkRecords_${customer?.username || 'User'}_${Date.now()}.xlsx`;
            Alert.alert(
              'Permission Denied',
              `Storage permission was not granted. The file will be saved to the app's internal storage at ${filePath}. You can access it via a file manager or enable permission in Settings.`,
              [
                { text: 'OK' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
          }
        }
      }

      const data = filteredRecords.map(record => ({
        Date: record.date,
        Quantity: record.quantity,
        Price: `₹${(record.quantity * pricePerLiter).toFixed(2)}`,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MilkRecords');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      await RNFS.writeFile(filePath, wbout, 'base64');

      Alert.alert(
        'Success',
        `Excel file saved to ${filePath}${hasPermission ? ' in your Downloads folder' : '. Use a file manager to access it.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error downloading Excel:', error);
      Alert.alert('Error', 'Failed to save Excel file. Please try again.');
    }
  };

  const handlePrint = async () => {
    try {
      await print({
        html: `<h1>${customer?.username || 'User'}'s Milk Records</h1><table style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #2A5866; color: white;">
            <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
          </tr>
          ${filteredRecords
            .map(
              r =>
                `<tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${r.date}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${r.quantity}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">₹${(r.quantity * pricePerLiter).toFixed(2)}</td>
                </tr>`
            )
            .join('')}
        </table>`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to print.');
    }
  };

  const togglePayment = async (month) => {
    try {
      const targetYear = month === 'this' ? currentYear : currentMonth === 1 ? currentYear - 1 : currentYear;
      const targetMonth = month === 'this' ? currentMonth : currentMonth === 1 ? 12 : currentMonth - 1;
      const newStatus = month === 'this' ? !thisMonthPaid : !previousMonthPaid;
      const response = await axios.post(`${API_CONFIG.update_payment_status}`, {
        Customer_id: customer.id,
        Year: targetYear,
        Month: targetMonth,
        Payment_status: newStatus ? 'Paid' : 'Pending',
      });
      if (response.data.status === 'success') {
        if (month === 'this') {
          setThisMonthPaid(newStatus);
        } else {
          setPreviousMonthPaid(newStatus);
        }
        Alert.alert('Success', `Payment status updated to ${newStatus ? 'Paid' : 'Pending'}`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update payment status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment status: ' + error.message);
    }
  };

  const toggleMonthView = (month) => {
    setSelectedMonth(month);
  };

  const renderMilkRecord = ({ item }) => (
    <View style={styles.recordRow}>
      <Text style={[styles.recordCell, { flex: 2 }]}>{item.date}</Text>
      <Text style={[styles.recordCell, { flex: 1 }]}>{item.quantity}L</Text>
      <Text style={[styles.recordCell, { flex: 1 }]}>₹{(item.quantity * pricePerLiter).toFixed(2)}</Text>
      {isAdmin && (
        <View style={[styles.recordCell, { flex: 1, flexDirection: 'row', justifyContent: 'space-around' }]}>
          <TouchableOpacity onPress={() => handleEditRecord(item)}>
            <Icon name="pencil" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteRecord(item.date)}>
            <Icon name="delete" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-double-left" size={20} color={currentPage === 1 ? '#B0BEC5' : '#2A5866'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#B0BEC5' : '#2A5866'} />
      </TouchableOpacity>
      <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#B0BEC5' : '#2A5866'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-double-right" size={20} color={currentPage === totalPages ? '#B0BEC5' : '#2A5866'} />
      </TouchableOpacity>
    </View>
  );

  const HeaderContent = () => (
    <>
      {isLoading || !customer ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A5866" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <View style={styles.profileIcon}>
                <Icon name="account" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerText}>{customer.username || 'N/A'}</Text>
              <Text style={styles.subHeader}>{customer.phone || 'N/A'}</Text>
            </View>
            {isAdmin && (
              <View style={styles.adminActions}>
                <TouchableOpacity style={styles.actionButton} onPress={downloadExcel}>
                  <Icon name="file-excel" size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Download Excel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
                  <Icon name="printer" size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Print</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.monthToggleContainer}>
            <TouchableOpacity
              style={[
                styles.monthButton,
                selectedMonth === 'previous' && styles.activeMonthButton,
              ]}
              onPress={() => toggleMonthView('previous')}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  selectedMonth === 'previous' && styles.activeMonthButtonText,
                ]}
              >
                Previous Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.monthButton,
                selectedMonth === 'current' && styles.activeMonthButton,
              ]}
              onPress={() => toggleMonthView('current')}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  selectedMonth === 'current' && styles.activeMonthButtonText,
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
      
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Icon name="chart-bar" size={24} color="#2A5866" />
              <Text style={styles.statValue}>{totalMilk.toFixed(2)}L</Text>
              <Text style={styles.statLabel}>
                {selectedMonth === 'current'
                  ? 'This Month'
                  : selectedMonth === 'previous'
                  ? 'Previous Month'
                  : 'Next Month'} Milk
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="currency-inr" size={24} color="#2A5866" />
              <Text style={styles.statValue}>₹{totalPrice.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={18} color="#2A5866" />
              <Text style={styles.infoText}>{customer.address || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="calendar" size={18} color="#2A5866" />
              <Text style={styles.infoText}>Price per Liter: ₹{pricePerLiter.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="cash-check" size={18} color="#2A5866" />
              <Text style={styles.infoText}>
                Previous Month Paid:{' '}
                <Text style={previousMonthPaid ? styles.paidText : styles.pendingText}>
                  {previousMonthPaid ? 'Paid' : 'Pending'}
                </Text>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => togglePayment('previous')}
                    style={styles.toggleButton}
                  >
                    <Text style={styles.toggleText}>{previousMonthPaid ? 'Unmark' : 'Mark'}</Text>
                  </TouchableOpacity>
                )}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="cash-clock" size={18} color="#2A5866" />
              <Text style={styles.infoText}>
                This Month Paid:{' '}
                <Text style={thisMonthPaid ? styles.paidText : styles.pendingText}>
                  {thisMonthPaid ? 'Paid' : 'Pending'}
                </Text>
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => togglePayment('this')}
                    style={styles.toggleButton}
                  >
                    <Text style={styles.toggleText}>{thisMonthPaid ? 'Unmark' : 'Mark'}</Text>
                  </TouchableOpacity>
                )}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="cash" size={18} color="#2A5866" />
              <Text style={styles.infoText}>
                Next Month Due: {thisMonthPaid ? '₹0' : `₹${totalPrice.toFixed(2)}`}
              </Text>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by date (YYYY-MM-DD)"
              placeholderTextColor="#90A4AE"
              value={dateFilter}
              onChangeText={setDateFilter}
            />
            <Icon name="magnify" size={24} color="#2A5866" style={styles.searchIcon} />
          </View>

          <Text style={styles.sectionTitle}>
            {selectedMonth === 'current'
              ? 'This Month Milk Distribution History'
              : selectedMonth === 'previous'
              ? 'Previous Month Milk Distribution History'
              : 'Next Month Milk Distribution History'}
          </Text>
        </>
      )}
    </>
  );

  return (
    <LinearGradient colors={['#F8F9FB', '#EFF2F6']} style={styles.container}>
      <FlatList
        data={paginatedRecords}
        keyExtractor={item => item.date}
        renderItem={renderMilkRecord}
        ListHeaderComponent={<HeaderContent />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="database-remove" size={48} color="#CFD8DC" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : `No records found for ${
                selectedMonth === 'current'
                  ? 'this month'
                  : selectedMonth === 'previous'
                  ? 'previous month'
                  : 'next month'
              }`}
            </Text>
          </View>
        }
        ListFooterComponent={filteredRecords.length > itemsPerPage ? renderPagination : null}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2A5866']}
            tintColor="#2A5866"
          />
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIcon: {
    backgroundColor: '#2A5866',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2A5866',
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 16,
    color: '#78909C',
    marginTop: 8,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  monthToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monthButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#ECEFF1',
    marginHorizontal: 8,
  },
  activeMonthButton: {
    backgroundColor: '#2A5866',
  },
  monthButtonText: {
    fontSize: 16,
    color: '#2A5866',
    fontWeight: '600',
  },
  activeMonthButtonText: {
    color: '#FFFFFF',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#2A5866',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A5866',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#78909C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#546E7A',
    marginLeft: 12,
    flex: 1,
  },
  paidText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  pendingText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#2A5866',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEFF1',
    marginVertical: 16,
  },
  filterContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    fontSize: 16,
    color: '#2A5866',
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A5866',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  recordRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    alignItems: 'center',
  },
  recordCell: {
    fontSize: 14,
    color: '#37474F',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#B0BEC5',
    marginTop: 16,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    elevation: 2,
  },
  navButton: {
    backgroundColor: '#ECEFF1',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 6,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F5F7FA',
  },
  pageInfo: {
    fontSize: 14,
    color: '#78909C',
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 80,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#2A5866',
    marginTop: 16,
  },
});

export default CustomerDetailScreen;
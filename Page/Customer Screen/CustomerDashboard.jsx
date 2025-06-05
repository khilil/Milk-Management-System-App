import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl, // Added RefreshControl import
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
import { fetchMonthlyConsumption } from '../../database-connect/customer/featch';

const CustomerDashboard = ({ route }) => {
  const navigation = useNavigation();
  const [customer, setCustomer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(route.params?.isAdmin || false);
  const [milkRecords, setMilkRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [thisMonthPaid, setThisMonthPaid] = useState(false);
  const [previousMonthPaid, setPreviousMonthPaid] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [refreshing, setRefreshing] = useState(false); // Added state for RefreshControl
  const itemsPerPage = 5;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

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
          setIsAdmin(userData.isAdmin || false);
        } else {
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
  }, [navigation, route.params?.customer]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  // Set navigation options
  useEffect(() => {
    if (customer) {
      navigation.setOptions({
        headerTitle: 'Customer Dashboard',
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

  // Fetch monthly consumption data
  const fetchData = useCallback(async () => {
    if (!customer) return;
    try {
      const data = await fetchMonthlyConsumption(customer.id, currentYear, currentMonth);
      setMonthlyData(data);
      setMilkRecords(data.current_month.daily_records);
      setFilteredRecords(data.current_month.daily_records);
      setThisMonthPaid(data.current_month.paid || false);
      setPreviousMonthPaid(data.previous_month.paid || false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [customer?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCustomer(); // Reload customer data
      await fetchData(); // Refetch monthly consumption data
      setCurrentPage(1); // Reset pagination
      setDateFilter(''); // Reset date filter
      // Alert.alert('Success', 'Data refreshed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [loadCustomer, fetchData]);

  // Filter records based on date input
  useEffect(() => {
    if (!milkRecords) return;
    const filtered = milkRecords.filter(record =>
      record.date.includes(dateFilter),
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [dateFilter, milkRecords]);

  // Update milk records when selected month changes
  useEffect(() => {
    if (monthlyData) {
      const records =
        selectedMonth === 'current'
          ? monthlyData.current_month.daily_records
          : selectedMonth === 'previous'
          ? monthlyData.previous_month.daily_records
          : monthlyData.next_month.daily_records;
      setMilkRecords(records);
      setFilteredRecords(records);
      setDateFilter('');
    }
  }, [selectedMonth, monthlyData]);

  // Calculate totals based on selected month
  const totalMilk = monthlyData
    ? selectedMonth === 'current'
      ? monthlyData.current_month.total_quantity
      : selectedMonth === 'previous'
      ? monthlyData.previous_month.total_quantity
      : monthlyData.next_month.total_quantity
    : 0;
  const totalPrice = monthlyData
    ? selectedMonth === 'current'
      ? monthlyData.current_month.total_price
      : selectedMonth === 'previous'
      ? monthlyData.previous_month.total_price
      : monthlyData.next_month.total_price
    : 0;
  const pricePerLiter = monthlyData
    ? monthlyData.current_month.price_per_liter
    : 64;
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditRecord = record => {
    Alert.prompt(
      'Edit Quantity',
      'Enter new milk quantity:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: newQuantity => {
            if (newQuantity && !isNaN(parseFloat(newQuantity))) {
              const updatedRecords = milkRecords.map(r =>
                r.date === record.date
                  ? { ...r, quantity: parseFloat(newQuantity) }
                  : r,
              );
              setMilkRecords(updatedRecords);
            } else {
              Alert.alert('Error', 'Please enter a valid number.');
            }
          },
        },
      ],
      'plain-text',
      record.quantity.toString(),
    );
  };

  const handleDeleteRecord = date => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            const updatedRecords = milkRecords.filter(r => r.date !== date);
            setMilkRecords(updatedRecords);
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('loggedInUser');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const toggleMonthView = month => {
    setSelectedMonth(month);
  };

  const downloadExcel = async () => {
    try {
      const isPermitted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (!isPermitted) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Needed',
            message: 'This app needs access to storage to download the Excel file.',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot download file without storage permission.');
          return;
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

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const filePath = `${RNFS.DownloadDirectoryPath}/MilkRecords_${customer?.username || 'User'}.xlsx`;

      await RNFS.writeFile(filePath, wbout, 'ascii');
      Alert.alert('Success', `Excel file downloaded to ${filePath}`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      Alert.alert('Error', 'Failed to download Excel file.');
    }
  };

  const handlePrint = async () => {
    try {
      await print({
        html: `<h1>${customer?.username || 'User'}'s Milk Records</h1><table>${filteredRecords
          .map(
            r =>
              `<tr><td>${r.date}</td><td>${r.quantity}</td><td>₹${(
                r.quantity * pricePerLiter
              ).toFixed(2)}</td></tr>`,
          )
          .join('')}</table>`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to print.');
    }
  };

  const togglePayment = month => {
    if (month === 'this') {
      setThisMonthPaid(!thisMonthPaid);
    } else if (month === 'previous') {
      setPreviousMonthPaid(!previousMonthPaid);
    }
  };

  const HeaderContent = () => (
    <>
      {customer ? (
        <>
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <View style={styles.profileIcon}>
                <Icon name="account" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.headerText}>{customer.username}</Text>
              <Text style={styles.subHeader}>{customer.phone}</Text>
            </View>

            {!isAdmin && (
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
              onPress={() => toggleMonthView('previous')}>
              <Text
                style={[
                  styles.monthButtonText,
                  selectedMonth === 'previous' && styles.activeMonthButtonText,
                ]}>
                Previous Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.monthButton,
                selectedMonth === 'current' && styles.activeMonthButton,
              ]}
              onPress={() => toggleMonthView('current')}>
              <Text
                style={[
                  styles.monthButtonText,
                  selectedMonth === 'current' && styles.activeMonthButtonText,
                ]}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Icon name="chart-bar" size={24} color="#2A5866" />
              <Text style={styles.statText}>{totalMilk.toFixed(2)} L</Text>
              <Text style={styles.statLabel}>
                {selectedMonth === 'current'
                  ? 'This Month'
                  : selectedMonth === 'previous'
                  ? 'Previous Month'
                  : 'Next Month'}{' '}
                Milk
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="currency-inr" size={24} color="#2A5866" />
              <Text style={styles.statText}>₹{totalPrice.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={18} color="#2A5866" />
              <Text style={styles.infoText}>{customer.address}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="calendar" size={18} color="#2A5866" />
              <Text style={styles.infoText}>
                Daily Quantity: {customer.milkQuantity}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="cash-check" size={18} color="#2A5866" />
              <Text style={styles.infoText}>
                Previous Month Paid: {previousMonthPaid ? 'Yes' : 'No'}
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => togglePayment('previous')}
                    style={styles.toggleButton}>
                    <Text style={styles.toggleText}>
                      {previousMonthPaid ? 'Unmark' : 'Mark'}
                    </Text>
                  </TouchableOpacity>
                )}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="cash-clock" size={18} color="#2A5866" />
              <Text style={styles.infoText}>
                This Month Paid: {thisMonthPaid ? 'Yes' : 'No'}
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => togglePayment('this')}
                    style={styles.toggleButton}>
                    <Text style={styles.toggleText}>
                      {thisMonthPaid ? 'Unmark' : 'Mark'}
                    </Text>
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
            <Icon
              name="magnify"
              size={24}
              color="#2A5866"
              style={styles.searchIcon}
            />
          </View>

          <Text style={styles.sectionTitle}>
            {selectedMonth === 'current'
              ? 'This Month Milk Distribution History'
              : selectedMonth === 'previous'
              ? 'Previous Month Milk Distribution History'
              : 'Next Month Milk Distribution History'}
          </Text>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      )}
    </>
  );

  const renderMilkRecord = ({ item }) => (
    <View style={styles.recordRow}>
      <Text style={[styles.recordCell, { flex: 2 }]}>{item.date}</Text>
      <Text style={[styles.recordCell, { flex: 1 }]}>{item.quantity}L</Text>
      <Text style={[styles.recordCell, { flex: 1 }]}>
        ₹{(item.quantity * pricePerLiter).toFixed(2)}
      </Text>
      {isAdmin && (
        <View
          style={[
            styles.recordCell,
            { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
          ]}>
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
        disabled={currentPage === 1}>
        <Icon
          name="chevron-double-left"
          size={20}
          color={currentPage === 1 ? '#B0BEC5' : '#2A5866'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}>
        <Icon
          name="chevron-left"
          size={20}
          color={currentPage === 1 ? '#B0BEC5' : '#2A5866'}
        />
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}>
        <Icon
          name="chevron-right"
          size={20}
          color={currentPage === totalPages ? '#B0BEC5' : '#2A5866'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.navButton,
          currentPage === totalPages && styles.disabledButton,
        ]}
        onPress={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}>
        <Icon
          name="chevron-double-right"
          size={20}
          color={currentPage === totalPages ? '#B0BEC5' : '#2A5866'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#F8F9FB', '#EFF2F6']} style={styles.container}>
      <FlatList
        data={customer ? paginatedRecords : []}
        keyExtractor={item => item.date}
        renderItem={renderMilkRecord}
        ListHeaderComponent={<HeaderContent />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="database-remove" size={48} color="#CFD8DC" />
            <Text style={styles.emptyText}>
              {customer
                ? `No records found for ${
                    selectedMonth === 'current'
                      ? 'this month'
                      : selectedMonth === 'previous'
                      ? 'previous month'
                      : 'next month'
                  }`
                : 'Please log in to view records'}
            </Text>
          </View>
        }
        ListFooterComponent={
          customer && filteredRecords.length > itemsPerPage ? renderPagination : null
        }
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
  statText: {
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2A5866',
  },
});

export default CustomerDashboard;
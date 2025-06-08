import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import { print } from 'react-native-print';
import axios from 'axios';
import { API_CONFIG } from '../../Apichange'; // Adjust path if needed
import { fetchSellerDeliveries } from '../../../database-connect/admin/seller/fetchSellerDeliveries'; // Verify path

const SellerDetailScreen = ({ route }) => {
  const { seller, isAdmin = false } = route.params;
  const [milkRecords, setMilkRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const itemsPerPage = 5;
  const pricePerLiter = 64;

  useEffect(() => {
    const fetchMilkRecords = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const response = await fetchSellerDeliveries(seller.id, formattedDate); // Use function directly
        console.log('Fetch Seller Deliveries Response:', response);
        if (response.status === 'success') {
          const formattedRecords = response.data.map(record => ({
            date: record.date,
            customerName: record.customer_name,
            address: record.address,
            quantity: `${record.quantity} L`,
            price: (parseFloat(record.quantity) * pricePerLiter).toFixed(2),
          }));
          setMilkRecords(formattedRecords);
          setFilteredRecords(formattedRecords);
        } else {
          Alert.alert('Error', response.message || 'Failed to load delivery records');
        }
      } catch (error) {
        console.error('Fetch Seller Deliveries Error:', error);
        Alert.alert('Error', 'Failed to connect to server');
        setMilkRecords([]);
        setFilteredRecords([]);
      }
    };
    fetchMilkRecords();
  }, [seller.id, selectedDate]);

  // Calculate totals
  const totalMilk = milkRecords.reduce((sum, record) => sum + parseFloat(record.quantity), 0);
  const totalPrice = totalMilk * pricePerLiter;
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
                const response = await axios.put(
                  `${API_CONFIG.updateMilkRecord}/${seller.id}`,
                  { date: record.date, customerId: record.customerId, quantity: parseFloat(newQuantity) },
                  { headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.status === 'success') {
                  const updatedRecords = milkRecords.map(r =>
                    r.date === record.date && r.customerName === record.customerName
                      ? { ...r, quantity: `${newQuantity} L`, price: (parseFloat(newQuantity) * pricePerLiter).toFixed(2) }
                      : r
                  );
                  setMilkRecords(updatedRecords);
                  setFilteredRecords(updatedRecords);
                  Alert.alert('Success', 'Record updated successfully');
                } else {
                  Alert.alert('Error', response.data.message || 'Failed to update record');
                }
              } catch (error) {
                console.error('Update Record Error:', error);
                Alert.alert('Error', 'Failed to connect to server');
              }
            } else {
              Alert.alert('Error', 'Please enter a valid number.');
            }
          },
        },
      ],
      'plain-text',
      record.quantity.replace(' L', '')
    );
  };

  const handleDeleteRecord = (date, customerName) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_CONFIG.deleteMilkRecord}/${seller.id}`, {
                headers: { 'Content-Type': 'application/json' },
                data: { date, customerName },
              });
              if (response.data.status === 'success') {
                const updatedRecords = milkRecords.filter(r => r.date !== date || r.customerName !== customerName);
                setMilkRecords(updatedRecords);
                setFilteredRecords(updatedRecords);
                Alert.alert('Success', 'Record deleted successfully');
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete record');
              }
            } catch (error) {
              console.error('Delete Record Error:', error);
              Alert.alert('Error', 'Failed to connect to server');
            }
          },
        },
      ]
    );
  };

  const downloadExcel = async () => {
    try {
      const isPermitted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (!isPermitted) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Needed',
            message: 'This app needs access to storage to download the Excel file.',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot download file without storage permission.');
          return;
        }
      }

      const data = filteredRecords.map(record => ({
        Date: record.date,
        Customer: record.customerName,
        Address: record.address,
        Quantity: record.quantity,
        Price: `₹${record.price}`,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SellerDeliveries');

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const filePath = `${RNFS.DownloadDirectoryPath}/SellerDeliveries_${seller.username}.xlsx`;

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
        html: `<h1>${seller.username}'s Delivery Records</h1><table>${filteredRecords
          .map(r => `<tr><td>${r.date}</td><td>${r.customerName}</td><td>${r.address}</td><td>${r.quantity}</td><td>₹${r.price}</td></tr>`)
          .join('')}</table>`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to print.');
    }
  };

  const HeaderContent = () => (
    <>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.profileIcon}>
            <Icon name="account" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerText}>{seller.username}</Text>
          <Text style={styles.subHeader}>{seller.phone}</Text>
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

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Icon name="chart-bar" size={24} color="#2A5866" />
          <Text style={styles.statValue}>{totalMilk.toFixed(1)}L</Text>
          <Text style={styles.statLabel}>Daily Milk</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="currency-inr" size={24} color="#2A5866" />
          <Text style={styles.statValue}>₹{totalPrice.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.infoRow}>
          <Icon name="phone" size={18} color="#2A5866" />
          <Text style={styles.infoText}>Contact: {seller.phone}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Icon name="truck" size={18} color="#2A5866" />
          <Text style={styles.infoText}>Vehicle No: {seller.vehicleNo}</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setOpenDatePicker(true)}
        >
          <Icon name="calendar" size={24} color="#2A5866" style={styles.searchIcon} />
          <Text style={styles.datePickerText}>
            {selectedDate.toISOString().split('T')[0]}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={openDatePicker}
          date={selectedDate}
          mode="date"
          onConfirm={(date) => {
            setOpenDatePicker(false);
            setSelectedDate(date);
            setCurrentPage(1);
          }}
          onCancel={() => setOpenDatePicker(false)}
        />
      </View>

      <Text style={styles.sectionTitle}>Daily Delivery History</Text>
    </>
  );

  const renderMilkRecord = ({ item }) => (
    <View style={styles.recordRow}>
      <Text style={[styles.recordCell, { flex: 2 }]}>{item.date}</Text>
      <Text style={[styles.recordCell, { flex: 2 }]}>{item.customerName}</Text>
      <Text style={[styles.recordCell, { flex: 2 }]}>{item.address}</Text>
      <Text style={[styles.recordCell, { flex: 1 }]}>{item.quantity}</Text>
      <Text style={[styles.recordCell, { flex: 1 }]}>₹{item.price}</Text>
      {isAdmin && (
        <View style={[styles.recordCell, { flex: 1, flexDirection: 'row', justifyContent: 'space-around' }]}>
          <TouchableOpacity onPress={() => handleEditRecord(item)}>
            <Icon name="pencil" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteRecord(item.date, item.customerName)}>
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

  return (
    <LinearGradient colors={['#F8F9FB', '#EFF2F6']} style={styles.container}>
      <FlatList
        data={paginatedRecords}
        keyExtractor={(item) => `${item.date}-${item.customerName}`}
        renderItem={renderMilkRecord}
        ListHeaderComponent={<HeaderContent />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="database-remove" size={48} color="#CFD8DC" />
            <Text style={styles.emptyText}>No records found for selected date</Text>
          </View>
        }
        ListFooterComponent={filteredRecords.length > itemsPerPage ? renderPagination : null}
        contentContainerStyle={styles.scrollContent}
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
  divider: {
    height: 1,
    backgroundColor: '#ECEFF1',
    marginVertical: 16,
  },
  filterContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  datePickerButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 2,
  },
  datePickerText: {
    fontSize: 16,
    color: '#2A5866',
    marginLeft: 12,
  },
  searchIcon: {
    marginRight: 8,
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
});

export default SellerDetailScreen;
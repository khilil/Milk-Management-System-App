import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import { getMilkDeliveryReport } from '../../../database-connect/admin/getDistributeMilkData/getDistributeMilkData';

const MonthlyReports = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // Options: 'date', 'quantity', 'customer'
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  // Fetch deliveries from API
  const fetchDeliveries = async (date) => {
    setLoading(true);
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const result = await getMilkDeliveryReport(formattedDate);
      if (result.status === 'success') {
        setDeliveries(result.data);
        setFilteredDeliveries(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's deliveries on component mount
  useEffect(() => {
    fetchDeliveries(selectedDate);
  }, []);

  // Handle date change
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      fetchDeliveries(date);
      setSearchQuery('');
      setSortBy('date');
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = deliveries.filter(
      (item) =>
        item.customer_name.toLowerCase().includes(query.toLowerCase()) ||
        item.seller_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDeliveries(filtered);
  };

  // Handle sorting
  const handleSort = (type) => {
    setSortBy(type);
    const sorted = [...filteredDeliveries].sort((a, b) => {
      if (type === 'quantity') {
        return b.quantity - a.quantity;
      } else if (type === 'customer') {
        return a.customer_name.localeCompare(b.customer_name);
      } else {
        return new Date(b.date_time) - new Date(a.date_time);
      }
    });
    setFilteredDeliveries(sorted);
  };

  // Handle row click to open modal
  const handleRowClick = (delivery) => {
    setSelectedDelivery(delivery);
    setModalVisible(true);
  };

  // Calculate dashboard metrics
  const totalLiters = filteredDeliveries.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = filteredDeliveries.reduce(
    (sum, item) => sum + (item.quantity * item.customer_price),
    0
  );
  const deliveryCount = filteredDeliveries.length;

  // Render table header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Time</Text>
      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Customer</Text>
      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Seller</Text>
      <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty (L)</Text>
      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Address</Text>
    </View>
  );

  // Render each table row
  const renderTableRow = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleRowClick(item)}
      style={[
        styles.tableRow,
        { backgroundColor: index % 2 === 0 ? '#FFF' : '#F8FAFC' },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.tableCell, { flex: 1.5 }]}>
        {moment(item.date_time).format('hh:mm A')}
      </Text>
      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
        {item.customer_name}
      </Text>
      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
        {item.seller_name}
      </Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantity.toFixed(2)}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
        {item.customer_address}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Milk Delivery Dashboard</Text>

      {/* Dashboard Summary */}
      <View style={styles.summaryContainer}>
        <Animatable.View animation="fadeIn" duration={500} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Deliveries</Text>
          <Text style={styles.summaryValue}>{deliveryCount}</Text>
        </Animatable.View>
        <Animatable.View animation="fadeIn" duration={500} delay={100} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Liters</Text>
          <Text style={styles.summaryValue}>{totalLiters.toFixed(2)} L</Text>
        </Animatable.View>
        <Animatable.View animation="fadeIn" duration={500} delay={200} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Amount</Text>
          <Text style={styles.summaryValue}>₹{totalCost.toFixed(2)}</Text>
        </Animatable.View>
      </View>

      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="calendar-today" size={20} color="#FFF" style={styles.icon} />
        <Text style={styles.dateButtonText}>
          {moment(selectedDate).format('DD-MM-YYYY')}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#2A5866" style={styles.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Customer or Seller"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => handleSort('date')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
            Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'quantity' && styles.sortButtonActive]}
          onPress={() => handleSort('quantity')}
        >
          <Text
            style={[styles.sortButtonText, sortBy === 'quantity' && styles.sortButtonTextActive]}
          >
            Quantity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'customer' && styles.sortButtonActive]}
          onPress={() => handleSort('customer')}
        >
          <Text
            style={[styles.sortButtonText, sortBy === 'customer' && styles.sortButtonTextActive]}
          >
            Customer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      {loading ? (
        <ActivityIndicator size="large" color="#2A5866" style={styles.loader} />
      ) : filteredDeliveries.length === 0 ? (
        <Text style={styles.noDataText}>No deliveries found for this date</Text>
      ) : (
        <ScrollView style={styles.tableContainer} nestedScrollEnabled={true}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
            <View>
              {renderTableHeader()}
              <FlatList
                data={filteredDeliveries}
                renderItem={renderTableRow}
                keyExtractor={(item) => item.delivery_id.toString()}
                scrollEnabled={false} // prevent FlatList internal scroll
                contentContainerStyle={styles.list}
              />
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {/* Modal for Full Details */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delivery Details</Text>
          {selectedDelivery && (
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalRow}>
                <Icon name="fingerprint" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>ID: {selectedDelivery.delivery_id}</Text>
              </View>
              <View style={styles.modalRow}>
                <Icon name="event" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>
                  Date & Time: {moment(selectedDelivery.date_time).format('DD-MM-YYYY hh:mm A')}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Icon name="water-drop" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>
                  Quantity: {selectedDelivery.quantity.toFixed(2)} Liters
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Icon name="attach-money" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>
                  Total Cost: ₹{(selectedDelivery.quantity * selectedDelivery.customer_price).toFixed(2)}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Icon name="person" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>
                  Seller: {selectedDelivery.seller_name} ({selectedDelivery.vehicle_no})
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Icon name="account-circle" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>
                  Customer: {selectedDelivery.customer_name} ({selectedDelivery.customer_contact})
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Icon name="location-on" size={20} color="#2A5866" style={styles.modalIcon} />
                <Text style={styles.modalText}>Address: {selectedDelivery.customer_address}</Text>
              </View>
            </ScrollView>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2A5866',
    marginVertical: 16,
    letterSpacing: 0.5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A5866',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sortButtonActive: {
    backgroundColor: '#2A5866',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#2A5866',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },
  tableContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A3C4A',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'left',
    paddingHorizontal: 4,
    minWidth: 100, // Added to ensure columns are wide enough
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'left', // Changed to left for better alignment
    paddingHorizontal: 4,
    minWidth: 100, // Added to ensure columns are wide enough
  },
  loader: {
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  icon: {
    marginRight: 8,
  },
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A5866',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  modalIcon: {
    marginRight: 8,
  },
  closeButton: {
    backgroundColor: '#2A5866',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MonthlyReports;
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
import { getMilkDeliveryReport } from '../../../database-connect/admin/getDistributeMilkData/getDistributeMilkData';

const SellerDashboardss= ({ route }) => {
  const { seller, selectedDate: initialDate } = route.params;
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [sellerTotals, setSellerTotals] = useState({
    assigned_milk: 0,
    distributed_milk: 0,
    remaining_milk: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // Options: 'date', 'quantity', 'customer'

  // Fetch deliveries for the seller
  const fetchDeliveries = async (date) => {
    setLoading(true);
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const result = await getMilkDeliveryReport(formattedDate, seller.seller_id);
      if (result.status === 'success') {
        setDeliveries(result.data);
        setFilteredDeliveries(result.data);
        setSellerTotals(result.seller_totals);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

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
    const filtered = deliveries.filter((item) =>
      item.customer_name.toLowerCase().includes(query.toLowerCase())
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

  // Render table header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Customer</Text>
      <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty (L)</Text>
      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Time</Text>
      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
    </View>
  );

  // Render each table row
  const renderTableRow = ({ item, index }) => (
    <View
      style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFF' : '#F8FAFC' }]}
    >
      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
        {item.customer_name}
      </Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantity.toFixed(2)}</Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>
        {moment(item.date_time).format('hh:mm A')}
      </Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>
        {moment(item.date_time).format('DD-MM-YYYY')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>
        {seller.seller_name} (ID: {seller.seller_id})
      </Text>

      {/* Summary Boxes */}
      <View style={styles.summaryContainer}>
        <Animatable.View animation="fadeIn" duration={500} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Assigned Milk</Text>
          <Text style={styles.summaryValue}>{sellerTotals.assigned_milk.toFixed(2)} L</Text>
        </Animatable.View>
        <Animatable.View animation="fadeIn" duration={500} delay={100} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Distributed Milk</Text>
          <Text style={styles.summaryValue}>{sellerTotals.distributed_milk.toFixed(2)} L</Text>
        </Animatable.View>
        <Animatable.View animation="fadeIn" duration={500} delay={200} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Remaining Milk</Text>
          <Text style={styles.summaryValue}>{sellerTotals.remaining_milk.toFixed(2)} L</Text>
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
          placeholder="Search by Customer"
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
                scrollEnabled={false}
                contentContainerStyle={styles.list}
              />
            </View>
          </ScrollView>
        </ScrollView>
      )}
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
    minWidth: 100,
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
    textAlign: 'left',
    paddingHorizontal: 4,
    minWidth: 100,
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
});

export default SellerDashboardss;
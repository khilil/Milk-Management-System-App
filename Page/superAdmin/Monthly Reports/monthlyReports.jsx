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
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { getMilkDeliveryReport } from '../../../database-connect/admin/getDistributeMilkData/getDistributeMilkData';

const { width } = Dimensions.get('window'); // Get screen width for responsive design

const MonthlyReports = () => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment('2025-07-01').toDate()); // Default to July 1, 2025
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('seller_name'); // Options: 'seller_name', 'seller_id', 'assigned', 'distributed', 'remaining'
  const navigation = useNavigation();

  // Fetch sellers' data
  const fetchSellers = async (date) => {
    setLoading(true);
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const result = await getMilkDeliveryReport(formattedDate);
      if (result.status === 'success') {
        setSellers(result.data);
        setFilteredSellers(result.data);
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
    fetchSellers(selectedDate);
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      fetchSellers(date);
      setSearchQuery('');
      setSortBy('seller_name');
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = sellers.filter((item) =>
      item.seller_name.toLowerCase().includes(query.toLowerCase()) ||
      item.seller_id.toString().includes(query)
    );
    setFilteredSellers(filtered);
  };

  // Handle sorting
  const handleSort = (type) => {
    setSortBy(type);
    const sorted = [...filteredSellers].sort((a, b) => {
      if (type === 'seller_id') {
        return a.seller_id - b.seller_id;
      } else if (type === 'assigned') {
        return b.assigned_milk - a.assigned_milk;
      } else if (type === 'distributed') {
        return b.distributed_milk - a.distributed_milk;
      } else if (type === 'remaining') {
        return b.remaining_milk - a.remaining_milk;
      } else {
        return a.seller_name.localeCompare(b.seller_name);
      }
    });
    setFilteredSellers(sorted);
  };

  // Calculate dashboard metrics
  const totalAssigned = filteredSellers.reduce((sum, item) => sum + item.assigned_milk, 0);
  const totalDistributed = filteredSellers.reduce((sum, item) => sum + item.distributed_milk, 0);
  const totalRemaining = filteredSellers.reduce((sum, item) => sum + item.remaining_milk, 0);

  // Render table header
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, { flex: 1 }]}>Seller ID</Text>
      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Seller Name</Text>
      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Assigned (L)</Text>
      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Distributed (L)</Text>
      <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Remaining (L)</Text>
    </View>
  );

  // Render each table row
  const renderTableRow = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('SellerDashboards', { seller: item, selectedDate })}
      style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFF' : '#F8FAFC' }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.seller_id}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.seller_name}
      </Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.assigned_milk.toFixed(2)}</Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.distributed_milk.toFixed(2)}</Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.remaining_milk.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Milk Delivery Dashboard</Text>

      {/* Dashboard Summary */}
      <View style={styles.summaryContainer}>
        <Animatable.View animation="fadeIn" duration={500} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Assigned</Text>
          <Text style={styles.summaryValue}>{totalAssigned.toFixed(2)} L</Text>
        </Animatable.View>
        <Animatable.View animation="fadeIn" duration={500} delay={100} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Distributed</Text>
          <Text style={styles.summaryValue}>{totalDistributed.toFixed(2)} L</Text>
        </Animatable.View>
        <Animatable.View animation="fadeIn" duration={500} delay={200} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Remaining</Text>
          <Text style={styles.summaryValue}>{totalRemaining.toFixed(2)} L</Text>
        </Animatable.View>
      </View>

      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="calendar-today" size={20} color="#FFF" style={styles.icon} />
        <Text style={styles.dateButtonText}>
          {moment(selectedDate).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')
            ? 'Today'
            : moment(selectedDate).format('DD-MM-YYYY')}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          maximumDate={new Date()} // Prevent selecting future dates
          onChange={handleDateChange}
        />
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#2A5866" style={styles.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Seller or ID"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>

        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'seller_name' && styles.sortButtonActive]}
          onPress={() => handleSort('seller_name')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'seller_name' && styles.sortButtonTextActive]}>
            Seller
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'assigned' && styles.sortButtonActive]}
          onPress={() => handleSort('assigned')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'assigned' && styles.sortButtonTextActive]}>
            Assigned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'distributed' && styles.sortButtonActive]}
          onPress={() => handleSort('distributed')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'distributed' && styles.sortButtonTextActive]}>
            Distributed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'remaining' && styles.sortButtonActive]}
          onPress={() => handleSort('remaining')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'remaining' && styles.sortButtonTextActive]}>
            Remaining
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      {loading ? (
        <ActivityIndicator size="large" color="#2A5866" style={styles.loader} />
      ) : filteredSellers.length === 0 ? (
        <Text style={styles.noDataText}>No sellers found for this date</Text>
      ) : (
        <ScrollView style={styles.tableContainer} nestedScrollEnabled={true}>
          <View style={styles.tableWrapper}>
            {renderTableHeader()}
            <FlatList
              data={filteredSellers}
              renderItem={renderTableRow}
              keyExtractor={(item) => item.seller_id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
            />
          </View>
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
  tableWrapper: {
    width: width - 32, // Adjust to fit screen width (accounting for 16px padding on each side)
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
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
    textAlign: 'left',
    paddingHorizontal: 4,
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

export default MonthlyReports;
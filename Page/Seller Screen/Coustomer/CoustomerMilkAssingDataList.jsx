import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDistributionDetails } from '../../../database-connect/seller-screen/Coustomer/track-milk-data-coustomer';

const CoustomerMilkAssingDataList = () => {
  const navigation = useNavigation();

  // Initialize date to today's date
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0]; // e.g., '2025-05-03'

  const [date, setDate] = useState(formattedToday);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [sellerId, setSellerId] = useState(null); // State for sellerId

  // Fetch sellerId from AsyncStorage
  useEffect(() => {
    const getSellerId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setSellerId(parseInt(userId)); // Convert to integer
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Seller ID not found. Please log in again.',
          });
          navigation.navigate('Login'); // Redirect to login if no sellerId
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load seller ID.',
        });
      }
    };
    getSellerId();
  }, []);

  // Fetch data when sellerId, date, or showAllDates changes
  useEffect(() => {
    if (!sellerId) return; // Wait until sellerId is available

    const loadData = async () => {
      setLoading(true);
      try {
        const distData = await fetchDistributionDetails(showAllDates ? '' : date, sellerId);
        setDistributions(distData);
        setFilteredDistributions(distData);
      } catch (error) {
        const errorMessage = error.message || 'Failed to load data';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
          onPress: () => loadData(),
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [date, showAllDates, sellerId]);

  // Calculate total distributed quantity whenever distributions or filteredDistributions change
  useEffect(() => {
    const total = filteredDistributions.reduce((sum, item) => sum + parseFloat(item.Quantity || 0), 0);
    setTotalDistributed(total);
  }, [filteredDistributions]);

  // Filter distributions based on search query
  useEffect(() => {
    const filtered = distributions.filter(
      (item) =>
        (item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Customer_id.toString().includes(searchQuery)
    );
    setFilteredDistributions(filtered);
    setPage(1); // Reset page on search
  }, [searchQuery, distributions]);

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const formattedDate = selected.toISOString().split('T')[0];
      setSelectedDate(selected);
      setDate(formattedDate);
      setShowAllDates(false); // Ensure All Dates is disabled when a date is selected
    }
  };

  const toggleShowAllDates = () => {
    setShowAllDates((prev) => !prev);
    if (!showAllDates) {
      setDate(formattedToday); // Reset to today when switching to All Dates
    }
  };

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const renderDistribution = ({ item }) => {
    const id = `${item.Customer_id}-${item.Distribution_date}`;
    const isExpanded = expandedCards[id];
    const dateTime = new Date(item.Distribution_date);
    const formattedDateTime = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    return (
      <TouchableOpacity style={styles.distributionCard} onPress={() => toggleCard(id)}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>
            {item.Name || 'Unknown'} (ID: {item.Customer_id})
          </Text>
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#0288D1" />
        </View>
        <Text style={styles.cardSubText}>{formattedDateTime}</Text>
        <Text style={styles.cardSubText}>Quantity: {parseFloat(item.Quantity).toFixed(2)} L</Text>
        {isExpanded && (
          <View style={styles.cardDetails}>
            <Text style={styles.detailText}>Contact: {item.Contact || 'N/A'}</Text>
            <Text style={styles.detailText}>Address: {item.Address || 'N/A'}</Text>
            <Text style={styles.detailText}>Price: ₹{parseFloat(item.Price || 0).toFixed(2)}/L</Text>
            <Text style={styles.detailText}>
              Total: ₹{(parseFloat(item.Quantity) * parseFloat(item.Price || 0)).toFixed(2)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const paginatedData = filteredDistributions.slice(0, page * itemsPerPage);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="arrow-left" size={24} color="#0288D1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milk Distribution Tracker</Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            fetchDistributionDetails(showAllDates ? '' : date, sellerId)
              .then((data) => {
                setDistributions(data);
                setFilteredDistributions(data);
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Data refreshed successfully',
                });
              })
              .catch((error) => {
                const errorMessage = error.message || 'Failed to refresh data';
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: errorMessage,
                });
              })
              .finally(() => setLoading(false));
          }}
          style={styles.iconButton}
        >
          <Icon name="refresh" size={24} color="#0288D1" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {showAllDates ? `All Distributions (Seller ID ${sellerId || 'N/A'})` : `Distribution for ${date}`}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Distributed:</Text>
          <Text style={styles.summaryValue}>{totalDistributed.toFixed(2)} L</Text>
        </View>
        <View style={styles.controlsContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.datePickerButton, showAllDates && styles.datePickerButtonDisabled]}
              disabled={showAllDates} // Disable date picker when All Dates is active
            >
              <Icon name="calendar" size={20} color={showAllDates ? '#888' : '#0288D1'} />
              <Text style={[styles.datePickerText, showAllDates && styles.datePickerTextDisabled]}>
                {date || 'Select Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleShowAllDates}
              style={[styles.toggleButton, showAllDates && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleButtonText, showAllDates && styles.toggleButtonTextActive]}>
                {showAllDates ? 'Single Date' : 'All Dates'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {showDatePicker && !showAllDates && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      {loading || !sellerId ? (
        <ActivityIndicator size="large" color="#0288D1" style={styles.loader} />
      ) : paginatedData.length > 0 ? (
        <>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) => `${item.Customer_id}-${item.Distribution_date}-${index}`}
            renderItem={renderDistribution}
            contentContainerStyle={styles.listContainer}
          />
          {paginatedData.length < filteredDistributions.length && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Icon name="alert-circle-outline" size={40} color="#0288D1" />
          <Text style={styles.noDataText}>
            {showAllDates
              ? `No distributions found for Seller ID ${sellerId}`
              : `No distributions found for ${date}`}
          </Text>
        </View>
      )}
      <Toast />
    </SafeAreaView>
  );
};

// Styles (updated to include disabled styles for date picker)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0288D1',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#555',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  controlsContainer: {
    marginTop: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0288D1',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#E3F2FD',
  },
  datePickerButtonDisabled: {
    backgroundColor: '#ECEFF1',
    borderColor: '#888',
  },
  datePickerText: {
    fontSize: 16,
    color: '#0288D1',
    marginLeft: 8,
  },
  datePickerTextDisabled: {
    color: '#888',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ECEFF1',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#0288D1',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0288D1',
  },
  toggleButtonTextActive: {
    color: '#FFF',
  },
  distributionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  cardSubText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#0288D1',
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
  loadMoreButton: {
    backgroundColor: '#0288D1',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoustomerMilkAssingDataList;
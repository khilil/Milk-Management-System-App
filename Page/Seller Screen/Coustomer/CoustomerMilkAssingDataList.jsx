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
import { fetchDistributionDetails, fetchTotalDistributed } from '../../../database-connect/seller-screen/Coustomer/track-milk-data-coustomer';

const CoustomerMilkAssingDataList = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState('2025-04-27');
  const [selectedDate, setSelectedDate] = useState(new Date('2025-04-27'));
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
  const sellerId = 3;

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [distData, totalData] = await Promise.all([
          fetchDistributionDetails(showAllDates ? '' : date, sellerId),
          showAllDates ? Promise.resolve({ total_quantity: 0 }) : fetchTotalDistributed(date, sellerId),
        ]);
        setDistributions(distData);
        setFilteredDistributions(distData);
        setTotalDistributed(totalData.total_quantity || 0);
      } catch (error) {
        console.error('Fetch Data Error:', error, error.response?.data);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load data',
          onPress: () => loadData(),
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [date, showAllDates]);

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
      setShowAllDates(false);
    }
  };

  const toggleShowAllDates = () => {
    setShowAllDates(!showAllDates);
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
    const formattedDateTime = `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <TouchableOpacity
        style={styles.distributionCard}
        onPress={() => toggleCard(id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>
            {item.Name || 'Unknown'} (ID: {item.Customer_id})
          </Text>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#0288D1"
          />
        </View>
        <Text style={styles.cardSubText}>
          {formattedDateTime}
        </Text>
        <Text style={styles.cardSubText}>
          Quantity: {parseFloat(item.Quantity).toFixed(2)} L
        </Text>
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
                console.error('Refresh Error:', error, error.response?.data);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: error.message || 'Failed to refresh data',
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
          {showAllDates ? `All Distributions (Seller ID ${sellerId})` : `Distribution for ${date}`}
        </Text>
        {!showAllDates && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Distributed:</Text>
            <Text style={styles.summaryValue}>{totalDistributed.toFixed(2)} L</Text>
          </View>
        )}
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
              style={styles.datePickerButton}
            >
              <Icon name="calendar" size={20} color="#0288D1" />
              <Text style={styles.datePickerText}>{date || 'Select Date'}</Text>
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
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      {loading ? (
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
    backgroundColor: '#9FA5CCFF',
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
  datePickerText: {
    fontSize: 16,
    color: '#0288D1',
    marginLeft: 8,
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
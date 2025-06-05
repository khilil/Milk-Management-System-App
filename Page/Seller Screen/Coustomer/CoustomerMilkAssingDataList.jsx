import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDistributionDetails } from '../../../database-connect/seller-screen/Coustomer/track-milk-data-coustomer';

const CoustomerMilkAssingDataList = () => {
  const navigation = useNavigation();

  // Initialize state
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  const [date, setDate] = useState(formattedToday);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [filteredDistributions, setFilteredDistributions] = useState([]);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date-desc');
  const itemsPerPage = 10;
  const [sellerId, setSellerId] = useState(null);

  // Fetch sellerId from AsyncStorage
  useEffect(() => {
    const getSellerId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setSellerId(parseInt(userId));
        } else {
          alert('Seller ID not found. Please log in again.');
          navigation.navigate('Login');
        }
      } catch (error) {
        alert('Failed to load seller ID.');
      }
    };
    getSellerId();
  }, [navigation]);

  // Load cached data for offline support
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await AsyncStorage.getItem(`distributions_${sellerId}_${date}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setDistributions(parsed);
          setFilteredDistributions(parsed);
        }
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    };
    if (sellerId) loadCachedData();
  }, [sellerId, date]);

  // Fetch data
  const loadData = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const distData = await fetchDistributionDetails(showAllDates ? '' : date, sellerId);
      setDistributions(distData);
      setFilteredDistributions(distData);
      // Cache data
      await AsyncStorage.setItem(`distributions_${sellerId}_${date}`, JSON.stringify(distData));
    } catch (error) {
      alert(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [date, showAllDates, sellerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1); // Reset pagination
    try {
      await loadData();
      // alert('Data refreshed successfully');
    } catch (error) {
      alert('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // Calculate total and sort distributions
  useEffect(() => {
    let sorted = [...distributions];
    if (sortBy === 'date-desc') {
      sorted.sort((a, b) => new Date(b.Distribution_date) - new Date(a.Distribution_date));
    } else if (sortBy === 'date-asc') {
      sorted.sort((a, b) => new Date(a.Distribution_date) - new Date(b.Distribution_date));
    } else if (sortBy === 'quantity') {
      sorted.sort((a, b) => parseFloat(b.Quantity) - parseFloat(a.Quantity));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
    }

    const filtered = sorted.filter(
      (item) =>
        (item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Customer_id.toString().includes(searchQuery)
    );
    setFilteredDistributions(filtered);
    const total = filtered.reduce((sum, item) => sum + parseFloat(item.Quantity || 0), 0);
    setTotalDistributed(total);
    setPage(1);
  }, [searchQuery, distributions, sortBy]);

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const formattedDate = selected.toISOString().split('T')[0];
      setSelectedDate(selected);
      setDate(formattedDate);
      setShowAllDates(false);
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
      <TouchableOpacity
        style={styles.distributionCard}
        onPress={() => toggleCard(id)}
        accessible
        accessibilityLabel={`Distribution for ${item.Name || 'Customer'} on ${formattedDateTime}`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>
            {item.Name || 'Unknown'} (ID: {item.Customer_id})
          </Text>
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#F8FAFC" />
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

  const renderSkeletonCard = () => (
    <View style={[styles.distributionCard, styles.skeletonCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.skeletonTextLarge} />
        <View style={styles.skeletonIcon} />
      </View>
      <View style={styles.skeletonTextSmall} />
      <View style={styles.skeletonTextSmall} />
    </View>
  );

  const renderHeader = () => (
    <>
      {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          accessible
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milk Distribution</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.iconButton}
          accessible
          accessibilityLabel="Refresh data"
        >
          <Icon name="refresh" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View> */}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {showAllDates ? `All Distributions` : `Distributions for ${date}`}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Distributed:</Text>
          <Text style={styles.summaryValue}>{totalDistributed.toFixed(2)} L</Text>
        </View>
        <View style={styles.controlsContainer}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Name or ID"
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessible
              accessibilityLabel="Search distributions"
            />
          </View>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentButton, !showAllDates && styles.segmentButtonActive]}
              onPress={() => setShowAllDates(false)}
            >
              <Text
                style={[styles.segmentText, !showAllDates && styles.segmentTextActive]}
                accessible
                accessibilityLabel="Show single date"
              >
                Single Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, showAllDates && styles.segmentButtonActive]}
              onPress={() => setShowAllDates(true)}
            >
              <Text
                style={[styles.segmentText, showAllDates && styles.segmentTextActive]}
                accessible
                accessibilityLabel="Show all dates"
              >
                All Dates
              </Text>
            </TouchableOpacity>
          </View>
          {!showAllDates && (
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
              accessible
              accessibilityLabel="Select date"
            >
              <Icon name="calendar" size={20} color="#F8FAFC" />
              <Text style={styles.datePickerText}>{date}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() =>
                setSortBy((prev) =>
                  prev === 'date-desc' ? 'date-asc' : prev === 'date-asc' ? 'quantity' : prev === 'quantity' ? 'name' : 'date-desc'
                )
              }
              accessible
              accessibilityLabel="Change sort order"
            >
              <Text style={styles.sortText}>
                {sortBy === 'date-desc' ? 'Date (Newest)' : sortBy === 'date-asc' ? 'Date (Oldest)' : sortBy === 'quantity' ? 'Quantity' : 'Name'}
              </Text>
              <Icon name="swap-vertical" size={20} color="#F8FAFC" />
            </TouchableOpacity>
          </View>
        </View>
        {showDatePicker && !showAllDates && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
          />
        )}
      </View>
    </>
  );

  const paginatedData = filteredDistributions.slice(0, page * itemsPerPage);

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={renderSkeletonCard}
          keyExtractor={(item) => `skeleton-${item}`}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2A5866']}
              tintColor="#2A5866"
            />
          }
        />
      ) : paginatedData.length > 0 ? (
        <FlatList
          data={paginatedData}
          keyExtractor={(item, index) => `${item.Customer_id}-${item.Distribution_date}-${index}`}
          renderItem={renderDistribution}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2A5866']}
              tintColor="#2A5866"
            />
          }
          ListFooterComponent={
            paginatedData.length < filteredDistributions.length ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                accessible
                accessibilityLabel="Load more distributions"
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.noDataContainer}>
              <Icon name="alert-circle-outline" size={48} color="#2A5866" />
              <Text style={styles.noDataText}>
                {showAllDates
                  ? `No distributions found for Seller ID ${sellerId}`
                  : `No distributions found for ${date}`}
              </Text>
              {!showAllDates && (
                <TouchableOpacity
                  style={styles.tryAnotherButton}
                  onPress={() => setShowDatePicker(true)}
                  accessible
                  accessibilityLabel="Try another date"
                >
                  <Text style={styles.tryAnotherText}>Try Another Date</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2A5866']}
              tintColor="#2A5866"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2A5866',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    fontFamily: 'Roboto',
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#4A8294',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A5866',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A5866',
  },
  controlsContainer: {
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1A3A4A',
    backgroundColor: 'transparent',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#2A5866',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#F8FAFC',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A5866',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: '#F8FAFC',
    marginLeft: 8,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A8294',
    borderRadius: 12,
    padding: 10,
  },
  sortText: {
    fontSize: 14,
    color: '#F8FAFC',
    marginRight: 8,
    fontWeight: '500',
  },
  distributionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonTextLarge: {
    width: '60%',
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTextSmall: {
    width: '40%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3A4A',
  },
  cardSubText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 6,
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#1A3A4A',
    marginBottom: 6,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 16,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#2A5866',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  tryAnotherButton: {
    backgroundColor: '#2A5866',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  tryAnotherText: {
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  loadMoreButton: {
    backgroundColor: '#2A5866',
    borderRadius: 12,
    padding: 14,
    margin: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '600',
  },
});

export default CoustomerMilkAssingDataList;
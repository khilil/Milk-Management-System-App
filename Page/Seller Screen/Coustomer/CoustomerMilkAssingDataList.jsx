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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { fetchDistributionDetails, fetchTotalDistributed } from '../../../database-connect/seller-screen/Coustomer/track-milk-data-coustomer';

const CoustomerMilkAssingDataList = () => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [distributions, setDistributions] = useState([]);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);

  // Fetch data when date changes or when toggling all dates
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [distData, totalData] = await Promise.all([
          fetchDistributionDetails(showAllDates ? '' : date),
          showAllDates ? Promise.resolve({ total_quantity: 0 }) : fetchTotalDistributed(date),
        ]);
        setDistributions(distData);
        setTotalDistributed(totalData.total_quantity || 0);
      } catch (error) {
        console.error('Fetch Data Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
          onPress: () => loadData(), // Retry
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [date, showAllDates]);

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      const formattedDate = selected.toISOString().split('T')[0];
      setSelectedDate(selected);
      setDate(formattedDate);
      setShowAllDates(false); // Reset to single date when selecting a new date
    }
  };

  const toggleShowAllDates = () => {
    setShowAllDates(!showAllDates);
  };

  const renderDistribution = ({ item }) => (
    <View style={styles.distributionCard}>
      <View style={styles.distributionHeader}>
        <Text style={styles.customerName}>
          {item.Name} (ID: {item.Customer_id})
        </Text>
        <Text style={styles.distributionDate}>
          {new Date(item.Distribution_date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.distributionDetails}>
        <Text style={styles.detailText}>Contact: {item.Contact}</Text>
        <Text style={styles.detailText}>Address: {item.Address}</Text>
        <Text style={styles.detailText}>Price: ₹{parseFloat(item.Price).toFixed(2)}/L</Text>
        <Text style={styles.detailText}>Quantity: {parseFloat(item.Quantity).toFixed(2)} L</Text>
        <Text style={styles.detailText}>
          Total: ₹{(parseFloat(item.Quantity) * parseFloat(item.Price)).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#4FC3F7', '#0288D1']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Milk Distribution Tracker</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              fetchDistributionDetails(showAllDates ? '' : date)
                .then((data) => {
                  setDistributions(data);
                  Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Data refreshed successfully',
                  });
                })
                .catch((error) => {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message,
                  });
                })
                .finally(() => setLoading(false));
            }}
            style={styles.iconButton}
          >
            <Icon name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Summary Section */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {showAllDates ? 'All Distributions (Seller ID 4)' : `Distribution for ${date}`}
          </Text>
          {!showAllDates && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Distributed:</Text>
              <Text style={styles.summaryValue}>{totalDistributed.toFixed(2)} L</Text>
            </View>
          )}
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
              <Text style={styles.toggleButtonText}>
                {showAllDates ? 'Single Date' : 'All Dates'}
              </Text>
            </TouchableOpacity>
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

        {/* Distribution List */}
        {loading ? (
          <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
        ) : distributions.length > 0 ? (
          <FlatList
            data={distributions}
            keyExtractor={(item, index) => `${item.Customer_id}-${item.Distribution_date}-${index}`}
            renderItem={renderDistribution}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="alert-circle-outline" size={40} color="#FFF" />
            <Text style={styles.noDataText}>
              {showAllDates
                ? 'No distributions found for Seller ID 4'
                : `No distributions found for ${date}`}
            </Text>
          </View>
        )}
      </SafeAreaView>
      <Toast />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  distributionHeader: {
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
  distributionDate: {
    fontSize: 14,
    color: '#555',
  },
  distributionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
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
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
});

export default CoustomerMilkAssingDataList;
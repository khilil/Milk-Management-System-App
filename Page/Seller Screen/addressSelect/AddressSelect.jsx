import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAddresses } from '../../../database-connect/seller-screen/address/getSelectAddress';
import Icon from 'react-native-vector-icons/Ionicons'; // Use react-native-vector-icons

const AddressSelectionScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [selectedAddressIds, setSelectedAddressIds] = useState([]);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load userId, addresses, and stored selections
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get userId from AsyncStorage
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          setError('User not logged in');
          setLoading(false);
          return;
        }
        setUserId(parseInt(storedUserId, 10));

        // Fetch addresses from API
        const addressData = await fetchAddresses();
        setAddresses(addressData);
        setFilteredAddresses(addressData);

        // Load previously selected addresses from AsyncStorage
        const storedSelectedIds = await AsyncStorage.getItem(
          `selectedAddressIds_${storedUserId}`
        );
        if (storedSelectedIds) {
          setSelectedAddressIds(JSON.parse(storedSelectedIds));
        }
      } catch (err) {
        setError(err.message || 'Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = addresses.filter((address) =>
      address.Address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAddresses(filtered);
  }, [searchQuery, addresses]);

  // Handle checkbox toggle
  const toggleAddressSelection = async (addressId) => {
    let updatedSelectedIds;
    if (selectedAddressIds.includes(addressId)) {
      updatedSelectedIds = selectedAddressIds.filter((id) => id !== addressId);
    } else {
      updatedSelectedIds = [...selectedAddressIds, addressId];
    }
    setSelectedAddressIds(updatedSelectedIds);

    // Store updated selections in AsyncStorage
    try {
      await AsyncStorage.setItem(
        `selectedAddressIds_${userId}`,
        JSON.stringify(updatedSelectedIds)
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to save selection');
    }
  };

  // Render each address item
  const renderAddressItem = ({ item }) => (
    <View style={styles.addressItem}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => toggleAddressSelection(item.Address_id)}
      >
        <Icon
          name={
            selectedAddressIds.includes(item.Address_id)
              ? 'checkbox'
              : 'square-outline'
          }
          size={24}
          color={selectedAddressIds.includes(item.Address_id) ? '#4CAF50' : '#666'}
        />
      </TouchableOpacity>
      <Text style={styles.addressText}>{item.Address}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Addresses</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search addresses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {/* Address List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : filteredAddresses.length === 0 ? (
        <Text style={styles.noResults}>No addresses found</Text>
      ) : (
        <>
          <FlatList
            data={filteredAddresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item.Address_id.toString()}
            style={styles.addressList}
            ListFooterComponent={<View style={styles.listFooter} />}
          />
          {selectedAddressIds.length > 0 && (
            <View style={styles.selectedSummary}>
              <Text style={styles.selectedSummaryText}>
                Selected: {selectedAddressIds.length} address(es)
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  addressList: {
    flex: 1,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '##000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
  },
  noResults: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  selectedSummary: {
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedSummaryText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  listFooter: {
    height: 80, // Extra space at the bottom
  },
});

export default AddressSelectionScreen;
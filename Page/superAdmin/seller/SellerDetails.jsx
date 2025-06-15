import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_CONFIG } from '../../../database-connect/Apichange';
import deleteSeller from '../../../database-connect/admin/seller/deleteSeller';

const SellerDetails = () => {
  const navigation = useNavigation();
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [visibleSellers, setVisibleSellers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 7;

  useEffect(() => {
    const fetchSellers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(API_CONFIG.fetchSeller, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000, // Increased timeout to 10 seconds
        });
        console.log('Fetch Sellers Response:', response.data);
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          const formattedSellers = response.data.data.map(seller => ({
            id: seller.Seller_id?.toString() || '',
            username: seller.Name || 'Unknown',
            phone: seller.Contact || '',
            vehicleNo: seller.Vehicle_no || '',
          }));
          setSellers(formattedSellers);
          setFilteredSellers(formattedSellers);
          updateVisibleSellers(formattedSellers, 1);
        } else {
          Alert.alert('Error', response.data.message || 'Failed to load sellers');
        }
      } catch (error) {
        console.error('Fetch Sellers Error:', error.message);
        Alert.alert('Error', error.response?.data?.message || 'Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellers();
  }, []);

  useEffect(() => {
    const filtered = sellers.filter(
      (seller) =>
        (seller.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (seller.phone || '').includes(searchQuery)
    );
    setFilteredSellers(filtered);
    setCurrentPage(1);
    updateVisibleSellers(filtered, 1);
  }, [searchQuery, sellers]);

  const updateVisibleSellers = (filtered, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setVisibleSellers(filtered.slice(startIndex, endIndex));
  };

  const handleDelete = (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid seller ID');
      return;
    }
    Alert.alert(
      'Deactivate Seller',
      'Are you sure you want to deactivate this seller?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteSeller(id);
              if (response.status === 'success') {
                const updatedSellers = sellers.filter((seller) => seller.id !== id);
                setSellers(updatedSellers);
                setFilteredSellers(updatedSellers);
                updateVisibleSellers(updatedSellers, currentPage);
                Alert.alert('Success', 'Seller deactivated successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to deactivate seller');
              }
            } catch (error) {
              console.error('Deactivate Seller Error:', error.message);
              Alert.alert('Error', error.message || 'Failed to deactivate seller');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleEdit = (seller) => {
    if (!seller?.id) {
      Alert.alert('Error', 'Invalid seller data');
      return;
    }
    console.log('Navigating to EditSeller with seller:', seller);
    navigation.navigate('EditSeller', { seller });
  };

  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateVisibleSellers(filteredSellers, newPage);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { width: 120 }]}>Name</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>Phone</Text>
      <Text style={[styles.headerCell, { width: 110 }]}>Vehicle No</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>Actions</Text>
    </View>
  );

  const renderSellerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => {
        console.log('Navigating to SellerDetailScreen with seller:', item);
        try {
          navigation.navigate('SellerDetailScreen', { seller: item, isAdmin: true });
        } catch (error) {
          console.error('Navigation Error:', error);
          Alert.alert('Navigation Error', 'Failed to navigate to Seller Detail Screen');
        }
      }}
    >
      <Text style={[styles.cell, { width: 120 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.username}
      </Text>
      <Text style={[styles.cell, { width: 100 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.phone}
      </Text>
      <Text style={[styles.cell, { width: 110 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.vehicleNo}
      </Text>
      <View style={[styles.cell, styles.actionCell, { width: 100 }]}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          <Icon name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-double-left" size={24} color={currentPage === 1 ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Icon name="chevron-left" size={24} color={currentPage === 1 ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <View style={styles.pageNumbers}>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
          .map((page) => (
            <TouchableOpacity
              key={page}
              style={[styles.pageButton, currentPage === page && styles.activePageButton]}
              onPress={() => handlePageChange(page)}
            >
              <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>{page}</Text>
            </TouchableOpacity>
          ))}
      </View>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-right" size={24} color={currentPage === totalPages ? '#ccc' : '#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <Icon name="chevron-double-right" size={24} color={currentPage === totalPages ? '#ccc' : '#fff'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#f4f7fa', '#e5e7eb']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Seller Details</Text>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.tableContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
          <View>
            {renderHeader()}
            {isLoading ? (
              <ActivityIndicator size="large" color="#2A5866" style={styles.loader} />
            ) : (
              <FlatList
                data={visibleSellers}
                keyExtractor={(item) => item.id}
                renderItem={renderSellerItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No sellers found</Text>}
              />
            )}
          </View>
        </ScrollView>
        {filteredSellers.length > 0 && renderPagination()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A5866',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2A5866',
    fontWeight: '500',
  },
  searchIcon: {
    marginRight: 10,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minWidth: 430,
  },
  headerCell: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    minWidth: 430,
  },
  cell: {
    fontSize: 14,
    color: '#2A5866',
    textAlign: 'center',
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    backgroundColor: '#ffe6e6',
    padding: 6,
    borderRadius: 6,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  navButton: {
    backgroundColor: '#2A5866',
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pageButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2A5866',
  },
  activePageButton: {
    backgroundColor: '#2A5866',
  },
  pageText: {
    fontSize: 14,
    color: '#2A5866',
    fontWeight: '600',
  },
  activePageText: {
    color: '#fff',
  },
  loader: {
    marginVertical: 20,
  },
});

export default SellerDetails;
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import fetchCustomers from '../../../database-connect/admin/customer/Featch';
import { API_CONFIG } from '../../../database-connect/Apichange'; // Assuming similar config as SellerDetails

const CustomerListScreen = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [visibleCustomers, setVisibleCustomers] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Added missing state
  const itemsPerPage = 5;

  // Define gradient colors
  const gradientColors = ['#E6F0FA', '#FFFFFF'];

  useEffect(() => {
    setIsLoading(true);
    fetchCustomers(setCustomers, setTotalMoney, setFilteredCustomers, updateVisibleCustomers)
      .catch((error) => {
        console.error('Fetch Customers Error:', error);
        Alert.alert('Error', 'Failed to fetch customers. Please try again.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const filtered = customers.filter(
      customer =>
        (customer.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (customer.phone || '').includes(searchQuery)
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
    updateVisibleCustomers(filtered, 1);
  }, [searchQuery, customers]);

  const updateVisibleCustomers = (filtered, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setVisibleCustomers(filtered.slice(startIndex, endIndex));
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_CONFIG.deleteCustomer}`, {
                headers: { 'Content-Type': 'application/json' },
                data: { Customer_id: id },
              });
              if (response.data.status === 'success') {
                const updatedCustomers = customers.filter(customer => customer.id !== id);
                setCustomers(updatedCustomers);
                setFilteredCustomers(updatedCustomers);
                updateVisibleCustomers(updatedCustomers, currentPage);
                Alert.alert('Success', 'Customer deleted successfully');
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete customer');
              }
            } catch (error) {
              console.error('Delete Customer Error:', error);
              Alert.alert('Error', 'Failed to connect to server');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleEdit = (customer) => {
    navigation.navigate('EditCustomer', { customer });
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage); // Fixed bug: was setCurrentPage(1)
      updateVisibleCustomers(filteredCustomers, newPage);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { width: 100 }]}>Name</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>Phone</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>Address</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>Price (₹/L)</Text>
      <Text style={[styles.headerCell, { width: 100 }]}>Actions</Text>
    </View>
  );

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => navigation.navigate('CustomerDetail', { customer: item, isAdmin: true })}
    >
      <Text style={[styles.cell, { width: 100 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.username || 'N/A'}
      </Text>
      <Text style={[styles.cell, { width: 100 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.phone || 'N/A'}
      </Text>
      <Text style={[styles.cell, { width: 100 }]} numberOfLines={1} ellipsizeMode="tail">
        {item.address || 'N/A'}
      </Text>
      <Text style={[styles.cell, { width: 100 }]}>
        ₹{(item.price || 0).toFixed(2)}
      </Text>
      <View style={[styles.cell, styles.actionCell, { width: 100 }]}>
        <TouchableOpacity onPress={(e) => {
          e.stopPropagation();
          handleEdit(item);
        }}>
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
          .filter(
            page =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map(page => (
            <TouchableOpacity
              key={page}
              style={[styles.pageButton, currentPage === page && styles.activePageButton]}
              onPress={() => handlePageChange(page)}
            >
              <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>
                {page}
              </Text>
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
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Customer List</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>N/A</Text>
            <Text style={styles.statLabel}>Total Milk</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{totalMoney.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Price/Liter</Text>
          </View>
        </View>
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
          <View style={styles.tableContent}>
            {renderHeader()}
            {isLoading ? (
              <ActivityIndicator size="large" color="#2A5866" style={styles.loader} />
            ) : (
              <FlatList
                data={visibleCustomers}
                keyExtractor={item => item.id}
                renderItem={renderCustomerItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No customers found</Text>}
                scrollEnabled={false} // Disable vertical scrolling in FlatList
              />
            )}
          </View>
        </ScrollView>
        {filteredCustomers.length > 0 && renderPagination()}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A5866',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    marginRight: 10,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableContent: {
    minWidth: 600, // Slightly reduced for better fit on smaller screens
    flexDirection: 'column',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    minWidth: 600, // Match tableContent width
  },
  cell: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
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

export default CustomerListScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import fetchCustomers from '../../../database-connect/admin/customer/Featch'; // Updated import path

const CustomerListScreen = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [visibleCustomers, setVisibleCustomers] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCustomers(setCustomers, setTotalMoney, setFilteredCustomers, updateVisibleCustomers);
  }, [fetchCustomers]);

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
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

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
         
              const updatedCustomers = customers.filter((customer) => customer.id !== id);
              setCustomers(updatedCustomers);
              setFilteredCustomers(updatedCustomers);
              updateVisibleCustomers(updatedCustomers, 1);
              Alert.alert('Success', 'Customer deleted successfully');
            } catch (error) {
              console.error('Error deleting customer:', error);
              Alert.alert('Error', 'Failed to delete customer');
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
      setCurrentPage(newPage);
      updateVisibleCustomers(filteredCustomers, newPage);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Phone</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Milk</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Money</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
    </View>
  );

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => navigation.navigate('CustomerDetail', { customer: item, isAdmin: true })}
    >
      <Text style={[styles.cell, { flex: 2 }]}>{item.username}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.phone}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.milkQuantity}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>₹{item.money.toFixed(2)}</Text>
      <View style={[styles.cell, styles.actionCell, { flex: 1 }]}>
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
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page) => (
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
    <LinearGradient colors={['#E6F0FA', '#FFFFFF']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Customer Dashboard</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>N/A</Text>
            <Text style={styles.statLabel}>Total Milk</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{totalMoney.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
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
        {renderHeader()}
        <FlatList
          data={visibleCustomers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCustomerItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No customers found</Text>}
        />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A5866',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    marginRight: 10,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deleteButton: {
    marginLeft: 10,
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
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
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
});

export default CustomerListScreen;
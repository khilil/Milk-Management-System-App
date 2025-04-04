import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentScreen = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [visibleCustomers, setVisibleCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const itemsPerPage = 5;

  // Sample payment data
  const samplePayments = [
    {
      id: '1',
      saller: 'Patel',
      name: 'John Doe',
      phone: '1234567890',
      amount: '1500',
      status: 'Paid',
      date: '2023-10-15',
    },
    {
      id: '2',
      saller: 'Patel',
      name: 'Jane Smith',
      phone: '9876543210',
      amount: '2000',
      status: 'Pending',
      date: '2023-10-16',
    },
    {
      id: '3',
      saller: 'Patel',
      name: 'Robert Johnson',
      phone: '5551234567',
      amount: '1800',
      status: 'Paid',
      date: '2023-10-17',
    },
    {
      id: '4',
      saller: 'Patel',
      name: 'Emily Davis',
      phone: '4445556666',
      amount: '2200',
      status: 'Pending',
      date: '2023-10-18',
    },
    {
      id: '5',
      saller: 'Patel',
      name: 'Michael Wilson',
      phone: '7778889999',
      amount: '1900',
      status: 'Paid',
      date: '2023-10-19',
    },
    {
      id: '6',
      saller: 'Patel',
      name: 'Khilil Patel',
      phone: '1112223333',
      amount: '2100',
      status: 'Pending',
      date: '2023-10-20',
    },
    {
      id: '7',
      saller: 'Sharma',
      name: 'David White',
      phone: '2223334444',
      amount: '2300',
      status: 'Paid',
      date: '2023-10-21',
    },
    {
      id: '8',
      saller: 'Sharma',
      name: 'Sophia Brown',
      phone: '3334445555',
      amount: '2500',
      status: 'Pending',
      date: '2023-10-22',
    },
    {
      id: '9',
      saller: 'Sharma',
      name: 'William Taylor',
      phone: '4445556667',
      amount: '2400',
      status: 'Paid',
      date: '2023-10-23',
    },
    {
      id: '10',
      saller: 'Sharma',
      name: 'Emma Thomas',
      phone: '5556667778',
      amount: '2600',
      status: 'Pending',
      date: '2023-10-24',
    },
    {
      id: '11',
      saller: 'Verma',
      name: 'Daniel Martinez',
      phone: '6667778889',
      amount: '1800',
      status: 'Paid',
      date: '2023-10-25',
    },
    {
      id: '12',
      saller: 'Verma',
      name: 'Olivia Harris',
      phone: '7778889990',
      amount: '2700',
      status: 'Pending',
      date: '2023-10-26',
    },
    {
      id: '13',
      saller: 'Verma',
      name: 'James Clark',
      phone: '8889990001',
      amount: '1950',
      status: 'Paid',
      date: '2023-10-27',
    },
    {
      id: '14',
      saller: 'Verma',
      name: 'Isabella Lewis',
      phone: '9990001112',
      amount: '2800',
      status: 'Pending',
      date: '2023-10-28',
    },
    {
      id: '15',
      saller: 'Kapoor',
      name: 'Alexander Walker',
      phone: '0001112223',
      amount: '2900',
      status: 'Paid',
      date: '2023-10-29',
    },
    {
      id: '16',
      saller: 'Kapoor',
      name: 'Mia Young',
      phone: '1112223334',
      amount: '3000',
      status: 'Pending',
      date: '2023-10-30',
    },
    {
      id: '17',
      saller: 'Kapoor',
      name: 'Benjamin Hall',
      phone: '2223334445',
      amount: '3100',
      status: 'Paid',
      date: '2023-10-31',
    },
    {
      id: '18',
      saller: 'Kapoor',
      name: 'Charlotte Allen',
      phone: '3334445556',
      amount: '3200',
      status: 'Pending',
      date: '2023-11-01',
    }
  ];
  
  
console.log(samplePayments[0].saller);


const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
    updateVisibleCustomers(filteredCustomers, newPage);
  }
};

const updateVisibleCustomers = (filtered, page) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  setVisibleCustomers(filtered.slice(startIndex, endIndex));
};

  useEffect(() => {

    const filtered = customers.filter(
      (customer) =>
        customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    loadPayments();
    setFilteredCustomers(samplePayments);
    setCurrentPage(1);
    updateVisibleCustomers(filtered, 1);
  }, []);

  const loadPayments = async () => {
    try {
      const storedPayments = await AsyncStorage.getItem('');
      if (storedPayments) {
        const data = JSON.parse(storedPayments);
        setPayments(data);
        setFilteredPayments(data);
      } else {
        // Initialize with sample data if no payments exist
        await AsyncStorage.setItem('payments', JSON.stringify(samplePayments));
        setPayments(samplePayments);
        setFilteredPayments(samplePayments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  // Filter Payments based on Date Selection
  const filterByDate = date => {
    setSelectedDate(date);
    if (date) {
      const filtered = payments.filter(item => item.date === date);
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  };

  // Search Payments
  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = payments.filter(
      item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.phone.includes(query),
    );
    setFilteredPayments(filtered);
  };

    // render Pagination
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
            .filter(page => 
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

  
  const renderPaymentItem = ({item}) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{item.saller}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.phone}</Text>
      <Text style={[styles.cell, item.status === 'Paid' ? styles.paid : 
                  item.status === 'Pending' ? styles.pending : styles.failed]}>
        {item.status}
      </Text>
      <TouchableOpacity 
        style={styles.viewButton} 
        onPress={() => alert(`Payment Details:\nName: ${item.name}\nAmount: $${item.amount}\nStatus: ${item.status}`)}>
        <Text style={styles.viewText}>View</Text>
      </TouchableOpacity>
    </View>
  );

    // Render table header
  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>saller</Text>
      <Text style={styles.headerText}>Name</Text>
      <Text style={styles.headerText}>Phone</Text>
      <Text style={styles.headerText}>Status</Text>
      <Text style={styles.headerText}>Action</Text>
    </View>
  );



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payments</Text>

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>Select Date: {selectedDate.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) filterByDate(date);
          }}
        />
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name or Phone"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Payment List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={styles.tableContainer}>
        {renderHeader()}
        <FlatList
          data={visibleCustomers}
          keyExtractor={item => item.id}
          renderItem={renderPaymentItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No payments found</Text>
          }
        />
      </View>
      </ScrollView>
        {filteredCustomers.length > 0 && renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
 tableHeader: {
    flexDirection: 'row',
    gap: 25,
    backgroundColor: '#2A5866',
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  paid: {
    color: 'green',
    fontWeight: 'bold',
  },
  pending: {
    color: 'orange',
    fontWeight: 'bold',
  },
  failed: {
    color: 'red',
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#2A5866',
    padding: 5,
    borderRadius: 5,
    minWidth: 60,
  },
  viewText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    flex: 1,
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },

  datePickerButton: {
    backgroundColor: '#2A5866',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  datePickerText: {
    color: '#fff',
    fontWeight: 'bold',
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
  disabledButton: {
    backgroundColor: '#ccc',
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
  activePageText: {
    color: '#fff',
  },
  pageText: {
    fontSize: 14,
    color: '#2A5866',
    fontWeight: '600',
  },
});

export default PaymentScreen;
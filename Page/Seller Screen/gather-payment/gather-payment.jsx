import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    FlatList,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import { Picker } from '@react-native-picker/picker';
import {
    fetchCustomersByArea,
    fetchPaymentHistory,
    recordPayment,
    fetchAreas,
} from '../../../database-connect/seller-screen/gatherPaymentSeller/gatherPaymentSeller';

const GatherPayment = () => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [amountCollected, setAmountCollected] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentStatus, setPaymentStatus] = useState('Paid');
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sellerId, setSellerId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAddressIds, setSelectedAddressIds] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const searchInputRef = useRef(null);
    const isSelectingCustomer = useRef(false);

    // Load initial data (areas and customers)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const userRole = await AsyncStorage.getItem('userRole');
                console.log('User ID:', userId, 'User Role:', userRole);
                if (userId && userRole === 'seller') {
                    setSellerId(parseInt(userId));
                    // Load assigned address IDs from AsyncStorage
                    const storedAddressIds = await AsyncStorage.getItem(`selectedAddressIds_${userId}`);
                    if (storedAddressIds) {
                        const addressIds = JSON.parse(storedAddressIds);
                        setSelectedAddressIds(addressIds);
                        setSelectedAddressId(addressIds[0]); // Default to first address
                        // Fetch area details
                        const fetchedAreas = await fetchAreas();
                        const filteredAreas = fetchedAreas.filter(area => addressIds.includes(area.Address_id));
                        setAddresses(filteredAreas.map(area => ({
                            Address_id: area.Address_id,
                            Name: area.Area_name || `Area ${area.Address_id}`,
                        })));
                        // Fetch customers for the default area
                        if (addressIds[0]) {
                            const customers = await fetchCustomersByArea([addressIds[0]]);
                            console.log('Fetched Customers:', customers);
                            setCustomers(customers);
                            setFilteredCustomers(customers);
                        }
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'No areas selected. Please select areas first.',
                        });
                        navigation.navigate('AddressSelect');
                    }
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Please log in as a seller.',
                    });
                    navigation.replace('Login');
                }
            } catch (error) {
                console.error('Load Initial Data Error:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load data',
                });
            }
        };
        loadInitialData();
    }, [navigation]);

    // Handle area selection
    const handleAddressSelect = useCallback(async (addressId) => {
        setSelectedAddressId(addressId);
        setLoading(true);
        setSearchText('');
        setCustomers([]);
        setFilteredCustomers([]);
        try {
            const fetchedCustomers = await fetchCustomersByArea([parseInt(addressId)]);
            console.log('Fetched Customers for Address ID:', addressId, fetchedCustomers);
            setCustomers(fetchedCustomers);
            setFilteredCustomers(fetchedCustomers);
            searchInputRef.current?.clear();
        } catch (error) {
            console.error('Fetch Customers by Area Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to fetch customers for selected area',
            });
            setCustomers([]);
            setFilteredCustomers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle pull-to-refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            setCustomers([]);
            setFilteredCustomers([]);
            const userId = await AsyncStorage.getItem('userId');
            const userRole = await AsyncStorage.getItem('userRole');
            if (userId && userRole === 'seller') {
                const storedAddressIds = await AsyncStorage.getItem(`selectedAddressIds_${userId}`);
                if (storedAddressIds) {
                    const addressIds = JSON.parse(storedAddressIds);
                    setSelectedAddressIds(addressIds);
                    setSelectedAddressId(addressIds[0]);
                    const fetchedAreas = await fetchAreas();
                    const filteredAreas = fetchedAreas.filter(area => addressIds.includes(area.Address_id));
                    setAddresses(filteredAreas.map(area => ({
                        Address_id: area.Address_id,
                        Name: area.Area_name || `Area ${area.Address_id}`,
                    })));
                    if (addressIds[0]) {
                        const fetchedCustomers = await fetchCustomersByArea([addressIds[0]]);
                        console.log('Refreshed Customers:', fetchedCustomers);
                        setCustomers(fetchedCustomers);
                        setFilteredCustomers(fetchedCustomers);
                    }
                }
                Toast.show({
                    type: 'success',
                    text1: 'Refreshed',
                    text2: 'Data refreshed successfully',
                });
            }
        } catch (error) {
            console.error('Refresh Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to refresh data',
            });
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((text) => {
            const filtered = customers.filter(
                (customer) =>
                    customer.Name?.toLowerCase().includes(text.toLowerCase()) ||
                    customer.Customer_id?.toString().includes(text)
            );
            console.log('Filtered Customers (Search):', filtered);
            setFilteredCustomers(filtered);
        }, 300),
        [customers]
    );

    const handleSearch = (text) => {
        setSearchText(text);
        debouncedSearch(text);
    };

    // Clear search
    const clearSearch = () => {
        setSearchText('');
        setFilteredCustomers(customers);
        searchInputRef.current?.clear();
    };

    // Handle customer selection
    const handleSelectCustomer = useCallback(
        async (customer) => {
            if (isSelectingCustomer.current) {
                console.log('Already selecting customer, ignoring click');
                return;
            }
            isSelectingCustomer.current = true;
            console.log('Selected Customer:', customer);

            try {
                setSelectedCustomer(customer);
                setAmountCollected('');
                setPaymentMethod('Cash');
                setPaymentStatus('Paid');
                setPaymentDate(new Date());
                setShowDatePicker(false);
                setPaymentHistory([]);
                setLoading(true);

                try {
                    const history = await fetchPaymentHistory(customer.Customer_id);
                    console.log('Payment History:', JSON.stringify(history, null, 2));
                    setPaymentHistory(Array.isArray(history) ? history : []);
                } catch (error) {
                    console.error('Fetch Payment History Error:', error.message);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to fetch payment history, but you can still record a payment',
                    });
                    setPaymentHistory([]);
                }

                setModalVisible(true);
            } catch (error) {
                console.error('Handle Select Customer Error:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to open payment form',
                });
            } finally {
                setLoading(false);
                isSelectingCustomer.current = false;
            }
        },
        []
    );

    // Handle date and time change
    const onDateChange = (event, selected) => {
        setShowDatePicker(false);
        if (selected) {
            setPaymentDate(selected);
        }
    };

    // Record payment
    const handleRecordPayment = async () => {
        if (!selectedCustomer || !amountCollected || !paymentMethod || !paymentStatus) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill all fields',
            });
            return;
        }

        const amount = parseFloat(amountCollected);
        if (isNaN(amount) || amount <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Amount must be a positive number',
            });
            return;
        }

        const validStatuses = ['Paid', 'Pending'];
        if (!validStatuses.includes(paymentStatus)) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Payment status must be Paid or Pending',
            });
            return;
        }

        setLoading(true);
        try {
            const paymentData = {
                customer_id: selectedCustomer.Customer_id,
                amount_collected: amount,
                payment_status: paymentStatus,
                payment_date: paymentDate.toISOString().slice(0, 19).replace('T', ' '),
                method: paymentMethod,
            };
            console.log('Recording Payment:', paymentData);
            await recordPayment(paymentData);
            const history = await fetchPaymentHistory(selectedCustomer.Customer_id);
            console.log('Updated Payment History:', JSON.stringify(history, null, 2));
            setPaymentHistory(Array.isArray(history) ? history : []);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Payment recorded successfully',
            });
            setModalVisible(false);
            setAmountCollected('');
            setPaymentMethod('Cash');
            setPaymentStatus('Paid');
            setPaymentDate(new Date());
        } catch (error) {
            console.error('Record Payment Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to record payment',
            });
        } finally {
            setLoading(false);
        }
    };

    // Render customer item
    const renderCustomer = ({ item }) => (
        <TouchableOpacity
            style={styles.customerCard}
            onPress={() => handleSelectCustomer(item)}
            activeOpacity={0.8}
            disabled={loading}
        >
            <View style={styles.customerIcon}>
                <AntDesign name="user" size={20} color="#2C5282" />
            </View>
            <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{item.Name || 'Unknown'}</Text>
                <Text style={styles.customerDetails}>
                    ID: {item.Customer_id || 'N/A'} | Area: {item.Address || 'N/A'}
                </Text>
                <Text style={styles.customerContact}>Contact: {item.Contact || 'N/A'}</Text>
            </View>
            <AntDesign name="right" size={16} color="#2C5282" />
        </TouchableOpacity>
    );

    // Render payment history item
    const renderPayment = ({ item }) => {
        const amount = parseFloat(item.Amount_collected);
        const formattedAmount = !isNaN(amount) ? amount.toFixed(2) : '0.00';
        const formattedDateTime = item.Payment_date || 'N/A';
        return (
            <View style={styles.paymentCard}>
                <Text style={styles.paymentText}>
                    {formattedDateTime} - {formattedAmount} ₹ ({item.Method || 'N/A'})
                </Text>
                <Text style={[styles.paymentStatus, { color: item.Payment_status === 'Paid' ? '#34C759' : '#D69E2E' }]}>
                    {item.Payment_status || 'N/A'}
                </Text>
            </View>
        );
    };

    // Render address item
    const renderAddress = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.addressButton,
                selectedAddressId === item.Address_id && styles.addressButtonSelected,
            ]}
            onPress={() => handleAddressSelect(item.Address_id)}
            disabled={loading}
        >
            <Text
                style={[
                    styles.addressText,
                    selectedAddressId === item.Address_id && styles.addressTextSelected,
                ]}
            >
                {item.Name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#2A5866']}
                        tintColor="#2A5866"
                    />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Payment Management</Text>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('AddressSelect')}
                    >
                        <AntDesign name="enviromento" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Select Area</Text>
                    <FlatList
                        horizontal
                        data={addresses}
                        keyExtractor={(item) => item.Address_id.toString()}
                        renderItem={renderAddress}
                        showsHorizontalScrollIndicator={false}
                        style={styles.addressList}
                        ListEmptyComponent={<Text style={styles.noResults}>No areas available</Text>}
                    />
                </View>

                <View style={styles.searchContainer}>
                    <AntDesign name="search1" size={20} color="#2C5282" style={styles.searchIcon} />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="Search by Name or ID"
                        value={searchText}
                        onChangeText={handleSearch}
                        editable={!loading}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
                            <AntDesign name="close" size={18} color="#2C5282" />
                        </TouchableOpacity>
                    )}
                </View>

                <FlashList
                    data={filteredCustomers}
                    renderItem={renderCustomer}
                    keyExtractor={(item) => `customer-${item.Customer_id}`}
                    estimatedItemSize={80}
                    ListEmptyComponent={<Text style={styles.noResults}>No customers found</Text>}
                    ListFooterComponent={
                        loading ? (
                            <ActivityIndicator size="small" color="#2C5282" style={styles.footerLoader} />
                        ) : null
                    }
                />
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setAmountCollected('');
                    setPaymentMethod('Cash');
                    setPaymentStatus('Paid');
                    setPaymentDate(new Date());
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Record Payment for {selectedCustomer?.Name || 'Unknown'} (ID: {selectedCustomer?.Customer_id || 'N/A'})
                        </Text>

                        <View style={styles.modalInput}>
                            <AntDesign name="calendar" size={20} color="#2C5282" style={styles.inputIcon} />
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={loading}>
                                <Text style={styles.inputText}>
                                    {paymentDate.toISOString().slice(0, 19).replace('T', ' ')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {showDatePicker && (
                            <DateTimePicker
                                value={paymentDate}
                                mode="datetime"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <View style={styles.modalInput}>
                            <AntDesign name="dollar" size={20} color="#2C5282" style={styles.inputIcon} />
                            <TextInput
                                style={styles.modalInputField}
                                placeholder="Amount Collected (₹)"
                                keyboardType="numeric"
                                value={amountCollected}
                                onChangeText={setAmountCollected}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.modalInput}>
                            <AntDesign name="creditcard" size={20} color="#2C5282" style={styles.inputIcon} />
                            <Picker
                                selectedValue={paymentMethod}
                                onValueChange={(value) => setPaymentMethod(value)}
                                style={styles.modalInputField}
                                enabled={!loading}
                            >
                                <Picker.Item label="Cash" value="Cash" />
                                <Picker.Item label="UPI" value="UPI" />
                                <Picker.Item label="Card" value="Card" />
                            </Picker>
                        </View>

                        <View style={styles.modalInput}>
                            <AntDesign name="checkcircleo" size={20} color="#2C5282" style={styles.inputIcon} />
                            <Picker
                                selectedValue={paymentStatus}
                                onValueChange={(value) => setPaymentStatus(value)}
                                style={styles.modalInputField}
                                enabled={!loading}
                            >
                                <Picker.Item label="Paid" value="Paid" />
                                <Picker.Item label="Pending" value="Pending" />
                            </Picker>
                        </View>

                        <View style={styles.paymentHistory}>
                            <Text style={styles.sectionTitle}>Payment History</Text>
                            <FlatList
                                data={paymentHistory}
                                renderItem={renderPayment}
                                keyExtractor={(item) => `payment-${item.S_payment_id}`}
                                ListEmptyComponent={<Text style={styles.noResults}>No payments recorded</Text>}
                            />
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, loading && styles.buttonDisabled]}
                                onPress={handleRecordPayment}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Processing...' : 'Record Payment'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setAmountCollected('');
                                    setPaymentMethod('Cash');
                                    setPaymentStatus('Paid');
                                    setPaymentDate(new Date());
                                }}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A2A44',
    },
    headerButton: {
        backgroundColor: '#2A5866',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A2A44',
        marginBottom: 12,
        marginTop: 8,
    },
    addressList: {
        maxHeight: 40,
    },
    addressButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
        backgroundColor: '#2A5866',
        borderRadius: 16,
        borderWidth: 0,
    },
    addressButtonSelected: {
        backgroundColor: '#102D36FF',
    },
    addressText: {
        fontSize: 14,
        color: '#F9FCFFFF',
        fontWeight: '600',
    },
    addressTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
        color: '#2A5866',
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1A2A44',
    },
    clearSearchButton: {
        padding: 8,
    },
    customerCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
    },
    customerIcon: {
        backgroundColor: '#F0F4F8',
        borderRadius: 8,
        padding: 8,
        marginRight: 12,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2A44',
        marginBottom: 4,
    },
    customerDetails: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 2,
    },
    customerContact: {
        fontSize: 14,
        color: '#64748B',
    },
    paymentCard: {
        backgroundColor: '#F0F4F8',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentText: {
        fontSize: 14,
        color: '#1A2A44',
    },
    paymentStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    noResults: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginVertical: 20,
    },
    footerLoader: {
        marginVertical: 16,
        color: '#2C5282',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A2A44',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        borderRadius: 10,
        padding: 12,
        marginVertical: 8,
    },
    modalInputField: {
        flex: 1,
        fontSize: 16,
        color: '#1A2A44',
    },
    inputIcon: {
        marginRight: 10,
        color: '#2C5282',
    },
    inputText: {
        fontSize: 16,
        color: '#1A2A44',
    },
    paymentHistory: {
        maxHeight: 150,
        marginVertical: 12,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        backgroundColor: '#2A5866',
        padding: 14,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalCancelButton: {
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelButtonText: {
        color: '#2A5866',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default GatherPayment;
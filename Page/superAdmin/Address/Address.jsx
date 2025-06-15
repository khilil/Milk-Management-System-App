import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import addAddress from '../../../database-connect/admin/add Address/addAddress';
import fetchAddresses from '../../../database-connect/admin/add Address/fetchAddresh';
import deleteAddress from '../../../database-connect/admin/add Address/deleteAddress';

const AddressScreen = () => {
  const [formData, setFormData] = useState({ address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAddresses(setAddresses, setAddresses, (data) => setAddresses(data))
      .catch(error => {
        console.error('Fetch error:', error.message);
        Alert.alert('Error', error.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const validateForm = () => {
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (formData.address.length > 255) {
      Alert.alert('Error', 'Address must be 255 characters or less');
      return false;
    }
    return true;
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const state = await NetInfo.fetch();
    const submitForm = async () => {
      try {
        const payload = { Address: formData.address };
        const response = await addAddress(payload);

        if (response.status === 'success') {
          Alert.alert('Success', 'Address added successfully');
          setFormData({ address: '' });
          await fetchAddresses(setAddresses, setAddresses, (data) => setAddresses(data));
        } else {
          Alert.alert('Error', response.message || 'Failed to add address');
        }
      } catch (error) {
        console.error('Submit error:', error.message);
        Alert.alert('Error', error.message || 'Failed to connect to server.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (state.type === 'cellular') {
      Alert.alert(
        'Mobile Data Alert',
        'You are using mobile data. Submitting the form may consume data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: submitForm },
        ],
        { cancelable: false }
      );
    } else {
      submitForm();
    }
  };

  const handleDelete = (id) => {
    console.log('Attempting to delete address with ID:', id);
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await deleteAddress(id);
              console.log('Delete response:', response);
              if (response.status === 'success') {
                Alert.alert('Success', 'Address deleted successfully');
                await fetchAddresses(setAddresses, setAddresses, (data) => setAddresses(data));
              } else {
                Alert.alert('Error', response.message || 'Failed to delete address');
              }
            } catch (error) {
              console.error('Delete error:', error.message);
              Alert.alert('Error', error.message || 'Failed to delete address');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 3 }]}>Address</Text>
      <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Action</Text>
    </View>
  );

  const renderAddressItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8F9FB' }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.cell, { flex: 3 }]}>{item.address}</Text>
      <View style={[styles.cell, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)} // Use item.id
          style={styles.deleteButton}
          activeOpacity={0.6}
        >
          <Icon name="delete" size={24} color="#d4082fdb" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.formTitle}>Manage Addresses</Text>
          <Text style={styles.subtitle}>Add and organize addresses efficiently</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="map-marker" size={20} color="#2A5866" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new address"
                placeholderTextColor="#A0AEC0"
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                multiline
                numberOfLines={2}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.6}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Address'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Address List</Text>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#2A5866"
              style={styles.loader}
            />
          ) : (
            <>
              {renderHeader()}
              <FlatList
                data={addresses}
                keyExtractor={item => item.id.toString()} // Use item.id
                renderItem={renderAddressItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No addresses found</Text>}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A5866',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2A5866',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A5866',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A5866',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputIcon: {
    alignItems: 'center',
    textAlign: 'center',
    marginRight: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2A5866',
    minHeight: 48,
  },
  submitButton: {
    backgroundColor: '#2A5866',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A5866',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 8,
  },
  headerCell: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cell: {
    fontSize: 14,
    color: '#2A5866',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
  },
  loader: {
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#2A5866',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default AddressScreen;
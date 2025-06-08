import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet } from 'react-native';
import { fetchAddresses, addCustomer } from '../../../database-connect/admin/customer/AddCustomer';
import NetInfo from '@react-native-community/netinfo';

const Customer = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    addressId: '',
    price: '',
    startDate: new Date(),
  });
  const [addresses, setAddresses] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetchAddresses();
        if (response.status === 'success') {
          setAddresses(response.data);
        } else {
          Alert.alert('Error', response.message || 'Failed to load addresses');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        Alert.alert('Error', 'Failed to fetch addresses. Please check your network or server.');
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      Alert.alert('Error', 'Valid 10-digit phone number is required');
      return false;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (!formData.addressId) {
      Alert.alert('Error', 'Please select an address');
      return false;
    }
    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    return true;
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, startDate: selectedDate });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const state = await NetInfo.fetch();
    const submitForm = async () => {
      try {
        const formattedDate = formData.startDate.toISOString().split('T')[0];
        const payload = {
          Name: formData.username,
          Contact: formData.phone,
          Password: formData.password,
          Address_id: parseInt(formData.addressId),
          Price: parseFloat(formData.price),
          Date: formattedDate,
        };

        const response = await addCustomer(payload);
        if (response.status === 'success') {
          Alert.alert('Success', 'Customer added successfully');
          setFormData({
            username: '',
            phone: '',
            password: '',
            addressId: '',
            price: '',
            startDate: new Date(),
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to add customer');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to connect to server. Please try again.');
        console.error('Error adding customer:', error);
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.formTitle}>Add New Customer</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account" size={20} color="#4B5EAA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#A0AEC0"
                value={formData.username}
                onChangeText={(text) => handleInputChange('username', text)}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={20} color="#4B5EAA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor="#A0AEC0"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#4B5EAA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor="#A0AEC0"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputWrapper}>
              <Icon name="map-marker" size={20} color="#4B5EAA" style={styles.inputIcon} />
              {isLoadingAddresses ? (
                <ActivityIndicator size="small" color="#4B5EAA" />
              ) : (
                <Picker
                  selectedValue={formData.addressId}
                  onValueChange={(value) => handleInputChange('addressId', value)}
                  style={styles.picker}
                  enabled={!isSubmitting}
                >
                  <Picker.Item label="Select Address" value="" />
                  {addresses.map((address) => (
                    <Picker.Item
                      key={address.Address_id}
                      label={address.Address}
                      value={address.Address_id.toString()}
                    />
                  ))}
                </Picker>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price (₹)</Text>
            <View style={styles.inputWrapper}>
              <Icon name="currency-inr" size={20} color="#4B5EAA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
              disabled={isSubmitting}
            >
              <Icon name="calendar" size={20} color="#4B5EAA" style={styles.inputIcon} />
              <Text style={styles.dateText}>
                {formData.startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Customer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1A202C',
  },
  picker: {
    flex: 1,
    height: 48,
    color: '#1A202C',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
    lineHeight: 48,
  },
  submitButton: {
    backgroundColor: '#4B5EAA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Customer;
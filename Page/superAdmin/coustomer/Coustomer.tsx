import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
// import styles from '../../../css/styles';
import { API_CONFIG } from '../../../database-connect/Apichange';
import { fetchAddresses, addCustomer } from '../../../database-connect/admin/customer/AddCustomer';
import { StyleSheet } from 'react-native';

const API_URL = API_CONFIG.BASE_URL;

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
          console.log('Setting addresses:', response.data); // Debug the data
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
    <LinearGradient colors={['#F8F9FB', '#FFFFFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Customer</Text>

        <View style={styles.inputContainer}>
          <Icon name="account" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={formData.username}
            onChangeText={(text) => handleInputChange('username', text)}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputContainer}>
  <Icon name="map-marker" size={20} color="#2A5866" style={styles.inputIcon} />
  {isLoadingAddresses ? (
    <ActivityIndicator size="small" color="#2A5866" />
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

        <View style={styles.inputContainer}>
          <Icon name="currency-inr" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Price (₹)"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => handleInputChange('price', text)}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
          disabled={isSubmitting}
        >
          <Icon name="calendar" size={20} color="#2A5866" style={styles.inputIcon} />
          <Text style={styles.dateText}>
            {formData.startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#2A5866', '#6C9A8B']}
            style={styles.gradientButton}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Customer'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A5866',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2A5866',
  },
  picker: {
    flex: 1,
    height: 50, // Ensure height is set
    color: '#2A5866',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#2A5866',
  },
  submitButton: {
    marginTop: 20,
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Customer;
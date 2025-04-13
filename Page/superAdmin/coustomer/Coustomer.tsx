import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import styles from '../../../css/styles';
import { addCustomer } from '../../../database-connect/admin/customer/AddCustomer'; // Corrected import path

const Customer = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    address: '',
    price: '',
    startDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
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
          Address: formData.address,
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
            address: '',
            price: '',
            startDate: new Date(),
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to add customer');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to connect to server. Please try again.');
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
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="map-marker" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="currency-inr" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Price (₹)"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => handleInputChange('price', text)}
          />
        </View>

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
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

export default Customer;
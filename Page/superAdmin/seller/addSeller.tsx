import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import styles from '../../../css/styles';
import { addSeller } from '../../../database-connect/admin/seller/addSeller';

const AddSeller = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    vehicleNo: '',
  });
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
    if (!formData.vehicleNo.trim() || !/^[A-Za-z0-9\s\-]{1,20}$/.test(formData.vehicleNo)) {
      Alert.alert('Error', 'Valid vehicle number is required');
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
        const payload = {
          Name: formData.username,
          Contact: formData.phone,
          Password: formData.password,
          Vehicle_no: formData.vehicleNo,
        };

        const response = await addSeller(payload);
        
        if (response.status === 'success') {
          Alert.alert('Success', 'Seller added successfully');
          setFormData({
            username: '',
            phone: '',
            password: '',
            vehicleNo: '',
          });
        } else {
          Alert.alert('Error', response.message || 'Failed to add seller');
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
        <Text style={styles.formTitle}>Add Seller</Text>

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
          <Icon name="motorbike" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Vehicle Number"
            value={formData.vehicleNo}
            onChangeText={(text) => handleInputChange('vehicleNo', text)}
          />
        </View>

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
              {isSubmitting ? 'Adding...' : 'Add Seller'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default AddSeller;
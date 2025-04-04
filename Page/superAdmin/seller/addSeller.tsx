import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import styles from '../../../css/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AddSeller = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    milkQuantity: '',
    startDate: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (selectedDate) {
      setFormData({...formData, startDate: selectedDate});
    }
  };

  const handleSubmit = async () => {
    // Check network connection type
    const state = await NetInfo.fetch();
    if (state.type === 'cellular') {
      // Show mobile data alert
      Alert.alert(
        'Mobile Data Alert',
        'You are currently using mobile data. Submitting the form may consume data. Do you want to continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: () => {
              // Format the date before logging
              const formattedDate = formData.startDate
                .toISOString()
                .split('T')[0];
              console.log('Form Data:', {
                ...formData,
                startDate: formattedDate, // Log the formatted date
              });
              // Add your form submission logic here
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      // Format the date before logging
      const formattedDate = formData.startDate.toISOString().split('T')[0];
      console.log('Form Data:', {
        ...formData,
        startDate: formattedDate, // Log the formatted date
      });
      // Add your form submission logic here
    }
  };
  return (
    <LinearGradient colors={['#F8F9FB', '#FFFFFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Form Title */}
        <Text style={styles.formTitle}>Add Seller</Text>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Icon
            name="account"
            size={20}
            color="#2A5866"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={formData.username}
            onChangeText={text => handleInputChange('username', text)}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputContainer}>
          <Icon
            name="phone"
            size={20}
            color="#2A5866"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={text => handleInputChange('phone', text)}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Icon
            name="lock"
            size={20}
            color="#2A5866"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={formData.password}
            onChangeText={text => handleInputChange('password', text)}
          />
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <Icon
            name="map-marker"
            size={20}
            color="#2A5866"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.address}
            onChangeText={text => handleInputChange('address', text)}
          />
        </View>

        {/* Bike Number */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons
            name="motorbike" // Updated icon name
            size={20}
            color="#2A5866"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="Bike Number"
            value={formData.address}
            onChangeText={text => handleInputChange('address', text)}
          />
        </View>

        {/* Milk Quantity */}
        <View style={styles.inputContainer}>
          <Icon
            name="cup-water"
            size={20}
            color="#2A5866"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Milk Quantity (L)"
            keyboardType="numeric"
            value={formData.milkQuantity}
            onChangeText={text => handleInputChange('milkQuantity', text)}
          />
        </View>

        {/* Start Date
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={20} color="#2A5866" style={styles.inputIcon} />
          <Text style={styles.dateText}>
            {formData.startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity> */}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={['#2A5866', '#6C9A8B']}
            style={styles.gradientButton}>
            <Text style={styles.submitButtonText}>Add Seller</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default AddSeller;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../Milk-Management-System-App/database-connect/Login/login-api-handle';

const LoginScreen = ({ navigation }) => {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!contact || !password || !role) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    if (!/^\d{10}$/.test(contact)) {
      Alert.alert('Error', 'Contact must be a 10-digit number');
      return;
    }

    setIsLoading(true);
    try {
      const userType = role.toLowerCase();
      const response = await api.post('/login.php?path=login', {
        contact,
        password,
        user_type: userType,
      });

      if (response.status === 'success') {
        await AsyncStorage.setItem('userRole', userType);
        await AsyncStorage.setItem('userId', response.data.user_id.toString());
        await AsyncStorage.setItem('userContact', response.data.contact);
        await AsyncStorage.setItem('token', response.data.token);
        if (response.data.username) {
          await AsyncStorage.setItem('userName', response.data.username);
        }

        if (userType === 'admin') {
          navigation.replace('Home');
        } else if (userType === 'seller') {
          navigation.replace('SellerDashboard');
        } else if (userType === 'customer') {
          navigation.replace('CustomerDashboard', {
            customer: {
              id: response.data.user_id,
              username: response.data.username || 'Customer',
              phone: response.data.contact,
              address: response.data.address || 'N/A',
              milkQuantity: '5', 
            },
            isAdmin: false,
          });
        }
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid contact or password');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Milk Management Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contact}
        onChangeText={setContact}
        placeholderTextColor="#777"
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#777"
      />

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
          dropdownIconColor="#2A5866"
        >
          <Picker.Item label="Select Role" value="" />
          <Picker.Item label="Admin" value="admin" />
          <Picker.Item label="Seller" value="seller" />
          <Picker.Item label="Customer" value="customer" />
        </Picker>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2A5866" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2A5866',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 51,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2A5866',
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoginScreen;
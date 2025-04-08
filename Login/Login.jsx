import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleLogin = async () => {
    // Inside handleLogin
    await AsyncStorage.setItem('userRole', role);



    if (!username || !password || !role) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
  
    // 🔐 Default testing credentials
    const defaultCredentials = {
      admin: { username: 'Admin', password: '123456' },
      seller: { username: 'Seller', password: '123456' },
      customer: { username: 'Customer', password: '123456' },
    };
  
    const current = defaultCredentials[role];
  
    if (current && username === current.username && password === current.password) {
      if (role === 'admin') {
        navigation.replace('Home');
      } else if (role === 'seller') {
        navigation.replace('SellerDashboard');
      } else if (role === 'customer') {
        navigation.replace('CustomerDashboard');
      }
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Milk Management Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#777"
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

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

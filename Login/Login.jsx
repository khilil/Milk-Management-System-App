import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../Milk-Management-System-App/database-connect/Login/login-api-handle';

const LoginScreen = ({ navigation }) => {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fade-in animation for form card
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
    <LinearGradient colors={['#f4f7fa', '#e5e7eb']} style={styles.container}>
      {/* Company Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://static.vecteezy.com/system/resources/previews/025/263/075/non_2x/milk-drops-grass-cow-frame-for-fresh-milk-product-logo-design-100-percent-natural-milk-premium-quality-illustration-vector.jpg' }} // Replace with your actual logo URI
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Form Card */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          <Text style={styles.title}>Milk Management Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={contact}
            onChangeText={setContact}
            placeholderTextColor="#A0AEC0"
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#A0AEC0"
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
        </LinearGradient>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f4f4f4',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    marginVertical: 16,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2A5866',
    letterSpacing: 0.3,
  },
  input: {
    height: 52,
    borderWidth: 0,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#2A5866',
    fontWeight: '500',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pickerWrapper: {
    borderWidth: 0,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  picker: {
    height: 52,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#2A5866',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2A5866',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});

export default LoginScreen;
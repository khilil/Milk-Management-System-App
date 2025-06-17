import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './Page/splashscreen/SplashScreen';
import LoginScreen from './Login/Login';
import HomeScreen from './Page/superAdmin/Home';
import SellerDashboard from './Page/Seller Screen/SellerDashboard';
import CustomerDashboard from './Page/Customer Screen/CustomerDashboard';
import Customer from './Page/superAdmin/customer/Customer';
import CustomerListScreen from './Page/superAdmin/customer/CustomerListScreen';
import CustomerDetailScreen from './Page/superAdmin/customer/CustomerDetailScreen';
import PaymentScreen from './Page/superAdmin/Payments/Payments';
import MonthlyReports from './Page/superAdmin/Monthly Reports/monthlyReports';
import MilkAssigning from './Page/superAdmin/Milk Assigning/MilkAssigning';
import AddSeller from './Page/superAdmin/seller/addSeller';
import SellerDetails from './Page/superAdmin/seller/SellerDetails';
import MilkSelling from './Page/Seller Screen/Settings/MilkSelling';
import CustomerMilkAssignDataList from './Page/Seller Screen/Coustomer/CoustomerMilkAssingDataList';
import AddAddress from './Page/superAdmin/Address/Address';
import AddressSelectionScreen from './Page/Seller Screen/addressSelect/AddressSelect';
import GatherPayment from './Page/Seller Screen/gather-payment/gather-payment';
import SellerDetailScreen from './Page/superAdmin/seller/SellerDetailScreen';

const Stack = createNativeStackNavigator();

const validateToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return false;
    // Replace with your token validation endpoint
    // const response = await api.get('/verify-token');
    // return response.status === 'success';
    return true; // Placeholder; implement actual validation
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const tokenValid = await validateToken();
      if (!tokenValid) {
        await AsyncStorage.clear(); // Clear invalid session
        setInitialRoute('Login');
        return;
      }

      const role = await AsyncStorage.getItem('userRole');
      if (role === 'admin') setInitialRoute('Home');
      else if (role === 'seller') setInitialRoute('SellerDashboard');
      else if (role === 'customer') setInitialRoute('CustomerDashboard');
      else setInitialRoute('Login');
    };
    checkLogin();
  }, []);

  if (initialRoute === null) {
    return <SplashScreen />; // Show splash screen while checking login
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Dairy Dashboard',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="SellerDashboard"
          component={SellerDashboard}
          options={{
            title: 'Seller Dashboard',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="CustomerDashboard"
          component={CustomerDashboard}
          options={{
            title: 'Customer Dashboard',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="MilkSelling"
          component={MilkSelling}
          options={{
            title: 'Milk Selling',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="CustomerMilkAssignDataList"
          component={CustomerMilkAssignDataList}
          options={{
            title: 'Customer Milk Data',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="SellerDetailScreen"
          component={SellerDetailScreen}
          options={{
            title: 'Seller Details',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="Customer"
          component={Customer}
          options={{
            title: 'Add Customer',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="CustomerList"
          component={CustomerListScreen}
          options={{
            title: 'Customer List',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="CustomerDetail"
          component={CustomerDetailScreen}
          options={{
            title: 'Customer Details',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="AddSeller"
          component={AddSeller}
          options={{
            title: 'Add Seller',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="Payments"
          component={PaymentScreen}
          options={{
            title: 'Payments',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="GatherPayment"
          component={GatherPayment}
          options={{
            title: 'Gather Payment',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="MonthlyReports"
          component={MonthlyReports}
          options={{
            title: 'Milk Delay Report',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="MilkAssigning"
          component={MilkAssigning}
          options={{
            title: 'Milk Assigning',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="Seller Details"
          component={SellerDetails}
          options={{
            title: 'Seller List',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="Address"
          component={AddAddress}
          options={{
            title: 'Add Address',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
        <Stack.Screen
          name="AddressSelect"
          component={AddressSelectionScreen}
          options={{
            title: 'Select Address',
            headerStyle: { backgroundColor: '#2A5866', elevation: 4 },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
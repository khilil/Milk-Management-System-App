import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Page/superAdmin/Home';
import Coustomer from './Page/superAdmin/customer/Customer';
import CustomerListScreen from './Page/superAdmin/customer/CustomerListScreen';
import CustomerDetailScreen from './Page/superAdmin/customer/CustomerDetailScreen';
import PaymentScreen from './Page/superAdmin/Payments/Payments';
import MonthlyReports from './Page/superAdmin/Monthly Reports/monthlyReports';
import MilkAssigning from './Page/superAdmin/Milk Assigning/MilkAssigning';
import LoginScreen from './Login/Login';
import SellerDashboard from './Page/Seller Screen/SellerDashboard';
import CustomerDashboard from './Page/Customer Screen/CustomerDashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddSeller from './Page/superAdmin/seller/addSeller';
import SellerDetails from './Page/superAdmin/seller/SellerDetails';
import MilkSelling from './Page/Seller Screen/Settings/MilkSelling';
import CoustomerMilkAssingDataList from './Page/Seller Screen/Coustomer/CoustomerMilkAssingDataList';
import AddAddress from './Page/superAdmin/Address/Address.jsx';
import AddressSelectionScreen from './Page/Seller Screen/addressSelect/AddressSelect.jsx';
import GatherPayment from './Page/Seller Screen/gather-payment/gather-payment.jsx';
import SellerDetailScreen from './Page/superAdmin/seller/SellerDetailScreen.jsx';
import SplashScreen from './Page/splashscreen/SplashScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role === 'admin') setInitialRoute('Home');
      else if (role === 'seller') setInitialRoute('SellerDashboard');
      else if (role === 'customer') setInitialRoute('CustomerDashboard');
      else setInitialRoute('Login');
    };
    checkLogin();
  }, []);

  if (initialRoute === null) return null; // Optional: splash loading

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
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
          name="SellerDashboard"
          component={SellerDashboard}
          options={{
            title: 'Seller Dashboard',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="CustomerDashboard"
          component={CustomerDashboard}
          options={{
            title: 'Customer Dashboard',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="Milk selling"
          component={MilkSelling}
          options={{
            title: 'Milk Selling',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="CoustomerMilkAssingDataList"
          component={CoustomerMilkAssingDataList}
          options={{
            title: 'Customer Milk Data',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="SellerDetailScreen"
          component={SellerDetailScreen}
          options={{
            title: 'Seller Details',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Dairy Dashboard',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="addressSelect"
          component={AddressSelectionScreen}
          options={{
            title: 'Select Address',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="Address"
          component={AddAddress}
          options={{
            title: 'Add Address',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="Coustomer"
          component={Coustomer}
          options={{
            title: 'Add Customer',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="CustomerList"
          component={CustomerListScreen}
          options={{
            title: 'Customer List',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="CustomerDetail"
          component={CustomerDetailScreen}
          options={{
            title: 'Customer Details',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="AddSeller"
          component={AddSeller}
          options={{
            title: 'Add Seller',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="Payments"
          component={PaymentScreen}
          options={{
            title: 'Payments',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="gather payment"
          component={GatherPayment}
          options={{
            title: 'Gather Payment',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="MonthlyReports"
          component={MonthlyReports}
          options={{
            title: 'Milk Delay Report',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="MilkAssigning"
          component={MilkAssigning}
          options={{
            title: 'Milk Assigning',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
        <Stack.Screen
          name="seller details"
          component={SellerDetails}
          options={{
            title: 'Seller List',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2A5866',
              elevation: 4,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              letterSpacing: 1,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
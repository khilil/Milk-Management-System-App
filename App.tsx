import React, { useEffect, useState } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from './Page/superAdmin/Home';
import Coustomer from './Page/superAdmin/coustomer/Coustomer';
import CustomerListScreen from './Page/superAdmin/coustomer/CustomerListScreen ';
import CustomerDetailScreen from './Page/superAdmin/coustomer/CustomerDetailScreen';
import AddSeller from './Page/superAdmin/Seller/addSeller';
import PaymentScreen from './Page/superAdmin/Payments/Payments';
import MonthlyReports from './Page/superAdmin/Monthly Reports/monthlyReports';
import MilkAssigning from './Page/superAdmin/Milk Assigning/MilkAssigning';
import SellerDetails from './Page/superAdmin/Seller/SellerDetails';
import LoginScreen from './Login/Login';
import SellerDashboard from './Page/Seller Screen/SellerDashboard';
import CustomerDashboard from './Page/Customer Screen/CustomerDashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from 'react-native';
import SettingScreen from './Page/Seller Screen/Settings/SettingScreen';


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
      <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
        <Stack.Screen name="Setting" component={SettingScreen} />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Dairy Dashboard',
            headerStyle: {
              backgroundColor: '#2A5866', // Primary color
              elevation: 4,
            },
            headerTintColor: '#FFFFFF', // White text
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
            title: 'Dairy Dashboard',
            headerStyle: {
              backgroundColor: '#2A5866', // Primary color
              elevation: 4,
            },
            headerTintColor: '#FFFFFF', // White text
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
            title: 'Customer List',
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
            title: 'Customer List',
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
            title: 'Customer List',
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
            title: 'Customer List',
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
            title: 'Customer List',
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
            title: 'Customer List',
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

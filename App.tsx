import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Page/superAdmin/Home';
import Coustomer from './Page/superAdmin/customer/Customer';
import CustomerListScreen from './Page/superAdmin/customer/CustomerListScreen';
import CustomerDetailScreen from './Page/superAdmin/customer/CustomerDetailScreen';
// import AddSeller from './Page/superAdmin/Seller/addSeller';
import PaymentScreen from './Page/superAdmin/Payments/Payments';
import MonthlyReports from './Page/superAdmin/Monthly Reports/monthlyReports';
import MilkAssigning from './Page/superAdmin/Milk Assigning/MilkAssigning';
// import SellerDetails from './Page/superAdmin/Seller/SellerDetails';
import LoginScreen from './Login/Login';
import SellerDashboard from './Page/Seller Screen/SellerDashboard';
import CustomerDashboard from './Page/Customer Screen/CustomerDashboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from 'react-native';
import AddSeller from './Page/superAdmin/seller/addSeller';
import SellerDetails from './Page/superAdmin/seller/SellerDetails';
import MilkSelling from './Page/Seller Screen/Settings/MilkSelling';
import CoustomerMilkAssingDataList from './Page/Seller Screen/Coustomer/CoustomerMilkAssingDataList';
// import AddAddress from './Page/superAdmin/Address/AddAddress'
import AddAddress from './Page/superAdmin/Address/Address.jsx';
import AddressSelectionScreen from './Page/Seller Screen/addressSelect/AddressSelect.jsx';
import GatherPayment from './Page/Seller Screen/gather-payment/gather-payment.jsx';
import SellerDetailScreen from './Page/superAdmin/seller/SellerDetailScreen.jsx';

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
        <Stack.Screen name="Milk selling" component={MilkSelling} />
        {/* <Stack.Screen name="CoustomerMilkAssingDataList" component={CoustomerMilkAssingDataList} /> */}


        {/* <Stack.Screen name="SellerDetails" component={SellerDetails} /> */}
        <Stack.Screen name="SellerDetailScreen" component={SellerDetailScreen} />
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
          name="addressSelect"
          component={AddressSelectionScreen}
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
          name="Address"
          component={AddAddress}
          options={{
            title: 'Go To Dashboard',
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
            title: 'Go To Dashboard',
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
          name="gather payment"
          component={GatherPayment}
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
            title: 'Milk Delay Report',
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
            title: 'Coustomer milk data',
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

      </Stack.Navigator>
    </NavigationContainer>
  );
}

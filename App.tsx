import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from './Page/superAdmin/Home';
import Coustomer from './Page/superAdmin/coustomer/Coustomer';
import CustomerListScreen from './Page/superAdmin/coustomer/CustomerListScreen ';
import CustomerDetailScreen from './Page/superAdmin/coustomer/CustomerDetailScreen';
import AddSeller from './Page/superAdmin/seller/addSeller';
import PaymentScreen from './Page/superAdmin/Payments/Payments';
import MonthlyReports from './Page/superAdmin/Monthly Reports/monthlyReports';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
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

      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../css/styles';
import { useNavigation } from '@react-navigation/native'; 
import Ionicons from 'react-native-vector-icons/Ionicons';

const features = [
  { id: '1', name: 'Add Customer', icon: 'account-plus', color: '#3498db', screen: 'Coustomer'  },
  { id: '2', name: 'Add Seller', icon: 'account-group', color: '#e67e22', screen: 'AddSeller' },
  { id: '3', name: 'Add Address', icon: 'message-text', color: '#34495e', screen:'Address' },
  { id: '4', name: 'Milk Distribution', icon: 'cup-water', color: '#2ecc71' ,screen: 'CustomerList'},
  { id: '5', name: 'Payments', icon: 'cash-multiple', color: '#9b59b6', screen: 'Payments'},
  { id: '6', name: 'Daily Reports', icon: 'chart-bar', color: '#1abc9c', screen: 'MonthlyReports' },
  { id: '7', name: 'Milk Assiging', icon: 'history', color: '#e74c3c', screen: 'MilkAssigning' },
  { id: '8', name: 'Seller Details', icon: 'bell', color: '#f1c40f', screen: 'seller details' },
  // { id: '9', name: 'Settings', icon: 'cog', color: '#7f8c8d' },
];
// HomeScreen.js - Enhanced with more details
export default function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.replace('Login')}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      title: 'Admin Dashboard',
      headerStyle: {
        backgroundColor: '#2A5866',
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);


    return (
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.container}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Good Morning, Admin!</Text>
            <Text style={styles.stats}>Today's Distribution: 1500 L</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Icon name="account" size={28} color="#2c3e50" />
          </TouchableOpacity>
        </View>

        {/* Main Features Grid */}
        <FlatList
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Management Tools</Text>
          }
          data={features}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
            style={styles.touchableBox}
            activeOpacity={0.9}
            onPress={() => {
              if (item.screen) {
                navigation.navigate(item.screen); // Navigate to the specified screen
              }
            }}
          >
              <LinearGradient
                colors={[item.color, `${item.color}dd`]}
                style={styles.box}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Badge for notifications */}
                {item.id === '7' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                )}
                <Icon
                  name={item.icon}
                  size={32}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.boxText}>{item.name}</Text>

                {/* Subtle Pattern Overlay */}
                <View style={styles.patternOverlay} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        />

        {/* Footer Quick Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <Icon name="clock" size={20} color="#2c3e50" />
            <Text style={styles.footerText}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Icon name="alert" size={20} color="#2c3e50" />
            <Text style={styles.footerText}>Alerts</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }
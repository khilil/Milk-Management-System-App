import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../css/styles';
import { useNavigation } from '@react-navigation/native';
import { fetchSellerDashboardData } from '../../database-connect/seller-screen/deashbord/fetchSellerDashboardData';

const features = [
  { id: '1', name: 'Add Customer', icon: 'account-plus', color: '#3498db', screen: 'Customer' },
  { id: '2', name: 'Select Area', icon: 'map', color: '#34495e', screen: 'AddressSelect' },
  { id: '3', name: 'Customer Milk Data', icon: 'cup-water', color: '#2ecc71', screen: 'CustomerMilkAssignDataList' },
  { id: '4', name: 'Payments', icon: 'cash-multiple', color: '#9b59b6', screen: 'Payments' },
  { id: '5', name: 'Gather Payment', icon: 'chart-bar', color: '#1abc9c', screen: 'GatherPayment' },
  { id: '6', name: 'Milk Selling', icon: 'beer-outline', color: '#7f8c8d', screen: 'MilkSelling' },
];

export default function SellerDashboard() {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({
    seller_name: 'Seller',
    total_assigned: 0,
    remaining_quantity: 0,
  });
  const [greeting, setGreeting] = useState('Good Morning, Seller!');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      const data = await fetchSellerDashboardData();
      setDashboardData({
        seller_name: data.seller_name || 'Seller',
        total_assigned: data.total_assigned || 0,
        remaining_quantity: data.remaining_quantity || 0,
      });
    } catch (error) {
      console.error('Error fetching seller dashboard data:', error.message);
    }
  };

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Refresh data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Dashboard focused, refreshing data...');
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  // Dynamic greeting and periodic data refresh
  useEffect(() => {
    const updateGreetingAndData = async () => {
      const hour = new Date().getHours();
      const newGreeting = hour < 12
        ? `Good Morning, ${dashboardData.seller_name}!`
        : hour < 17
        ? `Good Afternoon, ${dashboardData.seller_name}!`
        : `Good Evening, ${dashboardData.seller_name}!`;
      setGreeting(newGreeting);

      // Periodic fetch (fallback)
      await fetchData();
    };

    updateGreetingAndData(); // Initial fetch
    const interval = setInterval(updateGreetingAndData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [dashboardData.seller_name]);

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
      title: 'Seller Dashboard',
      headerStyle: {
        backgroundColor: '#2A5866',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 20,
      },
    });
  }, [navigation]);

  return (
    <LinearGradient colors={['#f4f7fa', '#e5e7eb']} style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header Section */}
        <View style={[styles.headerContainer, { paddingTop: 10 }]}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.headerCard}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>{greeting}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Icon name="nutrition" size={24} color="#e74c3c" />
                    <Text style={styles.statValue}>{dashboardData.total_assigned} L</Text>
                    <Text style={[styles.statLabel, { color: '#666' }]}>Assigned Today</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Icon name="bottle-tonic" size={24} color="#3498db" />
                    <Text style={styles.statValue}>{dashboardData.remaining_quantity} L</Text>
                    <Text style={[styles.statLabel, { color: '#666' }]}>Remaining Milk</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Features Grid */}
        <FlatList
          ListHeaderComponent={<Text style={styles.sectionTitle}>Management Tools</Text>}
          data={features}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          bounces={true}
          decelerationRate="fast"
          scrollEventThrottle={16}
          initialNumToRender={9}
          maxToRenderPerBatch={6}
          windowSize={5}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.touchableBox}
              activeOpacity={0.8}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <LinearGradient
                colors={[item.color, `${item.color}cc`]}
                style={styles.box}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name={item.icon} size={32} color="#fff" style={styles.icon} />
                <Text style={styles.boxText}>{item.name}</Text>
                <View style={styles.patternOverlay} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </LinearGradient>
  );
}
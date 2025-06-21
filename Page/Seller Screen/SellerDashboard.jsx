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
  { id: '3', name: 'Customer Milk Data', icon: 'cup-water', color: '#2ecc71', screen: 'CustomerMilkAssignDataList' }, // Fixed typo
  { id: '4', name: 'Payments', icon: 'cash-multiple', color: '#9b59b6', screen: 'Payments' },
  { id: '5', name: 'Gather Payment', icon: 'chart-bar', color: '#1abc9c', screen: 'GatherPayment' },
  // { id: '6', name: 'Milk Assigning', icon: 'nutrition', color: '#e74c3c', screen: 'MilkAssigning' },
  { id: '7', name: 'Milk Selling', icon: 'beer-outline', color: '#7f8c8d', screen: 'MilkSelling' },
];

export default function SellerDashboard() {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({
    seller_name: 'Seller',
    total_assigned: 0,
    delivery_locations: [],
  });
  const [greeting, setGreeting] = useState('Good Morning, Seller!');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Dynamic greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting(`Good Morning, ${dashboardData.seller_name}!`);
      } else if (hour < 17) {
        setGreeting(`Good Afternoon, ${dashboardData.seller_name}!`);
      } else {
        setGreeting(`Good Evening, ${dashboardData.seller_name}!`);
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [dashboardData.seller_name]);

  // Fetch dashboard data
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const data = await fetchSellerDashboardData();
        setDashboardData({
          seller_name: data.seller_name || 'Seller',
          total_assigned: data.total_assigned || 0,
          delivery_locations: data.delivery_locations || [],
        });
      } catch (error) {
        console.error('Error fetching seller dashboard data:', error.message);
      }
    };
    getDashboardData();
  }, []);

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
                    <Icon name="map-marker" size={24} color="#34495e" />
                    <Text style={styles.statValue}>{dashboardData.delivery_locations.length}</Text>
                    <Text style={[styles.statLabel, { color: '#666' }]}>Delivery Locations</Text>
                  </View>
                </View>
                {dashboardData.delivery_locations.length > 0 && (
                  <View style={styles.locationsContainer}>
                    <Text style={styles.locationsTitle}>Today’s Delivery Locations:</Text>
                    {dashboardData.delivery_locations.slice(0, 2).map((location, index) => (
                      <Text key={index} style={styles.locationText} numberOfLines={1}>
                        • {location}
                      </Text>
                    ))}
                    {dashboardData.delivery_locations.length > 2 && (
                      <Text style={styles.locationText}>+{dashboardData.delivery_locations.length - 2} more</Text>
                    )}
                  </View>
                )}
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
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../css/styles'; // Ensure this path matches your project structure
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchDashboardData } from '../../database-connect/admin/deashbord/deashbord';

const features = [
  { id: '1', name: 'Add Customer', icon: 'account-plus', color: '#3498db', screen: 'Customer' }, // Fixed typo
  { id: '2', name: 'Add Seller', icon: 'account-group', color: '#e67e22', screen: 'AddSeller' },
  { id: '3', name: 'Add Address', icon: 'earth', color: '#34495e', screen: 'Address' },
  { id: '7', name: 'Milk Assigning', icon: 'nutrition', color: '#e74c3c', screen: 'MilkAssigning' },
  { id: '4', name: 'Customer Detail', icon: 'cup-water', color: '#2ecc71', screen: 'CustomerList' },
  { id: '8', name: 'Seller Details', icon: 'storefront', color: '#f1c40f', screen: 'Seller Details' },
  { id: '6', name: 'Milk Delay Report', icon: 'chart-bar', color: '#1abc9c', screen: 'MonthlyReports' },
  { id: '5', name: 'Payments', icon: 'cash-multiple', color: '#9b59b6', screen: 'Payments' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState({
    totalDistributed: 0,
    totalAssigned: 0,
  });
  const [greeting, setGreeting] = useState('Good Morning, Admin!');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Dynamic greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning, Admin!');
      } else if (hour < 17) {
        setGreeting('Good Afternoon, Admin!');
      } else {
        setGreeting('Good Evening, Admin!');
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        if (data.status === 'success') {
          setDashboardData({
            totalDistributed: data.data.total_distributed,
            totalAssigned: data.data.total_assigned,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
      title: 'Admin Dashboard',
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
                <Text style={[styles.headerText, { color: '#666' }]}>Welcome to your dashboard.</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Icon name="cup-water" size={styles.headerIconSize || 24} color="#3498db" />
                    <Text style={styles.statValue}>{dashboardData.totalDistributed} L</Text>
                    <Text style={[styles.statLabel, { color: '#666' }]}>Distributed Today</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Icon name="nutrition" size={styles.headerIconSize || 24} color="#e74c3c" />
                    <Text style={styles.statValue}>{dashboardData.totalAssigned} L</Text>
                    <Text style={[styles.statLabel, { color: '#666' }]}>Assigned Today</Text>
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
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]} // Increased padding for scroll
          showsVerticalScrollIndicator={false}
          bounces={true}
          decelerationRate="fast"
          scrollEventThrottle={16} // Optimize scroll performance
          initialNumToRender={9} // Render 3 rows (3 columns * 3 rows) initially
          maxToRenderPerBatch={6} // Control rendering for performance
          windowSize={5} // Optimize rendering window
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
                {item.id === '7' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                )}
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
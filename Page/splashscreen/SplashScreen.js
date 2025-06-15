import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useState(new Animated.Value(0))[0]; // Fade-in animation for logo

  // Fade-in animation effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1-second fade-in
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Navigate to LoginScreen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Replace 'Login' with your LoginScreen route name
    }, 5000); // 3-second delay

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [navigation]);

  return (
    <LinearGradient colors={['#f4f7fa', '#e5e7eb']} style={styles.container}>
      {/* Center: Logo and Version */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
          <Image
            source={{ uri: 'https://static.vecteezy.com/system/resources/previews/025/263/075/non_2x/milk-drops-grass-cow-frame-for-fresh-milk-product-logo-design-100-percent-natural-milk-premium-quality-illustration-vector.jpg' }} // Replace with your actual logo
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

      {/* Bottom: Copyright and Creator */}
      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>© 2025 Milk Management System</Text>
        <Text style={styles.bottomText}>Developed by [Your Name]</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  versionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A5866',
    letterSpacing: 0.3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2A5866',
    letterSpacing: 0.2,
    marginVertical: 2,
  },
});

export default SplashScreen;
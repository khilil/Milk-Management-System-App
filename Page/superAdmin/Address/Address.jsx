import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import styles from '../../../css/styles';
import addAddress from '../../../database-connect/admin/add Address/addAddress';
import fetchAddresh from '../../../database-connect/admin/add Address/fetchAddresh';

const AddressScreen = () => {
  const [formData, setFormData] = useState({ address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAddresh(setAddresses, setAddresses, (data) => setAddresses(data))
      .catch(error => Alert.alert('Error', error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const validateForm = () => {
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (formData.address.length > 255) {
      Alert.alert('Error', 'Address must be 255 characters or less');
      return false;
    }
    return true;
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const state = await NetInfo.fetch();
    const submitForm = async () => {
      try {
        const payload = { Address: formData.address };
        const response = await addAddress(payload);

        if (response.status === 'success') {
          Alert.alert('Success', 'Address added successfully');
          setFormData({ address: '' });
          await fetchAddresh(setAddresses, setAddresses, (data) => setAddresses(data));
        } else {
          Alert.alert('Error', response.message || 'Failed to add address');
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to connect to server.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (state.type === 'cellular') {
      Alert.alert(
        'Mobile Data Alert',
        'You are using mobile data. Submitting the form may consume data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: submitForm },
        ],
        { cancelable: false }
      );
    } else {
      submitForm();
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteAddress(id, setAddresses, setAddresses, (data) => setAddresses(data));
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

const renderHeader = () => (
    <View style={[styles.tableHeader, {
      backgroundColor: '#2A5866',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      paddingVertical: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    }]}>
      <Text style={[styles.headerCell, {
        flex: 3,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'left',
        paddingLeft: 16,
      }]}>Address</Text>
      <View style={{ width: 16 }} /> {/* Spacer */}
      <Text style={[styles.headerCell, {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
      }]}>Actions</Text>
    </View>
);

  const renderAddressItem = ({ item }) => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      marginBottom: 8,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }}>
      <Text style={[styles.cell, {
        flex: 3,
        color: '#333',
        fontSize: 14,
        lineHeight: 20,
      }]}>{item.address}</Text>
      <View style={[styles.cell, styles.actionCell, {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }]}>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, {
            padding: 6,
            backgroundColor: '#FF4444',
            borderRadius: 10,
          }]}
        >
          <Icon name="delete" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#F8F9FB', '#FFFFFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Add Address</Text>

        <View style={styles.inputContainer}>
          <Icon name="map-marker" size={20} color="#2A5866" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#2A5866', '#6C9A8B']}
            style={styles.gradientButton}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Address'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={[styles.tableContainer, { marginTop: 24 }]}>
          {renderHeader()}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#2A5866"
              style={styles.loader}
            />
          ) : (
            <FlatList
              data={addresses}
              keyExtractor={item => item.id.toString()}
              renderItem={renderAddressItem}
              ListEmptyComponent={<Text style={styles.emptyText}>No addresses found</Text>}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default AddressScreen;
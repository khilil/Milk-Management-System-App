import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSellers, fetchAssignments, assignMilk, deleteAssignment } from '../../../database-connect/admin/seller/MilkAssignmentApi';

const MilkAssignScreen = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [assignedMilk, setAssignedMilk] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load sellers
        const sellerResponse = await fetchSellers();
        console.log('Fetch Sellers Response:', sellerResponse);
        if (Array.isArray(sellerResponse)) {
          setSellers(sellerResponse);
          if (sellerResponse.length > 0) {
            setSelectedSeller(sellerResponse[0].Seller_id);
          }
        } else {
          Alert.alert('Error', sellerResponse.message || 'Invalid seller data received');
        }

        // Load assignments for selected date
        loadAssignments();
      } catch (error) {
        console.error('Load Data Error:', error);
        Alert.alert('Error', 'Failed to connect to server.');
      }
    };
    loadData();
  }, []);

  const loadAssignments = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const assignmentResponse = await fetchAssignments(dateStr);
      console.log('Fetch Assignments Response:', assignmentResponse);
      if (Array.isArray(assignmentResponse)) {
        const formattedAssignments = assignmentResponse.map(assignment => ({
          assignment_id: assignment.Assignment_id,
          seller: assignment.Name,
          quantity: parseFloat(assignment.Assigned_quantity),
          remaining: parseFloat(assignment.Remaining_quantity),
        }));
        setAssignedMilk(formattedAssignments);
      } else {
        Alert.alert('Error', assignmentResponse.message || 'No assignments found for this date');
        setAssignedMilk([]);
      }
    } catch (error) {
      console.error('Load Assignments Error:', error);
      Alert.alert('Error', 'Failed to fetch assignments.');
      setAssignedMilk([]);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedDate]);

  const validateForm = () => {
    if (!selectedSeller) {
      Alert.alert('Error', 'Please select a seller');
      return false;
    }
    if (!quantity.trim() || isNaN(quantity) || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Valid milk quantity is required');
      return false;
    }
    return true;
  };

  const handleAssign = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        Seller_id: selectedSeller,
        Assigned_quantity: parseFloat(quantity),
        Date: selectedDate.toISOString().split('T')[0],
      };
      console.log('Assign Milk Payload:', payload);

      const response = await assignMilk(payload);
      console.log('Assign Milk Response:', response);

      if (response.status === 'success') {
        setAssignedMilk([
          ...assignedMilk,
          {
            assignment_id: response.assignment_id,
            seller: sellers.find(s => s.Seller_id === selectedSeller).Name,
            quantity: parseFloat(quantity),
            remaining: parseFloat(quantity),
          },
        ]);
        setQuantity('');
        Alert.alert('Success', 'Milk assigned successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to assign milk');
      }
    } catch (error) {
      console.error('Assign Milk Error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (index) => {
    const item = assignedMilk[index];
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the assignment for ${item.seller}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteAssignment(item.assignment_id);
              console.log('Delete Assignment Response:', response);
              if (response.status === 'success') {
                const updatedList = assignedMilk.filter((_, i) => i !== index);
                setAssignedMilk(updatedList);
                Alert.alert('Success', 'Assignment deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete assignment');
              }
            } catch (error) {
              console.error('Delete Assignment Error:', error);
              Alert.alert('Error', 'Failed to connect to server');
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (event, newDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Milk Assigning</Text>

      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
          <Icon name="chevron-left" size={24} color="#2A5866" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
          <Icon name="chevron-right" size={24} color="#2A5866" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Select Seller:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSeller}
          onValueChange={(itemValue) => setSelectedSeller(itemValue)}
          enabled={sellers.length > 0}
        >
          {sellers.map((seller) => (
            <Picker.Item key={seller.Seller_id} label={seller.Name} value={seller.Seller_id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Milk Quantity (Liters):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter quantity"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TouchableOpacity 
        style={[styles.assignButton, isSubmitting && { opacity: 0.6 }]} 
        onPress={handleAssign}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Assigning...' : 'Assign Milk'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.tableTitle}>Assigned Milk Table</Text>

      <View style={[styles.tableRow, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerText]}>Name</Text>
        <Text style={[styles.cell, styles.headerText]}>Assigned Qty</Text>
        <Text style={[styles.cell, styles.headerText]}>Remaining</Text>
        <Text style={[styles.cell, styles.headerText]}>Action</Text>
      </View>

      {assignedMilk.length === 0 ? (
        <Text style={styles.noDataText}>No assignments for this date</Text>
      ) : (
        assignedMilk.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{item.seller}</Text>
            <Text style={styles.cell}>{item.quantity} L</Text>
            <Text style={styles.cell}>{item.remaining} L</Text>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <Text style={styles.deleteBtn}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  title: {
    color: '#2A5866',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  tableTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A5866',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerRow: {
    backgroundColor: '#2A5866',
    borderBottomWidth: 2,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderColor: '#bbb',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },
  deleteBtn: {
    color: 'red',
    fontWeight: 'bold',
  },
  assignButton: {
    backgroundColor: '#2A5866',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dateButton: {
    padding: 10,
  },
  datePickerButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#2A5866',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MilkAssignScreen;
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const sellers = ['Seller 1', 'Seller 2', 'Seller 3', 'Seller 4', 'Seller 5'];

const MilkAssignScreen = () => {
  const [selectedSeller, setSelectedSeller] = useState(sellers[0]);
  const [quantity, setQuantity] = useState('');
  const [assignedMilk, setAssignedMilk] = useState([]);

//   const handleAssign = () => {
//     if (!quantity) return;

//     const existing = assignedMilk.find(item => item.seller === selectedSeller);
//     if (existing) {
//       // Update quantity
//       const updated = assignedMilk.map(item =>
//         item.seller === selectedSeller
//           ? {
//               ...item,
//               quantity: parseFloat(item.quantity) + parseFloat(quantity),
//             }
//           : item,
//       );
//       setAssignedMilk(updated);
//     } else {
//       // New entry
//       setAssignedMilk([
//         ...assignedMilk,
//         {
//           seller: selectedSeller,
//           quantity: parseFloat(quantity),
//           remaining: parseFloat(quantity), // Update as needed
//         },
//       ]);
//     }


    
//     setQuantity('');
//   };


const handleAssign = () => {
    if (!quantity) return;
  
    const existing = assignedMilk.find(item => item.seller === selectedSeller);
    if (existing) {
      alert('Seller already assigned. Please use the Edit option.');
      return;
    }
  
    // New entry
    setAssignedMilk([
      ...assignedMilk,
      {
        seller: selectedSeller,
        quantity: parseFloat(quantity),
        remaining: parseFloat(quantity), // You can change remaining logic later
      },
    ]);
  
    setQuantity('');
  };
  
  

  const handleEdit = index => {
    const item = assignedMilk[index];
    setSelectedSeller(item.seller);
    setQuantity(item.quantity.toString());

    const updatedList = assignedMilk.filter((_, i) => i !== index);
    setAssignedMilk(updatedList);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* <View style={styles.container}> */}
        <Text style={styles.title}>Milk Assigning</Text>

        <Text style={styles.label}>Select Seller:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSeller}
            onValueChange={itemValue => setSelectedSeller(itemValue)}>
            {sellers.map((seller, index) => (
              <Picker.Item key={index} label={seller} value={seller} />
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

        <TouchableOpacity style={styles.assignButton} onPress={handleAssign}>
          <Text style={styles.buttonText}>Assign Milk</Text>
        </TouchableOpacity>

        <Text style={styles.tableTitle}>Assigned Milk Table</Text>

        {/* Table Headers */}
        <View style={[styles.tableRow, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerText]}>Name</Text>
          <Text style={[styles.cell, styles.headerText]}>Assigned Qty</Text>
          <Text style={[styles.cell, styles.headerText]}>Remaining</Text>
          <Text style={[styles.cell, styles.headerText]}>Action</Text>
        </View>

        {/* Table Data */}
        {/* <FlatList
            data={assignedMilk}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) => (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>{item.seller}</Text>
                <Text style={styles.cell}>{item.quantity} L</Text>
                <Text style={styles.cell}>{item.remaining} L</Text>
                <TouchableOpacity onPress={() => handleEdit(index)}>
                  <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          /> */}
        {assignedMilk.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{item.seller}</Text>
            <Text style={styles.cell}>{item.quantity} L</Text>
            <Text style={styles.cell}>{item.remaining} L</Text>
            <TouchableOpacity onPress={() => handleEdit(index)}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* </View> */}
      </ScrollView>
    </>
  );
};

export default MilkAssignScreen;

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
    // flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },
  editBtn: {
    color: 'blue',
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
});

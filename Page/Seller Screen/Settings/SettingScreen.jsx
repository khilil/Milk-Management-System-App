import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";

const customers = [
  { id: "C001", name: "Ramesh" },
  { id: "C002", name: "Suresh" },
  { id: "C003", name: "Mahesh" },
  { id: "C004", name: "Kamlesh" },
  { id: "C005", name: "Dinesh" },
  { id: "C006", name: "Khilil" },
  { id: "C007", name: "Abhishek" },
];

const SettingScreen = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [milkQuantity, setMilkQuantity] = useState("");
  const [date, setDate] = useState("");
  const [entries, setEntries] = useState([]);

  // 👇 Date Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
    setFilteredCustomers(customers);
    setSearchText("");
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(text.toLowerCase()) ||
        customer.id.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDropdownVisible(false);
  };

  const handleAddEntry = () => {
    if (selectedCustomer && milkQuantity && date) {
      const newEntry = {
        customer: selectedCustomer,
        milkQuantity,
        date,
      };
      setEntries([...entries, newEntry]);
      setMilkQuantity("");
      setDate("");
      setSelectedCustomer(null);
    }
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) {
      const formattedDate = selected.toISOString().split("T")[0]; // yyyy-mm-dd
      setSelectedDate(selected);
      setDate(formattedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Milk Distribution Entry</Text>

      {/* Searchable Dropdown */}
      <TouchableOpacity style={styles.dropdownToggle} onPress={toggleDropdown}>
        <Text>
          {selectedCustomer
            ? `${selectedCustomer.name} (${selectedCustomer.id})`
            : "Select Customer"}
        </Text>
        <AntDesign
          name={dropdownVisible ? "up" : "down"}
          size={16}
          color="black"
        />
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.input}
            placeholder="Search by Name or ID"
            value={searchText}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelectCustomer(item)}
              >
                <Text>
                  {item.name} ({item.id})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {selectedCustomer && (
        <View style={styles.entrySection}>
          <Text>
            Selected: {selectedCustomer.name} ({selectedCustomer.id})
          </Text>

          {/* 👇 Date Picker */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            <Text style={{ color: date ? "black" : "#999" }}>
              {date || "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Milk Quantity (in Litres)"
            keyboardType="numeric"
            value={milkQuantity}
            onChangeText={setMilkQuantity}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddEntry}>
            <Text style={styles.buttonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.heading}>Entries</Text>
      <FlatList
        data={entries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.entryItem}>
            <Text>
              {item.date} - {item.customer.name} ({item.customer.id}) -{" "}
              {item.milkQuantity} L
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 10, color: '#2A5866' },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  dropdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 200,
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f9f9f9",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  entrySection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#2A5866",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    // backgroundColor: "#2A5866",
    fontWeight: "bold",
  },
  entryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default SettingScreen;

import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import celebrities from "../../celebrities.json";

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [editedUser, setEditedUser] = useState(null); // To track changes
  const [originalUser, setOriginalUser] = useState(null); // To revert to the original data

  useEffect(() => {
    const loadUsers = () => {
      setUsers(
        celebrities.map((user) => ({
          ...user,
          age: new Date().getFullYear() - new Date(user.dob).getFullYear(),
        }))
      );
    };
    loadUsers();
  }, []);

  const handleSave = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    setEditMode(false);
    setExpandedUser(updatedUser.id); // Keep the expanded user open after saving
    setEditedUser(null);
    setOriginalUser(null); // Clear original user data after saving
  };

  const handleDelete = (userId) => {
    Alert.alert("Are you sure you want to delete?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        },
      },
    ]);
  };

  const handleChange = (field, value) => {
    setEditedUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleEdit = (item) => {
    // Check if the user is under 18
    if (item.age < 18) {
      Alert.alert("You are not allowed to edit your information.");
      return;
    }

    setEditMode(true);
    setOriginalUser({ ...item }); // Save the original user data for cancel
    setEditedUser({ ...item }); // Set the initial edit data
    setExpandedUser(item.id); // Ensure the accordion stays open for the user being edited
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedUser({ ...originalUser }); // Revert to the original user data
    setExpandedUser(originalUser.id); // Keep the accordion of the original user expanded
  };

  const filteredUsers = users.filter((user) =>
    `${user.first} ${user.last}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }) => {
    const isExpanded = expandedUser === item.id;
    const userToEdit = editedUser || item; // Use edited user if exists

    return (
      <View style={styles.userContainer}>
        {/* Accordion Header */}
        <TouchableOpacity
          style={styles.userHeader}
          onPress={() => {
            if (!editMode) {
              setExpandedUser(isExpanded ? null : item.id); // Only toggle when not in edit mode
            }
          }}
        >
          <Image source={{ uri: item.picture }} style={styles.userImage} />
          <Text style={styles.userName}>{`${item.first} ${item.last}`}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? "-" : "+"}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.userDetails}>
            {editMode ? (
              <View>
                <View style={styles.content}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Age:</Text>
                    <TextInput
                      style={styles.input}
                      value={userToEdit.age.toString()}
                      onChangeText={(text) => handleChange("age", text)}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Gender:</Text>
                    <TouchableOpacity
                      onPress={() => setGenderOpen(!genderOpen)}
                      style={[styles.input, styles.dropdown]}
                    >
                      <Text>{userToEdit.gender}</Text>
                    </TouchableOpacity>
                    {genderOpen && (
                      <View style={styles.dropdownOptions}>
                        {["Male", "Female", "Transgender", "Rather not say", "Other"].map(
                          (genderOption) => (
                            <TouchableOpacity
                              key={genderOption}
                              onPress={() => {
                                handleChange("gender", genderOption);
                                setGenderOpen(false);
                              }}
                            >
                              <Text style={styles.option}>{genderOption}</Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Country:</Text>
                    <TextInput
                      style={styles.input}
                      value={userToEdit.country}
                      onChangeText={(text) => handleChange("country", text)}
                    />
                  </View>
                </View>
                <View>
                  <Text style={styles.label}>Description:</Text>
                  <TextInput
                    style={[styles.input1, styles.textArea]}
                    value={userToEdit.description}
                    onChangeText={(text) => handleChange("description", text)}
                    multiline
                  />
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => handleSave(userToEdit)}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.content}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Age:</Text>
                    <Text>{item.age} Years</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Gender:</Text>
                    <Text>{item.gender}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Country:</Text>
                    <Text>{item.country}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description:</Text>
                  <Text>{item.description}</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search user"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 30, padding: 16, backgroundColor: "#fff" },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userContainer: { marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  userHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  userImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { flex: 1, fontSize: 16, fontWeight: "bold" },
  expandIcon: { fontSize: 18 },
  userDetails: { padding: 10, backgroundColor: "#f9f9f9" },
  row: { flexDirection: "column", marginBottom: 8 },
  label: { fontWeight: "bold", fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    flex: 1,
    borderRadius: 4,
    fontSize: 12,
    width: 90,
  },
  input1: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    flex: 1,
    borderRadius: 4,
    fontSize: 12,
    height: 120,
    marginBottom: 20,
  },
  textArea: { height: 70 },
  dropdown: {
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownOptions: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    zIndex: 10,
  },
  option: {
    padding: 8,
    fontSize: 12,
  },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end" },
  editButton: { backgroundColor: "#007BFF", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, marginRight: 20 },
  saveButton: { backgroundColor: "#28a745", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, marginRight: 20 },
  cancelButton: { backgroundColor: "#808080", padding: 10, borderRadius: 5 },
  deleteButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});

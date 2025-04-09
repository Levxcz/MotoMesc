import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

interface Appointment {
  id: string;
  shopId: string;
  customerId: string;
  description: string;
  imageUrl: string;
  namePlateNumber: string;
  createdAt: string;
  status?: string;
}

export default function SellerAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Step 1: Get all shops owned by the current seller
      const shopQuery = query(collection(db, "shops"), where("owner", "==", user.uid));
      const shopSnapshot = await getDocs(shopQuery);
      const shopIds = shopSnapshot.docs.map((doc) => doc.id);

      // Step 2: Fetch all appointments tied to each shop
      let allAppointments: Appointment[] = [];

      for (const shopId of shopIds) {
        const apptQuery = query(collection(db, "appointments"), where("shopId", "==", shopId));
        const apptSnapshot = await getDocs(apptQuery);
        const apptList = apptSnapshot.docs.map((doc) => ({

          ...(doc.data() as Appointment),
        }));
        allAppointments.push(...apptList);
      }

      setAppointments(allAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, { status: newStatus });
      Alert.alert("Success", `Status updated to ${newStatus}`);
      fetchAppointments(); // Refresh the list after updating
    } catch (err) {
      console.error("Failed to update status:", err);
      Alert.alert("Error", "Failed to update appointment status.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const renderStatusButton = (item: Appointment) => {
    switch (item.status) {
      case "Pending":
        return (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "green" }]}
            onPress={() => updateStatus(item.id, "Confirmed")}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        );
      case "Confirmed":
        return (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "orange" }]}
            onPress={() => updateStatus(item.id, "In Progress")}
          >
            <Text style={styles.buttonText}>Mark In Progress</Text>
          </TouchableOpacity>
        );
      case "In Progress":
        return (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "blue" }]}
            onPress={() => updateStatus(item.id, "Completed")}
          >
            <Text style={styles.buttonText}>Mark Completed</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Appointments</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>Name Plate:</Text>
            <Text>{item.namePlateNumber}</Text>

            <Text style={styles.label}>Description:</Text>
            <Text>{item.description}</Text>

            <Text style={styles.label}>Status:</Text>
            <Text>{item.status || "Pending"}</Text>

            {renderStatusButton(item)}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 15,
  },
  label: { fontWeight: "bold", marginTop: 5 },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

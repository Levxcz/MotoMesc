import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";

type Appointment = {
  id: string;
  title: string;
  description: string;
  date: string; // Can be a Firestore Timestamp or string
  status: string; // e.g., 'Scheduled', 'Completed', 'Canceled'
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAppointments = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("No user logged in.");
        return;
      }

      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("userId", "==", currentUser.uid)); // Filter by current user's ID
      const snapshot = await getDocs(q);
      const appointmentList: Appointment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toLocaleString(), // Format Firestore timestamp
      })) as Appointment[];

      setAppointments(appointmentList);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Alert.alert("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentPress = (id: string) => {
    // Navigate to a detailed view of the appointment
    
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Appointments</Text>

      {appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No appointments available.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>Date: {item.date}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>

              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => handleAppointmentPress(item.id)}
              >
                <Text style={styles.btnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  noAppointments: { textAlign: "center", fontSize: 18, color: "gray" },
  appointmentCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 16, marginVertical: 5 },
  date: { fontSize: 14, color: "gray" },
  status: { fontSize: 14, color: "gray" },
  detailsBtn: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

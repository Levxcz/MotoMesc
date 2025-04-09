import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Define the Shop type
type Shop = {
  id: string;
  name: string;
  description: string;
  location: string;
  owner: string;
};

// Define the Appointment type
type Appointment = {
  id: string;
  shopId: string;
  customerId: string;
  description: string;
  plateNumber: string;
  motorImage: string;
};

export default function SellerHomeScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [appointmentsByShop, setAppointmentsByShop] = useState<Record<string, Appointment[]>>({});

  const fetchAppointments = async (shopId: string) => {
    try {
      const q = query(collection(db, "appointments"), where("shopId", "==", shopId));
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Appointment, "id">),
      }));
      return appointments;
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      return [];
    }
  };

  const fetchShops = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user is logged in");
        return;
      }

      const q = query(collection(db, "shops"), where("owner", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const shopsList: Shop[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Shop, "id">),
      }));
      setShops(shopsList);

      // Fetch appointments for each shop
      const appointmentsMap: Record<string, Appointment[]> = {};
      for (const shop of shopsList) {
        const appointments = await fetchAppointments(shop.id);
        appointmentsMap[shop.id] = appointments;
      }
      setAppointmentsByShop(appointmentsMap);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const handleDelete = async (shopId: string) => {
    try {
      await deleteDoc(doc(db, "shops", shopId));
      Alert.alert("Shop deleted");
      fetchShops(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Navigate to login screen
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Seller!</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/UploadShop")}>
        <Text style={styles.buttonText}>Upload Shop</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "blue" }]}
        onPress={() => router.push("/SellerAppointmentsScreen")}
      >
        <Text style={styles.buttonText}>View Appointments</Text>
      </TouchableOpacity>

      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.shopCard}>
            <Text style={styles.shopName}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>{item.location}</Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "orange" }]}
              onPress={() => router.push({ pathname: "/EditShop", params: { id: item.id } })}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "red" }]}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 10, fontWeight: "bold" }}>Appointments:</Text>
            {appointmentsByShop[item.id] && appointmentsByShop[item.id].length > 0 ? (
              appointmentsByShop[item.id].map((appt) => (
                <View key={appt.id} style={styles.appointmentCard}>
                  <Text style={{ fontWeight: "bold" }}>Plate: {appt.plateNumber}</Text>
                  <Text>Description: {appt.description}</Text>
                  {appt.motorImage ? (
                    <Image
                      source={{ uri: appt.motorImage }}
                      style={{ width: "100%", height: 150, marginTop: 5, borderRadius: 5 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text>No image provided</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ color: "gray" }}>No Appointments</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: "gray" }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  button: { backgroundColor: "green", padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "white", textAlign: "center" },
  shopCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

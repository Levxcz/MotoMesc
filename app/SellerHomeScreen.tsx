import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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

// Types
type Shop = {
  id: string;
  name: string;
  description: string;
  location: string;
  owner: string;
};

type Appointment = {
  id: string;
  shopId: string;
};

export default function SellerHomeScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [appointmentShopIds, setAppointmentShopIds] = useState<Set<string>>(new Set());

  // 🔒 BACK BUTTON GUARD (Disable going back)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Prevent default back behavior
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const fetchAppointmentsByShop = async (shopIds: string[]) => {
    try {
      const q = query(collection(db, "appointments"), where("shopId", "in", shopIds));
      const snapshot = await getDocs(q);

      const shopIdSet = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data() as Appointment;
        shopIdSet.add(data.shopId);
      });

      setAppointmentShopIds(shopIdSet);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  const fetchShops = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "shops"), where("owner", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const shopsList: Shop[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Shop, "id">),
      }));

      setShops(shopsList);

      const shopIds = shopsList.map((shop) => shop.id);
      if (shopIds.length > 0) await fetchAppointmentsByShop(shopIds);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const handleDelete = async (shopId: string) => {
    try {
      await deleteDoc(doc(db, "shops", shopId));
      Alert.alert("Shop deleted");
      fetchShops();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to login or landing page
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
});

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

// Define the Shop type
type Shop = {
  id: string;
  name: string;
  description: string;
  location: string;
  owner: string;
};

export default function SellerHomeScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);

  const fetchShops = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user is logged in");
        return;
      }

      const q = query(collection(db, "shops"), where("owner", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const shopsList: Shop[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Shop, "id">),
      }));
      setShops(shopsList);
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
      router.push("/");
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

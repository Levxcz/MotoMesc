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
import { collection, getDocs, query } from "firebase/firestore";

type Shop = {
  id: string;
  name: string;
  description: string;
  location: string;
  image?: string;
};

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedShops = async () => {
    try {
      const q = query(collection(db, "shops"));
      const snapshot = await getDocs(q);
      const shopList: Shop[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shop[];
      setShops(shopList);
    } catch (error) {
      console.error("Error fetching shops:", error);
      Alert.alert("Failed to load shops.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Change if your login route is different
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    fetchApprovedShops();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Customer!</Text>

      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading shops...</Text>
      ) : shops.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>No shops available.</Text>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.shopCard}>
              {item.image && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.image}` }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.shopName}>{item.name}</Text>
              <Text>{item.description}</Text>
              <Text>{item.location}</Text>

              <TouchableOpacity
  style={[styles.button, { backgroundColor: "blue" }]}
  onPress={() => router.push(`/ViewShop?shopId=${item.id}`)} // Use `item.id` instead of `shop.id`
>
  <Text style={styles.buttonText}>View Shop</Text>
</TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "gray", marginTop: 10 }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  shopCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

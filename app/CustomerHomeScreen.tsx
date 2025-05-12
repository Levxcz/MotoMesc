import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebaseConfig";
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
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  // 🔒 Authentication guard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/"); // Redirect to login
      } else {
        fetchApprovedShops();
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔙 Custom back handler only when this screen is focused
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(
          "Hold on!",
          "Do you want to logout or exit the app?",
          [
            {
              text: "Logout",
              onPress: async () => {
                await AsyncStorage.removeItem("role");
                router.replace("/");
              },
            },
            {
              text: "Exit App",
              onPress: () => BackHandler.exitApp(),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => backHandler.remove();
    }, [])
  );

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Customer!</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading shops...</Text>
      ) : shops.length === 0 ? (
        <Text style={styles.loadingText}>No shops available.</Text>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.shopCard}>
              {item.image && (
                <Image
                  source={{ uri: item.image }} // Use the image URL directly
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.shopName}>{item.name}</Text>
              <Text>{item.description}</Text>
              <Text>{item.location}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push(`/ViewShop?shopId=${item.id}`)}
              >
                <Text style={styles.buttonText}>View Shop</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.navContainer}>
        <TouchableOpacity onPress={() => router.push("/CustomerHomeScreen")}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/Notifications")}>
          <Text style={styles.navText}>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/Profile")}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/Appointments")}>
          <Text style={styles.navText}>Appointments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, backgroundColor: "#f2f3f4"},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", borderRadius: 5, marginBottom: 10, backgroundColor: "BDD5E7",},
  loadingText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  shopCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
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
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#eee",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

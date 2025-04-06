import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Shop {
  name: string;
  description: string;
  location: string;
  image?: string;
  offersParts: boolean;
  offersService: boolean;
  createdAt: any;
  owner: string;
}

export default function ViewShop() {
  const { shopId } = useLocalSearchParams(); // Use `shopId` to match the query parameter name
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        console.log(`Fetching shop with ID: ${shopId}`); // Add logging to verify shopId
        if (!shopId) {
          console.log("No shopId provided");
          setShop(null);
          setLoading(false);
          return;
        }

        const docRef = doc(db, "shops", shopId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Shop data:", docSnap.data()); // Log the shop data for debugging
          setShop(docSnap.data() as Shop);
        } else {
          console.log("Shop not found with that ID.");
          setShop(null); // Trigger the "Shop not found" message
        }
      } catch (error) {
        console.error("Failed to fetch shop:", error);
        setShop(null); // Ensure it's set to null on error
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0000ff" />;
  if (!shop) return <Text style={{ padding: 20 }}>Shop not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {shop.image && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${shop.image}` }}
          style={styles.image}
        />
      )}
      <Text style={styles.name}>{shop.name}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.text}>{shop.description}</Text>

      <Text style={styles.label}>Location:</Text>
      <Text style={styles.text}>{shop.location}</Text>

      <Text style={styles.label}>Availability:</Text>
      <Text style={styles.text}>
        {shop.offersParts ? "✓ Motorcycle Parts" : "✗ Motorcycle Parts"}
      </Text>
      <Text style={styles.text}>
        {shop.offersService ? "✓ Motorcycle Services" : "✗ Motorcycle Services"}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});

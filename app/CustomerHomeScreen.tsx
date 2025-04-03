import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  tag: "All" | "Both" | "Items" | "Service";
  image: string;
}

export default function CustomerHomeScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "stores"));
        const storeData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Store[];
        setStores(storeData);
        setFilteredStores(storeData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  const filterStores = (category: string) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredStores(stores);
    } else {
      setFilteredStores(stores.filter((store) => store.tag === category));
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <Text style={styles.title}>MOTOMESC</Text>
      </View>

      {/* Search Bar */}
      <TextInput style={styles.searchBar} placeholder="Search" />

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {["All", "Both", "Items", "Service"].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterButton, activeFilter === category && styles.activeFilter]}
            onPress={() => filterStores(category)}
          >
            <Text style={[styles.filterText, activeFilter === category && styles.activeFilterText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Store List */}
      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.storeCard}>
            <Image source={{ uri: item.image }} style={styles.storeImage} />
            <Text style={styles.storeName}>{item.name}</Text>
            <Text style={styles.storeLocation}>{item.location}</Text>
            <Text style={styles.storeRating}>⭐ {item.rating}</Text>
            <View style={[styles.tag, item.tag === "Service" ? styles.serviceTag : styles.itemTag]}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  topBar: { backgroundColor: "#007AFF", padding: 15, alignItems: "center" },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  searchBar: { backgroundColor: "#F1F1F1", padding: 10, marginVertical: 10, borderRadius: 8 },
  filterContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  filterButton: { padding: 10, borderRadius: 5, backgroundColor: "#E5E5E5" },
  activeFilter: { backgroundColor: "#007AFF" },
  filterText: { fontSize: 14, color: "#333" },
  activeFilterText: { color: "#fff", fontWeight: "bold" },
  storeCard: { flex: 1, margin: 5, padding: 10, backgroundColor: "#FFF", borderRadius: 10, alignItems: "center" },
  storeImage: { width: 100, height: 100, borderRadius: 10 },
  storeName: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  storeLocation: { fontSize: 12, color: "gray" },
  storeRating: { fontSize: 14, marginTop: 5 },
  tag: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, marginTop: 5 },
  serviceTag: { backgroundColor: "green" },
  itemTag: { backgroundColor: "blue" },
  tagText: { color: "white", fontSize: 12 },
});

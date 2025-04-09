import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as ImagePicker from "expo-image-picker";

interface Shop {
  name: string;
  description: string;
  location: string;
  image: string | null;
  offersParts: boolean;
  offersService: boolean;
}

export default function EditShop() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [shop, setShop] = useState<Shop>({
    name: "",
    description: "",
    location: "",
    image: null,
    offersParts: false,
    offersService: false,
  });

  useEffect(() => {
    const loadShop = async () => {
      if (!id) return;

      const docRef = doc(db, "shops", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setShop({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          image: data.image || null,
          offersParts: data.offersParts || false,
          offersService: data.offersService || false,
        });
      }
    };

    loadShop();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64Image = result.assets[0].base64;
      if (base64Image) {
        setShop((prev) => ({
          ...prev,
          image: base64Image,
        }));
      }
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    try {
      await updateDoc(doc(db, "shops", id), {
        name: shop.name,
        description: shop.description,
        location: shop.location,
        image: shop.image,
        offersParts: shop.offersParts,
        offersService: shop.offersService,
      });

      Alert.alert("Shop updated!");
      router.replace("/SellerHomeScreen");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Update failed!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Shop Name</Text>
      <TextInput
        style={styles.input}
        value={shop.name}
        onChangeText={(text) => setShop({ ...shop, name: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={shop.description}
        onChangeText={(text) => setShop({ ...shop, description: text })}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={shop.location}
        onChangeText={(text) => setShop({ ...shop, location: text })}
      />

      <Button title="Pick New Image" onPress={pickImage} />
      {shop.image && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${shop.image}` }}
          style={{ width: 100, height: 100, marginTop: 10 }}
        />
      )}

      <View style={styles.switchContainer}>
        <Text>Offers Motorcycle Parts</Text>
        <Switch
          value={shop.offersParts}
          onValueChange={(val) => setShop({ ...shop, offersParts: val })}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text>Offers Motorcycle Services</Text>
        <Switch
          value={shop.offersService}
          onValueChange={(val) => setShop({ ...shop, offersService: val })}
        />
      </View>

      <Button title="Update Shop" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginTop: 15, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    justifyContent: "space-between",
  },
});

import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Switch } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

const db = getFirestore();

export default function UploadShop() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [offersParts, setOffersParts] = useState(false);
  const [offersService, setOffersService] = useState(false);

  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      if (selectedAsset.base64) {
        setImage(`data:image/jpeg;base64,${selectedAsset.base64}`);
      } else {
        Alert.alert("Base64 data is missing from the selected image.");
      }
    }
  };

  const handleUpload = async () => {
    if (!name || !description || !location) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Not logged in!");
        return;
      }

      const shopRef = doc(collection(db, "shops"));
      const shopId = shopRef.id;

      await setDoc(shopRef, {
        shopId,
        name,
        description,
        location,
        image,
        offersParts,
        offersService,
        owner: user.uid,
        createdAt: Timestamp.now(),
      });

      Alert.alert("Shop uploaded!");
      router.replace("/SellerHomeScreen");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload failed!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Shop Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />

      <Button title="Pick Image" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image }} style={{ width: 100, height: 100, marginTop: 10 }} />
      )}

      <View style={styles.switchContainer}>
        <Text>Offers Motorcycle Parts</Text>
        <Switch value={offersParts} onValueChange={setOffersParts} />
      </View>
      <View style={styles.switchContainer}>
        <Text>Offers Motorcycle Services</Text>
        <Switch value={offersService} onValueChange={setOffersService} />
      </View>

      <Button title="Upload Shop" onPress={handleUpload} />
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

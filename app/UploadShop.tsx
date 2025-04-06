import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Switch } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";

const db = getFirestore();

export default function UploadShop() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [offersParts, setOffersParts] = useState(false);
  const [offersService, setOffersService] = useState(false);

  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].base64);
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
  
      // Generate a document reference with a unique ID
      const shopRef = doc(collection(db, "shops"));
      const shopId = shopRef.id;
  
      // Now set the document with that ID, and include it in the data
      await setDoc(shopRef, {
        shopId,
        name,
        description,
        location,
        image, // base64 string
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
        <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={{ width: 100, height: 100, marginTop: 10 }} />
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

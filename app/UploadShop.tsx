import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

const db = getFirestore();

export default function UploadShop() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [businessPermit, setBusinessPermit] = useState<string | null>(null);
  const [validId, setValidId] = useState<string | null>(null);
  const [contactNumber, setContactNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [otherService, setOtherService] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();

  const serviceKeys = {
    "Engine Repairs 8hrs ": "engineRepairs",
    "Transmission Repairs": "transmissionRepairs",
    "Electrical Repairs": "electricalRepairs",
    "Brake Repairs": "brakeRepairs",
    "Suspension Repairs": "suspensionRepairs",
    "Oil Change": "oilChange",
    "Tire Replacement and Balancing": "tireReplacementAndBalancing",
    "Chain Maintenance": "chainMaintenance",
    "Tune-ups": "tuneUps",
    "Body Kits": "bodyKits",
    "Performance Upgrades": "performanceUpgrades",
    "Seat and Handlebar Modifications": "seatHandlebarModifications",
    "Parts Replacement": "partsReplacement",
    "Motorcycle Gear": "motorcycleGear",
    "Accessories": "accessories",
    "Battery Installation": "batteryInstallation",
    "Battery Testing": "batteryTesting",
    "Carburetor Cleaning and Tuning": "carburetorCleaning",
    "Fuel Injector Cleaning": "fuelInjectorCleaning",
    "Puncture Repairs": "punctureRepairs",
    "Tire Installation": "tireInstallation",
    "Tire Balancing": "tireBalancing",
    "General Inspections": "generalInspections",
    "Computerized Diagnostics": "computerizedDiagnostics",
    "Registration Assistance": "registrationAssistance",
    Insurance: "insurance",
    "Motorcycle Washing and Detailing": "washingDetailing",
  };

  const [serviceToggles, setServiceToggles] = useState(
    Object.fromEntries(Object.values(serviceKeys).map((key) => [key, false]))
  );

  const pickImage = async (setImageCallback: (uri: string | null) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      if (selectedAsset.base64) {
        setImageCallback(`data:image/jpeg;base64,${selectedAsset.base64}`);
      } else {
        Alert.alert("Base64 data is missing from the selected image.");
      }
    }
  };

  const handleServiceToggle = (key: string) => {
    setServiceToggles((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const selected = Object.keys(updated).filter((k) => updated[k]);
      setServices(selected);
      return updated;
    });
  };

  const handleAddCustomService = () => {
    if (otherService.trim()) {
      setServices((prev) => [...prev, otherService.trim()]);
      setOtherService("");
    } else {
      Alert.alert("Please enter a valid custom service.");
    }
  };

  const handleUpload = async () => {
    if (!name || !description || !location || !contactNumber || !postalCode || !businessPermit || !validId) {
      Alert.alert("Please fill in all fields and upload all required documents.");
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
        businessPermit,
        validId,
        contactNumber,
        postalCode,
        services,
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
    <ScrollView style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.label}>Shop Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} />

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
          />

          <Button title="Next" onPress={() => setStep(2)} />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.label}>Shop Image</Text>
          <Button title="Pick Image" onPress={() => pickImage(setImage)} />
          {image && <Image source={{ uri: image }} style={styles.image} />}

          <Text style={styles.label}>Business Permit</Text>
          <Button title="Upload Business Permit" onPress={() => pickImage(setBusinessPermit)} />
          {businessPermit && <Text style={styles.uploadedText}>Business Permit Uploaded</Text>}

          <Text style={styles.label}>Valid ID</Text>
          <Button title="Upload Valid ID" onPress={() => pickImage(setValidId)} />
          {validId && <Text style={styles.uploadedText}>Valid ID Uploaded</Text>}

          <Button title="Next" onPress={() => setStep(3)} />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.label}>Services Offered</Text>

          {Object.entries(serviceKeys).map(([label, key]) => (
            <View key={label} style={styles.toggleContainer}>
              <Text style={styles.serviceText}>{label}</Text>
              <Switch
                value={serviceToggles[key]}
                onValueChange={() => handleServiceToggle(key)}
              />
            </View>
          ))}

          <TextInput
            style={styles.input}
            placeholder="Enter other services"
            value={otherService}
            onChangeText={setOtherService}
          />
          <Button title="Add Custom Service" onPress={handleAddCustomService} />
          <Button title="Submit" onPress={handleUpload} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  uploadedText: {
    fontSize: 14,
    color: "green",
    marginBottom: 10,
  },
});

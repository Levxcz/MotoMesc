import React, { useEffect, useState } from "react";
import { query, where, getDocs } from "firebase/firestore";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

interface Shop {
  name: string;
  description: string;
  location: string;
  image?: string;
  offersParts: boolean;
  offersService: boolean;
  createdAt: any;
  owner: string;
  services?: string[];
  gcashQrCode?: string; // Add GCash QR Code field
}

const ViewShop: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [description, setDescription] = useState("");
  const [motoImage, setMotoImage] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null); // For payment receipt
  const [firstName, setFirstName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [lastName, setLastName] = useState("");

  const route = useRoute();
  const { shopId } = route.params as { shopId: string };

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const shopRef = doc(db, "shops", shopId);
        const shopSnap = await getDoc(shopRef);
        if (shopSnap.exists()) {
          const shopData = shopSnap.data() as Shop;
          setShop(shopData);
        } else {
          console.log("No such shop!");
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomerDetails = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
          }
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    fetchShopDetails();
    fetchCustomerDetails();
  }, [shopId]);

  const pickImage = async (setImageCallback: (uri: string | null) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageCallback(result.assets[0].uri);
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!plateNumber || !description || !motoImage || !appointmentDate || !receiptImage) {
      alert("Please complete all fields, including uploading the payment receipt.");
      return;
    }

    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate);
    if (!isValidDate) {
      alert("Invalid date format. Please use YYYY-MM-DD.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to make an appointment.");
        return;
      }

      const uid = user.uid;

      // Check for existing pending appointment for the same shop
      const q = query(
        collection(db, "appointments"),
        where("uid", "==", uid),
        where("shopId", "==", shopId),
        where("status", "==", "Pending")
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("You already have a pending appointment at this shop.");
        return;
      }

      // Add new appointment
      const docRef = await addDoc(collection(db, "appointments"), {
        appointmentId: "",
        shopId,
        uid,
        plateNumber,
        description,
        image: motoImage,
        receiptImage, // Save the payment receipt
        createdAt: serverTimestamp(),
        appointmentDate, // Save as string
        customerName: `${firstName} ${lastName}`,
        status: "Pending",
      });

      // Update the document with its own ID
      await setDoc(
        doc(db, "appointments", docRef.id),
        { appointmentId: docRef.id },
        { merge: true }
      );

      alert("Appointment submitted!");
      setModalVisible(false);
      setPlateNumber("");
      setDescription("");
      setMotoImage(null);
      setReceiptImage(null);
      setAppointmentDate("");
    } catch (error) {
      console.error("Error making appointment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Shop not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {shop.image && <Image source={{ uri: shop.image }} style={styles.shopImage} />}
      <Text style={styles.shopName}>{shop.name}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.text}>{shop.description}</Text>
      <Text style={styles.label}>Location:</Text>
      <Text style={styles.text}>{shop.location}</Text>
      <Text style={styles.label}>Availability:</Text>
      <Text style={styles.text}>
        {shop.offersService ? "✓ Motorcycle Services" : "✗ Motorcycle Services"}
      </Text>
      <Text style={styles.text}>
        {shop.offersParts ? "✓ Motorcycle Parts" : "✗ Motorcycle Parts"}
      </Text>
      <Text style={styles.label}>Services Offered:</Text>
      {shop.services && shop.services.length > 0 ? (
        shop.services.map((serviceKey) => (
          <Text key={serviceKey} style={styles.text}>
            • {serviceKey}
          </Text>
        ))
      ) : (
        <Text style={styles.text}>No services listed.</Text>
      )}

      {shop.gcashQrCode && (
        <>
          <Text style={styles.label}>GCash QR Code:</Text>
          <Image source={{ uri: shop.gcashQrCode }} style={styles.qrCodeImage} />
        </>
      )}

      <TouchableOpacity style={styles.appointmentBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnText}>Make Appointment</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScrollView}>
            <Text style={styles.modalTitle}>Book an Appointment</Text>
            <Text style={{ textAlign: "center", marginBottom: 10 }}>
              Customer: {firstName} {lastName}
            </Text>

            <TextInput
              placeholder="Plate Number"
              value={plateNumber}
              onChangeText={setPlateNumber}
              style={styles.input}
            />
            <TextInput
              placeholder="Describe the issue"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 100 }]}
              multiline
            />
            <TextInput
              placeholder="Enter appointment date (YYYY-MM-DD)"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              style={styles.input}
            />

            <TouchableOpacity onPress={() => pickImage(setMotoImage)} style={styles.uploadBtn}>
              <Text style={styles.btnText}>
                {motoImage ? "Change Motorcycle Image" : "Upload Motorcycle Photo"}
              </Text>
            </TouchableOpacity>
            {motoImage && <Image source={{ uri: motoImage }} style={styles.previewImage} />}

            {shop.gcashQrCode && (
              <>
                <Text style={styles.label}>GCash QR Code:</Text>
                <Image source={{ uri: shop.gcashQrCode }} style={styles.qrCodeImage} />
              </>
            )}

            <TouchableOpacity onPress={() => pickImage(setReceiptImage)} style={styles.uploadBtn}>
              <Text style={styles.btnText}>
                {receiptImage ? "Change Receipt Image" : "Upload Payment Receipt"}
              </Text>
            </TouchableOpacity>
            {receiptImage && <Image source={{ uri: receiptImage }} style={styles.previewImage} />}

            <Button title="Submit Appointment" onPress={handleAppointmentSubmit} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shopImage: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 10,
  },
  shopName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  appointmentBtn: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalScrollView: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  uploadBtn: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 150,
    marginBottom: 10,
    borderRadius: 10,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default ViewShop;

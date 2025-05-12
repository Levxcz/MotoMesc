import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useRouter } from "expo-router";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native"; // Import types

const Register = () => {
  const router = useRouter();

  const [role, setRole] = useState("customer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [roleLoading, setRoleLoading] = useState(false); // Role selection loading state

  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleRegisterPress = () => {
    const nameRegex = /^[A-Za-z]+$/;
    const phoneRegex = /^\d{11}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!firstName || !lastName || !email || !password || !phoneNumber || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
  
    if (!nameRegex.test(firstName)) {
      Alert.alert("Error", "First name should only contain letters.");
      return;
    }
  
    if (!nameRegex.test(lastName)) {
      Alert.alert("Error", "Last name should only contain letters.");
      return;
    }
  
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Error", "Phone number should be exactly 11 digits.");
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
  
    setShowTermsModal(true);
  };

  const handleAcceptTerms = async () => {
    setLoading(true); // Start loading
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role,
        firstName,
        lastName,
        email,
        phoneNumber,
        createdAt: new Date(),
      });

      setShowTermsModal(false);
      Alert.alert("Success", "Account created successfully!");

      // Navigate to Customer Home Screen
      router.replace("/CustomerHomeScreen");
    } catch (error) {
      console.log("Registration Error:", error);
      Alert.alert("Error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleRoleSelection = (selectedRole: string) => {
    setRoleLoading(true); // Start role selection loading
    setTimeout(() => {
      setRole(selectedRole);
      setRoleLoading(false); // Stop role selection loading
    }, 500); // Simulate a delay for better UX
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={styles.roleSelectionContainer}>
        {roleLoading ? (
          <ActivityIndicator size="small" color="#008CBA" />
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.roleCard,
                role === "customer" && styles.selectedRoleCard, // Highlight selected role
              ]}
              onPress={() => handleRoleSelection("customer")}
            >
              <Text style={styles.roleCardText}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleCard,
                role === "seller" && styles.selectedRoleCard, // Highlight selected role
              ]}
              onPress={() => handleRoleSelection("seller")}
            >
              <Text style={styles.roleCardText}>Seller</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegisterPress}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showTermsModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Terms and Conditions</Text>
          <ScrollView style={styles.termsContent} onScroll={handleScroll} scrollEventThrottle={16}>
            <Text>
              {/* Your actual terms content here */}
              {/* Make long so user has to scroll */}
              Welcome to MotoShop!{"\n\n"}(Terms...){'\n'.repeat(60)}
              End of Terms.
            </Text>
          </ScrollView>

          <TouchableOpacity
            disabled={!hasScrolledToBottom}
            onPress={handleAcceptTerms}
            style={[
              styles.acceptBtn,
              { backgroundColor: hasScrolledToBottom ? "#4CAF50" : "#ccc" },
            ]}
          >
            <Text style={styles.acceptText}>Accept Terms and Register</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  roleSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "40%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedRoleCard: {
    backgroundColor: "#008CBA",
    borderColor: "#0073A8",
  },
  roleCardText: {
    color: "#000",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
  },
  registerBtn: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  registerText: { color: "#fff", fontSize: 16 },
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  termsContent: { marginBottom: 20 },
  acceptBtn: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "bold" },
});

export default Register;

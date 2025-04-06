import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const Register = () => {
  const [role, setRole] = useState("customer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role,
        firstName,
        lastName,
        email,
        phoneNumber,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully!");
    } catch (error) {
      console.log("Registration Error:");
      Alert.alert("Error");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Select Role:</Text>
      <Button title="Customer" onPress={() => setRole("customer")} />
      <Button title="Seller" onPress={() => setRole("seller")} />

      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default Register;

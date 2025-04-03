import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useState } from "react";
import { loginUser } from "../authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
  
          Alert.alert("Success", "Login Successful");
  
          if (userData.role === "customer") {
            router.push("/CustomerHomeScreen"); // ✅ Use relative path
          } else {
            router.push("/SellerHomeScreen"); // ✅ Use relative path
          }
        } else {
          Alert.alert("Error", "User data not found.");
        }
      } else {
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
      
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")} style={styles.createAccountButton}>
        <Text style={styles.createAccountText}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", marginBottom: 10, borderRadius: 5 },
  loginButton: { backgroundColor: "blue", padding: 15, borderRadius: 5, width: "100%", alignItems: "center" },
  loginButtonText: { color: "white", fontWeight: "bold" },
  createAccountButton: { marginTop: 10 },
  createAccountText: { color: "blue", fontWeight: "bold" },
});

import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import { loginUser } from "../authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
      const user = await loginUser(email, password);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          Alert.alert("Success", "Login Successful");

          if (userData.role === "customer") {
            router.push("/CustomerHomeScreen");
          } else {
            router.push("/SellerHomeScreen");
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
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MOTODROID LOGIN</Text>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />

      {loading ? (
        <ActivityIndicator size="large" color="blue" /> // Loading indicator
      ) : (
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push("/register")} style={styles.createAccountButton}>
        <Text style={styles.createAccountText}>Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input:{
   borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal:16,
  paddingVertical: 12,
  marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText:  {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createAccountButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#333',
    fontSize: 16,
  },



  
  


});

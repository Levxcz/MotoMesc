import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { loginUser } from "../authService";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const user = await loginUser(email, password);
    if (user) {
      Alert.alert("Success", "Login Successful");
      router.push("../home"); // Redirect to home page
    } else {
      Alert.alert("Error", "Invalid email or password");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />

        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.createAccountText}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", marginBottom: 10, borderRadius: 5 },
  loginButton: { backgroundColor: "blue", padding: 15, borderRadius: 5, width: "100%", alignItems: "center" },
  loginButtonText: { color: "white", fontWeight: "bold" },
  createAccountText: { color: "blue", marginTop: 10 },
});

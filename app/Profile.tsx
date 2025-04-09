import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";

type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // Date created, formatted as a string (timestamp from Firebase)
};

export default function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("No user logged in.");
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          createdAt: data.createdAt.toDate().toLocaleDateString(), // Format Firestore timestamp to a readable date
        });
      } else {
        Alert.alert("User profile not found.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Adjust to your login screen route
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      {userProfile ? (
        <View style={styles.card}>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.value}>{userProfile.firstName}</Text>

          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.value}>{userProfile.lastName}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userProfile.email}</Text>

          <Text style={styles.label}>Date Created:</Text>
          <Text style={styles.value}>{userProfile.createdAt}</Text>
        </View>
      ) : (
        <Text style={{ textAlign: "center" }}>No profile data found.</Text>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: "#cc0000",
    padding: 12,
    borderRadius: 5,
    marginTop: 30,
  },
  logoutText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

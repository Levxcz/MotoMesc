import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function BottomNavBar() {
  const router = useRouter();

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity onPress={() => router.push("/CustomerHomeScreen")}>
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/Notifications")}>
        <Text style={styles.navText}>Notification</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/Profile")}>
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/Appointments")}>
        <Text style={styles.navText}>Appointments</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#eee",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  navText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

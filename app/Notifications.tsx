import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { firebase } from "../authService"; // Firebase Auth
import { fetchNotifications } from "../fetchNotifications";
import { markAsRead } from "../markAsRead";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: any; // Firestore Timestamp or null
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const currentUser = firebase.auth().currentUser;

      if (currentUser) {
        try {
          const fetchedNotifications = await fetchNotifications(currentUser.uid);
          setNotifications(fetchedNotifications as NotificationItem[]);
        } catch (error) {
          Alert.alert("Failed to load notifications.");
        } finally {
          setLoading(false);
        }
      } else {
        Alert.alert("No user is currently logged in.");
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      Alert.alert("Failed to mark as read.");
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text>No notifications available.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const timestamp = item.timestamp?.toDate?.() || new Date();
            return (
              <View style={styles.notificationCard}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timestamp}>{timestamp.toLocaleString()}</Text>

                {!item.read && (
                  <TouchableOpacity
                    style={styles.markAsReadBtn}
                    onPress={() => handleMarkAsRead(item.id)}
                  >
                    <Text style={styles.btnText}>Mark as Read</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  notificationCard: { backgroundColor: "#f5f5f5", padding: 15, marginBottom: 15, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: "bold" },
  message: { fontSize: 16, marginVertical: 5 },
  timestamp: { fontSize: 14, color: "gray" },
  markAsReadBtn: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5, marginTop: 10 },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

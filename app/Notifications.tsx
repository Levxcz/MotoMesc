import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useRouter } from "expo-router";

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string; // Store as string, could be a Firestore timestamp
  read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("No user logged in.");
        return;
      }

      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, orderBy("timestamp", "desc")); // Sort by most recent
      const snapshot = await getDocs(q);
      const notificationList: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toLocaleString(), // Format Firestore timestamp
      })) as Notification[];

      setNotifications(notificationList);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Here, you can update the read status of the notification in Firestore
    try {

      
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications available.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>

              {!item.read && (
                <TouchableOpacity
                  style={styles.markAsReadBtn}
                  onPress={() => handleMarkAsRead(item.id)}
                >
                  <Text style={styles.btnText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  noNotifications: { textAlign: "center", fontSize: 18, color: "gray" },
  notificationCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  message: { fontSize: 16, marginVertical: 5 },
  timestamp: { fontSize: 14, color: "gray" },
  markAsReadBtn: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

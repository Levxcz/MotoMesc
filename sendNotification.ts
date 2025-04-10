import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const sendNotification = async (userId: string, message: string) => {
  try {
    if (!userId || !message) {
      throw new Error('User ID or message is missing');
    }

    const notification = {
      title: "Appointment Update",
      message: message, // Make sure this is not undefined
      timestamp: new Date(),
      read: false,
      uid: userId, // Ensure that userId is valid and not undefined
    };

    console.log("Notification to be sent:", notification); // Debugging line

    // Reference to the notifications collection
    const notificationsRef = collection(db, 'notifications');

    // Adding the notification to Firestore
    await addDoc(notificationsRef, notification);

    console.log('Notification sent successfully!');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};


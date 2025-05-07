import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const sendNotification = async (
  uid: string,
  message: string,
  sellerComment?: string,
  suggestedTime?: string
) => {
  try {
    if (!uid || !message) {
      throw new Error('User ID or message is missing');
    }

    // Append sellerComment and suggestedTime to the message if provided
    const fullMessage = `${message}${
      sellerComment ? `\nComment: ${sellerComment}` : ''
    }${suggestedTime ? `\nSuggested Time: ${suggestedTime}` : ''}`;

    const notification = {
      title: "Appointment Update",
      message: fullMessage,
      timestamp: serverTimestamp(),
      read: false,
      uid: uid,
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



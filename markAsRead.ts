import { db } from './firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export const markAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    console.log(`Notification ${notificationId} marked as read.`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

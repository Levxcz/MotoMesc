import { db } from './firebaseConfig';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export const fetchNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('uid', '==', userId),     // ✅ match based on 'uid'
      orderBy('timestamp', 'desc')   // ✅ newest first
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

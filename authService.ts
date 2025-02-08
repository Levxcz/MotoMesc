import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Register User and Save to Firestore
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      email: user.email,
      createdAt: new Date().toISOString(),
      role: "user" // Default role, modify as needed
    });

    return user;
  } catch (error: any) {
    console.error("Registration Error:", error.message);
    return null;
  }
};

// Login User and Retrieve Firestore Data
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user data from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { user, userData: userSnap.data() };
    } else {
      console.warn("No user data found in Firestore.");
      return { user, userData: null };
    }
  } catch (error: any) {
    console.error("Login Error:", error.message);
    return null;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Logout Error:", error.message);
  }
};

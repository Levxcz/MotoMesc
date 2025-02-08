// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, deleteDoc, getDoc, onSnapshot} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKeBrs7FnA_769PLmNaxHCwgMzgZmBbDI",
  authDomain: "motomesc-ca033.firebaseapp.com",
  projectId: "motomesc-ca033",
  storageBucket: "motomesc-ca033.firebasestorage.app",
  messagingSenderId: "506394082244",
  appId: "1:506394082244:web:66f4bfe34349b909ad4291",
  measurementId: "G-CRN79Z0HGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { auth,app,doc,getDoc,setDoc,collection, getDocs, updateDoc, deleteDoc, onSnapshot,createUserWithEmailAndPassword,db};
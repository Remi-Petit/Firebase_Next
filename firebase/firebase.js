import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnxVe_3H7Ypf0dJcQZO1kegQWv3KWTgQk",
  authDomain: "e-commerce-a2e5f.firebaseapp.com",
  projectId: "e-commerce-a2e5f",
  storageBucket: "e-commerce-a2e5f.appspot.com",
  messagingSenderId: "289054162281",
  appId: "1:289054162281:web:4d2e2d8666ba7e26e411f8",
  measurementId: "G-7F8LJFTQ42",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }
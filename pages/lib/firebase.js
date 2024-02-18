import { useEffect, useState } from "react"
import { getApps, getApp, initializeApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAnxVe_3H7Ypf0dJcQZO1kegQWv3KWTgQk",
  authDomain: "e-commerce-a2e5f.firebaseapp.com",
  projectId: "e-commerce-a2e5f",
  storageBucket: "e-commerce-a2e5f.appspot.com",
  messagingSenderId: "289054162281",
  appId: "1:289054162281:web:4d2e2d8666ba7e26e411f8",
  measurementId: "G-7F8LJFTQ42",
}

//initialisation de l'application Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

//récupération de l'instance de l'authentification
const auth = getAuth(app)

//configuration de la persistance de l'authentification
setPersistence(auth, browserLocalPersistence)

//récupération de l'instance de Firestore
const db = getFirestore(app)

//hook personnalisé pour gérer l'authentification de l'utilisateur
const useAuth = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  return { user }
}

export { app, auth, db, useAuth }

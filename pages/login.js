import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import Link from "next/link";

import "tailwindcss/tailwind.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((response) => {
        router.push(`/`);
      })
      .catch((error) => {
        // Ici, on vérifie le code d'erreur pour afficher un message générique
        if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
          setError("Utilisateur ou mot de passe incorrect.");
        } else {
          setError("Utilisateur ou mot de passe incorrect.");
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignIn} className="max-w-md p-4 bg-white shadow-md rounded-md">
        <label className="block mb-2 text-sm font-medium text-gray-600">
          Adresse mail :
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </label>

        <label className="block mb-2 text-sm font-medium text-gray-600">
          Mot de passe :
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </label>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="text-center text-4xl p-3 text-amber-100 rounded-md w-full bg-green-400 hover:bg-blue-500"
        >
          Connexion
        </button>

        <p className="text-gray-600 text-sm mt-2">
          Pas de compte ? <Link href="/register">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}

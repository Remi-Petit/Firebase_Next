import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../../lib/firebase";
import Link from 'next/link';

export default function Account() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState("");
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists() && docSnap.data().role === "vendeur") {
            setUserData(docSnap.data());
          } else {
            router.push("/");
          }
        });
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePublishProduct = async (e) => {
    e.preventDefault();
    setPublishSuccessMsg("");
    setPublishError("");

    if (!productName.trim() || !productPrice) {
      setPublishError("Informations manquantes");
      return;
    }

    const price = parseFloat(productPrice);
    if (!Number.isInteger(price)) {
      setPublishError("Bien essayé mais non, il faut un int pour le prix.");
      return;
    }

    let imageUrl = "/Images/noImage/noImage";
    if (selectedImageFile) {
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `Images/${generateUniqueFileName()}`);
        await uploadBytes(storageRef, selectedImageFile);
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image :", error);
      }
    }

    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price,
        imageUrl,
      });
      setPublishSuccessMsg(`Le produit "${productName}" a bien été ajouté.`);
      setProductName("");
      setProductPrice("");
      setSelectedImageFile(null);
    } catch (error) {
      console.error("Erreur lors de la publication du produit :", error);
      setPublishError("Erreur lors de la publication du produit.");
    }
  };

  const handleChange = setter => e => {
    setter(e.target.value);
    if (publishError) setPublishError("");
  };

  const generateUniqueFileName = () => `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Link href="/products">Retour</Link>
      <form onSubmit={handlePublishProduct} className="bg-gray-100 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Publier un produit</h2>
        {/* Formulaire */}
        <div className="mb-4">
          <label className="block text-gray-700">Nom du produit:</label>
          <input
            type="text"
            value={productName}
            onChange={handleChange(setProductName)}
            className="mt-1 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Prix du produit:</label>
          <input
            type="number"
            value={productPrice}
            onChange={handleChange(setProductPrice)}
            className="mt-1 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Image du produit:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImageFile(e.target.files[0])}
            className="mt-1 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Publier le produit
        </button>

        {publishSuccessMsg && <p className="text-green-500 mt-2">{publishSuccessMsg}</p>}
        {publishError && <p className="text-red-500 mt-2">{publishError}</p>}
      </form>
    </main>
  );
}

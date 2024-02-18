// pages/account.js
import { Inter } from "next/font/google";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Utilisation de l'emplacement commun
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const inter = Inter({ subsets: ["latin"] });

export default function Account() {
  const router = useRouter();
  const { uid } = router.query;
  const [userData, setUserData] = useState(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (uid) {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const fetchedUserData = docSnap.data();
            setUserData(fetchedUserData);
            console.log("Document data:", fetchedUserData);
          } else {
            console.log("Pas de data récupérées");
          }
        }
      } catch (error) {
        console.error("catch sur les data récupérées:", error);
      }
    };

    fetchUserData();
  }, [uid]);

  const userRole = userData?.role || "utilisateur";

  const handlePublishProduct = async (e) => {
    e.preventDefault();

    try {
      const storage = getStorage();
      const imageRef = ref(
        storage,
        `Images/${generateUniqueFileName()}`
      );
      await uploadBytes(imageRef, selectedImageFile);

      const productDetails = {
        name: productName,
        price: parseFloat(productPrice),
        imageUrl: imageRef.fullPath,
      };

      const productsCollectionRef = collection(db, "products");
      await addDoc(productsCollectionRef, productDetails);

      console.log("Produit publié avec succès !");
      setPublishSuccessMsg(`Le produit "${productName}" a bien été ajouté`);
    } catch (error) {
      console.error("Erreur lors de la publication du produit :", error);
    }
  };

  const generateUniqueFileName = () => {
    return `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors bg-neutral-100">
          <h2 className={`mb-3 text-2xl font-semibold`}>Bienvenue</h2>
          <p className={`m-0 max-w-[30ch] text-sm`}>
            {`Bienvenue, vous êtes ${
              userRole === "vendeur" ? "vendeur" : "client"
            }`}
          </p>
        </div>
      </div>

      {userRole === "vendeur" && (
        <form
          onSubmit={handlePublishProduct}
          className="max-w-md mx-auto bg-gray-100 p-8 rounded-md shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-4">Publier un produit</h2>

          <label className="block mb-4">
            <span className="text-gray-700">Nom du produit:</span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 p-2 w-full rounded-md border focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Prix du produit:</span>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="mt-1 p-2 w-full rounded-md border focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Image du produit:</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImageFile(e.target.files[0])}
              className="mt-1 p-2 w-full rounded-md border focus:outline-none focus:ring focus:border-blue-300"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            Publier le produit
          </button>

          {publishSuccessMsg && (
            <p className="text-green-600 mt-2">{publishSuccessMsg}</p>
          )}
        </form>
      )}
    </main>
  );
}

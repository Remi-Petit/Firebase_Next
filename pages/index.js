import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/Layout";
import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from './lib/firebase';
import Link from 'next/link'

const inter = Inter({ subsets: ["latin"] });

export default function VoirProduits() {
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true); // Ajoutez un état pour gérer le chargement

    useEffect(() => {
        const fetchProduits = async () => {
            const querySnapshot = await getDocs(collection(db, "products")); // Remplacez "products" par le nom de votre collection
            const produitsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                let imageUrl = '';
                console.log(data.imageUrl);
                try {
                    imageUrl = await getDownloadURL(ref(getStorage(), data.imageUrl));
                    console.log(imageUrl);
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    imageUrl = 'Images/Products/Pierre/background.jpg'; // Mettez ici une URL d'image par défaut si nécessaire
                }
                return { id: doc.id, ...data, imageUrl };
            }));
            setProduits(produitsData);
            setLoading(false); // Définissez le chargement sur false une fois les données chargées
        };

        fetchProduits();
    }, []);

    // Si les données ne sont pas encore chargées, affichez un indicateur de chargement
    if (loading) {
        return <div>Loading...</div>;
    }

    // Une fois les données chargées, affichez le contenu du composant
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 bg-white">
          <h1 className="text-3xl font-bold mb-4 text-center text-black">Liste des produits</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produits.map((produit) => (
                    <Link href={`/product/${produit.id}`} key={produit.id}>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={produit.imageUrl} alt={produit.name} className="w-full h-48 object-cover object-center" />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">{produit.name}</h2>
                                <p className="text-gray-600">{produit.description}</p>
                                <p className="text-gray-800 font-bold mt-2">{produit.price} €</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </Layout>
    );
}

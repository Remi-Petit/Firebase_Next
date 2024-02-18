import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"; // Ajout de deleteDoc et doc
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from './../lib/firebase';
import Link from 'next/link';
import { Inter } from "next/font/google";
import Layout from "../../components/Layout";

const inter = Inter({ subsets: ["latin"] });

export default function VoirProduitsAdmin() {
    const [produits, setProduits] = useState([]);

    useEffect(() => {
        const fetchProduits = async () => {
            const querySnapshot = await getDocs(collection(db, "products"));
            const produitsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const data = doc.data();
                let imageUrl = '';
                try {
                    imageUrl = await getDownloadURL(ref(getStorage(), data.imageUrl));
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    imageUrl = 'Images/Products/Pierre/background.jpg'; // URL d'image par défaut si nécessaire
                }
                return { id: doc.id, ...data, imageUrl };
            }));
            setProduits(produitsData);
        };

        fetchProduits();
    }, []);

    const confirmDelete = async (productId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            await deleteProduct(productId);
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await deleteDoc(doc(db, "products", productId));
            alert("Produit supprimé avec succès !");
            setProduits(produits.filter(produit => produit.id !== productId)); // Mise à jour de l'état au lieu de recharger la page
        } catch (error) {
            console.error("Erreur lors de la suppression du produit :", error);
        }
    };

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4 text-center">Liste des Produits</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Nom</th>
                            <th className="px-4 py-2">Prix</th>
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2" colSpan={2}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produits.map((produit) => (
                            <tr key={produit.id} className="border-b border-gray-300">
                                <td className="px-4 py-2">{produit.name}</td>
                                <td className="px-4 py-2">{produit.price} €</td>
                                <td className="px-4 py-2">
                                    <img src={produit.imageUrl} alt={produit.name} className="w-12 h-12 object-cover object-center" />
                                </td>
                                <td>
                                <Link href={`/products/edit/${produit.id}`}>Modifier</Link>
                                </td>
                                <td>
                                    <button onClick={() => confirmDelete(produit.id)}>Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </Layout>
    );
}

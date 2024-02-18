import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db, auth } from './../lib/firebase'; // Assurez-vous que ces imports sont corrects
import Link from 'next/link';
import Layout from "../../components/Layout";
import { onAuthStateChanged } from 'firebase/auth';

export default function VoirProduitsAdmin() {
    const [produits, setProduits] = useState([]);
    const [userId, setUserId] = useState(""); // Pour stocker l'ID de l'utilisateur
    const [userRole, setUserRole] = useState(null); // Pour stocker le rôle de l'utilisateur
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/');
            } else {
                setUserId(user.uid); // Stocker l'ID de l'utilisateur
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setUserRole(userData.role); // Mise à jour de l'état avec le rôle de l'utilisateur
                    if (userData.role === "vendeur") {
                        fetchProduits();
                    } else {
                        router.push('/');
                    }
                } else {
                    console.log("No such document!");
                    router.push('/');
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchProduits = async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        const produitsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let imageUrl = '';
            try {
                const imageRef = ref(getStorage(), data.imageUrl);
                imageUrl = await getDownloadURL(imageRef);
            } catch (error) {
                console.error("Error fetching image URL:", error);
                imageUrl = await getDownloadURL(ref(getStorage(), 'Images/noImage/noImage.jpg'));
            }
            return { id: doc.id, ...data, imageUrl };
        }));
        setProduits(produitsData);
    };

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

    // Contenu de la page
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4 text-center">Liste des Produits</h1>
                <Link href={`/account/${userId}`}>
                    Ajouter
                </Link>
                {userRole === "vendeur" && (
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
                                            <Link href={`/products/edit/${produit.id}`}>
                                                Modifier
                                            </Link>
                                        </td>
                                        <td>
                                            <button onClick={() => confirmDelete(produit.id)}>Supprimer</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}

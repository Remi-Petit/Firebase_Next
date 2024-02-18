import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '../../../lib/firebase'; // Assurez-vous que le chemin d'importation est correct
import { onAuthStateChanged } from 'firebase/auth';
import Layout from "../../../../components/Layout";
import Link from 'next/link';

export default function EditProductPage() {
    const [product, setProduct] = useState({ name: '', price: '', imageUrl: '' });
    const [newImage, setNewImage] = useState(null);
    const router = useRouter();
    const { uid } = router.query;

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Récupération des données de l'utilisateur connecté pour vérifier son rôle
                const userDocRef = doc(db, "users", user.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists() && docSnap.data().role === "vendeur") {
                        // L'utilisateur est un vendeur, continuer à charger le produit
                        fetchProduct();
                    } else {
                        // L'utilisateur n'est pas un vendeur, le rediriger
                        router.push("/");
                    }
                });
            } else {
                // Aucun utilisateur connecté, rediriger vers la page de connexion ou d'accueil
                router.push("/login");
            }
        });
    }, [router, uid]);

    const fetchProduct = async () => {
        if (!uid) return;
        const docRef = doc(db, "products", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            let imageUrl;
            try {
                imageUrl = await getDownloadURL(storageRef(getStorage(), data.imageUrl));
            } catch (error) {
                console.error("Error fetching image URL:", error);
                imageUrl = '/Images/noImage/noImage.jpg'; // Utilisez une image par défaut si nécessaire
            }
            setProduct({ ...data, imageUrl });
        } else {
            console.log("No such document!");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageUrl = product.imageUrl;

        if (newImage) {
            const storage = getStorage();
            const imageFileRef = storageRef(storage, `products/${newImage.name}_${Date.now()}`);
            await uploadBytes(imageFileRef, newImage);
            imageUrl = await getDownloadURL(imageFileRef);
        }

        const productRef = doc(db, "products", uid);
        await updateDoc(productRef, { ...product, imageUrl });

        alert("Produit mis à jour avec succès !");
        router.push('/products'); // Ajustez cette URL selon vos besoins
    };

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
        <div>
            <Link href={`/products`}>Retour</Link>
            <h1>Modifier le Produit</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Nom:</label>
                    <input type="text" id="name" name="name" value={product.name || ''} onChange={handleChange} className="text-black border-gray-300 bg-white p-2"/>
                </div>
                <div>
                    <label htmlFor="price">Prix:</label>
                    <input type="number" id="price" name="price" value={product.price || ''} onChange={handleChange} className="text-black border-gray-300 bg-white p-2"/>
                </div>
                <div>
                    <label htmlFor="imageUrl">Image Actuelle:</label>
                    <img src={product.imageUrl} alt="Produit" style={{ width: 100, height: 100 }} />
                </div>
                <div>
                    <label htmlFor="newImage">Nouvelle Image:</label>
                    <input type="file" id="newImage" name="newImage" onChange={handleImageChange} />
                </div>
                <button type="submit">Mettre à jour</button>
            </form>
        </div>
        </Layout>
    );
}

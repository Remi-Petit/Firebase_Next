import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../lib/firebase';
import { Inter } from "next/font/google";
import Layout from "../../../../components/Layout";

export default function EditProductPage() {
    const [product, setProduct] = useState({ name: '', price: '', imageUrl: '' });
    const [newImage, setNewImage] = useState(null);
    const router = useRouter();
    const { uid } = router.query;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!uid) return;
            const docRef = doc(db, "products", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Supposons que data.imageUrl est un chemin dans Firebase Storage
                const imageUrl = await getDownloadURL(storageRef(getStorage(), data.imageUrl));
                setProduct({ ...data, imageUrl });
            } else {
                console.log("No such document!");
            }
        };

        fetchProduct();
    }, [uid]);

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

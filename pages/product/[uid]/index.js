import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import { db } from '../../lib/firebase';
import { Inter } from "next/font/google";
import Layout from "../../../components/Layout";

export default function ProductPage() {
    const [product, setProduct] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const router = useRouter();
    const { uid } = router.query;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!uid) return;
            const docRef = doc(db, "products", uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setProduct(docSnap.data());
                try {
                    const imageRef = ref(getStorage(), docSnap.data().imageUrl);
                    const url = await getDownloadURL(imageRef);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    setImageUrl('/path/to/default/image'); // Chemin vers une image par défaut
                }
            } else {
                console.log("No such document!");
            }
        };

        fetchProduct();
    }, [uid]);

    if (!product) return <div>Loading...</div>;

    return (
        <Layout>
            <div>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p>Price: {product.price} €</p>
                <img src={imageUrl} alt={product.name} style={{ width: "300px", height: "auto" }} />
            </div>
        </Layout>
    );
}

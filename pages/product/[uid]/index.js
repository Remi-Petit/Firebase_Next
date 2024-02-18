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
                let url;
                try {
                    const imageRef = ref(getStorage(), docSnap.data().imageUrl);
                    url = await getDownloadURL(imageRef);
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                    // Utilisez directement `ref` ici au lieu de `storageRef`
                    url = await getDownloadURL(ref(getStorage(), 'Images/noImage/noImage.jpg'));
                }
                setImageUrl(url);
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

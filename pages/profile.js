import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "../components/Layout";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Profile() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mt-8">Profile</h1>

      <ul className="list-disc">
        <li>
          <Link href="/voirProduits" className="text-blue-500 hover:underline">
            Voir les produits
          </Link>
        </li>
        <li>
          <Link href="/products" className="text-blue-500 hover:underline">
            Produits ADMIN
          </Link>
        </li>
        {/* Ajoutez d'autres liens vers des pages pertinentes pour les vendeurs ici */}
      </ul>
    </Layout>
  )
}

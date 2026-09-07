/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { useAuthStore, UserProfile } from "@/src/store/useAuthStore";
import { Navbar } from "@/src/components/Navbar";
import { Footer } from "@/src/components/Footer";
import { motion } from "motion/react";

// Pages
import Home from "@/src/pages/Home";
import Explore from "@/src/pages/Explore";
import ProductDetail from "@/src/pages/ProductDetail";
import Dashboard from "@/src/pages/Dashboard";
import CreatorOnboarding from "@/src/pages/CreatorOnboarding";
import ProductCreate from "@/src/pages/ProductCreate";
import Cart from "@/src/pages/Cart";
import Storefront from "@/src/pages/Storefront";
import AdminLayout from "@/src/pages/admin/AdminLayout";


const GlassBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-neutral-950">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 100, 0],
        y: [0, -50, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen"
    />
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.2, 0.4, 0.2],
        x: [0, -100, 0],
        y: [0, 100, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen"
    />
  </div>
);

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Wait for profile creation in DB if it's a new user
            setProfile(null);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return (
    <BrowserRouter>
      <GlassBackground />
      <div className="min-h-screen flex flex-col relative z-0">
        <Navbar />
        <main className="flex-1 flex flex-col relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/store/:username" element={<Storefront />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/onboarding" element={<CreatorOnboarding />} />
            <Route path="/dashboard/products/new" element={<ProductCreate />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}


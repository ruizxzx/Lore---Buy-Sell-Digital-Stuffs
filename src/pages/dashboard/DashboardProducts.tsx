import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Plus } from "lucide-react";

export default function DashboardProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadProducts() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "products"),
          where("ownerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sorting locally since we need composite index otherwise
        prods.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setProducts(prods);
      } catch (error) {
        console.error("Failed to load products", error);
      }
    }
    loadProducts();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white">My Products</h1>
        <Link to="/dashboard/products/new" className="mt-4 sm:mt-0">
          <Button><Plus className="w-5 h-5 mr-2" /> New Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col group overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-800 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent z-10"></div>
              <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-widest uppercase text-white z-20">
                {product.status}
              </div>
            </div>
            <CardContent className="flex-1 p-6 bg-transparent space-y-2 z-20 relative -mt-8">
              <h3 className="font-display font-bold text-xl line-clamp-1 text-white">{product.title}</h3>
              <p className="font-medium text-lg text-neutral-400">₹{product.price.toFixed(2)}</p>
              <div className="pt-4 flex gap-2 border-t border-neutral-800 mt-4">
                <Link to={`/product/${product.slug}`} className="flex-1 mt-4">
                  <Button variant="outline" size="sm" className="w-full">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="border border-dashed border-neutral-800 rounded-[2.5rem] p-12 text-center bg-neutral-900/30">
          <p className="font-bold text-xl text-neutral-500 tracking-wide mb-6">No Products Yet</p>
          <Link to="/dashboard/products/new">
            <Button size="lg">Create your first product</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

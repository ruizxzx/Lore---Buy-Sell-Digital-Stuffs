import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Search } from "lucide-react";

export default function Explore() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "published")
        );
        const snapshot = await getDocs(q);
        let prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        // Client side filtering for MVP search
        if (category !== "All") {
          prods = prods.filter(p => p.category === category);
        }
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          prods = prods.filter(p => 
            p.title?.toLowerCase().includes(lower) || 
            p.description?.toLowerCase().includes(lower)
          );
        }
        
        setProducts(prods);
      } catch (error) {
        console.error("Error fetching explore products", error);
      }
    }
    fetchProducts();
  }, [searchTerm, category]);

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-200">
      <div className="border-b border-neutral-800 bg-neutral-900/50 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-white mb-8">
            Explore Marketplace
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products..." 
                className="pl-12 text-lg h-14"
              />
            </div>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-sm font-bold tracking-wide text-neutral-200 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Software">Software</option>
              <option value="Design">Design</option>
              <option value="Education">Education</option>
              <option value="Ebooks">Ebooks</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`}>
              <Card className="h-full flex flex-col hover:border-neutral-700 transition-all cursor-pointer group">
                <div className="aspect-[4/3] bg-neutral-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent z-10"></div>
                  <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 px-3 py-1.5 rounded-lg font-bold text-xs tracking-widest uppercase text-white z-20">
                    {product.category}
                  </div>
                </div>
                <CardContent className="flex-1 p-6 bg-transparent flex flex-col justify-between mt-0 z-20 relative -mt-8">
                  <div>
                    <h3 className="font-display font-bold text-xl line-clamp-2 leading-tight mb-2 text-white">{product.title}</h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-neutral-800">
                    <span className="font-medium text-2xl tabular-nums text-emerald-400">${product.price.toFixed(2)}</span>
                    <span className="font-bold uppercase text-[10px] tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">Buy Now</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="py-20 text-center font-medium text-xl text-neutral-500 tracking-wide">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}

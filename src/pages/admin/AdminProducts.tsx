import { useEffect, useState } from "react";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Package, ShieldAlert, EyeOff, Eye } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function AdminProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (user?.email !== "ruizxzxz@gmail.com") return;
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        data.sort((a, b) => b.createdAt - a.createdAt);
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [user]);

  const toggleStatus = async (productId: string, currentStatus: string) => {
    if (!confirm("Are you sure you want to change this product's status?")) return;
    setIsUpdating(productId);
    try {
      const newStatus = currentStatus === "published" ? "hidden" : "published";
      await updateDoc(doc(db, "products", productId), { status: newStatus });
      setProducts(products.map(p => p.id === productId ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error(error);
      alert("Failed to update product status");
    } finally {
      setIsUpdating(null);
    }
  };

  if (user?.email !== "ruizxzxz@gmail.com") {
    return <div className="p-8 text-red-500 font-bold uppercase">Unauthorized. Admin access only.</div>;
  }

  if (isLoading) return <div className="p-8 text-neutral-400 font-bold uppercase tracking-widest">Loading Products...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white">Product Moderation</h1>
        <div className="text-sm font-bold tracking-widest uppercase text-neutral-500">{products.length} Products</div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Product</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Creator ID</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Price</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Status</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.title} className="w-12 h-12 object-cover rounded-xl bg-neutral-800" />
                      ) : (
                        <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-neutral-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white line-clamp-1">{p.title}</div>
                        <div className="text-xs text-neutral-500">{new Date(p.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-mono text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-md">{p.ownerId}</span>
                  </td>
                  <td className="p-6 font-bold text-white tabular-nums">
                    ₹{p.price?.toFixed(2)}
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {p.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={isUpdating === p.id}
                      onClick={() => toggleStatus(p.id, p.status)}
                      className={p.status === 'published' ? 'hover:bg-red-500/20 hover:text-red-400' : 'hover:bg-emerald-500/20 hover:text-emerald-400'}
                    >
                      {p.status === "published" ? "Hide Product" : "Un-Hide"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

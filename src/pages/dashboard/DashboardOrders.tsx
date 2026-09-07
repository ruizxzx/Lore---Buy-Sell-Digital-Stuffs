import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Download } from "lucide-react";

export default function DashboardOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("buyerId", "==", user.uid),
          where("status", "==", "paid")
        );
        const snapshot = await getDocs(q);
        const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        orderData.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setOrders(orderData);

        // Fetch product details for these orders
        const productIds = [...new Set(orderData.map(o => o.productId))];
        const productMap: Record<string, any> = {};
        for (const pid of productIds) {
          // In production, batch this using 'in' query or similar, up to 10 at a time
          const pQuery = query(collection(db, "products"), where("__name__", "==", pid));
          const pSnap = await getDocs(pQuery);
          if (!pSnap.empty) {
            productMap[pid] = { id: pSnap.docs[0].id, ...pSnap.docs[0].data() };
          }
        }
        setProducts(productMap);

      } catch (error) {
        console.error("Failed to load orders", error);
      }
    }
    loadOrders();
  }, [user]);

  const handleDownload = async (productId: string) => {
    // In a real app, hit an API to generate a signed URL:
    // const res = await fetch("/api/downloads/generate", { method: "POST", body: JSON.stringify({ productId }) });
    // const { url } = await res.json();
    // window.open(url, "_blank");
    alert("In a full production environment, this would verify the user's order entitlement on the server and generate a signed Firebase Storage URL. (For now, see Product Dashboard for original files)");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-black tracking-tighter text-white">My Library</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const product = products[order.productId];
          if (!product) return null;
          return (
            <Card key={order.id} className="flex flex-col group overflow-hidden">
              <div className="aspect-[4/3] bg-neutral-800 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent z-10"></div>
                <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <CardContent className="flex-1 p-6 bg-transparent space-y-2 z-20 relative -mt-8">
                <h3 className="font-display font-bold text-xl line-clamp-1 text-white">{product.title}</h3>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Purchased: {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="pt-4 flex gap-2 border-t border-neutral-800 mt-4">
                  <Button onClick={() => handleDownload(product.id)} className="w-full mt-4">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {orders.length === 0 && (
        <div className="border border-dashed border-neutral-800 rounded-[2.5rem] p-12 text-center bg-neutral-900/30">
          <p className="font-bold text-xl text-neutral-500 tracking-wide mb-6">No Purchases Yet</p>
          <Link to="/explore">
            <Button size="lg">Explore Products</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Mail, Calendar, Package } from "lucide-react";

export default function DashboardCustomers() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      if (!user) return;
      try {
        const oQuery = query(collection(db, "orders"), where("creatorId", "==", user.uid), where("status", "==", "paid"));
        const oDocs = await getDocs(oQuery);
        
        const customerMap = new Map();
        
        // Fetch product mapping for names
        const pQuery = query(collection(db, "products"), where("ownerId", "==", user.uid));
        const pDocs = await getDocs(pQuery);
        const productsMap: Record<string, string> = {};
        pDocs.forEach(d => {
          productsMap[d.id] = d.data().title;
        });

        for (const doc of oDocs.docs) {
          const order = doc.data();
          const bId = order.buyerId;
          
          if (!customerMap.has(bId)) {
            // we could fetch user profile, but let's aggregate based on orders first
            customerMap.set(bId, {
              buyerId: bId,
              email: order.buyerEmail || "unknown@example.com", 
              totalSpent: 0,
              ordersCount: 0,
              lastOrder: order.createdAt,
              products: new Set()
            });
          }
          
          const c = customerMap.get(bId);
          c.totalSpent += order.amount;
          c.ordersCount += 1;
          c.products.add(productsMap[order.productId] || "Product");
          if (order.createdAt > c.lastOrder) {
            c.lastOrder = order.createdAt;
          }
        }

        const customerList = Array.from(customerMap.values()).sort((a, b) => b.lastOrder - a.lastOrder);
        setCustomers(customerList);
      } catch (error) {
        console.error("Failed to load customers", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, [user]);

  if (isLoading) return <div className="p-8 text-neutral-400 font-bold uppercase tracking-widest">Loading Audience...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white">Audience</h1>
        <div className="text-sm font-bold tracking-widest uppercase text-neutral-500">{customers.length} Customers</div>
      </div>
      
      {customers.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-[2.5rem] p-16 text-center bg-neutral-900/30">
          <p className="font-bold text-xl text-neutral-500 tracking-wide">No customers yet.</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/50">
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Customer</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Purchases</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Total Spent</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {customers.map((c) => (
                  <tr key={c.buyerId} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-white">{c.email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <Package className="w-4 h-4 text-neutral-500" />
                        <span className="font-bold">{c.ordersCount}</span>
                      </div>
                      <div className="text-xs text-neutral-500 font-medium mt-1 truncate max-w-[200px]">
                        {Array.from(c.products).join(", ")}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-black text-emerald-400 text-lg tabular-nums">₹{c.totalSpent.toFixed(2)}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Calendar className="w-4 h-4" />
                        <span className="font-bold text-sm">{new Date(c.lastOrder).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

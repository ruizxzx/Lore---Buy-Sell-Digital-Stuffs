import { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { DollarSign, Percent, TrendingUp, Users, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";

export default function AdminOverview() {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState({ 
    grossVolume: 0, 
    platformRevenue: 0, 
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      if (!user || user?.email !== "ruizxzxz@gmail.com") return;
      try {
        // Fetch Orders for GMV and Revenue
        const ordersSnap = await getDocs(collection(db, "orders"));
        let grossVolume = 0;
        let platformRevenue = 0;
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        orders.forEach(o => {
          if (o.status === "paid") {
            grossVolume += (o.amount || 0);
            platformRevenue += (o.loreShare || (o.amount * 0.10) || 0);
          }
        });

        // Sort for recent transactions
        orders.sort((a, b) => b.createdAt - a.createdAt);
        setRecentOrders(orders.slice(0, 10));

        // Fetch Users
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;

        // Fetch Products
        const productsSnap = await getDocs(collection(db, "products"));
        const totalProducts = productsSnap.size;

        setStats({ grossVolume, platformRevenue, totalOrders: orders.length, totalUsers, totalProducts });
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, [user, profile]);

  if (user?.email !== "ruizxzxz@gmail.com") {
    return <div className="p-8 text-red-500 font-bold uppercase">Unauthorized. Admin access only.</div>;
  }

  if (isLoading) return <div className="p-8 text-neutral-400 font-bold uppercase tracking-widest">Loading Platform Data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white">Platform Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 font-bold tracking-widest uppercase text-xs">Total GMV</h3>
              <TrendingUp className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-3xl font-black text-white tabular-nums">₹{stats.grossVolume.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-indigo-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Lore Revenue</h3>
            </div>
            <p className="text-4xl font-black text-indigo-400 tabular-nums">₹{stats.platformRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 font-bold tracking-widest uppercase text-xs">Users</h3>
              <Users className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-3xl font-black text-white tabular-nums">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 font-bold tracking-widest uppercase text-xs">Products</h3>
              <Package className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-3xl font-black text-white tabular-nums">{stats.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Date</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Order ID</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Gross</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Platform Cut</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {recentOrders.map((e) => {
                 const gross = e.amount || 0;
                 const fee = e.loreShare || (gross * 0.10) || 0;
                 
                 return (
                  <tr key={e.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-6 font-medium text-neutral-300">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-sm text-neutral-500 font-mono">
                      {e.cfOrderId || e.id}
                    </td>
                    <td className="p-6 text-white font-bold tabular-nums">₹{gross.toFixed(2)}</td>
                    <td className="p-6 text-indigo-400 font-black tabular-nums">₹{fee.toFixed(2)}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${e.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                 );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-500 font-medium">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

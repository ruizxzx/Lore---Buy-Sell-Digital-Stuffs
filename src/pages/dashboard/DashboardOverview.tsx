import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ revenue: 0, sales: 0, products: 0 });

  useEffect(() => {
    if (!user) return;
    
    async function fetchStats() {
      if (!user) return;
      try {
        const pQuery = query(collection(db, "products"), where("ownerId", "==", user.uid));
        const pDocs = await getDocs(pQuery);
        
        const oQuery = query(collection(db, "orders"), where("creatorId", "==", user.uid), where("status", "==", "paid"));
        const oDocs = await getDocs(oQuery);
        
        let revenue = 0;
        oDocs.forEach(doc => {
          revenue += doc.data().amount;
        });

        setStats({
          products: pDocs.size,
          sales: oDocs.size,
          revenue,
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    }
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-black tracking-tighter mb-8 text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`$${stats.revenue.toFixed(2)}`} colorClass="text-emerald-400" />
        <StatCard title="Total Sales" value={stats.sales.toString()} colorClass="text-indigo-400" />
        <StatCard title="Products" value={stats.products.toString()} colorClass="text-amber-500" />
      </div>
    </div>
  );
}

function StatCard({ title, value, colorClass }: { title: string, value: string, colorClass: string }) {
  return (
    <Card className="flex flex-col group overflow-hidden">
      <CardHeader className="py-6 bg-transparent">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-neutral-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="bg-transparent flex-1 flex items-end">
        <span className={`text-6xl font-display font-black tracking-tighter tabular-nums ${colorClass}`}>{value}</span>
      </CardContent>
    </Card>
  );
}


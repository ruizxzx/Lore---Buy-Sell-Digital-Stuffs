import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { DollarSign, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/Card";

export default function DashboardEarnings() {
  const { user, profile } = useAuthStore();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [stats, setStats] = useState({ gross: 0, loreCommission: 0, net: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("creatorId", "==", user.uid),
          where("status", "==", "paid")
        );
        const snapshot = await getDocs(q);
        const orderList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        orderList.sort((a, b) => b.createdAt - a.createdAt);
        setEarnings(orderList);

        let gross = 0;
        let commission = 0;
        let net = 0;
        orderList.forEach(o => {
          gross += (o.amount || 0);
          commission += (o.loreShare || (o.amount * 0.10) || 0);
          net += (o.creatorShare || (o.amount * 0.90) || 0);
        });

        setStats({ gross, loreCommission: commission, net });
      } catch (error) {
        console.error("Failed to load earnings", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEarnings();
  }, [user]);

  if (isLoading) return <div className="p-8 text-neutral-400 font-bold uppercase tracking-widest">Loading Earnings...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white">Earnings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 font-bold tracking-widest uppercase text-xs">Gross Revenue</h3>
              <TrendingUp className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-3xl font-black text-white tabular-nums">₹{stats.gross.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 font-bold tracking-widest uppercase text-xs">Lore Commission (10%)</h3>
              <Percent className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-3xl font-black text-red-400 tabular-nums">- ₹{stats.loreCommission.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-emerald-500" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-emerald-500 font-bold tracking-widest uppercase text-xs">Net Earnings</h3>
            </div>
            <p className="text-4xl font-black text-emerald-400 tabular-nums">₹{stats.net.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Date</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Order ID</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Gross</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Lore Fee</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Net</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {earnings.map((e) => {
                 const gross = e.amount || 0;
                 const fee = e.loreShare || (gross * 0.10) || 0;
                 const net = e.creatorShare || (gross - fee) || 0;
                 
                 return (
                  <tr key={e.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-6 font-medium text-neutral-300">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-sm text-neutral-500 font-mono">
                      {e.cfOrderId || e.id}
                    </td>
                    <td className="p-6 text-white font-bold tabular-nums">₹{gross.toFixed(2)}</td>
                    <td className="p-6 text-red-400 font-bold tabular-nums">-₹{fee.toFixed(2)}</td>
                    <td className="p-6 text-emerald-400 font-black tabular-nums">₹{net.toFixed(2)}</td>
                    <td className="p-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                        SETTLED
                      </span>
                    </td>
                  </tr>
                 );
              })}
              {earnings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 font-medium">
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

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";

export default function DashboardAnalytics() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      try {
        const oQuery = query(collection(db, "orders"), where("creatorId", "==", user.uid), where("status", "==", "paid"));
        const oDocs = await getDocs(oQuery);
        
        // Group by day
        const salesByDate: Record<string, number> = {};
        
        // Populate last 7 days with 0 as default
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          salesByDate[dateStr] = 0;
        }

        oDocs.forEach(doc => {
          const order = doc.data();
          const d = new Date(order.createdAt);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (salesByDate[dateStr] !== undefined) {
             salesByDate[dateStr] += order.amount;
          }
        });

        const chartData = Object.keys(salesByDate).map(date => ({
          date,
          revenue: salesByDate[date]
        }));
        
        setData(chartData);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

  if (isLoading) return <div className="p-8 text-neutral-400 font-bold uppercase tracking-widest">Loading Analytics...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-black tracking-tighter text-white">Analytics</h1>
      
      <Card className="bg-neutral-900 border-neutral-800 rounded-[2.5rem]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Revenue (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '1rem', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

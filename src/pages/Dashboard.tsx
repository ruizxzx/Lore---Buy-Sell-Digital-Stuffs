import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LayoutDashboard, Package, ShoppingCart, BarChart3, User, Users } from "lucide-react";

import DashboardOverview from "./dashboard/DashboardOverview";
import DashboardProducts from "./dashboard/DashboardProducts";
import DashboardOrders from "./dashboard/DashboardOrders";
import DashboardProfile from "./dashboard/DashboardProfile";
import DashboardAnalytics from "./dashboard/DashboardAnalytics";
import DashboardCustomers from "./dashboard/DashboardCustomers";
import DashboardEarnings from "./dashboard/DashboardEarnings";

export default function Dashboard() {
  const { profile, user } = useAuthStore();
  const location = useLocation();

  if (!profile) {
    return <div className="p-8 text-center font-bold text-2xl">Please sign in to view your dashboard.</div>;
  }

  const isCreator = profile.role === "creator" || profile.role === "admin" || user?.email === "ruizxzxz@gmail.com";

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" />, show: isCreator },
    { name: "Products", path: "/dashboard/products", icon: <Package className="w-5 h-5 mr-2" />, show: isCreator },
    { name: "Purchases", path: "/dashboard/orders", icon: <ShoppingCart className="w-5 h-5 mr-2" />, show: true },
    { name: "Audience", path: "/dashboard/customers", icon: <Users className="w-5 h-5 mr-2" />, show: isCreator },
    { name: "Analytics", path: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5 mr-2" />, show: isCreator },
    { name: "Earnings", path: "/dashboard/earnings", icon: <BarChart3 className="w-5 h-5 mr-2" />, show: isCreator },
    { name: "Profile", path: "/dashboard/profile", icon: <User className="w-5 h-5 mr-2" />, show: true },
  ];

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-neutral-950 text-neutral-200">
      <aside className="w-full md:w-64 border-r border-neutral-800 bg-neutral-900/50 shrink-0">
        <nav className="p-4 space-y-2 sticky top-20">
          {navItems.filter(i => i.show).map((item) => {
            const isCurrentlyActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 font-bold tracking-wide rounded-xl transition-all ${
                  isCurrentlyActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={isCreator ? <DashboardOverview /> : <DashboardOrders />} />
          <Route path="/products" element={<DashboardProducts />} />
          <Route path="/orders" element={<DashboardOrders />} />
          <Route path="/customers" element={<DashboardCustomers />} />
          <Route path="/earnings" element={<DashboardEarnings />} />
          <Route path="/profile" element={<DashboardProfile />} />
          <Route path="/analytics" element={<DashboardAnalytics />} />
        </Routes>
      </main>
    </div>
  );
}

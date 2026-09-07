import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LayoutDashboard, Users, Package } from "lucide-react";

import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminProducts from "./AdminProducts";

export default function AdminLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (user?.email !== "ruizxzxz@gmail.com") {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950 p-8">
        <div className="text-red-500 font-bold text-2xl uppercase tracking-widest text-center border border-red-500/20 bg-red-500/10 p-12 rounded-[2.5rem]">
          Unauthorized
          <p className="text-sm text-red-400 mt-2">Admin access is restricted to the platform owner.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Platform Overview", path: "/admin", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { name: "User Management", path: "/admin/users", icon: <Users className="w-5 h-5 mr-2" /> },
    { name: "Product Moderation", path: "/admin/products", icon: <Package className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-neutral-950 text-neutral-200">
      <aside className="w-full md:w-72 border-r border-neutral-800 bg-neutral-900/80 shrink-0">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-xl font-display font-black text-indigo-400 uppercase tracking-widest">Master Control</h2>
        </div>
        <nav className="p-4 space-y-2 sticky top-20">
          {navItems.map((item) => {
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

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative bg-neutral-950">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/products" element={<AdminProducts />} />
        </Routes>
      </main>
    </div>
  );
}

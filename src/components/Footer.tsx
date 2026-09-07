import { Link } from "react-router-dom";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Shield } from "lucide-react";

export function Footer() {
  const { user } = useAuthStore();
  const isMasterAdmin = user?.email === "ruizxzxz@gmail.com";

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-3 opacity-50">
          <div className="w-8 h-8 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-sm text-neutral-400">C</div>
          <span className="font-display font-bold text-sm tracking-tight text-neutral-400">CreatorStore © {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link to="/explore" className="hover:text-neutral-300 transition-colors">Explore</Link>
          <a href="#" className="hover:text-neutral-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-neutral-300 transition-colors">Privacy</a>
          
          {isMasterAdmin && (
            <Link to="/admin" className="flex items-center gap-2 text-indigo-500/50 hover:text-indigo-400 transition-colors ml-4 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Shield className="w-3 h-3" />
              Master Admin
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

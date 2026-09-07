import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useCartStore } from "@/src/store/useCartStore";
import { loginWithGoogle, logoutUser } from "@/src/lib/firebase";
import { Button } from "@/src/components/ui/Button";
import { ShoppingCart } from "lucide-react";

export function Navbar() {
  const { user, profile } = useAuthStore();
  const cartItems = useCartStore(state => state.items);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/cancelled-popup-request') return;
      alert(`Login failed: ${error.message}\n\nTip: If you are using a popup blocker, please allow popups for this site. You may also need to open the app in a new tab if you are viewing it inside an iframe.`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">C</div>
            <span className="font-display font-bold text-xl tracking-tight text-neutral-200">CreatorStore</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/explore" className="font-bold text-sm text-neutral-400 hover:text-white transition-colors">Explore</Link>
            
            <Link to="/cart" className="relative text-neutral-400 hover:text-white transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="font-bold text-sm text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
                {(!profile || profile.role !== "creator") && (
                  <Link to="/onboarding">
                    <Button variant="secondary" size="sm">Become a Creator</Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
              </>
            ) : (
              <Button onClick={handleLogin} disabled={isLoggingIn} variant="primary" size="sm">
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

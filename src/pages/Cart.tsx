import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/src/store/useCartStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please sign in to checkout.");
      return;
    }
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: items,
          buyerId: user.uid,
          appUrl: window.location.origin,
          buyerEmail: user.email || "test@example.com"
        })
      });
      const data = await response.json();
      
      if (data.paymentSessionId) {
        // @ts-ignore
        const cashfree = Cashfree({ mode: "sandbox" });
        
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          returnUrl: `${window.location.origin}/dashboard/orders?success=true&order_id={order_id}`
        });
        
        // Note: we clear cart when successfully redirected back or rely on user to clear it.
        // For a seamless flow, you can clear it right before redirecting, but if they cancel payment, 
        // they lose cart. Best practice is to clear it on the success page (/dashboard/orders).
      } else {
        alert(data.error || "Failed to initiate checkout");
      }
    } catch (e) {
      console.error(e);
      alert("Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-950 text-neutral-200">
        <div className="text-center p-8 max-w-md w-full">
          <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-800">
            <ShoppingBag className="w-10 h-10 text-neutral-500" />
          </div>
          <h2 className="text-3xl font-display font-black tracking-tighter text-white mb-4">Your Cart is Empty</h2>
          <p className="text-neutral-400 mb-8 font-medium">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/explore">
            <Button size="lg" className="w-full">Start Exploring</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-200 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 p-4 bg-neutral-900 border border-neutral-800 rounded-[2rem] items-center">
                <Link to={`/product/${item.slug}`} className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-neutral-800">
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-white truncate hover:text-indigo-400 transition-colors">{item.title}</h3>
                  </Link>
                  <p className="text-indigo-400 font-black tracking-tighter mt-1 text-lg">₹{item.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-800/50 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={clearCart} 
                className="text-sm font-bold text-neutral-500 hover:text-neutral-300 transition-colors tracking-wide uppercase"
              >
                Clear Cart
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 sticky top-28">
              <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm font-medium border-b border-neutral-800 pb-6">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-neutral-300">Total</span>
                <span className="text-4xl font-black tracking-tighter text-white">₹{getTotal().toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-indigo-600 text-white font-black tracking-widest uppercase py-5 rounded-2xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {isCheckingOut ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

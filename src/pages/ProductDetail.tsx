import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useCartStore } from "@/src/store/useCartStore";
import { Button } from "@/src/components/ui/Button";

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const { addItem, items } = useCartStore();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(0);

  useEffect(() => {
    async function loadProduct() {
      try {
        const q = query(collection(db, "products"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const pData = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
          setProduct(pData);
          setCustomPrice(pData.price || 0);
          
          const creatorQ = query(collection(db, "users"), where("uid", "==", pData.ownerId));
          const cSnap = await getDocs(creatorQ);
          if (!cSnap.empty) {
            setCreator(cSnap.docs[0].data());
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleBuy = async () => {
    if (!user) {
      alert("Please sign in to purchase products.");
      return;
    }
    if (product.isPWYW && customPrice < product.price) {
      alert(`Minimum price is ₹${product.price}`);
      return;
    }
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          price: customPrice,
          coverImage: product.coverImage,
          buyerId: user.uid,
          creatorId: product.ownerId,
          appUrl: window.location.origin,
          buyerEmail: user.email || "test@example.com"
        })
      });
      const data = await response.json();
      
      if (data.paymentSessionId) {
        // @ts-ignore
        const cashfree = Cashfree({
          mode: "sandbox", 
        });
        
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          returnUrl: `${window.location.origin}/dashboard/orders?success=true&order_id={order_id}`
        });
      } else {
        alert(data.error || "Failed to initiate checkout");
      }
    } catch (e) {
      console.error(e);
      alert("Checkout failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleAddToCart = () => {
    if (product.isPWYW && customPrice < product.price) {
      alert(`Minimum price is ₹${product.price}`);
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: customPrice,
      coverImage: product.coverImage,
      creatorId: product.ownerId,
      slug: product.slug
    });
  };

  const inCart = items.some(i => i.id === product?.id);

  if (isLoading) return <div className="p-20 text-center font-bold text-2xl uppercase">Loading...</div>;
  if (!product) return <div className="p-20 text-center font-bold text-2xl uppercase">Product Not Found</div>;

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-200">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] overflow-hidden bg-neutral-900 border border-neutral-800">
              <img src={product.coverImage} alt={product.title} className="w-full aspect-video object-cover" />
            </div>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-6 leading-tight text-white">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-10 pb-8 border-b border-neutral-800">
                <Link to={`/store/${creator?.username}`} className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center font-black text-white shadow-inner text-xl border border-neutral-700/50 hover:bg-neutral-700 transition-colors">
                  {creator?.displayName?.[0] || "C"}
                </Link>
                <div>
                  <Link to={`/store/${creator?.username}`} className="font-bold text-lg leading-none text-white hover:text-indigo-400 transition-colors">
                    {creator?.displayName || "Unknown Creator"}
                  </Link>
                  <p className="text-sm font-bold text-neutral-500 tracking-wider">@{creator?.username || "creator"}</p>
                </div>
              </div>
              
              <div className="prose prose-invert prose-lg max-w-none font-body text-neutral-300">
                {product.description.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-black bg-white text-indigo-600 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                    {product.isPWYW ? "Pay What You Want" : "Price"}
                  </span>
                </div>
                
                {product.isPWYW ? (
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-indigo-200 mb-2">Name a fair price (Min: ₹{product.price.toFixed(2)})</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-white/50">₹</span>
                      <input 
                        type="number" 
                        min={product.price}
                        step="1"
                        value={customPrice} 
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full bg-indigo-950/40 border border-indigo-400/30 rounded-2xl py-4 pl-12 pr-4 text-4xl font-black text-white focus:outline-none focus:border-indigo-400/80 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-6xl font-black tracking-tighter mb-8 tabular-nums">₹{product.price.toFixed(2)}</div>
                )}
                
                <div className="space-y-4 mb-6">
                  <button 
                    className="w-full bg-white text-indigo-950 font-black tracking-widest uppercase py-5 rounded-2xl hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    onClick={handleBuy} 
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? "Processing..." : "Buy Now"}
                  </button>
                  
                  <button 
                    className={`w-full font-black tracking-widest uppercase py-5 rounded-2xl border-2 transition-colors disabled:opacity-50 ${inCart ? 'bg-indigo-800 border-indigo-800 text-white cursor-default' : 'border-white/30 text-white hover:bg-white/10'}`}
                    onClick={inCart ? () => navigate("/cart") : handleAddToCart} 
                  >
                    {inCart ? "View Cart" : "Add to Cart"}
                  </button>
                </div>
                
                <p className="text-center font-bold text-xs text-indigo-200 tracking-widest uppercase mb-8">
                  Secure payment via Cashfree
                </p>
                
                <div className="border-t border-indigo-400/30 pt-6">
                  <h3 className="font-black uppercase tracking-widest mb-4 text-sm text-indigo-100">Includes</h3>
                  <ul className="space-y-3 font-medium text-sm text-indigo-50">
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                      Digital Download File
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                      Lifetime Access
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                      Future Updates
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

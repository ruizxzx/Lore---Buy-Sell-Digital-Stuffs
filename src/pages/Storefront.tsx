import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Globe, AtSign } from "lucide-react";

export default function Storefront() {
  const { username } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorefront() {
      try {
        const uQuery = query(collection(db, "users"), where("username", "==", username));
        const uSnap = await getDocs(uQuery);
        
        if (!uSnap.empty) {
          const cData = { id: uSnap.docs[0].id, ...uSnap.docs[0].data() } as any;
          setCreator(cData);
          
          const pQuery = query(collection(db, "products"), where("ownerId", "==", cData.uid), where("status", "==", "published"));
          const pSnap = await getDocs(pQuery);
          
          const prods = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          prods.sort((a, b) => b.createdAt - a.createdAt);
          setProducts(prods);
        }
      } catch (e) {
        console.error("Failed to load storefront", e);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (username) {
      loadStorefront();
    }
  }, [username]);

  if (isLoading) return <div className="p-20 text-center font-bold text-2xl uppercase text-white">Loading Store...</div>;
  
  if (!creator) return (
    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-white">
      <h1 className="text-4xl font-display font-black tracking-tighter mb-4">Creator Not Found</h1>
      <p className="text-neutral-400 mb-8 font-medium">The store you are looking for does not exist or was removed.</p>
      <Link to="/explore"><Button>Browse Marketplace</Button></Link>
    </div>
  );

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-200">
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center font-black text-6xl text-white shadow-2xl shadow-indigo-500/20 border-4 border-neutral-950">
              {creator.profileImage ? (
                <img src={creator.profileImage} alt={creator.displayName} className="w-full h-full object-cover rounded-[2.2rem]" />
              ) : (
                creator.displayName?.[0] || "C"
              )}
            </div>
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white mb-2">{creator.displayName}</h1>
              <p className="text-xl font-bold text-indigo-400 tracking-wide mb-6">@{creator.username}</p>
              
              {creator.bio ? (
                <p className="text-lg text-neutral-300 leading-relaxed font-medium mb-6">{creator.bio}</p>
              ) : (
                <p className="text-lg text-neutral-500 leading-relaxed font-medium italic mb-6">This creator hasn't added a bio yet.</p>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                {creator.twitter && (
                  <a href={`https://twitter.com/${creator.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-indigo-400 transition-colors">
                    <AtSign className="w-5 h-5" />
                    @{creator.twitter.replace('@', '')}
                  </a>
                )}
                {creator.website && (
                  <a href={creator.website.startsWith('http') ? creator.website : `https://${creator.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-indigo-400 transition-colors">
                    <Globe className="w-5 h-5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-display font-black tracking-tighter text-white">Products by {creator.displayName}</h2>
          <span className="bg-neutral-800 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase text-neutral-400">
            {products.length} {products.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <Link to={`/product/${product.slug}`} key={product.id} className="group block">
                <Card className="flex flex-col overflow-hidden h-full border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700 transition-colors">
                  <div className="aspect-[4/3] bg-neutral-800 overflow-hidden relative">
                    <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <CardContent className="flex-1 p-6 space-y-2">
                    <h3 className="font-display font-bold text-xl line-clamp-1 text-white group-hover:text-indigo-400 transition-colors">{product.title}</h3>
                    <p className="font-black text-lg text-neutral-300">₹{product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-800 rounded-[2.5rem] p-16 text-center bg-neutral-900/30">
            <p className="font-bold text-xl text-neutral-500 tracking-wide">No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

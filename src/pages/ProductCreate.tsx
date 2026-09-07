import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Input, Textarea, Label } from "@/src/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { generateId } from "@/src/lib/utils";
import { Wand2 } from "lucide-react";

export default function ProductCreate() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isPWYW, setIsPWYW] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Software");
  
  const [coverUrl, setCoverUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleGenerateDescription = async () => {
    if (!title) {
      alert("Please enter a title first to use the AI Assistant.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Write a punchy, compelling product description for a digital product named "${title}". It is in the ${category} category.` })
      });
      const data = await response.json();
      if (data.text) {
        setDescription(data.text);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate description.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== "creator") return;
    if (!coverUrl || !fileUrl) {
      alert("Please provide both a cover image link and the digital product link.");
      return;
    }
    setIsLoading(true);

    try {
      const productId = generateId();
      
      const product = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `product-${Date.now()}`,
        description,
        shortDescription: description.substring(0, 100),
        price: parseFloat(price),
        isPWYW,
        currency: "INR",
        coverImage: coverUrl,
        category,
        status: "published",
        ownerId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        fileUrl: fileUrl
      };

      await setDoc(doc(db, "products", productId), product);
      navigate("/dashboard/products");
    } catch (error: any) {
      console.error("Error creating product", error);
      alert(`Failed to create product: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10">
      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <CardHeader className="bg-white/5 border-b border-white/5">
          <CardTitle className="text-white drop-shadow-sm text-3xl font-display">New Product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Product Title</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Modern UI Kit" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/80">{isPWYW ? "Minimum Price (INR)" : "Price (INR)"}</Label>
                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                      <input type="checkbox" checked={isPWYW} onChange={e => setIsPWYW(e.target.checked)} className="rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500/50" />
                      Pay What You Want
                    </label>
                  </div>
                  <Input type="number" step="0.01" min="0" required value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Category</Label>
                  <select 
                    className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none backdrop-blur-xl"
                    value={category} onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Software" className="bg-neutral-900">Software</option>
                    <option value="Design" className="bg-neutral-900">Design</option>
                    <option value="Education" className="bg-neutral-900">Education</option>
                    <option value="Ebooks" className="bg-neutral-900">Ebooks</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Cover Image URL</Label>
                  <Input type="url" required value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://example.com/image.png" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Digital File Link (Google Drive, etc)</Label>
                  <Input type="url" required value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." />
                  <p className="text-xs text-white/50">This link is securely delivered to buyers.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white/80">Description</Label>
                <Button type="button" variant="secondary" size="sm" onClick={handleGenerateDescription} disabled={aiLoading} className="bg-white/10 hover:bg-white/20 border-0">
                  <Wand2 className="w-4 h-4 mr-2" />
                  {aiLoading ? "Writing..." : "AI Assist"}
                </Button>
              </div>
              <Textarea 
                required 
                className="min-h-[200px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your product in detail..." 
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full text-lg shadow-indigo-500/25" disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish Product"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Button } from "@/src/components/ui/Button";
import { Input, Textarea, Label } from "@/src/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/Card";

export default function CreatorOnboarding() {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
  });

  // If already a creator, redirect to dashboard
  React.useEffect(() => {
    if (profile?.role === "creator") {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  if (profile?.role === "creator") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const newProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        role: "creator" as const,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "users", user.uid), newProfile);
      setProfile(newProfile);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating creator profile", error);
      alert("Failed to set up profile. Please check that you accepted the terms and your username is alphanumeric.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative z-10">
      <Card className="w-full max-w-2xl relative overflow-hidden group">
        <CardHeader className="bg-transparent border-none p-10 pb-6 relative z-10">
          <CardTitle className="text-4xl font-display font-black tracking-tighter text-white">Become a Creator</CardTitle>
          <p className="font-bold text-white/50 uppercase tracking-widest text-xs mt-2">
            Setup your store in 30 seconds.
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="relative z-10">
          <CardContent className="space-y-8 mt-0 p-10 pt-4 bg-transparent border-none">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white/80">Store / Display Name</Label>
              <Input
                id="displayName"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Acme Studio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80">Username (URL handle)</Label>
              <Input
                id="username"
                required
                pattern="^[a-zA-Z0-9_\-]+$"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="acme_studio"
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Only letters, numbers, underscores, and hyphens.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white/80">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell the world what you make..."
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-transparent p-10 pt-0 border-none">
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6" size="lg">
              {isLoading ? "Setting up..." : "Launch My Store"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

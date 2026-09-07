import { useState } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Button } from "@/src/components/ui/Button";

export default function DashboardProfile() {
  const { user, profile, setProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [twitter, setTwitter] = useState(profile?.twitter || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        twitter,
        website
      });
      setProfile({ ...profile, displayName, bio, twitter, website } as any);
      alert("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-4xl font-display font-black tracking-tighter text-white">My Profile</h1>
      
      <div className="space-y-6 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        
        {profile.role === "creator" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Twitter / X</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-neutral-800">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

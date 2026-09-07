import { useEffect, useState } from "react";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Users, Shield, ShieldAlert, Edit2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function AdminUsers() {
  const { user, profile } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      if (!user || user?.email !== "ruizxzxz@gmail.com") return;
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        // sort by newest
        usersData.sort((a, b) => b.createdAt - a.createdAt);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [user, profile]);

  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (!confirm("Are you sure you want to change this user's role?")) return;
    setIsUpdating(userId);
    try {
      const newRole = currentRole === "admin" ? "buyer" : "admin";
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error(error);
      alert("Failed to update user role");
    } finally {
      setIsUpdating(null);
    }
  };

  if (user?.email !== "ruizxzxz@gmail.com") {
    return <div className="p-8 text-red-500 font-bold uppercase">Unauthorized. Admin access only.</div>;
  }

  if (isLoading) return <div className="p-8 text-neutral-400 font-bold uppercase tracking-widest">Loading Users...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-display font-black tracking-tighter text-white">User Management</h1>
        <div className="text-sm font-bold tracking-widest uppercase text-neutral-500">{users.length} Total Users</div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">User</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Role</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500">Joined</th>
                <th className="p-6 font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold uppercase">
                        {u.displayName?.[0] || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.displayName || "Unknown User"}</div>
                        <div className="text-xs text-neutral-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.role === 'admin' 
                        ? 'bg-red-500/10 text-red-400' 
                        : u.role === 'creator' 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'bg-neutral-500/10 text-neutral-400'
                    }`}>
                      {u.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                      {u.role === 'creator' && <Edit2 className="w-3 h-3" />}
                      {u.role === 'buyer' && <Users className="w-3 h-3" />}
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-medium text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={isUpdating === u.id || u.id === user?.uid}
                      onClick={() => toggleAdmin(u.id, u.role)}
                    >
                      {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

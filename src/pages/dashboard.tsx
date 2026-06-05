import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { formatMK } from "@/lib/auth";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });
      setServices(data ?? []);
      setLoadingServices(false);
    };
    load();
  }, [user]);

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!user) { setLocation("/login"); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {profile?.name || user.email}</p>
        </div>
        <Link href="/post-service" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
          <Plus size={16} /> Post Service
        </Link>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <h2 className="text-base font-bold mb-4">My Services ({services.length})</h2>
        {loadingServices ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">You haven't posted any services yet.</p>
            <Link href="/post-service" className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
              Post Your First Service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(svc => (
              <div key={svc.id} className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted/50 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{svc.title}</div>
                  <div className="text-xs text-muted-foreground">{svc.category} · {svc.location} · {formatMK(svc.price)}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {svc.status}
                </span>
                <div className="flex items-center gap-1">
                  <Link href={`/services/${svc.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
                    <Eye size={14} />
                  </Link>
                  <button onClick={() => deleteService(svc.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

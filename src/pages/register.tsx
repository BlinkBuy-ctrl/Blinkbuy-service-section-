import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const CITIES = ["Balaka","Blantyre","Chikwawa","Chiradzulu","Chitipa","Dedza","Dowa","Karonga","Kasungu","Likoma","Lilongwe","Machinga","Mangochi","Mchinji","Mulanje","Mwanza","Mzimba","Neno","Nkhata Bay","Nkhotakota","Nsanje","Ntcheu","Ntchisi","Phalombe","Rumphi","Salima","Thyolo","Zomba"];

export default function RegisterPage() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", whatsapp: "",
    role: "customer" as "customer" | "worker" | "both",
    location: "Lilongwe",
  });
  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await register(form);
      setLocation("/services");
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join BlinkBuy Services</p>
        </div>

        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Full Name *</label>
            <input type="text" value={form.name} onChange={e => set("name", e.target.value)} required
              placeholder="Your full name"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email *</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Password *</label>
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} required
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="0991234567"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)}
                placeholder="0991234567"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">I want to</label>
            <select value={form.role} onChange={e => set("role", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="customer">Find & Book Services</option>
              <option value="worker">Offer My Services</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Location *</label>
            <select value={form.location} onChange={e => set("location", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { submitWorkerProfile } from "@/lib/api";

const CATEGORIES = [
  "Home & Property Services","Jobs & Work Skills","Transport & Delivery",
  "Food & Daily Needs","Education & Skills","Marketplace",
  "Health & Personal Support","Digital & Online Services","Emergency & Quick Help",
];
const CITIES = ["Balaka","Blantyre","Chikwawa","Chiradzulu","Chitipa","Dedza","Dowa","Karonga","Kasungu","Likoma","Lilongwe","Machinga","Mangochi","Mchinji","Mulanje","Mwanza","Mzimba","Neno","Nkhata Bay","Nkhotakota","Nsanje","Ntcheu","Ntchisi","Phalombe","Rumphi","Salima","Thyolo","Zomba"];
const PRICE_TYPES = ["fixed","hourly","daily","negotiable"];

interface Props { onClose: () => void; }

export function WorkerRegistrationModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", whatsapp: "", location: "Lilongwe",
    category: CATEGORIES[0], title: "", description: "", price: "", priceType: "fixed",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await submitWorkerProfile(form);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to register. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" onClick={onClose}>
      <div className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div>
            <h2 className="text-lg font-black">Register as a Worker</h2>
            <p className="text-xs text-muted-foreground">Get listed and start receiving bookings</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-all">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-lg font-black mb-2">You're Listed!</h3>
            <p className="text-sm text-muted-foreground mb-5">Your service profile has been submitted. Customers can now find and contact you.</p>
            <button onClick={onClose} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl px-3 py-2">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold mb-1 block">Full Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. James Banda"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Phone *</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} required placeholder="0991234567" type="tel"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">WhatsApp</label>
                <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="0991234567" type="tel"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Service Title *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} required placeholder="e.g. Professional Plumbing Services"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Category *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Location *</label>
                <select value={form.location} onChange={e => set("location", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Description *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} required rows={3}
                placeholder="Describe your skills and what you offer..."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Price Type</label>
                <select value={form.priceType} onChange={e => set("priceType", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring">
                  {PRICE_TYPES.map(p => <option key={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Rate (MK)</label>
                <input value={form.price} onChange={e => set("price", e.target.value)} type="number"
                  disabled={form.priceType === "negotiable"} placeholder={form.priceType === "negotiable" ? "Negotiable" : "e.g. 5000"}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={15} /> Submit My Profile</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

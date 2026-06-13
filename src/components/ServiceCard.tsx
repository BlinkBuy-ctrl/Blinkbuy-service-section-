import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Star, MessageCircle, Phone, CheckCircle, Award, Heart } from "lucide-react";
import { formatMK, toggleFavorite, isFavorite } from "@/lib/utils";

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600","from-purple-400 to-purple-600",
  "from-green-400 to-green-600","from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600","from-teal-400 to-teal-600",
];
function colorFor(name: string) { return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }

export function ServiceCard({ service }: { service: any }) {
  const w = service.worker;
  const [fav, setFav] = useState(() => isFavorite(service.id));

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav(toggleFavorite(service.id));
  };

  const phone = w?.phone || w?.whatsapp;
  const wa = w?.whatsapp;

  return (
    <div className={`group relative bg-card border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${service.isFeatured ? "border-primary/40 shadow-primary/5 shadow-md" : "border-card-border"}`}>
      {service.isFeatured && (
        <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground text-xs font-black px-3 py-1 text-center tracking-wide uppercase">
          ⭐ Featured Listing
        </div>
      )}

      {/* Favorite heart */}
      <button onClick={handleFav} className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${fav ? "bg-red-500 text-white" : "bg-white/80 text-gray-400 hover:text-red-400"}`}>
        <Heart size={13} className={fav ? "fill-white" : ""} />
      </button>

      <div className="p-4">
        {w && (
          <div className="flex items-center gap-2 mb-3 pr-6">
            <div className="relative shrink-0">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorFor(w.name || "")} flex items-center justify-center text-sm font-black text-white overflow-hidden`}>
                {w.profilePhoto ? <img src={w.profilePhoto} alt={w.name} className="w-full h-full object-cover" /> : w.name?.charAt(0)}
              </div>
              {(w.isOnline || service.isOnline) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold truncate">{w.name}</span>
                {w.isVerified && <CheckCircle size={11} className="text-primary shrink-0" />}
                {w.isTrusted && <Award size={11} className="text-amber-500 shrink-0" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={9} /><span className="truncate">{service.location}</span>
              </div>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${service.isOnline ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
              {service.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        )}

        <Link href={`/services/${service.id}`}>
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">{service.title}</h3>
        </Link>

        {service.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{service.description}</p>}

        {(service.rating ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= Math.round(service.rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"} />)}</div>
            <span className="text-xs font-semibold">{service.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({service.reviewCount || 0})</span>
          </div>
        )}

        <div className="pt-2 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">From</div>
              <div className="text-sm font-black text-primary">{service.priceDisplay || formatMK(service.price)}</div>
            </div>
            <Link href={`/services/${service.id}`} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-all">
              View
            </Link>
          </div>

          {/* Contact buttons */}
          {(wa || phone) && (
            <div className="flex gap-2">
              {wa && (
                <a href={`https://wa.me/265${wa.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg text-xs font-semibold transition-all">
                  <MessageCircle size={12} /> WhatsApp
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} onClick={e => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg text-xs font-semibold transition-all">
                  <Phone size={12} /> Call
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

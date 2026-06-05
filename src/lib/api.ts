import { supabase, isSupabaseConfigured } from "./supabase";
import { cache } from "./cache";

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------
function normalizeWorker(p: any) {
  if (!p) return null;
  return {
    ...p,
    profilePhoto: p.profilePhoto ?? p.profile_photo ?? null,
    isOnline: p.isOnline ?? p.is_online ?? false,
    isVerified: p.isVerified ?? p.is_verified ?? false,
    isTrusted: p.isTrusted ?? p.is_trusted ?? false,
    isBoosted: p.isBoosted ?? p.is_boosted ?? false,
  };
}

export function normalizeService(s: any) {
  if (!s) return s;
  const raw = s.worker ?? s.profiles ?? null;
  return {
    ...s,
    isFeatured: s.isFeatured ?? s.is_featured ?? false,
    isOnline: s.isOnline ?? s.is_online ?? false,
    priceDisplay: s.priceDisplay ?? s.price_display ?? null,
    priceType: s.priceType ?? s.price_type ?? null,
    reviewCount: s.reviewCount ?? s.review_count ?? 0,
    worker: normalizeWorker(raw),
  };
}

function normalizeReview(r: any) {
  if (!r) return r;
  return { ...r, reviewer: r.reviewer ?? r.profiles ?? null };
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------
async function getAuthUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user;
}

// ---------------------------------------------------------------------------
// Services API
// ---------------------------------------------------------------------------
export interface ServicesQuery {
  search?: string;
  category?: string;
  location?: string;
  isOnline?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// Demo data shown when backend is not yet configured
const DEMO_SERVICES = [
  {
    id: "demo-1",
    title: "Professional Plumbing Services",
    description: "Expert plumbing repairs, installations, and maintenance for homes and offices across Lilongwe.",
    category: "Home & Property Services",
    location: "Lilongwe",
    price: 15000,
    priceType: "fixed",
    priceDisplay: "MK 15,000",
    isOnline: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 24,
    worker: { id: "w1", name: "Chisomo Banda", isVerified: true, isTrusted: false, isBoosted: true, isOnline: true },
  },
  {
    id: "demo-2",
    title: "Mathematics & Science Tutoring",
    description: "MSCE and university level tutoring in Mathematics, Physics, and Chemistry. Online and in-person.",
    category: "Education & Skills",
    location: "Blantyre",
    price: 5000,
    priceType: "per_hour",
    priceDisplay: "MK 5,000/hr",
    isOnline: true,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 12,
    worker: { id: "w2", name: "Tiwonge Phiri", isVerified: true, isTrusted: true, isBoosted: false, isOnline: false },
  },
  {
    id: "demo-3",
    title: "Motorcycle Delivery — Same Day",
    description: "Fast, reliable same-day delivery across Lilongwe and surrounding areas. Available 7 days a week.",
    category: "Transport & Delivery",
    location: "Lilongwe",
    price: 2000,
    priceType: "per_trip",
    priceDisplay: "From MK 2,000",
    isOnline: false,
    isFeatured: false,
    rating: 4.2,
    reviewCount: 38,
    worker: { id: "w3", name: "Peter Kamanga", isVerified: false, isTrusted: false, isBoosted: false, isOnline: true },
  },
  {
    id: "demo-4",
    title: "Web Design & Development",
    description: "Modern, mobile-friendly websites for businesses. Logo design, branding, and social media setup included.",
    category: "Digital & Online Services",
    location: "Zomba",
    price: 80000,
    priceType: "fixed",
    priceDisplay: "From MK 80,000",
    isOnline: true,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 7,
    worker: { id: "w4", name: "Grace Mwale", isVerified: true, isTrusted: true, isBoosted: true, isOnline: true },
  },
  {
    id: "demo-5",
    title: "House Cleaning & Laundry",
    description: "Thorough home cleaning, laundry, ironing, and general housekeeping. Weekly and monthly packages available.",
    category: "Home & Property Services",
    location: "Mzuzu",
    price: 8000,
    priceType: "per_visit",
    priceDisplay: "MK 8,000/visit",
    isOnline: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 19,
    worker: { id: "w5", name: "Abigail Tembo", isVerified: false, isTrusted: true, isBoosted: false, isOnline: false },
  },
  {
    id: "demo-6",
    title: "Carpentry & Furniture Making",
    description: "Custom furniture, repairs, and woodwork. Beds, wardrobes, tables, and doors crafted to order.",
    category: "Home & Property Services",
    location: "Blantyre",
    price: 25000,
    priceType: "from",
    priceDisplay: "From MK 25,000",
    isOnline: false,
    isFeatured: false,
    rating: 4.3,
    reviewCount: 15,
    worker: { id: "w6", name: "Moses Chirwa", isVerified: true, isTrusted: false, isBoosted: false, isOnline: false },
  },
];

export async function fetchServices(params: ServicesQuery = {}): Promise<{ services: any[]; total: number }> {
  // Show demo data if backend not configured yet
  if (!isSupabaseConfigured) {
    const { search, category, location } = params;
    let results = [...DEMO_SERVICES];
    if (search) results = results.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));
    if (category && category !== "All Categories") results = results.filter(s => s.category === category);
    if (location && location !== "All Locations") results = results.filter(s => s.location === location);
    return { services: results, total: results.length };
  }

  const {
    search, category, location, isOnline,
    minPrice, maxPrice,
    sortBy = "newest",
    page = 1,
    limit = 12,
  } = params;

  const cacheKey = `services?${JSON.stringify(params)}`;
  const cached = cache.get<{ services: any[]; total: number }>(cacheKey);
  if (cached) return cached;

  let q = supabase
    .from("services")
    .select(
      "id, title, description, category, location, price, price_type, price_display, is_online, rating, review_count, worker_id, status, is_featured, profiles(id, name, profile_photo, is_online, is_verified, is_trusted, is_boosted, whatsapp, phone)",
      { count: "exact" }
    )
    .eq("status", "active");

  if (search) q = q.ilike("title", `%${search}%`);
  if (category && category !== "All Categories") q = q.eq("category", category);
  if (location && location !== "All Locations") q = q.eq("location", location);
  if (isOnline) q = q.eq("is_online", true);
  if (minPrice) q = q.gte("price", minPrice);
  if (maxPrice) q = q.lte("price", maxPrice);

  const from = (page - 1) * limit;
  q = q.range(from, from + limit - 1);

  switch (sortBy) {
    case "rating":     q = q.order("rating", { ascending: false }); break;
    case "price_asc":  q = q.order("price", { ascending: true }); break;
    case "price_desc": q = q.order("price", { ascending: false }); break;
    default:           q = q.order("created_at", { ascending: false });
  }

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  const result = { services: (data ?? []).map(normalizeService), total: count ?? 0 };
  cache.set(cacheKey, result, 2 * 60 * 1000);
  return result;
}

export async function fetchServiceById(id: string): Promise<any> {
  if (!isSupabaseConfigured) {
    return DEMO_SERVICES.find(s => s.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from("services")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return normalizeService(data);
}

export async function fetchServiceReviews(serviceId: string): Promise<any[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(*)")
    .eq("service_id", serviceId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeReview);
}

export async function createService(form: {
  title: string;
  description: string;
  category: string;
  location: string;
  priceType: string;
  price: string;
  priceDisplay: string;
  tags: string;
  isOnline: boolean;
}): Promise<any> {
  const user = await getAuthUser();
  const { data, error } = await supabase
    .from("services")
    .insert({
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      price_type: form.priceType,
      price: form.price ? Number(form.price) : null,
      price_display: form.priceDisplay || null,
      is_online: form.isOnline,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      worker_id: user.id,
      status: "active",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  cache.clearPrefix("services");
  await supabase.from("notifications").insert({
    user_id: null,
    type: "new_service",
    title: `🔧 New service in ${form.location}`,
    body: `${form.title} — just listed in ${form.category}`,
    read: false,
  });
  return data;
}

export async function createBooking(params: {
  serviceId: string;
  customerId: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("bookings").insert({
    service_id: params.serviceId,
    customer_id: params.customerId,
    message: params.message,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function getOrCreateConversation(otherUserId: string): Promise<string> {
  const user = await getAuthUser();
  const me = user.id;
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(`and(user1_id.eq.${me},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${me})`)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user1_id: me, user2_id: otherUserId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id;
}

export async function trackServiceView(serviceId: string, workerId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const raw = `${navigator.userAgent}${screen.width}x${screen.height}${new Date().toDateString()}`;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
    await supabase.rpc("upsert_service_view", {
      p_service_id: serviceId,
      p_worker_id: workerId,
      p_hash: hash,
    });
  } catch {
    // Fire-and-forget
  }
}

import { supabase } from "./supabase";
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

export async function fetchServices(params: ServicesQuery = {}): Promise<{ services: any[]; total: number }> {
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

  // Pagination
  const from = (page - 1) * limit;
  q = q.range(from, from + limit - 1);

  // Sort
  switch (sortBy) {
    case "rating":     q = q.order("rating", { ascending: false }); break;
    case "price_asc":  q = q.order("price", { ascending: true }); break;
    case "price_desc": q = q.order("price", { ascending: false }); break;
    default:           q = q.order("created_at", { ascending: false });
  }

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  const result = { services: (data ?? []).map(normalizeService), total: count ?? 0 };
  cache.set(cacheKey, result, 2 * 60 * 1000); // 2 min cache
  return result;
}

export async function fetchServiceById(id: string): Promise<any> {
  const { data, error } = await supabase
    .from("services")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return normalizeService(data);
}

export async function fetchServiceReviews(serviceId: string): Promise<any[]> {
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
  // Broadcast notification
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
    // Fire-and-forget — never blocks UI
  }
}

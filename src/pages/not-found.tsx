import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-black mb-2">Page Not Found</h1>
      <p className="text-muted-foreground text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Link href="/services" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
        Browse Services
      </Link>
    </div>
  );
}

import { useState, memo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  Home, Briefcase, ShoppingBag, MessageCircle,
  User, LogOut, Settings, Sun, Moon, Menu, X,
  ChevronDown, Plus, LayoutDashboard
} from "lucide-react";

const NAV = [
  { label: "Services",  href: "/services",                                          icon: ShoppingBag },
  { label: "Post",      href: "/post-service",                                       icon: Plus },
  { label: "Dashboard", href: "/dashboard",                                          icon: LayoutDashboard },
];

const BOTTOM_NAV = [
  { label: "Home",     href: "/",             icon: Home },
  { label: "Services", href: "/services",     icon: ShoppingBag },
  { label: "Post",     href: "/post-service", icon: Plus },
  { label: "Messages", href: "/messages",     icon: MessageCircle },
  { label: "Profile",  href: "/dashboard",   icon: User },
];

const NavItem = memo(({ n, active }: { n: typeof NAV[0]; active: boolean }) => (
  <Link
    href={n.href}
    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${active ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"}`}
  >
    <n.icon size={12} />
    {n.label}
  </Link>
));

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [uMenu, setUMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[hsl(215,70%,18%)] to-[hsl(215,60%,22%)] border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-3 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">B</span>
            </div>
            <span className="text-white font-black text-sm hidden sm:block">BlinkBuy <span className="text-blue-300 font-medium">Services</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV.map(n => <NavItem key={n.href} n={n} active={loc === n.href || (n.href !== "/" && loc.startsWith(n.href))} />)}
          </nav>

          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={toggleTheme} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setUMenu(!uMenu)} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 transition-all">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {profile?.profilePhoto
                      ? <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                      : (profile?.name?.charAt(0) || user.email?.charAt(0) || "?")}
                  </div>
                  <ChevronDown size={12} className="text-white/60" />
                </button>
                {uMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-card-border rounded-xl shadow-xl py-1 z-50">
                    <Link href="/dashboard" onClick={() => setUMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-all">
                      <LayoutDashboard size={13} /> Dashboard
                    </Link>
                    <Link href="/settings" onClick={() => setUMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-all">
                      <Settings size={13} /> Settings
                    </Link>
                    <hr className="border-border my-1" />
                    <button onClick={() => { logout(); setUMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-all">
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/login" className="text-xs text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all">Login</Link>
                <Link href="/register" className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 transition-all">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10">
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-white/10 py-2 px-3 flex flex-col gap-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${loc.startsWith(n.href) ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                <n.icon size={15} />{n.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-card-border safe-area-bottom">
        <div className="flex">
          {BOTTOM_NAV.map(n => {
            const active = n.href === "/" ? loc === "/" : loc.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon size={18} className={active ? "text-primary" : ""} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Overlay for user menu */}
      {uMenu && <div className="fixed inset-0 z-30" onClick={() => setUMenu(false)} />}
    </div>
  );
}

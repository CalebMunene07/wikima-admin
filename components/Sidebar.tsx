"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, CalendarCheck, History, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

const links = [
  { href: "/analytics", label: "Analytics",  icon: LayoutDashboard },
  { href: "/tours",    label: "Tours",       icon: Map },
  { href: "/bookings", label: "Bookings",    icon: CalendarCheck },
  { href: "/history",  label: "History",     icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleSignOut = async () => { await supabase().auth.signOut(); router.push("/login"); };

  return (
    <aside className="w-64 flex flex-col h-screen sticky top-0 shrink-0"
      style={{ background: "rgba(2,15,9,0.95)", borderRight: "1px solid rgba(212,175,55,0.15)" }}>

      {/* Logo */}
      <div className="px-6 py-5 flex flex-col items-center" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
        <Image src="/logo.jpeg" alt="Wikima Safari" width={80} height={80} style={{ objectFit: "contain" }} />
        <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: "#D4AF37" }}>Staff Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? "linear-gradient(135deg, #D4AF37, #a07830)" : "transparent",
                color: active ? "#07301d" : "rgba(245,240,232,0.6)",
              }}>
              <Icon size={17} />{label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all"
          style={{ color: "rgba(245,240,232,0.4)" }}
          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,0.4)"}>
          <LogOut size={17} />Sign out
        </button>
      </div>
    </aside>
  );
}

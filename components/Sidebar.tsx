"use client";
// components/Sidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, CalendarCheck, Users, Map,
  BarChart2, Settings, LogOut, Mail,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Overview",   icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings",   icon: CalendarCheck },
  { href: "/dashboard/emails",   label: "Emails",     icon: Mail },
  { href: "/dashboard/tours",    label: "Tours",      icon: Map },
  { href: "/dashboard/guests",   label: "Guests",     icon: Users },
  { href: "/dashboard/analytics",label: "Analytics",  icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings",   icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(0,0,0,0.2)",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
            <Image src="/logo.jpeg" alt="Wikima" width={32} height={32} style={{ objectFit: "cover" }}/>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#e8f5e9", fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
              Wikima Safari
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: 0, letterSpacing: "0.06em" }}>
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 2 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                background: isActive ? "rgba(45,106,79,0.35)" : "transparent",
                color: isActive ? "#52b788" : "rgba(255,255,255,0.5)",
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
                borderLeft: isActive ? "2px solid #52b788" : "2px solid transparent",
              }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}}
              >
                <Icon size={15} style={{ flexShrink: 0 }}/>
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/logout" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.1)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}>
            <LogOut size={15}/>
            Sign Out
          </div>
        </Link>
      </div>
    </aside>
  );
}

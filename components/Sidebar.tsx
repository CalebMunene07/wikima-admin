"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard, CalendarCheck, Mail, Map,
  Users, BarChart2, Settings, LogOut, History,
  Menu, X,
} from "lucide-react";

const NAV = [
  { href:"/dashboard",            label:"Overview",   icon:LayoutDashboard },
  { href:"/dashboard/bookings",   label:"Bookings",   icon:CalendarCheck },
  { href:"/dashboard/emails",     label:"Emails",     icon:Mail },
  { href:"/dashboard/tours",      label:"Tours",      icon:Map },
  { href:"/dashboard/analytics",  label:"Analytics",  icon:BarChart2 },
  { href:"/dashboard/history",    label:"History",    icon:History },
  { href:"/dashboard/settings",   label:"Settings",   icon:Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  // Initialize the modern client-side Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 sticky top-0 z-40"
        style={{ height:56, borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(0,0,0,0.35)", fontFamily:"'DM Sans',sans-serif" }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, overflow:"hidden", flexShrink:0, border:"1px solid rgba(82,183,136,0.25)" }}>
            <Image src="/logo.jpeg" alt="Wikima" width={30} height={30} style={{ objectFit:"cover" }}/>
          </div>
          <p style={{ fontSize:13, fontWeight:700, color:"#e8f5e9", margin:0 }}>Wikima Safari</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", padding:6 }}
        >
          <Menu size={22}/>
        </button>
      </div>

      {/* Overlay (mobile only, shown when drawer open) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background:"rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full md:h-auto transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ width:220, minHeight:"100vh", display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.07)", background:"#07301d", flexShrink:0, fontFamily:"'DM Sans',sans-serif" }}
      >
        {/* Logo */}
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, overflow:"hidden", flexShrink:0, border:"1px solid rgba(82,183,136,0.25)" }}>
              <Image src="/logo.jpeg" alt="Wikima" width={34} height={34} style={{ objectFit:"cover" }}/>
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#e8f5e9", margin:0, lineHeight:1.2 }}>Wikima Safari</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0, letterSpacing:"0.06em", textTransform:"uppercase" }}>Admin Portal</p>
            </div>
          </div>
          {/* Close button, mobile only */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden"
            style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", padding:4 }}
          >
            <X size={18}/>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"14px 10px" }}>
          {NAV.map(({ href, label, icon:Icon }) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ textDecoration:"none", display:"block", marginBottom:2 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, background:active?"rgba(45,106,79,0.35)":"transparent", color:active?"#52b788":"rgba(255,255,255,0.45)", fontSize:13, fontWeight:active?600:400, borderLeft:active?"2px solid #52b788":"2px solid transparent", transition:"all 0.15s", cursor:"pointer" }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.8)"; }}}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background="transparent"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.45)"; }}}>
                  <Icon size={15} style={{ flexShrink:0 }}/>{label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding:"10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={handleLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget.style.background="rgba(248,113,113,0.1)"); (e.currentTarget.style.color="#f87171"); }}
            onMouseLeave={e => { (e.currentTarget.style.background="transparent"); (e.currentTarget.style.color="rgba(255,255,255,0.3)"); }}>
            <LogOut size={15}/>Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

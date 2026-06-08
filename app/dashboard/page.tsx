"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { CalendarCheck, Mail, Map, TrendingUp, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string; guest_name: string; tour_title: string;
  travel_date: string; status: string;
  total_amount: number; deposit_amount: number;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed:"#52b788", pending:"#f6c90e",
  cancelled:"#f87171", completed:"#74c69d",
};

export default function DashboardOverview() {
  // Initialize the modern client-side Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tourCount, setTourCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [bRes, tRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at",{ascending:false}).limit(50),
        supabase.from("tours").select("id",{count:"exact",head:true}),
      ]);
      setBookings(bRes.data || []);
      setTourCount(tRes.count || 0);
      setLoading(false);
    };
    void load();
  }, [supabase]);

  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status==="pending").length;
  const confirmed = bookings.filter(b => b.status==="confirmed").length;
  const revenue   = bookings.reduce((s,b) => s+(b.deposit_amount||0), 0);

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:700,color:"#e8f5e9",margin:"0 0 4px"}}>Dashboard</h1>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:0}}>Welcome back — here&apos;s what&apos;s happening.</p>
      </div>

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12}}>
          <Loader2 size={24} style={{color:"#52b788",animation:"spin 1s linear infinite"}}/>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>Loading…</span>
        </div>
      ) : (<>
        {/* Stat Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:28}}>
          {[
            {label:"Total Bookings",value:total,       icon:<CalendarCheck size={18}/>,sub:`${confirmed} confirmed`},
            {label:"Pending",       value:pending,     icon:<Clock size={18}/>,         sub:"Awaiting confirmation"},
            {label:"Deposits",      value:`$${revenue.toLocaleString()}`,icon:<TrendingUp size={18}/>,sub:"Total collected"},
            {label:"Active Tours",  value:tourCount,   icon:<Map size={18}/>,           sub:"In your catalog"},
          ].map(c => (
            <div key={c.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"20px 22px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{c.label}</span>
                <span style={{color:"#52b788",opacity:0.8}}>{c.icon}</span>
              </div>
              <p style={{fontSize:28,fontWeight:700,color:"#e8f5e9",margin:"0 0 4px"}}>{c.value}</p>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28}}>
          {[
            {href:"/dashboard/bookings",label:"View All Bookings",icon:<CalendarCheck size={16}/>,bg:"#2d6a4f"},
            {href:"/dashboard/emails",  label:"Open Inbox",       icon:<Mail size={16}/>,          bg:"#1e4a6e"},
            {href:"/dashboard/tours",   label:"Manage Tours",     icon:<Map size={16}/>,           bg:"#3a2d6e"},
          ].map(l => (
            <Link key={l.href} href={l.href} style={{textDecoration:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",background:l.bg,borderRadius:12,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",transition:"opacity 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.opacity="0.8")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                {l.icon}{l.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Bookings Table */}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <h2 style={{fontSize:14,fontWeight:600,color:"#e8f5e9",margin:0}}>Recent Bookings</h2>
            <Link href="/dashboard/bookings" style={{fontSize:12,color:"#52b788",textDecoration:"none"}}>View all →</Link>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  {["Guest","Tour","Date","Amount","Status"].map(h=>(
                    <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0,8).map((b,i)=>(
                  <tr key={b.id} style={{borderBottom:i<7?"1px solid rgba(255,255,255,0.04)":"none"}}>
                    <td style={{padding:"12px 16px",fontSize:13,color:"#e8f5e9",fontWeight:500}}>{b.guest_name}</td>
                    <td style={{padding:"12px 16px",fontSize:12,color:"rgba(255,255,255,0.6)"}}>{b.tour_title}</td>
                    <td style={{padding:"12px 16px",fontSize:12,color:"rgba(255,255,255,0.5)"}}>{b.travel_date?new Date(b.travel_date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—"}</td>
                    <td style={{padding:"12px 16px",fontSize:13,color:"#52b788",fontWeight:600}}>${(b.total_amount||0).toLocaleString()}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${STATUS_COLOR[b.status]||"#888"}22`,color:STATUS_COLOR[b.status]||"#888",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>)}
    </div>
  );
}

'use client';
export const runtime = "edge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Enter email and password."); return; }
    setLoading(true); setError(null);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard/tours");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #07301d 0%, #041f13 60%, #020f09 100%)" }}>
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #D4AF37 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="Wikima Safari Expeditions"
            width={180}
            height={180}
            className="mb-2 drop-shadow-2xl"
            style={{ objectFit: "contain" }}
            priority
          />
          <p className="text-sm tracking-[0.2em] uppercase font-medium mt-1" style={{ color: "#D4AF37" }}>
            Staff Portal
          </p>
          <p className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.45)" }}>
            Authorized access only
          </p>
        </div>

        <div className="rounded-2xl p-6 shadow-2xl"
          style={{ background: "rgba(4,31,19,0.85)", border: "1px solid rgba(212,175,55,0.25)", backdropFilter: "blur(12px)" }}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#D4AF37" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="staff@wikimasafari.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition"
                style={{ background: "rgba(2,15,9,0.6)", border: "1px solid rgba(212,175,55,0.2)", color: "#f5f0e8" }}
                onFocus={e => e.target.style.border = "1px solid rgba(212,175,55,0.6)"}
                onBlur={e => e.target.style.border = "1px solid rgba(212,175,55,0.2)"} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#D4AF37" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition"
                style={{ background: "rgba(2,15,9,0.6)", border: "1px solid rgba(212,175,55,0.2)", color: "#f5f0e8" }}
                onFocus={e => e.target.style.border = "1px solid rgba(212,175,55,0.6)"}
                onBlur={e => e.target.style.border = "1px solid rgba(212,175,55,0.2)"} />
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="mt-6 w-full py-3 font-bold text-sm rounded-lg transition-all disabled:opacity-50 tracking-wide"
            style={{ background: "linear-gradient(135deg, #D4AF37 0%, #a07830 100%)", color: "#07301d" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
        <p className="text-center text-xs mt-6" style={{ color: "rgba(245,240,232,0.25)" }}>
          Wikima Safari Expeditions © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

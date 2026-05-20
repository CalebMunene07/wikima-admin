import Sidebar from "@/components/Sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(160deg, #07301d 0%, #041f13 60%, #020f09 100%)" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

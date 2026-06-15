export const runtime = 'edge';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#f5f0e8" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.5)" }}>
          Manage your account and site preferences
        </p>
      </div>

      <div
        className="rounded-xl border p-8 text-center"
        style={{
          background: "rgba(245,240,232,0.03)",
          borderColor: "rgba(245,240,232,0.1)",
        }}
      >
        <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>
          Settings options are coming soon.
        </p>
      </div>
    </div>
  );
}

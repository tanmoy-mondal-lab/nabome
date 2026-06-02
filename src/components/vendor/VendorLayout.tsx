type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function VendorLayout({ sidebar, children }: Props) {
  return (
    <div style={{
      display: "flex", gap: 28, padding: "40px 6% 80px",
      maxWidth: 1400, margin: "0 auto", alignItems: "flex-start",
    }}>
      <div style={{ flexShrink: 0, width: 260, display: "var(--sidebar-display, block)" }}>
        {sidebar}
      </div>
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

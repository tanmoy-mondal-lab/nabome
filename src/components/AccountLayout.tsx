import { useMediaQuery } from "../hooks/useMediaQuery";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function AccountLayout({ sidebar, children }: Props) {
  const isDesktop = useMediaQuery("(min-width: 900px)");

  return (
    <section style={{
      padding: "40px 6% 80px",
      display: "flex",
      gap: 32,
      flexDirection: isDesktop ? "row" : "column",
      alignItems: "flex-start",
    }}>
      {sidebar}
      <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
        {children}
      </div>
    </section>
  );
}

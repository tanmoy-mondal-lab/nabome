import { useLocation } from "react-router-dom";
import { type ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="fade-in" key={location.pathname + location.search}>
      {children}
    </div>
  );
}

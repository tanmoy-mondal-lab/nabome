import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

export default function Unauthorized() {
  return (
    <>
      <SEO title="Unauthorized | নবME" description="You don't have access to this page." />
      <Navbar />
      <main className="page" style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "100px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ textAlign: "center", maxWidth: 480 }}
        >
          <div style={{ fontSize: "4rem", color: "var(--gold)", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <ShieldAlert size={72} />
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 300, marginBottom: 16 }}>
            Access Denied
          </h1>
          <p className="lede" style={{ marginBottom: 32, color: "var(--muted)" }}>
            You don't have the required permissions to view this page. If you believe this is a mistake, please contact support.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <Home size={16} /> Go Home
            </Link>
            <Link to="/profile" className="ghost-button" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <ArrowLeft size={16} /> My Profile
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}

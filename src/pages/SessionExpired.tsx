import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TimerOff, LogIn } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

export default function SessionExpired() {
  return (
    <>
      <SEO title="Session Expired | নবME" description="Your session has expired. Please log in again." />
      <Navbar />
      <main className="page" style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "100px 6%" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ textAlign: "center", maxWidth: 480 }}
        >
          <div style={{ fontSize: "4rem", color: "var(--gold)", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <TimerOff size={72} />
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 300, marginBottom: 16 }}>
            Session Expired
          </h1>
          <p className="lede" style={{ marginBottom: 32, color: "var(--muted)" }}>
            Your session has timed out. Please log in again to continue.
          </p>
          <Link to="/login" className="premium-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <LogIn size={16} /> Log In Again
          </Link>
        </motion.div>
      </main>
    </>
  );
}

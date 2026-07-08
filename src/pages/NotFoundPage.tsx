import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LayoutDashboard, ShoppingBag, Grid3X3, HelpCircle } from "lucide-react";
import { useAuthStore } from "../stores/auth-store";
import { Helmet } from "react-helmet-async";

const popularRoutes = [
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Collections", href: "/collections", icon: Grid3X3 },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
];

export default function NotFoundPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center bg-white px-4"
    >
      <Helmet>
        <title>Page Not Found — নবME</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto">
            <rect width="100" height="100" rx="12" fill="#8b6940" />
            <text x="50" y="68" fontFamily="serif" fontSize="52" fontWeight="700" fill="white" textAnchor="middle">N</text>
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-8xl font-display text-brand-500 mb-2"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-xl text-neutral-500 font-light mb-8"
        >
          The page you are looking for does not exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          {isAdmin && (
            <Link to="/admin" className="btn-secondary inline-flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Popular Pages</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {popularRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.href}
                  to={route.href}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-xs uppercase tracking-wider text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-all duration-300"
                >
                  <Icon className="w-3 h-3" />
                  {route.label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

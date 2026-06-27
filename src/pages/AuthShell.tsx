import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, heroTitle, heroSubtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex bg-neutral-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
              নবME
            </Link>
            <h1 className="mt-6 font-display text-2xl text-neutral-900">{title}</h1>
            <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.25),_transparent_40%),linear-gradient(135deg,#1c1c1e_0%,#5d4527_55%,#8b6940_100%)]">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_32%)]" />
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="max-w-md text-center text-white">
            <p className="font-display text-5xl leading-tight mb-6">{heroTitle}</p>
            <p className="font-body text-sm tracking-widest uppercase opacity-70">{heroSubtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

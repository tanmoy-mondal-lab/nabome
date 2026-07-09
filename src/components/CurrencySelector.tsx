import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/client";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  formattingLocale: string;
}

export function CurrencySelector() {
  const { i18n: _i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("INR");
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.get("/api/currencies"),
    staleTime: 1000 * 60 * 30,
  });

  const currencies = ((data as any)?.currencies ?? []) as Currency[];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("nabome-currency");
    if (stored) setSelected(stored);
  }, []);

  function selectCurrency(code: string) {
    setSelected(code);
    localStorage.setItem("nabome-currency", code);
    setOpen(false);
    window.location.reload();
  }

  const current = currencies.find((c) => c.code === selected);
  if (currencies.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
        aria-label="Select currency"
      >
        <span>{current?.symbol || selected}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-neutral-100 shadow-lg min-w-[120px] z-50">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => selectCurrency(c.code)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors",
                c.code === selected
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

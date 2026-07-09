import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { SUPPORTED_LANGUAGES } from "../lib/i18n";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  function switchLang(code: string) {
    void i18n.changeLanguage(code);
    document.documentElement.lang = code;
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
        aria-label="Switch language"
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{current.nativeName}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-neutral-100 shadow-lg min-w-[140px] z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider transition-colors",
                lang.code === i18n.language
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              {lang.nativeName}
              <span className="ml-2 text-[10px] text-neutral-400">({lang.name})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

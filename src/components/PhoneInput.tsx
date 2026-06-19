import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+1", label: "CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+91", label: "IN +91" },
  { code: "+61", label: "AU +61" },
  { code: "+81", label: "JP +81" },
  { code: "+86", label: "CN +86" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+39", label: "IT +39" },
  { code: "+7", label: "RU +7" },
  { code: "+55", label: "BR +55" },
  { code: "+82", label: "KR +82" },
  { code: "+65", label: "SG +65" },
  { code: "+971", label: "AE +971" },
  { code: "+966", label: "SA +966" },
  { code: "+974", label: "QA +974" },
  { code: "+968", label: "OM +968" },
  { code: "+973", label: "BH +973" },
  { code: "+880", label: "BD +880" },
  { code: "+92", label: "PK +92" },
  { code: "+94", label: "LK +94" },
  { code: "+977", label: "NP +977" },
  { code: "+60", label: "MY +60" },
  { code: "+63", label: "PH +63" },
  { code: "+62", label: "ID +62" },
  { code: "+64", label: "NZ +64" },
  { code: "+27", label: "ZA +27" },
  { code: "+20", label: "EG +20" },
  { code: "+234", label: "NG +234" },
  { code: "+254", label: "KE +254" },
  { code: "+233", label: "GH +233" },
  { code: "+351", label: "PT +351" },
  { code: "+34", label: "ES +34" },
  { code: "+31", label: "NL +31" },
  { code: "+32", label: "BE +32" },
  { code: "+41", label: "CH +41" },
  { code: "+46", label: "SE +46" },
  { code: "+47", label: "NO +47" },
  { code: "+45", label: "DK +45" },
  { code: "+358", label: "FI +358" },
  { code: "+30", label: "GR +30" },
  { code: "+48", label: "PL +48" },
  { code: "+36", label: "HU +36" },
  { code: "+420", label: "CZ +420" },
  { code: "+43", label: "AT +43" },
  { code: "+353", label: "IE +353" },
  { code: "+852", label: "HK +852" },
  { code: "+886", label: "TW +886" },
];

function parsePhone(value: string): { countryCode: string; number: string } {
  for (const c of COUNTRY_CODES) {
    if (value.startsWith(c.code)) {
      return { countryCode: c.code, number: value.slice(c.code.length) };
    }
  }
  return { countryCode: "+91", number: value };
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  id?: string;
}

export function PhoneInput({ value, onChange, className = "", required, id }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const parsed = parsePhone(value);
  const [selectedCode, setSelectedCode] = useState(parsed.countryCode);
  const [localNumber, setLocalNumber] = useState(parsed.number);

  function handleCodeChange(code: string) {
    setSelectedCode(code);
    onChange(code + localNumber);
  }

  function handleNumberChange(num: string) {
    const digits = num.replace(/\D/g, "");
    setLocalNumber(digits);
    onChange(selectedCode + digits);
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative shrink-0">
        <select
          value={selectedCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="input-field appearance-none cursor-pointer pr-6 w-[90px]"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={`${c.code}-${c.label}`} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      <input
        id={id}
        type="tel"
        value={localNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="input-field flex-1 min-w-0"
        placeholder="9876543210"
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import type { Screen, UserProfile, Address } from "./data/types";
import { t, languages } from "./data/strings";
import {
  mockFarmers,
  mockProducts,
  mockNotifications,
  mockSchemes,
  mockWeather,
  mockMarketPrices,
  mockCropAdvisory,
  mockEvents,
  PRODUCTS_LIST,
  FARMER_TYPES,
  INDIAN_STATES,
  COOPERATIVE_FILTERS,
  CHAT_SUGGESTIONS,
} from "./data/mock";
import agrixLogo from "./imports/agrix.jpeg";

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 && /^[6-9]/.test(d);
}
function validateEmail(email: string) {
  if (!email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function validatePin(pin: string) {
  return /^\d{6}$/.test(pin);
}
function validateName(name: string) {
  return name.trim().length >= 2 && /\S/.test(name);
}

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function TrustBadge({ score }: { score: number }) {
  const cls =
    score >= 90
      ? "bg-emerald-100 text-emerald-800"
      : score >= 75
      ? "bg-amber-100 text-amber-800"
      : "bg-orange-100 text-orange-700";
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
      ⭐ {score}
    </span>
  );
}

function MatchBadge({ pct }: { pct: number }) {
  return (
    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-green-600 text-white">
      {pct}%
    </span>
  );
}

function FieldError({ msg }: { msg: string }) {
  return msg ? (
    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
      ⚠ {msg}
    </p>
  ) : null;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  suffix,
  prefix,
  maxLength,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  maxLength?: number;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      <div
        className={`flex border-2 rounded-2xl overflow-hidden transition-all ${
          error ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-green-600 bg-white"
        }`}
      >
        {prefix && <div className="flex items-center px-3 text-gray-500 bg-gray-50 border-r border-gray-200">{prefix}</div>}
        <input
          type={type}
          readOnly={readOnly}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(type === "tel" ? e.target.value.replace(/\D/g, "") : e.target.value)}
          className="flex-1 px-4 py-3.5 text-sm outline-none bg-transparent"
        />
        {suffix && <div className="flex items-center pr-3">{suffix}</div>}
      </div>
      <FieldError msg={error || ""} />
    </div>
  );
}

function greeting(lang: string) {
  const h = new Date().getHours();
  if (h < 12) return t(lang, "goodMorning");
  if (h < 17) return t(lang, "goodAfternoon");
  return t(lang, "goodEvening");
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

function BottomNav({
  screen,
  go,
  lang,
  onMic,
}: {
  screen: Screen;
  go: (s: Screen) => void;
  lang: string;
  onMic: () => void;
}) {
  const tabs: { id: Screen; icon: string; lk: string }[] = [
    { id: "home", icon: "🏠", lk: "home" },
    { id: "marketplace", icon: "🛒", lk: "marketplace" },
    { id: "cooperative", icon: "🤝", lk: "cooperative" },
    { id: "dashboard", icon: "📊", lk: "dashboard" },
    { id: "profile", icon: "👤", lk: "profile" },
  ];

  return (
    <>
      {/* Floating mic */}
      <div className="fixed z-50" style={{ bottom: 68, left: "50%", transform: "translateX(-50%)" }}>
        <button
          onClick={onMic}
          className="w-14 h-14 rounded-full bg-green-800 border-4 border-white flex items-center justify-center active:scale-95 transition-all"
          style={{ boxShadow: "0 6px 28px rgba(27,94,32,0.55)" }}
        >
          <span className="text-2xl">🎤</span>
        </button>
      </div>

      {/* Nav bar — full width, safe area aware */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">
          {tabs.map((tab, i) => {
            const isActive = screen === tab.id;
            const gap = i === 2 ? "opacity-0 pointer-events-none" : "";
            return (
              <button
                key={tab.id}
                onClick={() => go(tab.id)}
                className={`flex flex-col items-center gap-0.5 flex-1 ${gap}`}
              >
                <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>{tab.icon}</span>
                <span className={`text-[9px] font-bold tracking-wide ${isActive ? "text-green-800" : "text-gray-400"}`}>
                  {t(lang, tab.lk).toUpperCase().slice(0, 8)}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-green-700" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const tm = setTimeout(onDone, 2800);
    return () => clearTimeout(tm);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-green-900 select-none relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        {["🌾", "🌱", "🐄", "🌿", "🍃"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-6xl"
            style={{ top: `${15 + i * 18}%`, left: `${5 + i * 22}%`, transform: `rotate(${i * 30}deg)` }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-5 z-10">
        <div
          className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-400/70"
          style={{ boxShadow: "0 0 0 8px rgba(196,154,0,0.15), 0 16px 48px rgba(0,0,0,0.4)" }}
        >
          <img src={agrixLogo} alt="AgriX" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Agri<span className="text-amber-400">X</span>
          </h1>
          <p className="text-amber-300/80 text-[13px] font-medium mt-2 tracking-[0.2em]">
            CONNECT • GROW • TRADE • SUSTAIN
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 flex gap-2 items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse [animation-delay:300ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:600ms]" />
      </div>
    </div>
  );
}

// ─── Language Select ──────────────────────────────────────────────────────────

function LanguageScreen({ onSelect }: { onSelect: (lang: string) => void }) {
  const [sel, setSel] = useState("ml");
  const selLang = languages.find((l) => l.code === sel)!;

  return (
    <div className="flex flex-col h-full bg-green-900">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/60 mb-4">
          <img src={agrixLogo} alt="AgriX" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-white text-2xl font-bold">
          {sel === "ml" ? "ഭാഷ തിരഞ്ഞെടുക്കുക" : sel === "hi" ? "भाषा चुनें" : "Choose Language"}
        </h2>
        <p className="text-green-300 text-xs mt-1">Select your preferred language</p>
      </div>

      {/* Language grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSel(lang.code)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                sel === lang.code
                  ? "border-amber-400 bg-white/15 shadow-lg"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {lang.code === "ml" && (
                <span className="absolute top-2 right-2 text-[9px] bg-amber-400 text-green-900 font-black px-1.5 py-0.5 rounded-full">
                  DEFAULT
                </span>
              )}
              <span className="text-xl">{lang.flag}</span>
              <span className={`text-base font-bold ${sel === lang.code ? "text-white" : "text-green-200"}`}>
                {lang.name}
              </span>
              <span className="text-[10px] text-green-400">{lang.label}</span>
              {sel === lang.code && (
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                  <span className="text-green-900 text-[9px] font-black">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Continue */}
      <div className="px-4 pb-6 pt-3 bg-green-900/80">
        <button
          onClick={() => onSelect(sel)}
          className="w-full bg-amber-400 text-green-900 font-black py-4 rounded-2xl text-lg shadow-xl active:scale-95 transition-transform"
        >
          {selLang.code === "ml" ? "തുടരുക" : selLang.code === "hi" ? "जारी रखें" :
           selLang.code === "ta" ? "தொடரவும்" : selLang.code === "te" ? "కొనసాగించు" : "Continue"} →
        </button>
      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(165deg, #1B5E20 0%, #2E7D32 50%, #1B5E20 100%)" }}
      />
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-amber-400/10" />

      <div className="relative flex flex-col items-center justify-center flex-1 px-8 gap-8">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400/60"
            style={{ boxShadow: "0 0 0 8px rgba(196,154,0,0.1), 0 16px 40px rgba(0,0,0,0.3)" }}
          >
            <img src={agrixLogo} alt="AgriX" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white">
              Agri<span className="text-amber-400">X</span>
            </h1>
            <p className="text-green-300 text-sm mt-1">{t(lang, "tagline")}</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {["🌾 Marketplace", "🤝 Cooperative", "🤖 AI Advisory", "📋 Schemes"].map((f) => (
            <span key={f} className="bg-white/10 text-green-100 text-xs px-3 py-1.5 rounded-full border border-white/20">
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={() => go("login")}
          className="w-full bg-white text-green-900 font-black py-5 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <span className="text-2xl">🔑</span>
          {t(lang, "login")}
        </button>
        <button
          onClick={() => go("register-1")}
          className="w-full bg-amber-400 text-green-900 font-black py-5 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-amber-300"
        >
          <span className="text-2xl">🌱</span>
          {t(lang, "register")}
        </button>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ lang, go, onLogin }: { lang: string; go: (s: Screen) => void; onLogin: (phone: string) => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [demoOtp, setDemoOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const DEMO_PHONE = "9876543210";

  function handleSendOtp() {
    const e: Record<string, string> = {};
    if (!validatePhone(phone)) e.phone = t(lang, "phoneRequired");
    setErrors(e);
    if (Object.keys(e).length) return;
    const demo = String(100000 + (parseInt(phone.slice(-4)) || 1234) * 7).slice(0, 6);
    setDemoOtp(demo);
    setStep("otp");
  }

  function otpInput(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function otpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  }

  function handleVerify() {
    const code = otp.join("");
    if (code !== demoOtp) {
      setErrors({ otp: t(lang, "otpInvalid") });
      return;
    }
    onLogin(phone);
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="bg-green-800 px-5 pt-14 pb-7 rounded-b-3xl">
          <button onClick={() => setStep("phone")} className="text-white/60 text-sm mb-4 flex items-center gap-1">
            ‹ {t(lang, "back")}
          </button>
          <h2 className="text-2xl font-black text-white">{t(lang, "verifyOtp")}</h2>
          <p className="text-green-300 text-sm mt-0.5">{t(lang, "otpSentTo")} +91 {phone}</p>
        </div>
        <div className="flex-1 px-5 pt-8 flex flex-col gap-6">
          <div>
            <p className="text-center text-sm text-gray-500 mb-5">{t(lang, "enterOtp")}</p>
            <div className="flex justify-center gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="tel"
                  maxLength={1}
                  value={d}
                  onChange={(e) => otpInput(i, e.target.value)}
                  onKeyDown={(e) => otpKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-2xl font-black border-2 rounded-2xl outline-none transition-all ${
                    d ? "border-green-600 bg-green-50" : errors.otp ? "border-red-400" : "border-gray-200"
                  }`}
                />
              ))}
            </div>
            <FieldError msg={errors.otp || ""} />
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
            <p className="text-xs text-amber-600 font-medium mb-1">💡 {t(lang, "demoOtpHint")}</p>
            <p className="text-3xl font-black text-amber-700 tracking-widest">{demoOtp}</p>
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all"
          >
            {t(lang, "verifyOtp")} →
          </button>
          <button onClick={() => setOtp(["", "", "", "", "", ""])} className="text-center text-green-700 font-bold text-sm">
            {t(lang, "resendOtp")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-green-800 px-5 pt-14 pb-7 rounded-b-3xl">
        <button onClick={() => go("auth")} className="text-white/60 text-sm mb-4 flex items-center gap-1">
          ‹ {t(lang, "back")}
        </button>
        <h2 className="text-2xl font-black text-white">{t(lang, "welcomeBack")}</h2>
        <p className="text-green-300 text-sm mt-0.5">{t(lang, "loginOtp")}</p>
      </div>

      <div className="flex-1 px-5 pt-6 flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{t(lang, "phone")}</label>
          <div className={`flex border-2 rounded-2xl overflow-hidden ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-green-700"}`}>
            <div className="flex items-center gap-1.5 px-3 bg-green-50 border-r border-gray-200">
              <span className="text-base">🇮🇳</span>
              <span className="text-sm font-bold text-green-800">+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              className="flex-1 px-3 py-3.5 text-base outline-none bg-transparent"
              placeholder={t(lang, "phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            />
            {validatePhone(phone) && <span className="pr-3 flex items-center text-green-600 text-lg">✓</span>}
          </div>
          <FieldError msg={errors.phone || ""} />
        </div>

        <button
          onClick={handleSendOtp}
          className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base mt-2 shadow-lg active:scale-95 transition-all"
        >
          {t(lang, "sendOtp")} →
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
          <p className="text-xs text-blue-700 text-center font-medium">
            💡 {t(lang, "demoOtpHint")}: {t(lang, "phone")} → {DEMO_PHONE}
          </p>
        </div>

        <p className="text-center text-sm text-gray-500">
          {t(lang, "noAccount")}{" "}
          <button onClick={() => go("register-1")} className="text-green-700 font-black">{t(lang, "register")}</button>
        </p>
      </div>
    </div>
  );
}

// ─── Register Step 1 ──────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1 mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-amber-400" : "bg-white/25"}`} />
      ))}
    </div>
  );
}

function RegHeader({ lang, back, title, step, total, go }: { lang: string; back: Screen; title: string; step: number; total: number; go: (s: Screen) => void }) {
  return (
    <div className="bg-green-800 px-5 pt-14 pb-5 rounded-b-3xl">
      <button onClick={() => go(back)} className="text-white/60 text-sm mb-3 flex items-center gap-1">
        ‹ {t(lang, "back")}
      </button>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">{title}</h2>
        <span className="bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full">
          {t(lang, "step")} {step}/{total}
        </span>
      </div>
      <ProgressBar step={step} total={total} />
    </div>
  );
}

function RegisterStep1({
  lang, go, onNext, initial,
}: {
  lang: string; go: (s: Screen) => void;
  onNext: (d: { name: string; phone: string; email: string }) => void;
  initial: { name: string; phone: string; email: string };
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function next() {
    const e: Record<string, string> = {};
    if (!validateName(name)) e.name = t(lang, "nameRequired");
    if (!validatePhone(phone)) e.phone = t(lang, "phoneRequired");
    if (email && !validateEmail(email)) e.email = t(lang, "emailInvalid");
    setErrors(e);
    if (!Object.keys(e).length) onNext({ name: name.trim(), phone, email: email.trim() });
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <RegHeader lang={lang} back="auth" title={`🌱 ${t(lang, "joinAgriX")}`} step={1} total={5} go={go} />
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 flex flex-col gap-4">
        <Input label={t(lang, "name")} value={name} onChange={setName} placeholder="e.g. Rajan Pillai"
          error={errors.name} suffix={validateName(name) ? <span className="text-green-600 font-bold text-sm">✓</span> : undefined} />

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{t(lang, "phone")}</label>
          <div className={`flex border-2 rounded-2xl overflow-hidden ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-green-700"}`}>
            <div className="flex items-center gap-1.5 px-3 bg-green-50 border-r border-gray-200 shrink-0">
              <span>🇮🇳</span>
              <span className="text-sm font-bold text-green-800">+91</span>
            </div>
            <input type="tel" maxLength={10} className="flex-1 px-3 py-3.5 text-sm outline-none"
              placeholder="10-digit mobile number" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
            {validatePhone(phone) && <span className="pr-3 flex items-center text-green-600">✓</span>}
          </div>
          <p className="text-gray-400 text-[11px] mt-1">Starting with 6-9, 10 digits</p>
          <FieldError msg={errors.phone || ""} />
        </div>

        <Input label={t(lang, "email")} value={email} onChange={setEmail}
          placeholder="yourname@example.com" type="email" error={errors.email}
          suffix={email && validateEmail(email) ? <span className="text-green-600 text-sm font-bold">✓</span> : undefined} />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700">{t(lang, "mandatoryField")} — {t(lang, "email").replace(" *", "")} {t(lang, "email").includes("Optional") ? "(Optional)" : "is optional"}</p>
        </div>
      </div>
      <div className="px-5 pb-6 pt-3 border-t border-gray-100">
        <button onClick={next} className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all">
          {t(lang, "next")} →
        </button>
      </div>
    </div>
  );
}

// ─── Register OTP ─────────────────────────────────────────────────────────────

function RegisterOTPScreen({ lang, phone, go, onVerified }: { lang: string; phone: string; go: (s: Screen) => void; onVerified: () => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [cd, setCd] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cd > 0) { const t = setTimeout(() => setCd((c) => c - 1), 1000); return () => clearTimeout(t); }
  }, [cd]);

  function input(i: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  function keyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function verify() {
    if (otp.join("").length !== 6) { setError(t(lang, "otpInvalid")); return; }
    onVerified();
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <RegHeader lang={lang} back="register-1" title={`📱 ${t(lang, "verifyOtp")}`} step={2} total={5} go={go} />
      <div className="flex-1 px-5 pt-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-4xl mb-4">📱</div>
        <p className="text-gray-600 text-sm text-center">{t(lang, "otpSentTo")}</p>
        <p className="text-green-800 font-black text-xl mt-1 mb-8">+91 {phone}</p>

        <div className="flex gap-3 mb-4">
          {otp.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} type="tel" maxLength={1} value={d}
              onChange={(e) => input(i, e.target.value)} onKeyDown={(e) => keyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-black border-2 rounded-2xl outline-none transition-all ${d ? "border-green-700 bg-green-50 text-green-800" : "border-gray-200"}`}
            />
          ))}
        </div>

        {error && <FieldError msg={error} />}

        <p className="text-gray-400 text-sm mt-3">
          {cd > 0 ? <span>{t(lang, "resendOtp")} in {cd}s</span> :
            <button onClick={() => setCd(30)} className="text-green-700 font-bold">{t(lang, "resendOtp")}</button>}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mt-5 w-full">
          <p className="text-xs text-amber-700 text-center">💡 Demo: Enter any 6-digit code to continue</p>
        </div>
      </div>
      <div className="px-5 pb-6 pt-3 border-t border-gray-100">
        <button onClick={verify} className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all">
          {t(lang, "verifyOtp")} →
        </button>
      </div>
    </div>
  );
}

// ─── Register Step 2: Address ─────────────────────────────────────────────────

function RegisterStep2({ lang, go, onNext, initial }: { lang: string; go: (s: Screen) => void; onNext: (a: Address) => void; initial: Address }) {
  const [addr, setAddr] = useState<Address>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(k: keyof Address, v: string) { setAddr((a) => ({ ...a, [k]: v })); }

  function next() {
    const e: Record<string, string> = {};
    if (!addr.houseNo.trim()) e.houseNo = t(lang, "addressRequired");
    if (!addr.street.trim()) e.street = t(lang, "addressRequired");
    if (!addr.city.trim()) e.city = t(lang, "addressRequired");
    if (!addr.district.trim()) e.district = t(lang, "addressRequired");
    if (!addr.state) e.state = t(lang, "addressRequired");
    if (!validatePin(addr.pinCode)) e.pinCode = t(lang, "pinRequired");
    setErrors(e);
    if (!Object.keys(e).length) onNext({ ...addr, country: "India" });
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <RegHeader lang={lang} back="register-otp" title={`📍 ${t(lang, "address")}`} step={3} total={5} go={go} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 flex flex-col gap-3">
        {[
          { k: "houseNo" as keyof Address, lk: "houseNo", phk: "houseNoPlaceholder" },
          { k: "street" as keyof Address, lk: "street", phk: "streetPlaceholder" },
          { k: "landmark" as keyof Address, lk: "landmark", phk: "landmarkPlaceholder" },
          { k: "city" as keyof Address, lk: "city", phk: "cityPlaceholder" },
          { k: "district" as keyof Address, lk: "district", phk: "districtPlaceholder" },
        ].map(({ k, lk, phk }) => (
          <Input key={k} label={t(lang, lk)} value={addr[k]} onChange={(v) => set(k, v)}
            placeholder={t(lang, phk)} error={errors[k]} />
        ))}

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{t(lang, "state")}</label>
          <select className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm outline-none ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-700"}`}
            value={addr.state} onChange={(e) => set("state", e.target.value)}>
            <option value="">{t(lang, "selectState")}</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <FieldError msg={errors.state || ""} />
        </div>

        <Input label={t(lang, "pinCode")} value={addr.pinCode} onChange={(v) => set("pinCode", v)}
          placeholder={t(lang, "pinPlaceholder")} type="tel" maxLength={6} error={errors.pinCode}
          suffix={validatePin(addr.pinCode) ? <span className="text-green-600 font-bold text-sm">✓</span> : undefined} />

        <Input label={t(lang, "country")} value="India" readOnly />
      </div>
      <div className="px-5 pb-6 pt-3 border-t border-gray-100">
        <button onClick={next} className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all">
          {t(lang, "next")} →
        </button>
      </div>
    </div>
  );
}

// ─── Register Step 3: Profession ──────────────────────────────────────────────

function RegisterStep3({ lang, go, onNext, initial }: { lang: string; go: (s: Screen) => void; onNext: (p: string) => void; initial: string }) {
  const [sel, setSel] = useState(initial);
  const [error, setError] = useState("");

  const profs = [
    { key: "farmer", icon: "🌾", lk: "farmer", sublk: "profSub_farmer" },
    { key: "agroProcessing", icon: "🏭", lk: "agroProcessing", sublk: "profSub_agroProcessing" },
    { key: "livestock", icon: "🐄", lk: "livestock", sublk: "profSub_livestock" },
    { key: "ruralEntrepreneur", icon: "🤝", lk: "ruralEntrepreneur", sublk: "profSub_ruralEntrepreneur" },
    { key: "energyStartup", icon: "⚡", lk: "energyStartup", sublk: "profSub_energyStartup" },
  ];

  function next() {
    if (!sel) { setError(t(lang, "professionRequired")); return; }
    onNext(sel);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <RegHeader lang={lang} back="register-2" title={`💼 ${t(lang, "selectProfession")}`} step={4} total={5} go={go} />
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 flex flex-col gap-2.5">
        {profs.map((p) => (
          <button key={p.key} onClick={() => setSel(p.key)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left w-full ${sel === p.key ? "border-green-700 bg-green-50" : "border-gray-200 bg-white"}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${sel === p.key ? "bg-green-700" : "bg-gray-100"}`}>
              {p.icon}
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${sel === p.key ? "text-green-800" : "text-gray-800"}`}>{t(lang, p.lk)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t(lang, p.sublk)}</p>
            </div>
            {sel === p.key && <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center shrink-0"><span className="text-white text-xs font-black">✓</span></div>}
          </button>
        ))}
        {error && <FieldError msg={error} />}
      </div>
      <div className="px-5 pb-6 pt-3 border-t border-gray-100">
        <button onClick={next} className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all">
          {t(lang, "next")} →
        </button>
      </div>
    </div>
  );
}

// ─── Register Step 4: Products ────────────────────────────────────────────────

function ProductPicker({
  lang, title, selected, onToggle, accent,
}: {
  lang: string; title: string; selected: string[]; onToggle: (p: string) => void; accent: "green" | "amber";
}) {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS_LIST.filter((p) => p.toLowerCase().includes(search.toLowerCase()));
  const accentBg = accent === "green" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200";
  const accentCheck = accent === "green" ? "accent-green-700" : "accent-amber-600";
  const accentText = accent === "green" ? "text-green-700" : "text-amber-700";

  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{title}</label>
      <div className="relative mb-1.5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input type="text" className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-green-500"
          placeholder={t(lang, "searchProducts")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100">
        {filtered.map((p) => (
          <label key={p} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${selected.includes(p) ? accentBg : "hover:bg-gray-50"}`}>
            <input type="checkbox" checked={selected.includes(p)} onChange={() => onToggle(p)} className={`${accentCheck} w-4 h-4 shrink-0 rounded`} />
            <span className="text-sm text-gray-700 leading-snug">{p}</span>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <p className={`text-xs mt-1 font-bold ${accentText}`}>
          ✓ {selected.length} {t(lang, "selected")}
        </p>
      )}
    </div>
  );
}

function RegisterStep4({ lang, profession, go, onDone, initial }: {
  lang: string; profession: string; go: (s: Screen) => void;
  onDone: (d: { farmerType: string; have: string[]; need: string[] }) => void;
  initial: { farmerType: string; have: string[]; need: string[] };
}) {
  const [farmerType, setFarmerType] = useState(initial.farmerType);
  const [have, setHave] = useState<string[]>(initial.have);
  const [need, setNeed] = useState<string[]>(initial.need);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idStatus, setIdStatus] = useState("not_submitted");

  function toggleHave(p: string) { setHave((h) => h.includes(p) ? h.filter((x) => x !== p) : [...h, p]); }
  function toggleNeed(p: string) { setNeed((n) => n.includes(p) ? n.filter((x) => x !== p) : [...n, p]); }

  function done() {
    const e: Record<string, string> = {};
    if (profession === "farmer" && !farmerType) e.farmerType = t(lang, "farmerTypeRequired");
    if (!have.length) e.have = t(lang, "productRequired");
    if (!need.length) e.need = t(lang, "productRequired");
    setErrors(e);
    if (!Object.keys(e).length) onDone({ farmerType: farmerType || profession, have, need });
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <RegHeader lang={lang} back="register-3" title={`📦 ${t(lang, "profession")} Details`} step={5} total={5} go={go} />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-4">
        {profession === "farmer" && (
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{t(lang, "farmerType")}</label>
            <select className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm outline-none ${errors.farmerType ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-700"}`}
              value={farmerType} onChange={(e) => setFarmerType(e.target.value)}>
              <option value="">{t(lang, "selectFarmerTypeOpt")}</option>
              {FARMER_TYPES.map((ft, i) => {
                const typeKeys = ["cropFarmer","vegetableFarmer","fruitFarmer","paddyFarmer","plantationFarmer","organicFarmer","mixedFarmer","otherFarmer"];
                return <option key={ft} value={ft}>{t(lang, typeKeys[i] || "otherFarmer")}</option>;
              })}
            </select>
            <FieldError msg={errors.farmerType || ""} />
          </div>
        )}

        <div>
          <ProductPicker lang={lang} title={t(lang, "whatDoYouHave")} selected={have} onToggle={toggleHave} accent="green" />
          <FieldError msg={errors.have || ""} />
        </div>

        <div>
          <ProductPicker lang={lang} title={t(lang, "whatDoYouNeed")} selected={need} onToggle={toggleNeed} accent="amber" />
          <FieldError msg={errors.need || ""} />
        </div>

        {/* Government ID */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🪪</span> {t(lang, "uploadId")}
          </p>
          <div className="flex gap-2 mb-3">
            {["aadhaar", "other"].map((type) => (
              <button key={type} onClick={() => {}}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 border-green-200 bg-green-50 text-green-800">
                {type === "aadhaar" ? t(lang, "aadhaar") : t(lang, "otherId")}
              </button>
            ))}
          </div>
          <button onClick={() => setIdStatus("submitted")}
            className={`w-full py-3 rounded-xl text-sm font-bold border-2 transition-all ${idStatus === "submitted" ? "border-green-600 bg-green-50 text-green-700" : "border-dashed border-gray-300 text-gray-500"}`}>
            {idStatus === "submitted" ? `✓ ${t(lang, "verified")}` : `📷 ${t(lang, "takePhoto")} / ${t(lang, "chooseFile")}`}
          </button>
          <p className="text-[10px] text-gray-400 mt-2 text-center">🔒 {t(lang, "idPrivacyNote")}</p>
        </div>
      </div>
      <div className="px-5 pb-6 pt-3 border-t border-gray-100">
        <button onClick={done} className="w-full bg-green-800 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-95 transition-all">
          ✓ {t(lang, "submit")}
        </button>
      </div>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessScreen({ lang, user, onEnter }: { lang: string; user: UserProfile; onEnter: () => void }) {
  useEffect(() => { const t = setTimeout(onEnter, 3200); return () => clearTimeout(t); }, [onEnter]);

  return (
    <div className="flex flex-col h-full bg-green-800 items-center justify-center text-center px-8 gap-5">
      <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center text-5xl shadow-2xl border-4 border-amber-300">
        🎉
      </div>
      <div>
        <h2 className="text-3xl font-black text-white">{t(lang, "registrationSuccess")}</h2>
        <p className="text-green-200 mt-1">{t(lang, "welcomeToAgriX")}</p>
        <p className="text-amber-300 font-bold mt-0.5">{user.name}</p>
      </div>
      <div className="bg-white/10 rounded-2xl p-4 w-full flex flex-col gap-2 text-sm">
        <p className="text-green-100">✓ {t(lang, "phone")} {t(lang, "verified")}</p>
        <p className="text-green-100">✓ {user.productsHave.length} {t(lang, "myProducts")}</p>
        <p className="text-green-100">✓ {user.productsNeed.length} {t(lang, "myRequirements")}</p>
        <p className="text-green-100">✓ {t(lang, "trustScore")}: {user.trustScore}</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse [animation-delay:300ms]" />
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:600ms]" />
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

type CamMode = "soil" | "product" | "disease" | null;

const CAM_RESULTS: Record<string, string[]> = {
  soil: [
    "🌱 Soil Health: Moderate — pH 6.2 (slightly acidic)",
    "🔬 Organic Carbon: 1.8% (below optimal 2.5%)",
    "💧 Moisture: Adequate for current conditions",
    "✅ Recommendation: Add vermicompost 200 kg/acre",
    "🌾 Best crops: Paddy, Tapioca, Banana",
    "⚠️ Potassium deficiency detected — apply MOP",
  ],
  product: [
    "📦 Product identified: Rice Husk / Paddy Straw",
    "💰 Market value: ₹22–28/kg (HIGH demand)",
    "🔥 3 nearby buyers looking for this now",
    "📈 Best selling period: Oct–Dec",
    "♻️ Uses: Bio-energy, Mushroom cultivation, Compost",
    "✅ List this on AgriX Marketplace for best price",
  ],
  disease: [
    "⚠️ Disease detected: Blast fungus (Pyricularia oryzae)",
    "🔬 Confidence: 87% match with known pattern",
    "💊 Treatment: Tricyclazole @ 0.6g/L spray",
    "🌿 Organic: Neem oil 3% spray as preventive",
    "📅 Apply spray in early morning or evening",
    "🏥 Consult local Krishi Vigyan Kendra for confirmation",
  ],
};

function AICameraModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const [mode, setMode] = useState<CamMode>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function openCamera(m: CamMode) {
    setMode(m);
    setCaptured(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setCameraActive(true);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 200;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setCaptured(canvas.toDataURL("image/jpeg", 0.8));
    } else {
      setCaptured("captured");
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(CAM_RESULTS[mode!] || CAM_RESULTS.soil);
    }, 2200);
  }

  function retake() {
    setCaptured(null);
    setResult(null);
    openCamera(mode);
  }

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col" onClick={onClose}>
        <div className="flex-1 overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="bg-green-800 px-5 pt-14 pb-5">
            <button onClick={onClose} className="text-white/60 text-sm mb-3">‹ {t(lang, "back")}</button>
            <h3 className="text-white font-black text-lg">{t(lang, "analysisResult")}</h3>
            <p className="text-green-300 text-xs mt-0.5">{t(lang, mode === "soil" ? "soilScan" : mode === "product" ? "productId" : "diseaseDetect")}</p>
          </div>
          {captured && captured !== "captured" && (
            <img src={captured} alt="capture" className="w-full h-40 object-cover" />
          )}
          <div className="flex-1 bg-white px-5 py-5 flex flex-col gap-3">
            {result.map((line, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="text-base shrink-0 mt-0.5">{line.split(" ")[0]}</div>
                <p className="text-sm text-gray-800 font-medium leading-snug">{line.split(" ").slice(1).join(" ")}</p>
              </div>
            ))}
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">{t(lang, "disclaimer")}</p>
          </div>
        </div>
        <div className="bg-white px-5 pb-8 pt-3 border-t border-gray-100 flex gap-3">
          <button onClick={retake} className="flex-1 border-2 border-green-800 text-green-800 font-black py-3.5 rounded-2xl text-sm">
            📷 {t(lang, "retake")}
          </button>
          <button onClick={onClose} className="flex-1 bg-green-800 text-white font-black py-3.5 rounded-2xl text-sm">
            ✓ {t(lang, "continue")}
          </button>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center flex-col gap-5">
        {captured && captured !== "captured" && (
          <img src={captured} alt="captured" className="w-48 h-32 object-cover rounded-2xl opacity-50" />
        )}
        <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-black text-lg">{t(lang, "analyzing")}</p>
        <p className="text-green-300 text-sm">AI {t(lang, mode === "soil" ? "soilScan" : mode === "product" ? "productId" : "diseaseDetect")}</p>
      </div>
    );
  }

  if (cameraActive) {
    return (
      <div className="fixed inset-0 bg-black z-[60] flex flex-col">
        <div className="relative flex-1">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-4 border-amber-400 opacity-30 pointer-events-none" />
          <div className="absolute top-14 left-0 right-0 flex items-center justify-center">
            <div className="bg-black/60 text-white text-sm font-bold px-4 py-2 rounded-full">
              {t(lang, mode === "soil" ? "soilScan" : mode === "product" ? "productId" : "diseaseDetect")}
            </div>
          </div>
          <button onClick={onClose} className="absolute top-14 left-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-lg">✕</button>
        </div>
        <div className="bg-black px-8 py-8 flex items-center justify-center gap-6">
          <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setMode(null); setCameraActive(false); }}
            className="text-white/60 text-sm">{t(lang, "back")}</button>
          <button onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-4 border-amber-400 flex items-center justify-center text-3xl active:scale-95 transition-all shadow-xl">
            📷
          </button>
          <div className="w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end" onClick={onClose}>
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-amber-400 rounded-2xl flex items-center justify-center text-2xl">📷</div>
          <div>
            <h3 className="font-black text-gray-800 text-base">{t(lang, "aiCamera")}</h3>
            <p className="text-xs text-gray-400">{t(lang, "askAI")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          {[
            { icon: "🌍", mode: "soil" as CamMode, lk: "soilScan", sublk: "soilScanResult", bg: "border-amber-200 bg-amber-50" },
            { icon: "🌿", mode: "product" as CamMode, lk: "productId", sublk: "productIdResult", bg: "border-green-200 bg-green-50" },
            { icon: "🔬", mode: "disease" as CamMode, lk: "diseaseDetect", sublk: "diseaseResult", bg: "border-red-200 bg-red-50" },
          ].map((opt) => (
            <button key={opt.mode} onClick={() => openCamera(opt.mode)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${opt.bg} active:scale-95 transition-all text-left w-full`}>
              <span className="text-3xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="font-black text-gray-800 text-sm">{t(lang, opt.lk)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(lang, opt.sublk)}</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 text-center leading-snug">{t(lang, "disclaimer")}</p>
      </div>
    </div>
  );
}

function VoiceModal({ lang, go, onClose }: { lang: string; go: (s: Screen) => void; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "listening" | "result" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<{ stop: () => void } | null>(null);

  const examples = [
    { say: "Open camera", screen: "ai-camera" as Screen },
    { say: "Show schemes / government schemes", screen: "schemes" as Screen },
    { say: "Crop advisory / crops", screen: "crop-advisory" as Screen },
    { say: "Weather / rain", screen: "weather" as Screen },
    { say: "Market price / prices", screen: "market-prices" as Screen },
    { say: "Cooperative / farmers", screen: "cooperative" as Screen },
    { say: "AI assistant / chat", screen: "ai-assistant" as Screen },
  ];

  function navigateFromText(text: string) {
    const lc = text.toLowerCase();
    if (lc.includes("cam") || lc.includes("photo") || lc.includes("picture") || lc.includes("scan"))
      return "ai-camera" as Screen;
    if (lc.includes("scheme") || lc.includes("government") || lc.includes("yojana") || lc.includes("sarkar"))
      return "schemes" as Screen;
    if (lc.includes("crop") || lc.includes("advisory") || lc.includes("salah") || lc.includes("upadesh"))
      return "crop-advisory" as Screen;
    if (lc.includes("weather") || lc.includes("rain") || lc.includes("mausam") || lc.includes("mazha"))
      return "weather" as Screen;
    if (lc.includes("price") || lc.includes("market") || lc.includes("rate") || lc.includes("bazaar"))
      return "market-prices" as Screen;
    if (lc.includes("coop") || lc.includes("farmer") || lc.includes("sahakari"))
      return "cooperative" as Screen;
    if (lc.includes("ai") || lc.includes("chat") || lc.includes("assist") || lc.includes("help"))
      return "ai-assistant" as Screen;
    if (lc.includes("notification") || lc.includes("alert"))
      return "notifications" as Screen;
    if (lc.includes("dashboard") || lc.includes("stats"))
      return "dashboard" as Screen;
    return null;
  }

  function startListening() {
    const w = window as unknown as Record<string, unknown>;
    const SR = (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((e: unknown) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void }) | undefined;
    if (!SR) { setStatus("error"); return; }
    const rec = new SR();
    rec.lang = lang === "ml" ? "ml-IN" : lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "te" ? "te-IN" : lang === "pa" ? "pa-IN" : lang === "kn" ? "kn-IN" : lang === "mr" ? "mr-IN" : "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    recRef.current = rec;
    setStatus("listening");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setStatus("result");
      const dest = navigateFromText(text);
      if (dest) {
        setTimeout(() => { go(dest); onClose(); }, 800);
      }
    };
    rec.onerror = () => setStatus("error");
    rec.onend = () => { if (status === "listening") setStatus("idle"); };
    rec.start();
  }

  useEffect(() => {
    startListening();
    return () => { recRef.current?.stop(); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/85 z-[60] flex flex-col items-center justify-center" onClick={onClose}>
      <div className="flex flex-col items-center gap-5 px-6 w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={status === "listening" ? () => recRef.current?.stop() : startListening}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
            status === "listening" ? "bg-red-600 animate-pulse" : status === "result" ? "bg-green-600" : "bg-green-700"
          }`}
          style={{ boxShadow: status === "listening" ? "0 0 50px rgba(239,68,68,0.5)" : "0 0 40px rgba(74,222,128,0.4)", border: "4px solid rgba(255,255,255,0.3)" }}
        >
          <span className="text-5xl">{status === "result" ? "✓" : "🎤"}</span>
        </button>

        <div className="text-center">
          <p className="text-white text-xl font-black">{t(lang, "voiceAssistant")}</p>
          <p className="text-green-300 text-sm mt-1">
            {status === "listening" ? t(lang, "listening")
              : status === "result" ? `"${transcript}"`
              : status === "error" ? "Speech not supported — tap a command below"
              : t(lang, "voiceSay")}
          </p>
        </div>

        {status === "listening" && (
          <div className="flex gap-1.5 items-end h-8">
            {[1, 3, 2, 4, 2, 3, 1].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-green-400 rounded-full animate-bounce"
                style={{ height: `${h * 6}px`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        <div className="bg-white/10 rounded-2xl p-4 w-full">
          <p className="text-green-200 text-xs font-bold mb-2">{t(lang, "voiceSay")}:</p>
          <div className="flex flex-col gap-1">
            {examples.map((ex) => (
              <button key={ex.screen} onClick={() => { go(ex.screen); onClose(); }}
                className="text-white/80 text-xs py-1.5 px-2 rounded-xl hover:bg-white/10 text-left border-b border-white/10 last:border-0">
                🗣 "{ex.say}"
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="text-white/40 text-sm">{t(lang, "back")}</button>
      </div>
    </div>
  );
}

function HomeScreen({ lang, user, go }: { lang: string; user: UserProfile; go: (s: Screen) => void }) {
  const [showCam, setShowCam] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const canSell = mockProducts.filter((p) => p.canSell);
  const mayNeed = mockProducts.filter((p) => p.mayNeed);

  const newsBulletin = [
    { icon: "🌾", text: "Rice Husk demand up 40% — sell now at ₹28/kg", tag: "Market", tagBg: "bg-green-100 text-green-700" },
    { icon: "📋", text: "PM-KISAN next installment — apply before Oct 31", tag: "Scheme", tagBg: "bg-blue-100 text-blue-700" },
    { icon: "⛈️", text: "Heavy rain expected tomorrow — protect your crops", tag: "Weather", tagBg: "bg-sky-100 text-sky-700" },
    { icon: "🌿", text: "Vermicompost prices up 15% — organic farming boom", tag: "Trend", tagBg: "bg-pink-100 text-pink-700" },
    { icon: "🤝", text: "New cooperative match: Paddy farmer 5km needs straw", tag: "Coop", tagBg: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-40">
      {/* ── Header ── */}
      <div className="bg-green-800 px-4 pt-14 pb-4 rounded-b-[28px] shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => go("profile")}
            className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </button>
          <div className="text-center">
            <p className="text-green-300 text-[11px]">{greeting(lang)},</p>
            <p className="text-white font-black text-base leading-tight">{user.name} 🌾</p>
          </div>
          <button onClick={() => go("notifications")}
            className="relative w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-black">
              {mockNotifications.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <button
          onClick={() => go("marketplace")}
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-md w-full text-left active:scale-99"
        >
          <span className="text-gray-400">🔍</span>
          <span className="text-gray-400 text-sm flex-1">{t(lang, "searchPlaceholder")}</span>
          <span className="bg-green-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Search</span>
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-5">

        {/* ── AI TOOLS strip — visible immediately ── */}
        <div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">AI Tools</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowCam(true)}
              className="bg-amber-400 rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <span className="text-2xl">📷</span>
              <span className="text-[11px] font-black text-green-900 text-center leading-tight">{t(lang, "aiCamera")}</span>
            </button>
            <button
              onClick={() => go("ai-assistant")}
              className="bg-green-800 rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <span className="text-2xl">🤖</span>
              <span className="text-[11px] font-black text-white text-center leading-tight">{t(lang, "aiAssistant")}</span>
            </button>
            <button
              onClick={() => setShowVoice(true)}
              className="bg-emerald-600 rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <span className="text-2xl">🎤</span>
              <span className="text-[11px] font-black text-white text-center leading-tight">{t(lang, "voiceAssistant")}</span>
            </button>
          </div>
        </div>

        {/* ── News Bulletin — horizontal scroll ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">📰 News Bulletin</p>
            <button onClick={() => go("notifications")} className="text-xs text-green-700 font-bold">{t(lang, "viewAll")}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {newsBulletin.map((n, i) => (
              <button
                key={i}
                onClick={() => go("notifications")}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 min-w-[200px] max-w-[200px] shrink-0 text-left active:scale-95"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xl shrink-0">{n.icon}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${n.tagBg}`}>{n.tag}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium leading-snug">{n.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick Access grid ── */}
        <div>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t(lang, "quickAccess")}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🌱", lk: "cropAdvisory",   screen: "crop-advisory" as Screen,  bg: "bg-emerald-50 border-emerald-200" },
              { icon: "📋", lk: "schemeApp",      screen: "schemes" as Screen,         bg: "bg-blue-50 border-blue-200" },
              { icon: "⛅", lk: "weatherSoil",    screen: "weather" as Screen,         bg: "bg-sky-50 border-sky-200" },
              { icon: "📈", lk: "latestTrends",   screen: "trends" as Screen,          bg: "bg-pink-50 border-pink-200" },
              { icon: "🤝", lk: "coopConnections",screen: "cooperative" as Screen,     bg: "bg-orange-50 border-orange-200" },
              { icon: "💰", lk: "marketPrice",    screen: "market-prices" as Screen,   bg: "bg-teal-50 border-teal-200" },
            ].map((qa) => (
              <button
                key={qa.screen}
                onClick={() => go(qa.screen)}
                className={`${qa.bg} border rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-sm`}
              >
                <span className="text-2xl">{qa.icon}</span>
                <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{t(lang, qa.lk)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Crop Advisory Preview ── */}
        <button
          onClick={() => go("crop-advisory")}
          className="bg-gradient-to-r from-green-800 to-emerald-700 rounded-2xl p-4 text-white active:scale-98 transition-all shadow-lg w-full text-left"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-green-300 text-[11px] font-bold uppercase tracking-wide">{t(lang, "cropAdvisory")}</p>
              <p className="text-white font-black text-base mt-0.5">{user.farmerType}</p>
            </div>
            <span className="text-3xl">🌾</span>
          </div>
          <div className="flex flex-col gap-1 mb-3">
            {mockCropAdvisory.whatToDo.slice(0, 2).map((tip, i) => (
              <p key={i} className="text-green-100 text-xs flex gap-1.5 leading-snug">
                <span className="text-amber-400 shrink-0">•</span>{tip}
              </p>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {user.productsHave.slice(0, 3).map((p) => (
                <span key={p} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">{p}</span>
              ))}
            </div>
            <span className="text-green-300 text-sm font-bold">View full →</span>
          </div>
        </button>

        {/* ── Government Schemes Preview ── */}
        <button
          onClick={() => go("schemes")}
          className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-4 text-white active:scale-98 transition-all shadow-lg w-full text-left"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-blue-300 text-[11px] font-bold uppercase tracking-wide">{t(lang, "govSchemes")}</p>
              <p className="text-white font-black text-base mt-0.5">5 Schemes Available</p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
          <div className="flex flex-col gap-1 mb-3">
            {mockSchemes.slice(0, 2).map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <p className="text-blue-100 text-xs font-medium">{s.name}</p>
                <span className="text-amber-300 text-xs font-black">{s.benefit}</span>
              </div>
            ))}
          </div>
          <span className="text-blue-300 text-sm font-bold">Apply now →</span>
        </button>

        {/* ── Can Sell ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-black text-gray-800 text-base">{t(lang, "youCanSell")}</p>
            <button onClick={() => go("marketplace")} className="text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-full">{t(lang, "viewAll")}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {canSell.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-[150px] max-w-[150px] shrink-0">
                <div className="h-20 overflow-hidden bg-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-black text-gray-800 leading-tight">{p.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-green-700 font-black text-sm">{p.price}</span>
                    <TrustBadge score={p.trustScore} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">📍 {p.distance}km</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── May Need ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-black text-gray-800 text-base">{t(lang, "youMayNeed")}</p>
            <button onClick={() => go("cooperative")} className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-full">{t(lang, "viewAll")}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {mayNeed.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-[150px] max-w-[150px] shrink-0">
                <div className="h-20 overflow-hidden bg-amber-50">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-black text-gray-800 leading-tight">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.seller} · {p.distance}km</p>
                  <button className="mt-1.5 w-full bg-amber-400 text-green-900 text-[11px] font-black py-1.5 rounded-xl">
                    {t(lang, "connect")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Weather Widget ── */}
        <button
          onClick={() => go("weather")}
          className="bg-gradient-to-r from-blue-700 to-sky-500 rounded-2xl p-4 text-white active:scale-98 shadow-lg w-full text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-200 font-medium">{t(lang, "weatherSoil")}</p>
              <p className="text-4xl font-black mt-0.5">{mockWeather.temp}°C</p>
              <p className="text-sm text-blue-100">{mockWeather.condition}</p>
              <div className="flex gap-3 mt-1.5">
                <span className="text-xs text-blue-200">💧 {mockWeather.humidity}%</span>
                <span className="text-xs text-blue-200">🌧 {mockWeather.rainChance}%</span>
                <span className="text-xs text-blue-200">💨 {mockWeather.wind}km/h</span>
              </div>
            </div>
            <span className="text-7xl opacity-90">⛅</span>
          </div>
        </button>

        {/* ── Events ── */}
        <div>
          <p className="font-black text-gray-800 text-base mb-2">🗓️ {t(lang, "agriEventsTitle")}</p>
          <div className="flex flex-col gap-2">
            {mockEvents.slice(0, 2).map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl p-3.5 flex gap-3 shadow-sm border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-green-800 flex flex-col items-center justify-center shrink-0">
                  <p className="text-lg font-black text-amber-400 leading-tight">{ev.date.split(" ")[0]}</p>
                  <p className="text-[9px] text-green-300 uppercase font-bold">{ev.date.split(" ")[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-800 leading-tight">{ev.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {ev.location}</p>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">{ev.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCam && <AICameraModal lang={lang} onClose={() => setShowCam(false)} />}
      {showVoice && <VoiceModal lang={lang} go={go} onClose={() => setShowVoice(false)} />}
    </div>
  );
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

function MarketplaceScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Crop Residues", "Animal Waste", "Compost", "Plantation Waste", "Grains"];

  const results = mockProducts.filter((p) => {
    const mQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.seller.toLowerCase().includes(query.toLowerCase());
    const mF = filter === "All" || p.category === filter;
    return mQ && mF;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-36">
      <div className="bg-green-800 px-4 pt-14 pb-4 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <h2 className="text-white text-xl font-black mb-3">🛒 {t(lang, "marketplace")}</h2>
        <div className="flex bg-white rounded-2xl overflow-hidden shadow-md">
          <div className="flex items-center pl-4 text-gray-400 text-sm">🔍</div>
          <input type="text" className="flex-1 px-3 py-3.5 text-sm outline-none"
            placeholder={t(lang, "searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <button onClick={() => setQuery("")} className="pr-4 text-gray-400 text-xl font-light">×</button>}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 transition-colors ${filter === c ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-600 border-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">🔍</div>
            <p className="text-center text-gray-500 text-sm px-6 leading-relaxed">{t(lang, "noResults")}</p>
            <button className="bg-green-800 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md">
              🔔 {t(lang, "notifyMe")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 font-medium">{results.length} {t(lang, "productsAvailable")}</p>
            {results.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="w-[88px] h-[88px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800 text-sm leading-tight">{p.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{p.category}</p>
                      </div>
                      <TrustBadge score={p.trustScore} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">{p.seller}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-green-700 font-black text-base">{p.price}</span>
                      <span className="text-[11px] text-gray-400">📍 {p.distance}km</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  <button className="flex-1 bg-green-800 text-white text-xs font-black py-2.5 rounded-xl">{t(lang, "connect")}</button>
                  <button className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl">{t(lang, "viewDetails")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cooperative ──────────────────────────────────────────────────────────────

function CooperativeScreen({ lang, go, user }: { lang: string; go: (s: Screen) => void; user: UserProfile | null }) {
  const [productFilter, setProductFilter] = useState("All of These");
  const [nameSearch, setNameSearch] = useState("");
  const [bellFarmerId, setBellFarmerId] = useState<string | null>(null);
  const [bellMsg, setBellMsg] = useState("");

  const userNeeds = user?.productsNeed || [];
  const userHas = user?.productsHave || [];
  const userDistrict = user?.address.district.toLowerCase() || "";
  const userCity = user?.address.city.toLowerCase() || "";
  const userFarmerType = user?.farmerType || "";

  function isRecommendedProduct(product: string) {
    return userNeeds.some((n) => product.toLowerCase().includes(n.toLowerCase().slice(0, 6)))
      || userHas.some((h) => product.toLowerCase().includes(h.toLowerCase().slice(0, 6)));
  }

  function farmerScore(farmer: typeof mockFarmers[0]) {
    let score = farmer.matchPercent;
    if (farmer.location.toLowerCase().includes(userDistrict) || farmer.location.toLowerCase().includes(userCity)) score += 20;
    if (farmer.products.some(isRecommendedProduct)) score += 10;
    return score;
  }

  const filtered = mockFarmers
    .filter((f) => {
      const productMatch = productFilter === "All of These"
        ? true
        : f.products.some((p) => p.toLowerCase().includes(productFilter.toLowerCase()));
      const nameMatch = !nameSearch.trim()
        ? true
        : f.name.toLowerCase().includes(nameSearch.toLowerCase());
      return productMatch && nameMatch;
    })
    .sort((a, b) => farmerScore(b) - farmerScore(a));

  function ringBell(farmer: typeof mockFarmers[0]) {
    setBellFarmerId(farmer.id);
    setBellMsg(`${t(lang, "bellRang")} ${farmer.name}`);
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
    setTimeout(() => setBellFarmerId(null), 2500);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-36">
      <div className="bg-green-800 px-4 pt-14 pb-4 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <h2 className="text-white text-xl font-black">🤝 {t(lang, "coopConnections")}</h2>
        {user && (
          <div className="flex gap-2 mt-1 mb-3">
            <span className="text-[10px] bg-amber-400 text-green-900 px-2 py-0.5 rounded-full font-black">
              📍 {user.address.district}
            </span>
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
              🌾 {user.farmerType}
            </span>
          </div>
        )}

        {/* Name search */}
        <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-3 py-2 mb-3">
          <span className="text-white/60">🔍</span>
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
            placeholder={t(lang, "searchByName")}
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          {nameSearch && <button onClick={() => setNameSearch("")} className="text-white/60 text-lg">✕</button>}
        </div>

        {/* Product filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {COOPERATIVE_FILTERS.map((f) => (
            <button key={f} onClick={() => setProductFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${productFilter === f ? "bg-amber-400 text-green-900 border-amber-400" : "bg-white/15 text-white border-white/25"}`}>
              {f === "All of These" ? t(lang, "allOfThese") : f}
            </button>
          ))}
        </div>
      </div>

      {bellMsg && (
        <div className="mx-4 mt-3 bg-amber-100 border-2 border-amber-400 rounded-2xl p-3 text-center animate-bounce">
          <p className="text-amber-800 font-black text-sm">{bellMsg}</p>
        </div>
      )}

      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">{filtered.length} {t(lang, "nearbyFarmersFound")}</p>
          {user && <p className="text-xs text-green-700 font-bold">{t(lang, "locationBased")}</p>}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4">
            <span className="text-5xl">🔍</span>
            <p className="text-center text-gray-500 text-sm">{t(lang, "noResults")}</p>
            <button className="bg-green-800 text-white px-6 py-3 rounded-2xl font-black text-sm">🔔 {t(lang, "notifyMe")}</button>
          </div>
        )}

        {filtered.map((farmer) => {
          const hasRecommended = farmer.products.some(isRecommendedProduct);
          const isNearby = farmer.location.toLowerCase().includes(userDistrict) || farmer.location.toLowerCase().includes(userCity);
          return (
            <div key={farmer.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${hasRecommended ? "border-amber-300" : "border-gray-100"}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 ${hasRecommended ? "bg-amber-500" : "bg-green-800"}`}>
                  {farmer.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-gray-800">{farmer.name}</p>
                    {farmer.verified && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{t(lang, "verified")}</span>}
                    {hasRecommended && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black">⭐ {t(lang, "recommended")}</span>}
                    {isNearby && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">📍 Near</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {farmer.location} · {farmer.distance}km</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <TrustBadge score={farmer.trustScore} />
                  <MatchBadge pct={farmer.matchPercent} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                {[
                  { icon: "📦", val: farmer.quantity },
                  { icon: "💰", val: farmer.price },
                  { icon: "📞", val: farmer.phone.slice(0, 5) + "·····" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl py-2 px-1">
                    <p className="text-base">{item.icon}</p>
                    <p className="text-[11px] font-bold text-gray-700 mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {farmer.products.map((p) => {
                  const isRec = isRecommendedProduct(p);
                  return (
                    <span key={p} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${isRec ? "bg-amber-50 text-amber-700 border-amber-300 font-black" : "bg-green-50 text-green-700 border-green-200"}`}>
                      {isRec ? "⭐ " : ""}{p}
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-green-800 text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5">
                  🗺️ {t(lang, "getDirections")}
                </button>
                <button
                  onClick={() => ringBell(farmer)}
                  className={`flex-1 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${bellFarmerId === farmer.id ? "bg-amber-400 text-green-900 scale-95" : "bg-amber-400 text-green-900"}`}
                >
                  🔔 {t(lang, "notifyMe")}
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5">
                  📞 {t(lang, "connect")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardScreen({ lang, user, go }: { lang: string; user: UserProfile; go: (s: Screen) => void }) {
  const tiles = [
    { icon: "🌱", lk: "cropAdvisory", screen: "crop-advisory" as Screen, val: "3 tips", bg: "bg-emerald-50 border-emerald-200" },
    { icon: "📋", lk: "govSchemes", screen: "schemes" as Screen, val: "5 schemes", bg: "bg-blue-50 border-blue-200" },
    { icon: "⛅", lk: "weatherSoil", screen: "weather" as Screen, val: `${mockWeather.temp}°C`, bg: "bg-sky-50 border-sky-200" },
    { icon: "💰", lk: "marketPrice", screen: "market-prices" as Screen, val: "↑ Trending", bg: "bg-teal-50 border-teal-200" },
    { icon: "📈", lk: "latestTrends", screen: "trends" as Screen, val: "6 trends", bg: "bg-pink-50 border-pink-200" },
    { icon: "🤝", lk: "coopConnections", screen: "cooperative" as Screen, val: "16 farmers", bg: "bg-orange-50 border-orange-200" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-36">
      <div className="bg-green-800 px-4 pt-14 pb-6 rounded-b-[28px] shadow-lg">
        <h2 className="text-white text-xl font-black">📊 {t(lang, "dashboard")}</h2>
        <p className="text-green-300 text-sm mt-0.5">{user.name} · {user.farmerType}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: t(lang, "trustScore").replace("AgriX ", ""), val: user.trustScore, icon: "⭐" },
            { label: t(lang, "myProducts"), val: user.productsHave.length, icon: "📦" },
            { label: t(lang, "myRequirements"), val: user.productsNeed.length, icon: "🛒" },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center border border-white/20">
              <p className="text-xl font-black text-white">{s.icon}</p>
              <p className="text-2xl font-black text-amber-400">{s.val}</p>
              <p className="text-[10px] text-green-200 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <button key={tile.screen} onClick={() => go(tile.screen)}
              className={`${tile.bg} border rounded-2xl p-4 flex flex-col gap-2 text-left active:scale-95 transition-all`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{tile.icon}</span>
                <span className="text-[10px] font-black text-gray-600 bg-white/80 rounded-full px-2 py-0.5">{tile.val}</span>
              </div>
              <p className="text-sm font-black text-gray-800 leading-tight">{t(lang, tile.lk)}</p>
            </button>
          ))}
        </div>

        {/* My Products */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-800">{t(lang, "myProducts")}</h3>
            <button className="text-xs text-green-700 font-bold">Edit</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.productsHave.slice(0, 5).map((p) => (
              <span key={p} className="text-[11px] bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-full font-medium">{p}</span>
            ))}
            {user.productsHave.length > 5 && (
              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">+{user.productsHave.length - 5}</span>
            )}
          </div>
        </div>

        {/* My Requirements */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-800">{t(lang, "myRequirements")}</h3>
            <button className="text-xs text-green-700 font-bold">Edit</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.productsNeed.slice(0, 5).map((p) => (
              <span key={p} className="text-[11px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full font-medium">{p}</span>
            ))}
            {user.productsNeed.length > 5 && (
              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">+{user.productsNeed.length - 5}</span>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-800">{t(lang, "transactions")}</h3>
            <button className="text-xs text-green-700 font-bold">{t(lang, "viewAll")}</button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { product: "Rice Husk", role: "Rajan ← Sold", amount: "₹4,250", date: "12 Sep", status: "completed" },
              { product: "Vermicompost", role: "Nair → Bought", amount: "₹1,200", date: "5 Sep", status: "completed" },
              { product: "Paddy Straw", role: "Meena ← Sold", amount: "₹800", date: "28 Aug", status: "pending" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.status === "completed" ? "bg-green-100" : "bg-amber-100"}`}>
                  <span className="text-base">{tx.status === "completed" ? "✓" : "⏳"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{tx.product}</p>
                  <p className="text-[11px] text-gray-500">{tx.role} · {tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${tx.status === "completed" ? "text-green-700" : "text-amber-600"}`}>{tx.amount}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileScreen({ lang, user, go, onLogout, onChangeLang }: {
  lang: string; user: UserProfile; go: (s: Screen) => void; onLogout: () => void; onChangeLang: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-36">
      <div className="bg-green-800 px-4 pt-14 pb-8 rounded-b-[28px] shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center text-4xl font-black text-green-900 shadow-xl border-4 border-amber-300">
            {user.name[0]}
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-black">{user.name}</h2>
            <p className="text-green-300 text-sm">{user.farmerType}</p>
            <p className="text-green-400 text-xs mt-0.5">📍 {user.address.city}, {user.address.state}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 border border-white/20">
            <span className="text-amber-300">⭐</span>
            <span className="text-white font-black text-lg">{user.trustScore}</span>
            <span className="text-green-300 text-xs">{t(lang, "trustScore")}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Trust Score Breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-3">📊 {t(lang, "myTrustScore")}</h3>
          {[
            { lk: "transactions_count", val: "8", pct: 80 },
            { lk: "completion_rate", val: "95%", pct: 95 },
            { lk: "feedback_rating", val: "4.7/5", pct: 94 },
            { lk: "account_verified", val: "Yes", pct: 100 },
            { lk: "listing_accuracy", val: "88%", pct: 88 },
          ].map((item) => (
            <div key={item.lk} className="mb-2.5 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600 font-medium">{t(lang, item.lk)}</span>
                <span className="text-xs font-black text-green-700">{item.val}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-black text-gray-800">Profile Info</h3>
            <button className="text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-full">✏️ {t(lang, "editProfile")}</button>
          </div>
          {[
            { icon: "📞", label: t(lang, "phone").replace(" *", ""), val: `+91 ${user.phone}` },
            { icon: "📍", label: t(lang, "address"), val: `${user.address.city}, ${user.address.district}, ${user.address.state} - ${user.address.pinCode}` },
            { icon: "💼", label: t(lang, "profession").replace(" *", ""), val: user.profession },
            { icon: "📧", label: t(lang, "email").replace(" (Optional)", "").replace(" (ഐച്ഛിക)", ""), val: user.email || "—" },
          ].map((item) => (
            <div key={item.label} className="flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <span>{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{item.label}</p>
                <p className="text-sm text-gray-800 font-medium leading-snug mt-0.5">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { icon: "🌐", label: t(lang, "changeLanguage"), action: onChangeLang },
            { icon: "📦", label: t(lang, "myProducts"), action: () => go("dashboard") },
            { icon: "🛒", label: t(lang, "myRequirements"), action: () => go("dashboard") },
            { icon: "📋", label: t(lang, "transactions"), action: () => go("dashboard") },
            { icon: "🔔", label: t(lang, "notifications"), action: () => go("notifications") },
            { icon: "🪪", label: "Government ID", action: () => {} },
          ].map((item, i, arr) => (
            <button key={i} onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 transition-colors text-left ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-sm font-semibold text-gray-800">{item.label}</span>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>

        <button onClick={onLogout}
          className="w-full bg-red-50 text-red-600 font-black py-4 rounded-2xl border-2 border-red-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
          🚪 {t(lang, "logout")}
        </button>
      </div>
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────

function AIAssistantScreen({ lang, go, user }: { lang: string; go: (s: Screen) => void; user: UserProfile }) {
  const initGreet = `${greeting(lang)} ${user.name}! 👋\n\n${t(lang, "aiAssistant")} — ${t(lang, "advisoryFor")} ${user.farmerType}, ${user.address.district}.\n\n${t(lang, "cropAdvisory")} • ${t(lang, "govSchemes")} • ${t(lang, "nearbyFarmers")} • ${t(lang, "weatherSoil")} • ${t(lang, "marketPrice")}`;
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string; time: string }[]>([
    { role: "ai", text: initGreet, time: "now" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function getReply(msg: string): string {
    const lc = msg.toLowerCase();
    const city = user.address.city;
    const district = user.address.district;
    const farmerType = user.farmerType;
    const products = user.productsHave.join(", ") || "your products";

    if (lc.includes("rice husk") || lc.includes("husk") || lc.includes("ഉമി") || lc.includes("धान की भूसी"))
      return `🌾 Rice husk is in HIGH demand right now in ${district}!\n\n• Current price: ₹22–28/kg\n• 3 buyers found near ${city}\n• Bio-energy companies paying premium\n• Best selling period: Oct–Dec\n\nOpen Cooperative Connections to find buyers now?`;
    if (lc.includes("paddy") || lc.includes("നെൽ") || lc.includes("ধান") || lc.includes("धान"))
      return `🌾 Paddy market update for ${district}:\n\n• Current price: ₹22–26/kg\n• Government MSP: ₹23.10/kg\n• Best harvest: Nov–Dec\n• Nearby mills: 3 within 15km\n\nPM-KISAN & PMFBY cover paddy farmers. Want to apply?`;
    if (lc.includes("scheme") || lc.includes("government") || lc.includes("kshemasena") || lc.includes("പദ്ധതി") || lc.includes("योजना") || lc.includes("sarkar"))
      return `📋 ${farmerType} in ${user.address.state} — you are eligible for:\n\n1. ✅ PM-KISAN — ₹6,000/year (apply before Oct 31)\n2. ✅ PMFBY — Full crop insurance\n3. ✅ Kerala Karshaka Kshemasena — ₹1 lakh cover\n4. ✅ Soil Health Card — Free soil testing\n5. ✅ Kisan Credit Card — ₹3 lakh @ 7%\n\nShall I open Schemes to apply now?`;
    if (lc.includes("weather") || lc.includes("rain") || lc.includes("mausam") || lc.includes("mazha") || lc.includes("കാലാവസ്ഥ"))
      return `⛅ Weather in ${city} right now:\n\n• Temperature: ${mockWeather.temp}°C\n• Humidity: ${mockWeather.humidity}%\n• Rain chance: ${mockWeather.rainChance}%\n• Wind: ${mockWeather.wind} km/h\n• Condition: ${mockWeather.condition}\n\n⚠️ Heavy rain tomorrow — cover stored crops. Best time to irrigate: early morning.`;
    if (lc.includes("cow dung") || lc.includes("manure") || lc.includes("compost") || lc.includes("വളം") || lc.includes("खाद"))
      return `🐄 Organic manure available near ${district}:\n\n• Meena Krishnan — 22km, 1,000kg @ ₹8/kg (88% match)\n• Suresh Babu — 1.2km, 300kg @ ₹25/kg (100% match)\n• Anand Pillai — 13.5km, 500kg (95% match)\n\n✅ Suresh Babu is closest. Open Cooperative to connect?`;
    if (lc.includes("sell") || lc.includes("price") || lc.includes("market") || lc.includes("വില") || lc.includes("bazaar") || lc.includes("भाव"))
      return `💰 Best selling prices for ${farmerType} in ${district}:\n\n• ${products} — check market prices\n• Rice Husk: ₹25/kg (HIGH ↑)\n• Paddy: ₹24/kg (RISING ↑)\n• Vermicompost: ₹20/kg (STABLE →)\n• Coconut Husk: ₹12/kg (market pending)\n\nBest window: Oct–Dec. Open Market Prices?`;
    if (lc.includes("nearby") || lc.includes("farmer") || lc.includes("find") || lc.includes("കർഷകൻ") || lc.includes("kisan"))
      return `🗺️ Farmers near ${district}:\n\n• Suresh Babu — 1.2km ✅ 100% match\n• Lakshmi Nair — 6.7km ✅ 100% match\n• Anand Pillai — 13.5km 95% match\n• Meena Krishnan — 22km 88% match\n• Rajan Menon — 35km 82% match\n\nOpen Cooperative Connections to contact them?`;
    if (lc.includes("soil") || lc.includes("test") || lc.includes("scan") || lc.includes("മണ്ണ്"))
      return `🌍 Soil testing for your farm in ${district}:\n\n• Use AI Camera → Soil Scan for quick estimate\n• Government: Soil Health Card scheme — FREE\n• Results show pH, NPK, organic carbon\n• Nearest testing lab: Krishi Bhavan, ${city}\n\nI recommend getting a full test before Kharif season!`;
    if (lc.includes("advisory") || lc.includes("tips") || lc.includes("how") || lc.includes("what") || lc.includes("ഉപദേശം"))
      return `🌱 Crop advisory for ${farmerType} in ${district} this season:\n\n• Maintain water level 5-10cm in fields\n• Apply top-dressing urea at tillering\n• Watch for blast disease — spray fungicide\n• Remove weeds before competition stage\n• Install light traps for pest monitoring\n\nSee full advisory?`;
    return `🤖 I understood: "${msg}"\n\n${farmerType} in ${city} — here's what I suggest:\n\n• 🌱 Crop Advisory → seasonal tips for your farm\n• 📋 Schemes → 5 schemes you can apply now\n• 💰 Market Prices → best selling windows\n• 🤝 Cooperative → ${t(lang, "nearbyFarmers")} near ${district}\n\nWhat would you like to explore?`;
  }

  function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMsgs((m) => [...m, { role: "user", text: userMsg, time }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { role: "ai", text: getReply(userMsg), time }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1000 + Math.random() * 500);
  }

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-green-800 px-4 pt-14 pb-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => go("home")} className="text-white/70 text-xl">‹</button>
        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-xl shrink-0">🤖</div>
        <div className="flex-1">
          <p className="text-white font-black text-sm">{t(lang, "aiAssistant")}</p>
          <p className="text-green-300 text-[11px]">{typing ? "Typing..." : "Always online"}</p>
        </div>
        <button className="text-white/70 text-xl">📷</button>
      </div>

      {/* Suggestion chips */}
      <div className="bg-white border-b border-gray-100 px-3 py-2">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CHAT_SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="shrink-0 bg-green-50 text-green-800 text-[11px] font-medium px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {msgs.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-base shrink-0 mt-auto">🤖</div>
            )}
            <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user" ? "bg-green-800 text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
              }`}>
                {msg.text}
              </div>
              <p className="text-[10px] text-gray-400 px-1">{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-base shrink-0">🤖</div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:200ms]" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 pb-5">
        <div className="flex gap-2 items-end">
          <div className="flex-1 flex bg-gray-100 rounded-2xl overflow-hidden items-end">
            <button className="pl-3 pb-3 text-gray-400 shrink-0">📷</button>
            <input type="text" className="flex-1 bg-transparent px-2 py-3 text-sm outline-none"
              placeholder={t(lang, "typeMessage")} value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="pr-3 pb-3 text-gray-400 shrink-0">🎤</button>
          </div>
          <button onClick={send}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base shrink-0 transition-colors ${input.trim() ? "bg-green-800" : "bg-gray-300"}`}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Crop Advisory ────────────────────────────────────────────────────────────

function CropAdvisoryScreen({ lang, user, go }: { lang: string; user: UserProfile; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="bg-green-800 px-4 pt-14 pb-5 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <button onClick={() => go("dashboard")} className="text-white/60 text-sm mb-2 flex items-center gap-1">‹ {t(lang, "back")}</button>
        <h2 className="text-white text-xl font-black">🌱 {t(lang, "cropAdvisory")}</h2>
        <p className="text-green-300 text-sm mt-0.5">{t(lang, "advisoryFor")}: <span className="font-bold text-amber-300">{user.farmerType}</span></p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-2">{t(lang, "yourProducts")}:</p>
          <div className="flex flex-wrap gap-1.5">
            {user.productsHave.map((p) => (
              <span key={p} className="text-[11px] bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium">{p}</span>
            ))}
          </div>
        </div>

        {[
          { icon: "✅", title: t(lang, "whatToDo"), items: mockCropAdvisory.whatToDo, bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
          { icon: "⚙️", title: t(lang, "processing"), items: mockCropAdvisory.processing, bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
          { icon: "💎", title: t(lang, "byproducts"), items: mockCropAdvisory.byproducts, bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
        ].map((card) => (
          <div key={card.title} className={`${card.bg} border rounded-2xl p-4`}>
            <p className="font-black text-gray-800 mb-3 flex items-center gap-2">{card.icon} {card.title}</p>
            <div className="flex flex-col gap-2">
              {card.items.map((item, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${card.dot} mt-1.5 shrink-0`} />
                  <p className="text-sm text-gray-700 leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
          <p className="font-black text-sky-800 mb-3">🌤️ {t(lang, "weatherReqs")}</p>
          {Object.entries(mockCropAdvisory.weather).map(([k, v]) => (
            <div key={k} className="flex gap-3 py-2 border-b border-sky-100 last:border-0">
              <span className="text-sky-500 text-sm">•</span>
              <div>
                <span className="text-xs text-sky-600 font-bold capitalize">{k.replace(/([A-Z])/g, " $1")}: </span>
                <span className="text-xs text-gray-700">{v}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Weather ──────────────────────────────────────────────────────────────────

function WeatherScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  const w = mockWeather;
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-4 pt-14 pb-7 rounded-b-[28px] shadow-lg">
        <button onClick={() => go("dashboard")} className="text-white/60 text-sm mb-3 flex items-center gap-1">‹ {t(lang, "back")}</button>
        <h2 className="text-white text-xl font-black mb-4">⛅ {t(lang, "weatherSoil")}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-7xl font-black text-white">{w.temp}°</p>
            <p className="text-blue-200 mt-1">{w.condition}</p>
            <p className="text-blue-300 text-sm">{`📍 Kottayam, Kerala`}</p>
          </div>
          <span className="text-8xl opacity-80">⛅</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { icon: "💧", label: t(lang, "humidity"), val: `${w.humidity}%` },
            { icon: "🌧️", label: t(lang, "rainfall"), val: `${w.rainChance}%` },
            { icon: "💨", label: t(lang, "wind"), val: `${w.wind}km/h` },
          ].map((item) => (
            <div key={item.label} className="bg-white/20 rounded-2xl p-2.5 text-center">
              <p className="text-xl">{item.icon}</p>
              <p className="text-white font-black text-sm mt-0.5">{item.val}</p>
              <p className="text-blue-200 text-[10px]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 mb-3">5-Day Forecast</h3>
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {w.forecast.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-1.5 min-w-[64px] shrink-0 bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-500 font-bold">{day.day}</p>
                <span className="text-2xl">{day.icon}</span>
                <p className="text-xs font-black text-gray-800">{day.high}°</p>
                <p className="text-xs text-gray-400">{day.low}°</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-black text-amber-800 mb-3">🌍 {t(lang, "soilType")}</h3>
          {[
            { label: t(lang, "soilType"), val: "Clay Loam (Paddy suitable)" },
            { label: "pH Level", val: "6.2 — Slightly acidic ✓" },
            { label: t(lang, "humidity"), val: "72% — Optimal ✓" },
            { label: "Organic Carbon", val: "0.8% — Needs improvement" },
            { label: t(lang, "bestSeason"), val: "Paddy, Vegetables, Pulses" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between py-2 border-b border-amber-100 last:border-0">
              <span className="text-xs text-amber-700 font-medium">{item.label}</span>
              <span className="text-xs font-bold text-gray-800">{item.val}</span>
            </div>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <h3 className="font-black text-green-800 mb-3">✅ Today's Farm Recommendations</h3>
          {[
            "⚠️ Heavy rain tomorrow — protect stored crop residues",
            "✅ Ideal temperature for paddy transplanting today",
            "💧 Reduce irrigation — soil moisture at optimal 72%",
            "🌱 Good week to apply organic fertilizer",
          ].map((item, i) => (
            <p key={i} className="text-sm text-gray-700 py-2 border-b border-green-100 last:border-0">{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Schemes ──────────────────────────────────────────────────────────────────

function SchemesScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="bg-blue-800 px-4 pt-14 pb-5 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <button onClick={() => go("dashboard")} className="text-white/60 text-sm mb-2 flex items-center gap-1">‹ {t(lang, "back")}</button>
        <h2 className="text-white text-xl font-black">📋 {t(lang, "govSchemes")}</h2>
        <p className="text-blue-200 text-sm mt-0.5">5 {t(lang, "govSchemes").toLowerCase()} available for you</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {mockSchemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">📋</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-gray-800 leading-tight">{scheme.name}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold shrink-0">{scheme.state}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{scheme.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-green-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400 font-medium">{t(lang, "benefit")}</p>
                <p className="text-sm font-black text-green-700 mt-0.5">{scheme.benefit}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400 font-medium">{t(lang, "deadline")}</p>
                <p className="text-xs font-bold text-red-600 mt-0.5">{scheme.deadline}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              <span className="font-bold">{t(lang, "eligibility")}:</span> {scheme.eligibility}
            </p>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-700 text-white text-xs font-black py-3 rounded-xl">{t(lang, "apply")} →</button>
              <button className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-3 rounded-xl">{t(lang, "viewDetails")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Market Prices ────────────────────────────────────────────────────────────

function MarketPricesScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="bg-teal-800 px-4 pt-14 pb-5 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <button onClick={() => go("dashboard")} className="text-white/60 text-sm mb-2 flex items-center gap-1">‹ {t(lang, "back")}</button>
        <h2 className="text-white text-xl font-black">💰 {t(lang, "marketPrice")}</h2>
        <p className="text-teal-200 text-sm mt-0.5">Live data · Updated today</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
          <p className="text-xs text-amber-700 font-medium">⚠️ {t(lang, "disclaimer")}</p>
        </div>
        {mockMarketPrices.map((mp) => (
          <div key={mp.product} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-black text-gray-800">{mp.product}</p>
                <p className="text-2xl font-black text-green-700 mt-1">{mp.price}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  mp.trend === "up" ? "bg-green-100 text-green-700" :
                  mp.trend === "down" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {mp.trend === "up" ? "↑" : mp.trend === "down" ? "↓" : "→"} {mp.change}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  mp.demand === "high" ? "bg-green-100 text-green-700" :
                  mp.demand === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                }`}>
                  {mp.demand.toUpperCase()} {t(lang, "demand")}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600">
              🗓️ {t(lang, "bestSellPeriod")}: <span className="font-bold text-gray-800">{mp.bestSellPeriod}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

function playBell() {
  try {
    const ctx = new AudioContext();
    [880, 1100, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const start = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch {}
}

function NotificationsScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  const [rang, setRang] = useState<string | null>(null);
  const colors: Record<string, string> = {
    demand: "bg-emerald-50 border-emerald-200",
    supply: "bg-blue-50 border-blue-200",
    scheme: "bg-purple-50 border-purple-200",
    weather: "bg-sky-50 border-sky-200",
    cooperative: "bg-orange-50 border-orange-200",
    transaction: "bg-teal-50 border-teal-200",
  };
  const icons: Record<string, string> = {
    demand: "🔥", supply: "📦", scheme: "📋", weather: "⛈️", cooperative: "🤝", transaction: "💰",
  };

  function handleNotify(id: string) {
    playBell();
    setRang(id);
    setTimeout(() => setRang(null), 2500);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="bg-green-800 px-4 pt-14 pb-5 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <button onClick={() => go("home")} className="text-white/60 text-sm mb-2 flex items-center gap-1">‹ {t(lang, "back")}</button>
        <h2 className="text-white text-xl font-black">🔔 {t(lang, "notifications")}</h2>
      </div>
      <div className="px-4 pt-4 flex flex-col gap-2.5">
        {mockNotifications.map((n) => (
          <div key={n.id} className={`rounded-2xl border overflow-hidden ${colors[n.type] || "bg-gray-50 border-gray-200"} ${rang === n.id ? "scale-105 shadow-lg transition-transform" : ""}`}>
            <div className="flex gap-3 p-4">
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shrink-0 shadow-sm ${rang === n.id ? "animate-bounce" : ""}`}>
                {icons[n.type] || "📢"}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium leading-snug">{n.text}</p>
                <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={() => handleNotify(n.id)}
                className={`flex-1 text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${rang === n.id ? "bg-amber-500 text-white scale-95" : "bg-white border border-current text-green-800"}`}
              >
                {rang === n.id ? `🔔 ${t(lang, "bellRang")}` : `🔔 ${t(lang, "notifyMe")}`}
              </button>
              {n.type === "scheme" && (
                <button onClick={() => go("schemes")} className="flex-1 bg-purple-600 text-white text-xs font-black py-2 rounded-xl">
                  📋 {t(lang, "apply")}
                </button>
              )}
              {n.type === "demand" && (
                <button onClick={() => go("marketplace")} className="flex-1 bg-green-700 text-white text-xs font-black py-2 rounded-xl">
                  🛒 {t(lang, "marketplace")}
                </button>
              )}
              {n.type === "cooperative" && (
                <button onClick={() => go("cooperative")} className="flex-1 bg-orange-500 text-white text-xs font-black py-2 rounded-xl">
                  🤝 {t(lang, "connect")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Trends ───────────────────────────────────────────────────────────────────

function TrendsScreen({ lang, go }: { lang: string; go: (s: Screen) => void }) {
  const trends = [
    { icon: "🌾", title: "Rice Husk High Demand", desc: "Bio-energy companies buying at ₹28/kg in Kerala. 40% price jump this month.", tag: "🔥 High Demand" },
    { icon: "🌿", title: "Vermicompost Boom", desc: "Organic farming surge driving prices up 15%. Export opportunity opening.", tag: "📈 Rising" },
    { icon: "🌴", title: "Coconut Products", desc: "Coir & cocopeat export demand from Sri Lanka. Best window Nov–Feb.", tag: "🌍 Export" },
    { icon: "🐄", title: "Organic Manure Demand", desc: "Urban farms and kitchen gardens are fastest growing buyers.", tag: "📊 Trending" },
    { icon: "☀️", title: "Bio-energy Opportunity", desc: "3 new bio-energy plants in Thrissur now buying crop residues.", tag: "🆕 New" },
    { icon: "🌱", title: "Organic Certification", desc: "State scheme for organic certification launched — ₹50,000 support available.", tag: "📋 Scheme" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-32">
      <div className="bg-pink-700 px-4 pt-14 pb-5 rounded-b-[28px] shadow-lg sticky top-0 z-30">
        <button onClick={() => go("dashboard")} className="text-white/60 text-sm mb-2 flex items-center gap-1">‹ {t(lang, "back")}</button>
        <h2 className="text-white text-xl font-black">📈 {t(lang, "latestTrends")}</h2>
        <p className="text-pink-200 text-sm mt-0.5">Agricultural market insights · Sep 2026</p>
      </div>
      <div className="px-4 pt-4 flex flex-col gap-3">
        {trends.map((tr, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl shrink-0">{tr.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-gray-800 text-sm leading-tight">{tr.title}</p>
                  <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">{tr.tag}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{tr.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

const emptyAddr: Address = { houseNo: "", street: "", landmark: "", city: "", district: "", state: "", pinCode: "", country: "India" };
const emptyUser: UserProfile = { name: "", phone: "", email: "", address: emptyAddr, profession: "", farmerType: "", productsHave: [], productsNeed: [], idType: "aadhaar", idVerified: false, trustScore: 72 };
const demoUser: UserProfile = {
  name: "Rajan Pillai",
  phone: "9876543210",
  email: "rajan@example.com",
  address: { houseNo: "12B", street: "Palarivattom Road", landmark: "Near Church", city: "Kottayam", district: "Kottayam", state: "Kerala", pinCode: "686001", country: "India" },
  profession: "farmer",
  farmerType: "Paddy Farmer",
  productsHave: ["Rice husk", "Paddy", "Crop residues (straw, stalks, chaff)", "Biogas slurry"],
  productsNeed: ["Cow dung", "Organic manure", "Compost / vermicompost surplus"],
  idType: "aadhaar",
  idVerified: true,
  trustScore: 87,
};

const MAIN_SCREENS: Screen[] = ["home", "marketplace", "cooperative", "dashboard", "profile"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [lang, setLang] = useState("ml");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reg, setReg] = useState<UserProfile>({ ...emptyUser });
  const [showGlobalVoice, setShowGlobalVoice] = useState(false);

  const go = useCallback((s: Screen) => setScreen(s), []);
  const isMain = MAIN_SCREENS.includes(screen) && !!user;

  function handleLangSelect(l: string) {
    setLang(l);
    go(user ? "home" : "auth");
  }

  function handleLogin(phone: string) {
    setUser({ ...demoUser, phone });
    go("home");
  }

  function handleReg1(d: { name: string; phone: string; email: string }) {
    setReg((r) => ({ ...r, ...d }));
    go("register-otp");
  }

  function handleOTP() { go("register-2"); }

  function handleReg2(addr: Address) {
    setReg((r) => ({ ...r, address: addr }));
    go("register-3");
  }

  function handleReg3(profession: string) {
    setReg((r) => ({ ...r, profession }));
    go("register-4");
  }

  function handleReg4(d: { farmerType: string; have: string[]; need: string[] }) {
    const finalUser: UserProfile = { ...reg, farmerType: d.farmerType || reg.profession, productsHave: d.have, productsNeed: d.need, idVerified: false, trustScore: 72 };
    setUser(finalUser);
    go("register-5");
  }

  function handleLogout() {
    setUser(null);
    setReg({ ...emptyUser });
    go("auth");
  }

  return (
    <div className="relative w-full h-[100dvh] bg-white overflow-hidden flex flex-col">
      {/* Screen content */}
      <div className="absolute inset-0 overflow-hidden">
        {screen === "splash" && <SplashScreen onDone={() => go("language")} />}
        {screen === "language" && <LanguageScreen onSelect={handleLangSelect} />}
        {screen === "auth" && <AuthScreen lang={lang} go={go} />}
        {screen === "login" && <LoginScreen lang={lang} go={go} onLogin={handleLogin} />}
        {screen === "register-1" && <RegisterStep1 lang={lang} go={go} onNext={handleReg1} initial={{ name: reg.name, phone: reg.phone, email: reg.email }} />}
        {screen === "register-otp" && <RegisterOTPScreen lang={lang} phone={reg.phone} go={go} onVerified={handleOTP} />}
        {screen === "register-2" && <RegisterStep2 lang={lang} go={go} onNext={handleReg2} initial={reg.address} />}
        {screen === "register-3" && <RegisterStep3 lang={lang} go={go} onNext={handleReg3} initial={reg.profession} />}
        {screen === "register-4" && <RegisterStep4 lang={lang} profession={reg.profession} go={go} onDone={handleReg4} initial={{ farmerType: reg.farmerType, have: reg.productsHave, need: reg.productsNeed }} />}
        {screen === "register-5" && user && <SuccessScreen lang={lang} user={user} onEnter={() => go("home")} />}
        {screen === "home" && user && <HomeScreen lang={lang} user={user} go={go} />}
        {screen === "marketplace" && <MarketplaceScreen lang={lang} go={go} />}
        {screen === "cooperative" && <CooperativeScreen lang={lang} go={go} user={user} />}
        {screen === "dashboard" && user && <DashboardScreen lang={lang} user={user} go={go} />}
        {screen === "profile" && user && <ProfileScreen lang={lang} user={user} go={go} onLogout={handleLogout} onChangeLang={() => go("language")} />}
        {screen === "ai-assistant" && user && <AIAssistantScreen lang={lang} go={go} user={user} />}
        {screen === "crop-advisory" && user && <CropAdvisoryScreen lang={lang} user={user} go={go} />}
        {screen === "weather" && <WeatherScreen lang={lang} go={go} />}
        {screen === "schemes" && <SchemesScreen lang={lang} go={go} />}
        {screen === "market-prices" && <MarketPricesScreen lang={lang} go={go} />}
        {screen === "notifications" && <NotificationsScreen lang={lang} go={go} />}
        {screen === "trends" && <TrendsScreen lang={lang} go={go} />}
      </div>

      {/* Bottom nav overlay */}
      {isMain && <BottomNav screen={screen} go={go} lang={lang} onMic={() => setShowGlobalVoice(true)} />}
      {showGlobalVoice && <VoiceModal lang={lang} go={go} onClose={() => setShowGlobalVoice(false)} />}
    </div>
  );
}

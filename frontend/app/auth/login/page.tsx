"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"check" | "password" | "register" | "request">("check");
  const [phone, setPhone] = useState("+7 ");
  const [iin, setIIN] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCuratorId, setSelectedCuratorId] = useState("");
  const [curators, setCurators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberBrowser, setRememberBrowser] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("browserFingerprint");
    if (stored) {
      axios.post(`${API_BASE}/auth/login-remembered`, { browserFingerprint: stored })
        .then(res => {
          localStorage.setItem("token", res.data.token);
          router.push("/app/dashboard");
        })
        .catch(() => {});
    }
  }, [router]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const d = digits.startsWith("7") ? digits : "7" + digits.replace(/^8/, "");
    const p = d.slice(0, 11);
    let result = "+7";
    if (p.length > 1) result += " " + p.slice(1, 4);
    if (p.length > 4) result += " " + p.slice(4, 7);
    if (p.length > 7) result += " " + p.slice(7, 9);
    if (p.length > 9) result += " " + p.slice(9, 11);
    return result;
  };

  const generateBrowserFingerprint = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.textBaseline = "alphabetic";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Browser Fingerprint", 2, 15);
    const fingerprint = navigator.userAgent + navigator.language + screen.width + screen.height + canvas.toDataURL();
    const msgBuffer = new TextEncoder().encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/auth/check`, { phone, iin });
      if (res.data.exists) {
        setStep("password");
      } else {
        setCurators([
          { id: 1, name: "Куратор Алибек", role: "curator" },
          { id: 2, name: "Партнер Айгерим", role: "partner" },
        ]);
        setStep("register");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка проверки");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fingerprint = rememberBrowser ? await generateBrowserFingerprint() : null;
      const res = await axios.post(`${API_BASE}/auth/login`, { phone, iin, password, browserFingerprint: fingerprint });
      if (fingerprint) localStorage.setItem("browserFingerprint", fingerprint);
      localStorage.setItem("token", res.data.token);
      router.push("/app/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Неверный пароль");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_BASE}/auth/register`, { phone, iin, name, selectedCuratorId: Number(selectedCuratorId) });
      setStep("request");
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-green/10 to-transparent" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="IC Group" className="h-24 w-auto mx-auto mb-3" />
          <p className="text-sm font-medium tracking-widest text-brand-dark/35 uppercase">OPU Check-list</p>
        </div>

        {/* Step: check */}
        {step === "check" && (
          <form onSubmit={handleCheckUser} className="space-y-5 rounded-[28px] border border-black/5 bg-white p-5 shadow-premium">
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="+7 700 000 00 00"
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-ic-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                ИИН (12 цифр)
              </label>
              <input
                type="text"
                value={iin}
                onChange={e => setIIN(e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-ic-green transition-colors"
              />
            </div>
            {error && <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>}
            <button
              type="submit"
              disabled={loading || !phone || !iin}
              className="w-full py-4 rounded-2xl bg-ic-green text-white font-bold tracking-widest text-sm uppercase disabled:opacity-40 hover:bg-ic-dark transition-colors"
            >
              {loading ? "Проверка..." : "Далее →"}
            </button>
            <button type="button" onClick={() => router.push("/")} className="w-full py-3 rounded-2xl text-sm text-gray-500 hover:text-ic-dark transition-colors">
              ← На главную
            </button>
            <div className="border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => router.push("/app/work")}
                className="w-full py-3 rounded-2xl text-xs text-gray-400 hover:text-ic-green transition-colors border border-dashed border-gray-200 hover:border-ic-green"
              >
                Демо-вход (без бэкенда) →
              </button>
            </div>
          </form>
        )}

        {/* Step: password */}
        {step === "password" && (
          <form onSubmit={handleLogin} className="space-y-5 rounded-[28px] border border-black/5 bg-white p-5 shadow-premium">
            <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-ic-green/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-ic-green" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">{phone}</span>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-ic-green transition-colors"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setRememberBrowser(!rememberBrowser)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${rememberBrowser ? "bg-ic-green" : "bg-gray-200"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${rememberBrowser ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <span className="text-sm text-gray-600">Запомнить этот браузер</span>
            </label>
            {error && <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 rounded-2xl bg-ic-dark text-white font-bold tracking-widest text-sm uppercase disabled:opacity-40 hover:bg-ic-green transition-colors"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
            <button type="button" onClick={() => setStep("check")} className="w-full py-3 rounded-2xl text-sm text-gray-500 hover:text-ic-dark transition-colors">
              ← Назад
            </button>
          </form>
        )}

        {/* Step: register */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-5 rounded-[28px] border border-black/5 bg-white p-5 shadow-premium">
            <div className="bg-ic-green/10 rounded-2xl px-5 py-4 text-sm text-ic-dark/70">
              Пользователь не найден — заполните форму для регистрации
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Имя</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-ic-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Куратор / Партнёр</label>
              <select
                value={selectedCuratorId}
                onChange={e => setSelectedCuratorId(e.target.value)}
                className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-ic-green transition-colors bg-white"
              >
                <option value="">— Выберите —</option>
                {curators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {error && <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>}
            <button
              type="submit"
              disabled={loading || !selectedCuratorId || !name}
              className="w-full py-4 rounded-2xl bg-ic-dark text-white font-bold tracking-widest text-sm uppercase disabled:opacity-40 hover:bg-ic-green transition-colors"
            >
              {loading ? "Отправка..." : "Отправить заявку"}
            </button>
            <button type="button" onClick={() => setStep("check")} className="w-full py-3 rounded-2xl text-sm text-gray-500 hover:text-ic-dark transition-colors">
              ← Назад
            </button>
          </form>
        )}

        {/* Step: request pending */}
        {step === "request" && (
          <div className="text-center space-y-5 rounded-[28px] border border-black/5 bg-white p-5 shadow-premium">
            <div className="w-20 h-20 rounded-full bg-ic-green/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-ic-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-ic-dark mb-2">Заявка отправлена</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ваша заявка отправлена куратору. Как только её одобрят — вы получите уведомление.
              </p>
            </div>
            <button onClick={() => setStep("check")} className="w-full py-4 rounded-2xl border-2 border-gray-200 text-sm font-bold tracking-widest uppercase text-gray-600 hover:border-ic-dark hover:text-ic-dark transition-colors">
              На главную
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

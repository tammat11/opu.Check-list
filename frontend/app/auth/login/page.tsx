"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"check" | "password" | "register" | "request">(
    "check"
  );
  const [phone, setPhone] = useState("");
  const [iin, setIIN] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedCuratorId, setSelectedCuratorId] = useState("");
  const [curators, setCurators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberBrowser, setRememberBrowser] = useState(true);
  const [browserRemembered, setBrowserRemembered] = useState(false);

  useEffect(() => {
    // Try to login with remembered browser
    const checkRememberedBrowser = async () => {
      const stored = localStorage.getItem("browserFingerprint");
      if (stored) {
        try {
          const res = await axios.post(
            `${API_BASE}/auth/login-remembered`,
            { browserFingerprint: stored }
          );
          localStorage.setItem("token", res.data.token);
          router.push("/dashboard");
        } catch (err) {
          // Browser not remembered or session expired
          console.log("Browser not remembered");
        }
      }
    };

    checkRememberedBrowser();
  }, [router]);

  const generateBrowserFingerprint = async () => {
    // Simple browser fingerprint - in production use a library like fingerprintjs2
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx!.textBaseline = "top";
    ctx!.font = '14px Arial';
    ctx!.textBaseline = "alphabetic";
    ctx!.fillStyle = "#f60";
    ctx!.fillRect(125, 1, 62, 20);
    ctx!.fillStyle = "#069";
    ctx!.fillText("Browser Fingerprint", 2, 15);

    const canvasData = canvas.toDataURL();
    const fingerprint =
      navigator.userAgent +
      navigator.language +
      screen.width +
      screen.height +
      canvasData;

    return await hashString(fingerprint);
  };

  const hashString = async (str: string) => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/auth/check`, {
        phone,
        iin,
      });

      if (res.data.exists) {
        if (res.data.requiresPassword) {
          setStep("password");
        } else {
          // User exists but no password - shouldn't happen
          setError("User setup incomplete");
        }
      } else {
        // User doesn't exist - show curator selection for registration
        setCurators([
          { id: 1, name: "Куратор Алибек", role: "curator" },
          { id: 2, name: "Партнер Айгерим", role: "partner" },
        ]);
        setStep("register");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to check user");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fingerprint = rememberBrowser
        ? await generateBrowserFingerprint()
        : null;

      const res = await axios.post(`${API_BASE}/auth/login`, {
        phone,
        iin,
        password,
        browserFingerprint: fingerprint,
      });

      if (fingerprint) {
        localStorage.setItem("browserFingerprint", fingerprint);
        setBrowserRemembered(true);
      }

      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/auth/register`, {
        phone,
        iin,
        name,
        selectedCuratorId: Number(selectedCuratorId),
      });

      setStep("request");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl font-bold">
              <span className="text-ic-green">ic</span>
              <span className="text-gray-400">group</span>
            </span>
          </div>
          <p className="text-lg text-gray-600">OPU Check-list — Вход в систему</p>
        </div>

        {/* Check User Step */}
        {step === "check" && (
          <form
            onSubmit={handleCheckUser}
            className="bg-white rounded-lg p-8 shadow-md"
          >
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+77011234567"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                ИИН (12 цифр)
              </label>
              <input
                type="text"
                value={iin}
                onChange={(e) => setIIN(e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Проверка..." : "Далее"}
            </button>
          </form>
        )}

        {/* Password Step */}
        {step === "password" && (
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-lg p-8 shadow-md"
          >
            <div className="mb-6">
              <p className="text-lg text-gray-900 font-semibold mb-4">
                Телефон: {phone}
              </p>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={rememberBrowser}
                onChange={(e) => setRememberBrowser(e.target.checked)}
                id="remember"
                className="w-6 h-6 accent-blue-600"
              />
              <label htmlFor="remember" className="ml-3 text-gray-700 text-lg">
                Запомнить этот браузер
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 mb-3"
            >
              {loading ? "Вход..." : "Войти"}
            </button>

            <button
              type="button"
              onClick={() => setStep("check")}
              className="btn-secondary w-full"
            >
              Назад
            </button>
          </form>
        )}

        {/* Register Step */}
        {step === "register" && (
          <form
            onSubmit={handleRegister}
            className="bg-white rounded-lg p-8 shadow-md"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-gray-800">
                Пользователь не найден. Заполните форму для регистрации.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Выберите куратора
              </label>
              <select
                value={selectedCuratorId}
                onChange={(e) => setSelectedCuratorId(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">-- Выберите куратора --</option>
                {curators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedCuratorId}
              className="btn-primary w-full disabled:opacity-50 mb-3"
            >
              {loading ? "Отправка..." : "Отправить заявку"}
            </button>

            <button
              type="button"
              onClick={() => setStep("check")}
              className="btn-secondary w-full"
            >
              Назад
            </button>
          </form>
        )}

        {/* Request Pending Step */}
        {step === "request" && (
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Заявка отправлена
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Ваша заявка на регистрацию отправлена куратору. Мы уведомим вас,
              как только она будет одобрена.
            </p>
            <button
              onClick={() => setStep("check")}
              className="btn-secondary w-full"
            >
              На главную
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

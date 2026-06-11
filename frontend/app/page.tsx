"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold">
              <span className="text-ic-green">ic</span>
              <span className="text-gray-400">group</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className="text-gray-600 hover:text-ic-dark font-medium">
              УСЛУГИ
            </a>
            <a href="#" className="text-gray-600 hover:text-ic-dark font-medium">
              О НАС
            </a>
            <a href="#" className="text-gray-600 hover:text-ic-dark font-medium">
              КОНТАКТЫ
            </a>
            <button
              onClick={handleGetStarted}
              className="btn-primary px-6 py-2 text-sm"
            >
              ВХОД
            </button>
          </nav>
          <button
            onClick={handleGetStarted}
            className="md:hidden btn-primary px-4 py-2 text-sm"
          >
            ВХОД
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
          СОЗДАТЬ
          <br />
          <span className="text-ic-green">ЧИСТОТУ</span>
          <br />
          ВО ВСЕМ
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          OPU Check-list — система управления уборкой от IC Group. Контролируйте
          процесс, отслеживайте прогресс и обеспечивайте качество.
        </p>

        <button
          onClick={handleGetStarted}
          className="btn-primary text-lg px-10 py-5 inline-block"
        >
          ПОЛУЧИТЬ ДОСТУП
        </button>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Возможности системы
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="text-5xl mb-6">📋</div>
              <h3 className="text-2xl font-bold mb-4">Управление задачами</h3>
              <p className="text-gray-600">
                Создавайте шаблоны уборки, назначайте их объектам и отслеживайте
                выполнение в реальном времени.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="text-5xl mb-6">👥</div>
              <h3 className="text-2xl font-bold mb-4">Управление командой</h3>
              <p className="text-gray-600">
                Организуйте иерархию от администратора до сотрудников с разными
                правами доступа.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="text-5xl mb-6">📍</div>
              <h3 className="text-2xl font-bold mb-4">Геолокация</h3>
              <p className="text-gray-600">
                Отслеживайте местоположение работников во время выполнения задач
                на объектах.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="text-5xl mb-6">🔔</div>
              <h3 className="text-2xl font-bold mb-4">Уведомления</h3>
              <p className="text-gray-600">
                Получайте мгновенные уведомления о новых задачах и изменении
                статуса.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center">
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-bold mb-4">Аналитика</h3>
              <p className="text-gray-600">
                Анализируйте эффективность команды с помощью детальных отчетов и
                статистики.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center">
              <div className="text-5xl mb-6">♿</div>
              <h3 className="text-2xl font-bold mb-4">Удобный интерфейс</h3>
              <p className="text-gray-600">
                Простой и интуитивный дизайн, доступный для пользователей любого
                возраста.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Готовы начать?</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Присоединитесь к сотням компаний, которые доверяют OPU Check-list для
          управления своими операциями по уборке.
        </p>
        <button
          onClick={handleGetStarted}
          className="btn-primary text-lg px-10 py-5"
        >
          ПЕРЕЙТИ В СИСТЕМУ
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-ic-dark text-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <p className="mb-4">© 2026 IC Group. Все права защищены.</p>
          <p className="text-gray-400">
            OPU Check-list — система управления уборкой и контроля качества
          </p>
        </div>
      </footer>
    </main>
  );
}

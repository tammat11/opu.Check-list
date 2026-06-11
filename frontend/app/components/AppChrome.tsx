"use client";

import Link from "next/link";

type IconProps = { cls?: string };

export const GridIcon = ({ cls = "w-4 h-4" }: IconProps) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

export const UsersIcon = ({ cls = "w-4 h-4" }: IconProps) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

export const ClipboardIcon = ({ cls = "w-4 h-4" }: IconProps) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);

export const BellIcon = ({ cls = "w-4 h-4" }: IconProps) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const ChartIcon = ({ cls = "w-4 h-4" }: IconProps) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l3-3 3 2 4-6" />
  </svg>
);

export const CheckIcon = ({ cls = "w-4 h-4" }: IconProps) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

type PreviewNavbarProps = {
  active: "dashboard" | "admin" | "work" | "checklist";
};

export function PreviewNavbar({ active }: PreviewNavbarProps) {
  return (
    <div className="sticky top-0 z-50 px-4 pt-3 pb-2">
      <div className="max-w-2xl mx-auto rounded-[26px] bg-brand-dark/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,29,30,0.28)] overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 border-b border-white/6">
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white/45">
            Просмотр администратора
          </span>
          <span className="px-2 py-0.5 rounded-full bg-brand-green/25 text-brand-green text-[8px] font-black uppercase tracking-[0.15em]">
            Preview
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="IC Group" className="h-6 w-auto brightness-0 invert opacity-80" />
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/app/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] transition-all text-[10px] font-black uppercase tracking-[0.08em] ${
                active === "dashboard"
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white hover:bg-white/8"
              }`}
            >
              <GridIcon /> <span className="hidden sm:inline">Дашборд</span>
            </Link>
            <Link
              href="/app/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] transition-all text-[10px] font-black uppercase tracking-[0.08em] ${
                active === "admin"
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white hover:bg-white/8"
              }`}
            >
              <UsersIcon /> <span className="hidden sm:inline">Админка</span>
            </Link>
            <Link
              href={active === "checklist" ? "/checklist" : "/app/work"}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[16px] transition-all text-[10px] font-black uppercase tracking-[0.08em] ${
                active === "work" || active === "checklist"
                  ? "bg-brand-green text-brand-dark shadow-[0_2px_12px_rgba(143,198,64,0.35)]"
                  : "text-white/45 hover:text-white hover:bg-white/8"
              }`}
            >
              <ClipboardIcon /> <span className="hidden sm:inline">Уборка</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type AppHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sideLabel?: string;
};

export function AppHero({ eyebrow, title, subtitle, sideLabel }: AppHeroProps) {
  return (
    <div className="relative rounded-[30px] bg-brand-dark overflow-hidden px-6 py-6 shadow-[0_8px_40px_rgba(26,29,30,0.18)]">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-green/10 pointer-events-none" />
      <div className="absolute -bottom-10 left-[58%] w-24 h-24 rounded-full bg-white/[0.03] pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="IC Group" className="h-12 w-auto brightness-0 invert opacity-90" />
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40 mb-0.5">
              {eyebrow}
            </p>
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/65">
              {subtitle}
            </p>
          </div>
        </div>

        {sideLabel ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-green">
            {sideLabel}
          </span>
        ) : null}
      </div>

      <h1 className="mt-5 text-[clamp(2.3rem,8vw,3.3rem)] font-black uppercase text-white leading-[0.9] tracking-tight">
        {title}
      </h1>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
};

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-[24px] px-4 py-4 border border-black/5 shadow-premium">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/35 mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-brand-dark leading-none">{value}</p>
      <p className="text-[10px] font-semibold text-brand-dark/30 mt-2">{sub}</p>
    </div>
  );
}

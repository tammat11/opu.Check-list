"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SparklesButton from "./SparklesButton";

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ onCtaClick }: { onCtaClick?: () => void }) => {
  const root = useRef<HTMLDivElement>(null);
  const [permsGranted, setPermsGranted] = useState(false);
  const [requestingPerms, setRequestingPerms] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const [notif, geo] = await Promise.all([
        navigator.permissions.query({ name: "notifications" as PermissionName }),
        navigator.permissions.query({ name: "geolocation" }),
      ]);
      setPermsGranted(notif.state === "granted" && geo.state === "granted");
    } catch {
      setPermsGranted(false);
    }
  };

  const handleRequestPerms = async () => {
    setRequestingPerms(true);
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(() => resolve(), reject);
      });
      const notif = await Notification.requestPermission();
      setPermsGranted(notif === "granted");
      window.dispatchEvent(new Event("opu-push-sync"));
    } catch {
      // геолокация отклонена
    }
    await checkPermissions();
    setRequestingPerms(false);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        [".hero-fade-in", ".hero-title-reveal"],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.05,
          ease: "power4.out",
        }
      );

      const cleaningTl = gsap.timeline({ delay: 1.4 });
      cleaningTl
        .fromTo(
          ".cleaning-hand",
          { x: 300, y: 100, rotate: 30, opacity: 0 },
          { x: 20, y: -5, rotate: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        )
        .to(".cleaning-hand", {
          x: -20,
          y: 5,
          rotate: -5,
          duration: 0.2,
          repeat: 3,
          yoyo: true,
          ease: "sine.inOut",
        })
        .to(
          ".clean-dirt",
          {
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)",
            duration: 0.4,
            ease: "power2.in",
          },
          "-=0.6"
        )
        .to(".cleaning-hand", {
          x: -1200,
          y: 800,
          rotate: -60,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
        })
        .fromTo(
          ".clean-sparkle",
          { scale: 0, opacity: 0, rotate: -45 },
          { scale: 1.5, opacity: 1, rotate: 45, duration: 0.5, ease: "back.out(3)" },
          "-=0.4"
        )
        .to(".clean-sparkle", { opacity: 0, scale: 0, duration: 0.4, delay: 0.2 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-white -mt-16"
    >
      <div className="max-w-7xl mx-auto text-center relative z-10 w-full flex flex-col items-center">
        {/* Logo */}
        <div className="hero-fade-in mb-8 transition-transform duration-700 hover:scale-105">
          <img src="/logo.png" alt="IC Group" className="h-44 w-auto" />
        </div>

        {/* Headline */}
        <h1 className="flex flex-col items-center mb-6 select-none font-bold tracking-tighter uppercase whitespace-normal lg:whitespace-nowrap leading-[0.85] relative z-20">
          <span
            className="hero-title-reveal block text-[clamp(50px,10vw,100px)] text-ic-dark"
          >
            Создать
          </span>

          <span className="hero-title-reveal block text-[clamp(56px,11vw,112px)] relative inline-block px-4 py-2 overflow-visible">
            <span className="relative z-20 text-ic-green">Чистоту</span>

            {/* Dirt blob */}
            <div className="clean-dirt absolute top-1/2 right-[-10%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 pointer-events-none z-30 opacity-50 flex items-center justify-center mix-blend-multiply">
              <svg viewBox="0 0 200 200" className="w-full h-full fill-current text-[#5c6066]">
                <path
                  d="M41.7,-72.4C53.4,-64.7,62.1,-53.4,68.9,-41.4C75.7,-29.4,80.6,-16.7,81.1,-3.7C81.6,9.3,77.7,22.6,71.2,34.8C64.7,47,55.6,58.1,44.4,66.5C33.2,74.9,19.9,80.6,6.1,80.9C-7.7,81.2,-21.9,76.1,-34.5,68.9C-47.1,61.7,-58.1,52.4,-66.4,41.2C-74.7,30,-80.3,16.9,-81.1,3.4C-81.9,-10.1,-77.9,-24,-69.9,-35.8C-61.9,-47.6,-49.9,-57.3,-37.4,-64.5C-24.9,-71.7,-11.9,-76.4,2.1,-79.8C16.1,-83.2,30,-80.1,41.7,-72.4Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>

            {/* Sparkle after clean */}
            <div className="clean-sparkle absolute top-0 right-0 w-24 h-24 pointer-events-none z-50 opacity-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-ic-dark/15">
                <path
                  d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Cleaning hand (rag image) */}
            <div className="cleaning-hand absolute top-0 right-[-20%] w-40 md:w-64 h-auto pointer-events-none z-[60] select-none">
              <img src="/rag.png" alt="" className="w-full h-auto" style={{ transform: "rotate(30deg) scaleX(-1)" }} />
            </div>
          </span>

          <span className="hero-title-reveal block text-[clamp(50px,10vw,100px)] text-ic-dark">
            Во всем
          </span>
        </h1>


        {/* CTA */}
        <div className="hero-fade-in flex flex-col items-center gap-4 mt-4 z-20">
          <SparklesButton
            onClick={onCtaClick}
            className="px-16 py-6 text-lg font-semibold tracking-widest rounded-full bg-ic-dark text-white hover:bg-ic-green shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            ВОЙТИ В СИСТЕМУ
          </SparklesButton>

          <div className="flex gap-3 mt-2">
            <a
              href="#instructions"
              className="px-8 py-4 text-sm font-semibold tracking-widest rounded-full border-2 border-gray-300 text-gray-600 hover:border-ic-dark hover:text-ic-dark transition-all duration-300"
            >
              ИНСТРУКЦИЯ
            </a>
            <button
              onClick={permsGranted ? undefined : handleRequestPerms}
              disabled={requestingPerms}
              className={`px-8 py-4 text-sm font-semibold tracking-widest rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${
                permsGranted
                  ? "border-ic-green text-ic-green cursor-default"
                  : "border-gray-300 text-gray-600 hover:border-ic-dark hover:text-ic-dark"
              }`}
            >
              {permsGranted ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  ДОСТУПЫ РАЗРЕШЕНЫ
                </>
              ) : requestingPerms ? (
                "ЗАГРУЗКА..."
              ) : (
                "РАЗРЕШИТЬ ДОСТУПЫ"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

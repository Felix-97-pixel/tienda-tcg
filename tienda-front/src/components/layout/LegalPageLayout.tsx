"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";

export interface LegalLink {
  id: string;
  label: string;
}

interface LegalPageLayoutProps {
  title: string;
  navTitle: string;
  links: LegalLink[];
  lastUpdated: string;
  backToShopText: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  navTitle,
  links,
  lastUpdated,
  backToShopText,
  children
}) => {
  const [activeId, setActiveId] = useState(links[0]?.id || "");

  useEffect(() => {
    if (links.length === 0) return;

    // Use a slightly wider target band (-160px to -45%) to catch small sections
    const observerOptions = {
      root: null,
      rootMargin: "-160px 0px -45% 0px",
      threshold: [0, 0.2, 0.5, 0.8, 1.0]
    };

    // Track active intersecting sections
    const intersectingMap = new Map<string, number>();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingMap.set(entry.target.id, entry.boundingClientRect.top);
        } else {
          intersectingMap.delete(entry.target.id);
        }
      });

      // If we are intersecting sections, pick the one closest to our threshold top (160px)
      if (intersectingMap.size > 0) {
        let closestId = "";
        let minDistance = Infinity;

        intersectingMap.forEach((top, id) => {
          const distance = Math.abs(top - 160);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = id;
          }
        });

        if (closestId) {
          setActiveId(closestId);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    links.forEach((link) => {
      const element = document.getElementById(link.id);
      if (element) observer.observe(element);
    });

    // Handle scroll to absolute bottom of page where sections might not hit 160px margin
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (isAtBottom && links.length > 0) {
        setActiveId(links[links.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      links.forEach((link) => {
        const element = document.getElementById(link.id);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener("scroll", handleScroll);
    };
  }, [links]);

  const getLinkClass = (id: string) => {
    const baseClass = "transition-all duration-200 block py-2 px-3 rounded-xl font-semibold text-xs border-l-2";
    const isActive = activeId === id;
    
    return isActive
      ? `${baseClass} text-white bg-[#E10E0E]/15 border-[#E10E0E] shadow-sm font-bold`
      : `${baseClass} text-gray-400 border-transparent hover:text-white hover:bg-white/5`;
  };

  return (
    <div className="bg-[#07090E] min-h-screen text-white relative">
      {/* Isolated Background Atmosphere Layer (avoids breaking position: sticky on page content) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-[#E10E0E]/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <Breadcrumb title={title} pages={[title]} />
      
      <section className="py-10 lg:py-16 relative z-10">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Quick Dropdown Sticky Bar */}
          <div className="lg:hidden sticky top-[110px] z-30 mb-6 p-3 rounded-2xl bg-[#0E121B]/95 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#E10E0E] animate-pulse shrink-0"></span>
              <span className="text-xs font-bold text-white truncate">
                {links.find((l) => l.id === activeId)?.label || "Índice de Cláusulas"}
              </span>
            </div>
            <select
              value={activeId}
              onChange={(e) => {
                const target = document.getElementById(e.target.value);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                  setActiveId(e.target.value);
                }
              }}
              className="bg-[#111522] border border-white/10 text-xs font-bold text-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-red-500 shrink-0"
            >
              {links.map((link) => (
                <option key={link.id} value={link.id} className="bg-[#0E121B] text-white">
                  {link.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
            
            {/* Quick Navigation Sticky Sidebar (follows scroll all the way down) */}
            <aside className="w-full lg:w-[320px] shrink-0 sticky top-[130px] self-start bg-[#0E121B]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 hidden lg:block z-20">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E10E0E] animate-pulse"></span>
                  {navTitle}
                </h3>
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {links.length} Cláusulas
                </span>
              </div>

              <ul className="flex flex-col gap-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {links.map((link) => (
                  <li key={link.id}>
                    <a href={`#${link.id}`} className={getLinkClass(link.id)}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Sidebar Legal Badges */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase tracking-wider">
                    Titular Legal
                  </span>
                  <span className="text-xs font-black text-white block mt-0.5">
                    TAPTRADE SpA
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 block">
                    RUT: 78.531.106-K
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir / Descargar PDF
                </button>
              </div>
            </aside>

            {/* Document Content Article */}
            <article className="flex-1 bg-[#0E121B]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 lg:p-12 w-full shadow-2xl shadow-black/60">
              {children}

              {/* Document Footer */}
              <div className="border-t border-white/10 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{lastUpdated}</span>
                </div>
                <Link
                  href="/shop"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-lg shadow-[#E10E0E]/25 transition-all flex items-center gap-1.5"
                >
                  {backToShopText} &rarr;
                </Link>
              </div>
            </article>

          </div>

        </div>
      </section>
    </div>
  );
};

export default LegalPageLayout;

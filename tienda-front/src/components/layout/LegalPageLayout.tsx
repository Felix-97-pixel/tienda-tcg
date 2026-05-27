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
    const baseClass = "transition-all duration-200 block py-1 border-l-2 pl-3 font-semibold text-custom-sm";
    const isActive = activeId === id;
    
    return isActive
      ? `${baseClass} text-blue border-blue`
      : `${baseClass} text-gray-6 border-transparent hover:text-blue hover:border-gray-4`;
  };

  return (
    <>
      <Breadcrumb title={title} pages={[title]} />
      
      <section className="bg-gray-2 py-15 lg:py-25">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-15 items-start">
            
            {/* Quick Navigation Sidebar */}
            <aside className="w-full lg:w-[280px] shrink-0 sticky top-[160px] bg-white rounded-lg shadow-1 p-6 hidden lg:block">
              <h3 className="font-bold text-dark text-base mb-4 border-b border-gray-3 pb-3">
                {navTitle}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.id}>
                    <a href={`#${link.id}`} className={getLinkClass(link.id)}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Document Content */}
            <article className="flex-1 bg-white rounded-lg shadow-1 p-6 sm:p-10 lg:p-12 w-full">
              {children}

              {/* Footer Box */}
              <div className="border-t border-gray-3 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-custom-xs text-gray-5 font-semibold">
                  {lastUpdated}
                </span>
                <Link href="/shop" className="text-custom-sm text-blue font-bold hover:underline">
                  {backToShopText} &rarr;
                </Link>
              </div>
            </article>

          </div>

        </div>
      </section>
    </>
  );
};

export default LegalPageLayout;

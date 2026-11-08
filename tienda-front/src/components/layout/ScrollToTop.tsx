"use client";
import { useEffect, useState } from "react";
import { IconChevronUp } from "@/components/ui/Icons";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Top: 0 takes us all the way back to the top of the page
  // Behavior: smooth keeps it smooth!
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Button is displayed after scrolling for 300 pixels
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          className={`items-center justify-center w-11 h-11 rounded-xl bg-[#111522]/90 backdrop-blur-md border border-white/15 hover:border-red-500/60 text-gray-300 hover:text-white hover:bg-gradient-to-br hover:from-[#E10E0E] hover:to-[#B80B0B] shadow-xl shadow-black/60 hover:shadow-red-600/25 transition-all duration-200 group fixed bottom-8 right-8 z-[999] ${
            isVisible ? "flex" : "hidden"
          }`}
        >
          <IconChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </button>
      )}
    </>
  );
}

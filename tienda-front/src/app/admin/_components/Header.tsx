import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { useTranslations } from "next-intl";

const Header = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) => {
  const t = useTranslations("header");
  const tc = useTranslations("common");
  const { user } = useAppSelector((state) => state.adminAuthReducer);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-999 flex w-full bg-[#0E121B]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="flex flex-grow items-center justify-between px-6 py-4 md:px-8 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-xl border border-white/10 bg-white/5 p-2 shadow-sm lg:hidden text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>

        <div className="hidden lg:block">
          <p className="text-xs font-bold text-white/50 uppercase tracking-[0.1em]">
            {t("management")} <span className="text-red mx-1.5 font-black">/</span> <span className="text-white">{t("summary")}</span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <span className="hidden text-right lg:block">
              {isMounted && (
                <>
                  <span className="block text-sm font-black text-white tracking-tight leading-tight">
                    {user?.name || user?.email}
                  </span>
                  <span className="inline-block text-[9px] font-black text-red-light uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-full bg-red/10 border border-red/20">
                    {user?.role || tc("admin")}
                  </span>
                </>
              )}
            </span>

            {/* Link back to store */}
            <Link
              href="/"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-bold text-white/70 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all shadow-sm"
            >
              <svg className="w-4 h-4 text-white/50 group-hover:text-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {isMounted && t("backToStore")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

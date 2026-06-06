import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/store";
import { useTranslations } from "next-intl";

const Header = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) => {
  const t = useTranslations("header");
  const tc = useTranslations("common");
  const { user } = useAppSelector((state) => state.authReducer);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-999 flex w-full bg-[#1a1d24]/80 backdrop-blur-md border-b border-stroke/50 shadow-sm">
      <div className="flex flex-grow items-center justify-between px-6 py-4 md:px-8 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-xl border border-stroke bg-[#1a1d24] p-2 shadow-sm lg:hidden hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>

        <div className="hidden lg:block">
          <p className="text-xs font-bold text-gray-4 uppercase tracking-[0.1em]">{t("management")} <span className="text-blue mx-1">/</span> <span className="text-white">{t("summary")}</span></p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-l border-stroke pl-6">
            <span className="hidden text-right lg:block">
              {isMounted && (
                <>
                  <span className="block text-sm font-black text-white tracking-tight leading-tight">
                    {user?.name || user?.email}
                  </span>
                  <span className="block text-[10px] font-bold text-blue uppercase tracking-widest mt-0.5">{user?.role || tc("admin")}</span>
                </>
              )}
            </span>

            {/* Link back to store */}
            <Link
              href="/"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111318] text-xs font-bold text-gray-4 hover:bg-blue hover:text-white transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {isMounted && t("backToStore")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";

interface PreLoaderProps {
  message?: string;
}

const PreLoader = ({ message }: PreLoaderProps) => {
  return (
    <div className="fixed left-0 top-0 z-999999 flex h-screen w-screen flex-col items-center justify-center bg-[#07090E]/80 backdrop-blur-md">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red/20 blur-xl animate-pulse" />
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-solid border-red border-t-transparent shadow-[0_0_15px_rgba(225,14,14,0.5)]" />
      </div>
      {message && (
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-white/80 animate-pulse font-mono">
          {message}
        </p>
      )}
    </div>
  );
};

export default PreLoader;

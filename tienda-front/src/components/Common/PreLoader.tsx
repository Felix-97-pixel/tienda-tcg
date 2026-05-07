import React from "react";

interface PreLoaderProps {
  message?: string;
}

const PreLoader = ({ message }: PreLoaderProps) => {
  return (
    <div className="fixed left-0 top-0 z-999999 flex h-screen w-screen flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue border-t-transparent"></div>
      {message && (
        <p className="mt-4 text-lg font-medium text-dark animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default PreLoader;

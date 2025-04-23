"use client";
import { RegisterPage } from "./components/RegisterPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useEffect, useState } from "react";

export default function Register() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center md:bg-gradient-to-br md:from-slate-900 md:to-slate-800 p-0 md:p-4">
      <div className="w-full h-screen md:w-[430px] md:h-auto md:max-h-[850px] bg-white dark:bg-slate-900 md:rounded-xl md:shadow-xl flex flex-col overflow-hidden md:border border-slate-300 dark:border-slate-700">
        <ErrorBoundary>
          <RegisterPage />
        </ErrorBoundary>
      </div>
    </div>
  );
}

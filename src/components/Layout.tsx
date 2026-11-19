import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Header } from "./Header";
import { Footer } from "./Footer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function Layout() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[100] bg-signal px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t("nav.skip")}
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

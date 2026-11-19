import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ClipboardList, Globe, Menu, Phone, Search, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { useQuote } from "@/state/quote";
import { categories } from "@/data/categories";
import { brands } from "@/data/brands";
import { countProducts } from "@/services/catalog";
import { Logo } from "./Logo";
import { CategoryIcon } from "./CategoryIcon";
import { Arrow, useContact } from "./common";

export function Header() {
  const { t, tr, toggle, n } = useI18n();
  const { lineCount } = useQuote();
  const contact = useContact();
  const location = useLocation();
  const navigate = useNavigate();
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    setMega(false);
    setMobile(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/catalogue?q=${encodeURIComponent(q.trim())}` : "/catalogue");
    setQ("");
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-2 text-sm font-semibold transition-colors hover:text-signal after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:bg-signal after:transition-transform rtl:after:origin-right ${
      isActive ? "after:scale-x-100 text-ink" : "after:scale-x-0 text-ink/80"
    }`;

  return (
    <header className="sticky top-0 z-50" onMouseLeave={() => setMega(false)}>
      {/* Utility bar */}
      <div className="hidden bg-ink text-white md:block">
        <div className="mx-auto flex h-9 max-w-[1360px] items-center justify-between px-8">
          <p className="label flex items-center gap-2 text-white/70">
            <span className="size-1.5 bg-signal" /> {t("topbar.note")}
          </p>
          <div className="label flex items-center gap-5 text-white/70">
            <span className="flex items-center gap-1.5" title={contact.phone.configured ? undefined : t("common.toBeConfigured")}>
              <Phone className="size-3" />
              <span className={`mono ${contact.phone.configured ? "" : "opacity-60"}`}>{contact.phone.value}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="relative border-b border-ink/15 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-4 px-4 sm:px-8 md:h-[72px] lg:gap-8">
          <Link to="/" aria-label="MIS" className="shrink-0">
            <Logo className="h-9 md:h-10" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Main">
            <NavLink to="/" end className={linkCls}>
              {t("nav.home")}
            </NavLink>
            <button
              type="button"
              aria-expanded={mega}
              aria-haspopup="true"
              onMouseEnter={() => setMega(true)}
              onClick={() => setMega((v) => !v)}
              className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors hover:text-signal ${
                mega || location.pathname.startsWith("/catalogue") || location.pathname.startsWith("/categor") ? "text-signal" : "text-ink/80"
              }`}
            >
              {t("nav.catalogue")}
              <ChevronDown className={`size-3.5 transition-transform ${mega ? "rotate-180" : ""}`} />
            </button>
            <NavLink to="/brands" className={linkCls}>
              {t("nav.brands")}
            </NavLink>
            <NavLink to="/about" className={linkCls}>
              {t("nav.about")}
            </NavLink>
            <NavLink to="/faq" className={linkCls}>
              {t("nav.faq")}
            </NavLink>
            <NavLink to="/contact" className={linkCls}>
              {t("nav.contact")}
            </NavLink>
          </nav>

          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <form onSubmit={submitSearch} role="search" className="hidden xl:block">
              <label className="relative block">
                <span className="sr-only">{t("nav.search")}</span>
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("nav.search")}
                  className="h-10 w-44 border border-ink/20 bg-white ps-9 pe-3 text-sm outline-none transition-all focus:w-60 focus:border-ink"
                />
              </label>
            </form>

            <button
              type="button"
              onClick={toggle}
              className="flex h-10 items-center gap-1.5 border border-ink/20 px-3 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-white"
              aria-label={t("nav.language")}
            >
              <Globe className="size-4" />
              {t("nav.switchTo")}
            </button>

            <Link
              to="/quote"
              className="relative flex h-10 items-center gap-2 bg-ink px-3 text-sm font-semibold text-white transition-colors hover:bg-signal sm:px-4"
              aria-label={`${t("nav.quote")} (${lineCount})`}
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline">{t("nav.quote")}</span>
              <span
                key={lineCount}
                className={`mono flex size-5 items-center justify-center bg-signal text-[11px] font-semibold ${lineCount ? "bump" : "opacity-60"}`}
              >
                {n(lineCount)}
              </span>
            </Link>

            <button
              type="button"
              className="flex size-10 items-center justify-center border border-ink/20 lg:hidden"
              aria-label={mobile ? t("nav.close") : t("nav.menu")}
              aria-expanded={mobile}
              onClick={() => setMobile((v) => !v)}
            >
              {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <div
          className={`absolute inset-x-0 top-full hidden transition-all duration-300 lg:block ${
            mega ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
          }`}
        >
          <div className="border-b-4 border-signal bg-paper shadow-2xl">
            <div className="mx-auto grid max-w-[1360px] grid-cols-12 gap-10 px-8 py-8">
              <div className="col-span-8">
                <p className="label mb-4 text-mist">{t("nav.byCategory")}</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to={`/category/${c.slug}`}
                        className="group flex items-center gap-4 border-b border-ink/10 py-3 transition-colors hover:border-signal"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center bg-ink text-white transition-colors group-hover:bg-signal">
                          <CategoryIcon name={c.icon} className="size-5" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold leading-tight">{tr(c.name)}</span>
                          <span className="mono text-[11px] text-mist">
                            {c.code} · {t("common.nProducts", { n: countProducts({ category: c.slug }) })}
                          </span>
                        </span>
                        <Arrow className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-4 border-s border-ink/10 ps-10">
                <p className="label mb-4 text-mist">{t("nav.byBrand")}</p>
                <ul className="grid grid-cols-2 gap-x-4">
                  {brands.map((b) => (
                    <li key={b.slug}>
                      <Link
                        to={`/brand/${b.slug}`}
                        className="flex items-center justify-between border-b border-ink/10 py-2.5 text-sm font-semibold transition-colors hover:text-signal"
                      >
                        {b.name}
                        <span className="mono text-[11px] font-normal text-mist">{countProducts({ brand: b.slug })}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/catalogue" className="btn btn-ink btn-sm mt-6 w-full">
                  {t("nav.browseAll")} <Arrow className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-ink text-white lg:hidden">
          <div className="bp-grid-dark min-h-full px-5 pt-6 pb-24">
            <form onSubmit={submitSearch} role="search" className="relative">
              <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className="h-12 w-full border border-white/25 bg-white/5 ps-11 pe-3 text-sm outline-none placeholder:text-white/40 focus:border-signal"
              />
            </form>
            <nav className="mt-6 flex flex-col" aria-label="Mobile">
              {[
                ["/", t("nav.home")],
                ["/catalogue", t("nav.catalogue")],
                ["/categories", t("nav.categories")],
                ["/brands", t("nav.brands")],
                ["/about", t("nav.about")],
                ["/faq", t("nav.faq")],
                ["/contact", t("nav.contact")],
              ].map(([to, label], i) => (
                <Link
                  key={to}
                  to={to}
                  className="display flex items-center justify-between border-b border-white/15 py-4 text-2xl transition-colors hover:text-signal"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    {label}
                  </span>
                  <Arrow />
                </Link>
              ))}
            </nav>
            <p className="label mt-8 mb-3 text-white/50">{t("nav.byCategory")}</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  className="flex items-center gap-2 border border-white/15 p-3 text-sm transition-colors hover:border-signal"
                >
                  <CategoryIcon name={c.icon} className="size-4 shrink-0 text-signal" />
                  <span className="leading-tight">{tr(c.name)}</span>
                </Link>
              ))}
            </div>
            <Link to="/quote/request" className="btn btn-red mt-8 w-full">
              {t("nav.requestQuote")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

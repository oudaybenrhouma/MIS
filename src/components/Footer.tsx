import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { categories } from "@/data/categories";
import { brands } from "@/data/brands";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { useContact } from "./common";

export function Footer() {
  const { t, tr, lang } = useI18n();
  const contact = useContact();

  const heading = "label mb-4 text-signal";
  const link = "block py-1 text-sm text-white/70 transition-colors hover:text-white";
  const ph = (configured: boolean) => (configured ? "" : "opacity-60");

  const block = [
    [t("footer.blockMarket"), t("footer.blockMarketV")],
    [t("footer.blockModel"), t("footer.blockModelV")],
    [t("footer.blockCurrency"), t("footer.blockCurrencyV")],
    [t("footer.blockLang"), t("footer.blockLangV")],
  ];

  return (
    <footer className="bp-grid-dark relative mt-0 bg-ink text-white">
      <div className="mx-auto max-w-[1360px] px-5 pt-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo plate className="h-10" />
            <p className="mt-6 max-w-sm text-sm text-white/70">{t("footer.tag")}</p>
            <p className="mt-2 text-sm font-semibold text-white">{siteConfig.name[lang]}</p>
          </div>

          <div className="md:col-span-3">
            <p className={heading}>{t("footer.catalogue")}</p>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`} className={link}>
                    {tr(c.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className={heading}>{t("nav.brands")}</p>
            <ul>
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link to={`/brand/${b.slug}`} className={link}>
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className={heading}>{t("footer.company")}</p>
            <ul>
              <li><Link to="/about" className={link}>{t("nav.about")}</Link></li>
              <li><Link to="/faq" className={link}>{t("nav.faq")}</Link></li>
              <li><Link to="/contact" className={link}>{t("nav.contact")}</Link></li>
              <li><Link to="/quote" className={link}>{t("nav.quote")}</Link></li>
            </ul>
            <p className={`${heading} mt-6`}>{t("footer.contact")}</p>
            <ul className="space-y-1 text-sm text-white/70">
              <li className={`mono ${ph(contact.phone.configured)}`}>{contact.phone.value}</li>
              <li className={`mono ${ph(contact.email.configured)}`}>{contact.email.value}</li>
              <li className={ph(contact.address.configured)}>{contact.address.value}</li>
            </ul>
          </div>
        </div>

        {/* Engineering-drawing title block */}
        <div className="mt-16 grid grid-cols-2 border border-white/25 md:grid-cols-4">
          {block.map(([k, v], i) => (
            <div key={k} className={`p-4 ${i % 2 === 0 ? "border-e border-white/25" : ""} ${i > 1 ? "border-t border-white/25 md:border-t-0" : ""} ${i !== 3 ? "md:border-e md:border-white/25" : ""}`}>
              <p className="label text-white/45">{k}</p>
              <p className="mt-1 text-sm font-semibold">{v}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 py-8 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl">{t("footer.disclaimer")}</p>
          <p className="mono shrink-0">
            © {new Date().getFullYear()} MIS · {t("footer.rights")}
          </p>
        </div>
      </div>
      <div className="h-2 bg-signal" />
    </footer>
  );
}

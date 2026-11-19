import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Arrow, usePageTitle } from "@/components/common";

export default function NotFound({ title }: { title?: string }) {
  const { t } = useI18n();
  usePageTitle(title ?? t("common.notFound"));
  return (
    <section className="bp-grid-light mx-auto flex min-h-[60vh] max-w-[1360px] flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="outline-num text-[9rem] leading-none text-signal sm:text-[14rem]">404</p>
      <h1 className="display mt-4 text-3xl md:text-5xl">{title ?? t("common.notFound")}</h1>
      <p className="mt-4 max-w-lg text-ink/65">{t("common.notFoundText")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-ink">
          {t("common.goHome")} <Arrow />
        </Link>
        <Link to="/catalogue" className="btn btn-line">
          {t("nav.catalogue")}
        </Link>
      </div>
    </section>
  );
}

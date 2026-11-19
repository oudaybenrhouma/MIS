import type { Brand } from "./types";

/**
 * Brand portfolio. To add a brand: append an entry here (and products that reference its slug).
 * Official brand logos are NOT bundled; the UI uses neutral typographic plates until
 * MIS supplies licensed brand assets.
 */
const profilePlaceholder = {
  en: "Brand profile to be supplied by MIS. Products shown under this brand are placeholders until the official catalogue is connected.",
  ar: "نبذة العلامة التجارية ستُزوَّد من قبل MIS. المنتجات المعروضة تحت هذه العلامة بيانات تجريبية إلى حين ربط الكتالوج الرسمي.",
};

export const brands: Brand[] = [
  {
    slug: "hazet",
    name: "Hazet",
    monogram: "H",
    focus: { en: "Workshop tools & equipment", ar: "عدد ومعدات الورش" },
    description: profilePlaceholder,
    categories: ["tools", "logistics-workshop"],
  },
  {
    slug: "knipex",
    name: "Knipex",
    monogram: "K",
    focus: { en: "Pliers & cutting tools", ar: "الكمّاشات وأدوات القص" },
    description: profilePlaceholder,
    categories: ["tools", "maintenance-production"],
  },
  {
    slug: "loctite",
    name: "Loctite",
    monogram: "L",
    focus: { en: "Adhesives & sealants", ar: "المواد اللاصقة ومواد الإحكام" },
    description: profilePlaceholder,
    categories: ["maintenance-production", "industrial-performance"],
  },
  {
    slug: "mitutoyo",
    name: "Mitutoyo",
    monogram: "M",
    focus: { en: "Precision measuring instruments", ar: "أجهزة القياس الدقيقة" },
    description: profilePlaceholder,
    categories: ["measurement-control"],
  },
  {
    slug: "showa",
    name: "SHOWA",
    monogram: "S",
    focus: { en: "Protective gloves", ar: "قفازات الحماية" },
    description: profilePlaceholder,
    categories: ["safety-ppe"],
  },
  {
    slug: "smc",
    name: "SMC",
    monogram: "SMC",
    focus: { en: "Pneumatic & automation components", ar: "مكوّنات الهواء المضغوط والأتمتة" },
    description: profilePlaceholder,
    categories: ["fluid-transmission", "automation-electrical"],
  },
  {
    slug: "wera",
    name: "Wera",
    monogram: "W",
    focus: { en: "Screwdriving & hand tools", ar: "المفكات والعدد اليدوية" },
    description: profilePlaceholder,
    categories: ["tools", "maintenance-production"],
  },
];

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);

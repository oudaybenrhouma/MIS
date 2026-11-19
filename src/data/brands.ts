import type { Brand } from "./types";

const profile = (en: string, ar: string) => ({ en, ar });

export const brands: Brand[] = [
  {
    slug: "djois-tarifold",
    name: "Djois | Tarifold",
    monogram: "DT",
    focus: profile("Document display, identification & planning", "عرض المستندات والتعريف والتخطيط"),
    description: profile("The supplied folder contains product reference images, but no structured product list.", "يحتوي المجلد المرفق على صور مراجع المنتجات، دون قائمة منتجات منظمة."),
    categories: ["logistics-workshop"],
  },
  {
    slug: "ecs",
    name: "ECS",
    monogram: "ECS",
    focus: profile("Electronics cleaners & maintenance products", "منظفات الإلكترونيات ومنتجات الصيانة"),
    description: profile("Product details imported from the supplied ECS catalogue.", "تم استيراد بيانات المنتجات من كتالوج ECS المرفق."),
    categories: ["maintenance-production"],
  },
  {
    slug: "hazet",
    name: "HAZET",
    monogram: "H",
    focus: profile("Hand tools & workshop equipment", "العدد اليدوية ومعدات الورش"),
    description: profile("Product references and specifications imported from the supplied HAZET database.", "تم استيراد مراجع المنتجات ومواصفاتها من قاعدة بيانات HAZET المرفقة."),
    categories: ["tools"],
  },
  {
    slug: "novap",
    name: "NOVAP",
    monogram: "N",
    focus: profile("Storage, safety & site marking", "التخزين والسلامة وعلامات مواقع العمل"),
    description: profile("The supplied folder contains product images grouped by range, but no structured product list.", "يحتوي المجلد المرفق على صور منتجات مرتبة حسب الفئة، دون قائمة منتجات منظمة."),
    categories: ["logistics-workshop", "safety-ppe"],
  },
  {
    slug: "rennsteig",
    name: "RENNSTEIG",
    monogram: "R",
    focus: profile("Professional hand tools & cable processing", "العدد الاحترافية وتجهيز الكابلات"),
    description: profile("Product descriptions, specifications and references imported from the supplied English catalogue.", "تم استيراد أوصاف المنتجات ومواصفاتها ومراجعها من الكتالوج الإنجليزي المرفق."),
    categories: ["tools"],
  },
  {
    slug: "vigor",
    name: "VIGOR",
    monogram: "V",
    focus: profile("Workshop tools & equipment", "عدد ومعدات الورش"),
    description: profile("Product references and technical details imported from the supplied VIGOR database.", "تم استيراد مراجع المنتجات وتفاصيلها الفنية من قاعدة بيانات VIGOR المرفقة."),
    categories: ["tools"],
  },
  {
    slug: "wera",
    name: "Wera",
    monogram: "W",
    focus: profile("Screwdriving & hand tools", "مفكات وعدد يدوية"),
    description: profile("Product references and names imported from the supplied Wera data. Product names are preserved in the source language.", "تم استيراد مراجع المنتجات وأسمائها من بيانات Wera المرفقة مع الحفاظ على لغة المصدر."),
    categories: ["tools", "maintenance-production"],
  },
  {
    slug: "wsp",
    name: "WSP",
    monogram: "WSP",
    focus: profile("Personal protective equipment", "معدات الوقاية الشخصية"),
    description: profile("Product references imported from the supplied WSP safety catalogue.", "تم استيراد مراجع المنتجات من كتالوج السلامة WSP المرفق."),
    categories: ["safety-ppe"],
  },
];

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);

import type { Category } from "./types";

/**
 * Industrial categories. To add a category: append an entry here.
 * Pages, menus, filters and counts all derive from this list.
 */
export const categories: Category[] = [
  {
    slug: "measurement-control",
    code: "MC",
    icon: "ruler",
    name: { en: "Measurement & Control", ar: "القياس والتحكم" },
    short: {
      en: "Instruments for dimensional measurement and inspection.",
      ar: "أجهزة القياس البُعدي والفحص.",
    },
    description: {
      en: "Measuring and inspection instruments for the workshop, the quality lab and the production line.",
      ar: "أجهزة قياس وفحص لخدمة الورش ومختبرات الجودة وخطوط الإنتاج.",
    },
  },
  {
    slug: "fluid-transmission",
    code: "FT",
    icon: "droplets",
    name: { en: "Fluid Transmission", ar: "نقل الموائع" },
    short: {
      en: "Fittings, tubing and conditioning for air and fluid lines.",
      ar: "وصلات وأنابيب ومعالجة لخطوط الهواء والموائع.",
    },
    description: {
      en: "Components that carry, connect and condition compressed air and other fluids in industrial systems.",
      ar: "مكوّنات لنقل الهواء المضغوط والموائع الأخرى وتوصيلها ومعالجتها في المنظومات الصناعية.",
    },
  },
  {
    slug: "automation-electrical",
    code: "AE",
    icon: "zap",
    name: { en: "Automation & Electrical", ar: "الأتمتة والكهرباء" },
    short: {
      en: "Actuators, valves, sensors and switching components.",
      ar: "مشغّلات وصمامات ومستشعرات ومكوّنات تحكم.",
    },
    description: {
      en: "Automation components for machines and plants: actuation, control and sensing.",
      ar: "مكوّنات أتمتة للآلات والمصانع: تشغيل وتحكم واستشعار.",
    },
  },
  {
    slug: "safety-ppe",
    code: "SP",
    icon: "shield",
    name: { en: "Safety & PPE", ar: "السلامة ومعدات الوقاية" },
    short: {
      en: "Personal protective equipment for people on site.",
      ar: "معدات الوقاية الشخصية للعاملين في المواقع.",
    },
    description: {
      en: "Personal protective equipment for workshops, plants and sites.",
      ar: "معدات الوقاية الشخصية للورش والمصانع والمواقع.",
    },
  },
  {
    slug: "maintenance-production",
    code: "MP",
    icon: "cog",
    name: { en: "Maintenance & Production", ar: "الصيانة والإنتاج" },
    short: {
      en: "Consumables and tools for keeping production running.",
      ar: "مستلزمات وأدوات لاستمرار الإنتاج والصيانة.",
    },
    description: {
      en: "Maintenance materials and tools used to assemble, secure, repair and keep equipment in service.",
      ar: "مواد وأدوات صيانة تُستخدم في التركيب والتثبيت والإصلاح وإبقاء المعدات في الخدمة.",
    },
  },
  {
    slug: "logistics-workshop",
    code: "LW",
    icon: "box",
    name: { en: "Logistics & Workshop", ar: "اللوجستيات والورش" },
    short: {
      en: "Workshop organisation, storage and transport equipment.",
      ar: "تجهيزات تنظيم الورش والتخزين والنقل.",
    },
    description: {
      en: "Equipment that organises, stores and moves tools and materials around the workshop.",
      ar: "تجهيزات لتنظيم الأدوات والمواد وتخزينها ونقلها داخل الورشة.",
    },
  },
  {
    slug: "industrial-performance",
    code: "IP",
    icon: "gauge",
    name: { en: "Industrial Performance", ar: "الأداء الصناعي" },
    short: {
      en: "Products that protect and improve equipment performance.",
      ar: "منتجات تحمي أداء المعدات وتحسّنه.",
    },
    description: {
      en: "Products that bond, protect and improve the performance and service life of industrial equipment.",
      ar: "منتجات للّصق والحماية وتحسين أداء المعدات الصناعية وإطالة عمرها التشغيلي.",
    },
  },
  {
    slug: "tools",
    code: "TL",
    icon: "wrench",
    name: { en: "Tools", ar: "العدد والأدوات" },
    short: {
      en: "Hand tools for professional use.",
      ar: "عدد يدوية للاستخدام المهني.",
    },
    description: {
      en: "Professional hand tools for assembly, maintenance and repair.",
      ar: "عدد يدوية مهنية للتركيب والصيانة والإصلاح.",
    },
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

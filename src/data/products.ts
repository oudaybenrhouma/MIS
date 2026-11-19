import type { Product } from "./types";

/**
 * PLACEHOLDER CATALOGUE
 * ---------------------
 * Every row below is generated, clearly labelled placeholder content:
 * no real part numbers, specifications, prices or availability.
 *
 * To connect the real catalogue, replace `products` with data from your API/CMS
 * (same `Product` shape) — see src/services/catalog.ts, the only consumer.
 */

type Seed = {
  brand: string;
  prefix: string;
  category: string;
  types: [string, string][]; // [English family, Arabic family]
};

const seeds: Seed[] = [
  {
    brand: "mitutoyo",
    prefix: "MIT",
    category: "measurement-control",
    types: [
      ["Calipers", "أجهزة القدمة"],
      ["Micrometers", "الميكرومترات"],
      ["Dial indicators", "مؤشرات الساعة"],
      ["Height gauges", "مقاييس الارتفاع"],
    ],
  },
  {
    brand: "wera",
    prefix: "WER",
    category: "tools",
    types: [
      ["Screwdrivers", "المفكات"],
      ["Bit sets", "أطقم الرؤوس"],
      ["Ratchets & sockets", "المقابض والسوكتات"],
    ],
  },
  {
    brand: "wera",
    prefix: "WER",
    category: "maintenance-production",
    types: [["Torque screwdrivers", "مفكات العزم"]],
  },
  {
    brand: "hazet",
    prefix: "HAZ",
    category: "tools",
    types: [
      ["Socket sets", "أطقم السوكت"],
      ["Torque wrenches", "مفاتيح العزم"],
      ["Spanners", "المفاتيح الرنج والبوكس"],
    ],
  },
  {
    brand: "hazet",
    prefix: "HAZ",
    category: "logistics-workshop",
    types: [
      ["Workshop trolleys", "عربات الورش"],
      ["Tool cases", "حقائب العدد"],
      ["Storage systems", "أنظمة التخزين"],
    ],
  },
  {
    brand: "knipex",
    prefix: "KNI",
    category: "tools",
    types: [
      ["Pliers", "الكمّاشات"],
      ["Cable cutters", "قصّاصات الكابلات"],
      ["Pipe wrenches", "مفاتيح الأنابيب"],
    ],
  },
  {
    brand: "knipex",
    prefix: "KNI",
    category: "maintenance-production",
    types: [["Cable & wire tools", "أدوات الكابلات والأسلاك"]],
  },
  {
    brand: "loctite",
    prefix: "LOC",
    category: "maintenance-production",
    types: [
      ["Threadlockers", "مثبّتات اللولبة"],
      ["Retaining compounds", "مركبات التثبيت"],
      ["Sealants", "مواد الإحكام"],
    ],
  },
  {
    brand: "loctite",
    prefix: "LOC",
    category: "industrial-performance",
    types: [
      ["Instant adhesives", "اللواصق الفورية"],
      ["Epoxy adhesives", "لواصق الإيبوكسي"],
    ],
  },
  {
    brand: "showa",
    prefix: "SHO",
    category: "safety-ppe",
    types: [
      ["Protective gloves", "قفازات الحماية"],
      ["Coated gloves", "القفازات المغلّفة"],
      ["Disposable gloves", "القفازات أحادية الاستخدام"],
    ],
  },
  {
    brand: "smc",
    prefix: "SMC",
    category: "fluid-transmission",
    types: [
      ["Pneumatic fittings", "وصلات الهواء المضغوط"],
      ["Tubing", "الأنابيب"],
      ["Filters & regulators", "الفلاتر والمنظّمات"],
    ],
  },
  {
    brand: "smc",
    prefix: "SMC",
    category: "automation-electrical",
    types: [
      ["Pneumatic cylinders", "الأسطوانات الهوائية"],
      ["Valves", "الصمامات"],
      ["Sensors & switches", "المستشعرات والمفاتيح"],
    ],
  },
];

const SAMPLES_PER_TYPE = 2;

const generate = (): Product[] => {
  const out: Product[] = [];
  const counters: Record<string, number> = {};

  for (const seed of seeds) {
    for (const [en, ar] of seed.types) {
      for (let s = 1; s <= SAMPLES_PER_TYPE; s++) {
        counters[seed.prefix] = (counters[seed.prefix] ?? 0) + 1;
        const n = String(counters[seed.prefix]).padStart(3, "0");
        const sample = String(s).padStart(2, "0");
        const ref = `MIS-${seed.prefix}-${n}`;
        out.push({
          id: ref.toLowerCase(),
          ref,
          brand: seed.brand,
          category: seed.category,
          name: {
            en: `${en} — Placeholder ${sample}`,
            ar: `${ar} — عنصر تجريبي ${sample}`,
          },
          description: {
            en: "Placeholder description. Official product details will be supplied from the MIS catalogue.",
            ar: "وصف تجريبي. ستُزوَّد تفاصيل المنتج الرسمية من كتالوج MIS.",
          },
          image: null,
          specs: [],
          placeholder: true,
        });
      }
    }
  }
  return out;
};

export const products: Product[] = generate();

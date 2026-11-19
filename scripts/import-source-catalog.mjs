import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.resolve(process.argv[2] ?? "C:/Users/ouday/Downloads/IDS database/IDS database");
const rennsteigFile = path.join(project, ".catalog-import", "rennsteig.json");
const outputFile = path.join(project, "src/data/source-products.json");
const imageDir = path.join(project, "public/catalog");
const imageLimitPerBrand = 18;

function csvRows(relativePath) {
  const buffer = fs.readFileSync(path.join(sourceRoot, relativePath));
  const hasUtf8Bom = buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  const text = new TextDecoder(hasUtf8Bom ? "utf-8" : "windows-1252").decode(buffer).replace(/^\uFEFF/, "");
  const delimiter = text.slice(0, text.indexOf("\n")).includes(";") ? ";" : ",";
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (c === '"') quoted = false;
      else value += c;
    } else if (c === '"') quoted = true;
    else if (c === delimiter) { row.push(value); value = ""; }
    else if (c === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += c;
  }
  if (row.length || value) { row.push(value); rows.push(row); }
  const headers = rows.shift().map((header) => header.trim().toLocaleLowerCase());
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? "").trim()])));
}

const value = (row, ...keys) => {
  for (const key of keys) {
    const found = row[key.toLocaleLowerCase()];
    if (found?.trim()) return found.trim();
  }
  return "";
};
const slug = (input) => input.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const localized = (text) => ({ en: text, ar: text });
const label = (en, ar) => ({ en, ar });
const productSpecs = (pairs) => pairs.filter(([, v]) => v).map(([en, ar, v]) => ({ label: label(en, ar), value: localized(v) }));

function product({ brand, ref, category, name, description = "", specs = [], imageSource = "", sourceImages = [] }) {
  const id = `${brand}-${slug(ref)}`;
  return { id, ref, brand, category, name: localized(name), description: localized(description), image: null, specs, placeholder: false, _imageSource: imageSource, _sourceImages: sourceImages };
}

function mapRows(brand, category, rows, build, imageLimit = imageLimitPerBrand) {
  const products = rows.map((row) => build(row)).filter(Boolean);
  const seen = new Set();
  const unique = products.filter((p) => {
    if (!p.ref || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  const eligible = unique.map((p, i) => p._imageSource && fs.existsSync(p._imageSource) && fs.statSync(p._imageSource).isFile() ? i : -1).filter((i) => i >= 0);
  const selected = new Set();
  if (eligible.length) {
    const count = Math.min(imageLimit, eligible.length);
    for (let n = 0; n < count; n++) selected.add(eligible[Math.floor(n * eligible.length / count)]);
  }
  unique.forEach((p, i) => {
    if (selected.has(i)) {
      const ext = path.extname(p._imageSource).toLocaleLowerCase();
      const filename = `${brand}-${slug(p.id)}${ext}`;
      fs.copyFileSync(p._imageSource, path.join(imageDir, filename));
      p.image = `/catalog/${filename}`;
    }
    delete p._imageSource;
    delete p._sourceImages;
  });
  console.log(`${brand}: ${unique.length} products, ${selected.size} product photos`);
  return unique;
}

fs.mkdirSync(imageDir, { recursive: true });
const imported = [];

const hazetRows = csvRows("Hazet/Hazet.csv");
imported.push(...mapRows("hazet", "tools", hazetRows, (r) => {
  const ref = value(r, "numéro d'article");
  const name = value(r, "désignation du groupe de produits");
  if (!ref || !name) return null;
  const image = value(r, "image principale").replace(/^HAZET[\\/]/i, "").replace(/[\\/]/g, path.sep);
  return product({ brand: "hazet", ref, category: "tools", name, imageSource: path.join(sourceRoot, "Hazet", image), description: value(r, "caractéristique technique pour la sous-gamme", "caractéristique de l'article (contenu du tableau)"), specs: productSpecs([["Product group", "فئة المنتج", name], ["EAN / GTIN", "الرقم العالمي", value(r, "ean/gtin code")], ["Weight", "الوزن", value(r, "poids export gramme")]]) });
}));

const vigorRows = csvRows("Vigor/Vigor.csv");
imported.push(...mapRows("vigor", "tools", vigorRows, (r) => {
  const ref = value(r, "ean/gtin code");
  const rawImage = value(r, "image principale").replace(/^VIGOR[\\/]/i, "").replace(/[\\/]/g, path.sep);
  const details = value(r, "caractéristique technique");
  if (!ref) return null;
  const model = path.basename(rawImage, path.extname(rawImage)).replace(/[-_]/g, " ");
  return product({ brand: "vigor", ref, category: "tools", name: details || `VIGOR ${model}`, description: "", imageSource: path.join(sourceRoot, "Vigor", rawImage), specs: productSpecs([["Catalogue category", "فئة الكتالوج", value(r, "main category")], ["EAN / GTIN", "الرقم العالمي", ref], ["Technical details", "تفاصيل فنية", details]]) });
}));

const weraRows = csvRows("Wera/Wera_tournevis/Wera_tournevis.csv");
imported.push(...mapRows("wera", "tools", weraRows, (r) => {
  const ref = value(r, "primary reference");
  const name = value(r, "product name (fr)");
  if (!ref || !name) return null;
  const imageName = value(r, "image filename");
  const imageSource = path.join(sourceRoot, "Wera/Wera_tournevis/images", imageName);
  return product({ brand: "wera", ref, category: "tools", name, imageSource, specs: productSpecs([["Product references", "مراجع المنتج", value(r, "all references")]]) });
}));

const wspRows = csvRows("WSP database/WSP_Product.csv");
imported.push(...mapRows("wsp", "safety-ppe", wspRows, (r) => {
  const ref = value(r, "produit");
  if (!ref) return null;
  const image = value(r, "image 1");
  const candidates = [image, `${ref}.webp`, `${ref}_1.webp`, `${ref.toLowerCase()}.webp`].filter(Boolean);
  const imageSource = candidates.map((file) => path.join(sourceRoot, "WSP database", file)).find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? "";
  return product({ brand: "wsp", ref, category: "safety-ppe", name: ref, description: "Product listed in the supplied WSP catalogue.", imageSource, specs: productSpecs([["Catalogue category", "فئة الكتالوج", value(r, "categorie")]]) });
}));

const ecsRows = csvRows("ECS database/ECS_Product.csv");
imported.push(...mapRows("ecs", "maintenance-production", ecsRows, (r) => {
  const ref = value(r, "article no.");
  const name = value(r, "product");
  if (!ref || !name) return null;
  const image = value(r, "image");
  return product({ brand: "ecs", ref, category: "maintenance-production", name, description: value(r, "description"), imageSource: image ? path.join(sourceRoot, "ECS database/Image", image) : "", specs: productSpecs([["Contents", "السعة", value(r, "content can")], ["Cans per carton", "العبوات في الكرتون", value(r, "cans per carton")]]) });
}));

const rennsteigRows = JSON.parse(fs.readFileSync(rennsteigFile, "utf8").replace(/^\uFEFF/, "")).map((row) => Object.fromEntries(Object.entries(row).map(([key, v]) => [key.toLocaleLowerCase(), v])));
imported.push(...mapRows("rennsteig", "tools", rennsteigRows, (r) => {
  const ref = value(r, "article number");
  const name = value(r, "article designation");
  if (!ref || !name) return null;
  const imageName = value(r, "main image");
  const cleanImage = imageName.replace(/[\\/]/g, path.sep);
  const imageSource = path.join(sourceRoot, "RENNSTEIG/RENNSTEIG", path.basename(cleanImage));
  const sourceCategory = value(r, "category");
  const categoryName = sourceCategory.toLocaleLowerCase();
  const category = /safety|protection|ppe|glove/.test(categoryName) ? "safety-ppe" : /storage|workshop|transport/.test(categoryName) ? "logistics-workshop" : /electri|electronic|automation/.test(categoryName) ? "automation-electrical" : /measure|test|gauge/.test(categoryName) ? "measurement-control" : /fluid|hydraulic|pneumatic/.test(categoryName) ? "fluid-transmission" : /maintenance|clean|chemical/.test(categoryName) ? "maintenance-production" : "tools";
  return product({ brand: "rennsteig", ref, category, name, description: value(r, "short description", "long description"), imageSource, specs: productSpecs([["EAN", "الرقم العالمي", value(r, "ean")], ["Category", "الفئة", sourceCategory], ["Finish", "التشطيب", value(r, "finish")], ["Length", "الطول", value(r, "article length")], ["Width", "العرض", value(r, "article width")], ["Height", "الارتفاع", value(r, "article height")], ["Weight", "الوزن", value(r, "article weight")]]) });
}));

fs.writeFileSync(outputFile, `${JSON.stringify(imported)}\n`, "utf8");
console.log(`Wrote ${imported.length} real catalogue entries to ${path.relative(project, outputFile)}`);

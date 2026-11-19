import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const products = JSON.parse(await readFile(path.join(root, "src/data/source-products.json"), "utf8"));
const imageFiles = new Set(await readdir(path.join(root, "public/catalog")));
const ids = new Set();
const refs = new Set();
const brands = new Map();
const problems = { duplicateId: [], duplicateReference: [], missingImage: [], imageFileMissing: [], missingEnglishName: [], missingEnglishDescription: [], untranslatedName: [] };

for (const product of products) {
  const brand = brands.get(product.brand) ?? { products: 0, withImage: 0, withoutDescription: 0 };
  brand.products++;
  if (product.image) {
    if (imageFiles.has(path.basename(product.image))) brand.withImage++;
    else problems.imageFileMissing.push(product);
  } else problems.missingImage.push(product);
  if (!product.description?.en?.trim()) {
    problems.missingEnglishDescription.push(product);
    brand.withoutDescription++;
  }
  if (!product.name?.en?.trim()) problems.missingEnglishName.push(product);
  if (product.name?.en?.trim() && product.name?.ar?.trim() === product.name.en.trim()) problems.untranslatedName.push(product);
  if (ids.has(product.id)) problems.duplicateId.push(product);
  if (refs.has(product.ref)) problems.duplicateReference.push(product);
  ids.add(product.id); refs.add(product.ref); brands.set(product.brand, brand);
}

console.log(`Catalogue: ${products.length.toLocaleString()} products · ${imageFiles.size.toLocaleString()} image files`);
for (const [key, rows] of Object.entries(problems)) console.log(`${key}: ${rows.length.toLocaleString()}`);
console.log("\nBrands (products / products with image / missing English description):");
for (const [name, stats] of [...brands].sort((a, b) => b[1].products - a[1].products)) {
  console.log(`${name}: ${stats.products} / ${stats.withImage} / ${stats.withoutDescription}`);
}

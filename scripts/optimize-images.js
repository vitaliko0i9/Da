// Скрипт оптимізації зображень: конвертує PNG -> WebP + стиснутий JPEG
// Запуск: node scripts/optimize-images.js

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = path.join(__dirname, "../public/images");
const OUTPUT_DIR = path.join(__dirname, "../public/images");

const files = fs.readdirSync(INPUT_DIR).filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

async function optimizeImage(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const name = path.basename(file, path.extname(file));
  
  const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);
  const jpegPath = path.join(OUTPUT_DIR, `${name}-opt.jpg`);

  const originalSize = fs.statSync(inputPath).size;

  // Конвертуємо в WebP (найкраще для веб)
  await sharp(inputPath)
    .resize({ width: 1280, withoutEnlargement: true }) // максимум 1280px по ширині
    .webp({ quality: 80 })
    .toFile(webpPath);

  const webpSize = fs.statSync(webpPath).size;
  const savings = (((originalSize - webpSize) / originalSize) * 100).toFixed(1);
  
  console.log(
    `✅ ${file} → ${name}.webp  |  ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(webpSize / 1024).toFixed(0)} KB  (-${savings}%)`
  );
}

(async () => {
  console.log(`\n🖼️  Оптимізація ${files.length} зображень...\n`);
  for (const file of files) {
    // Пропускаємо вже конвертовані WebP
    if (file.endsWith(".webp")) continue;
    await optimizeImage(file);
  }
  console.log("\n✨ Готово! Всі зображення оптимізовано.\n");
})();

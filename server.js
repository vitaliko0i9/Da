require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const ejs = require("ejs");

const connectDB = require("./db/connect");
const seedData = require("./db/seed");

const Habitat = require("./db/models/Habitat");
const Fish = require("./db/models/Fish");
const Gallery = require("./db/models/Gallery");
const Message = require("./db/models/Message");
const User = require("./db/models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

// View engine
app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

// Logging
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Database connection middleware for Serverless
app.use(async (req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    next(err);
  }
});

const NAV = [
  { href: "/", label: "Головна" },
  { href: "/species", label: "Види риб" },
  { href: "/habitats", label: "Середовища" },
  { href: "/aquarium", label: "Догляд" },
  { href: "/gallery", label: "Галерея" },
  { href: "/contact", label: "Вхід / Реєстрація" },
];

function getMeta(options = {}) {
  const siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;
  return {
    siteName: "AquaFauna",
    siteUrl,
    ogImage: options.ogImage || "/images/hero-ocean.png",
    title: options.title || "AquaFauna — Енциклопедія світу риб | Біотопи, види та догляд",
    description:
      options.description ||
      "Повна енциклопедія світу риб українською: каталог акваріумних та морських видів, параметри води, біотопи, наукова класифікація та практичний гід з догляду.",
    keywords:
      options.keywords ||
      "енциклопедія риб, акваріумні рибки, види риб, морські риби, прісноводні риби, біотопи, догляд за акваріумом, параметри води, AquaFauna",
    type: options.type || "website",
    path: options.path || "/",
    nav: NAV,
    year: new Date().getFullYear(),
  };
}

// --- Маршрути сторінок ---

// Головна
app.get("/", async (req, res, next) => {
  try {
    const fishes = await Fish.find().lean();
    res.render("index.html", {
      ...getMeta({
        path: "/",
        title: "AquaFauna — Енциклопедія світу риб | Від рифу до ставка",
        description:
          "Енциклопедія глибин: понад 8 популярних видів риб, 5 біотопів, таблиця параметрів води та науково обґрунтовані поради з догляду.",
        keywords:
          "світ риб, енциклопедія риб, акваріумістика, рифові риби, прісноводні риби, AquaFauna",
      }),
      fishes,
    });
  } catch (err) {
    next(err);
  }
});

// Каталог видів
app.get("/species", async (req, res, next) => {
  try {
    const habitats = await Habitat.find().lean();
    const fishes = await Fish.find().lean();

    const habitatMap = new Map(habitats.map((h) => [h.slug, h.name]));
    const fishesWithHabitat = fishes.map((f) => ({
      ...f,
      habitat_name: habitatMap.get(f.habitat_slug) || f.habitat_slug,
    }));

    res.render("species.html", {
      ...getMeta({
        path: "/species",
        title: "Каталог видів риб — Фото, опис та параметри води | AquaFauna",
        description:
          "Повний каталог риб: морські, прісноводні, ставкові види. Фільтрація за середовищем існування, параметри води (pH, температура), складність утримання.",
        keywords:
          "каталог риб, види акваріумних рибок, прісноводні риби, морські риби, рифові риби, риби для ставка, опис риб, параметри води",
      }),
      habitats,
      fishes: fishesWithHabitat,
    });
  } catch (err) {
    next(err);
  }
});

// Сторінка окремої риби
app.get("/fish/:slug", async (req, res, next) => {
  try {
    const fishDoc = await Fish.findOne({ slug: req.params.slug }).lean();
    if (!fishDoc) {
      return res.status(404).render(
        "404.html",
        getMeta({ path: req.path, title: "Рибу не знайдено (404) — AquaFauna" })
      );
    }

    const habitat = await Habitat.findOne({ slug: fishDoc.habitat_slug }).lean();
    const fish = {
      ...fishDoc,
      habitat_name: habitat ? habitat.name : fishDoc.habitat_slug,
    };

    const related = await Fish.find({
      habitat_slug: fish.habitat_slug,
      slug: { $ne: fish.slug },
    })
      .limit(3)
      .lean();

    res.render("fish.html", {
      ...getMeta({
        path: `/fish/${fish.slug}`,
        title: `${fish.name_uk} (${fish.name_lat}) — Догляд, параметри води, опис | AquaFauna`,
        description: `${fish.name_uk} (${fish.name_lat}): родина ${fish.family}, середовище ${fish.habitat_name}. Розмір ${fish.size_cm} см, температура ${fish.temperature}, pH ${fish.ph}. ${fish.summary}`,
        keywords: `${fish.name_uk}, ${fish.name_lat}, ${fish.family}, риба ${fish.name_uk} догляд, акваріум ${fish.name_uk}, параметри води ${fish.name_uk}, ${fish.habitat_slug}`,
        ogImage: fish.image,
        type: "article",
      }),
      fish,
      related,
    });
  } catch (err) {
    next(err);
  }
});

// Середовища існування
app.get("/habitats", async (req, res, next) => {
  try {
    const habitats = await Habitat.find().lean();
    const allFishes = await Fish.find().lean();

    const habitatsWithFishes = habitats.map((h) => ({
      ...h,
      fishes: allFishes.filter((f) => f.habitat_slug === h.slug),
    }));

    res.render("habitats.html", {
      ...getMeta({
        path: "/habitats",
        title: "Середовища існування та природні біотопи риб | AquaFauna",
        description:
          "Огляд природних біотопів: коралові рифи, чорні води Амазонки, тропічні мілководдя Азії, ставки та відкритий океан. Параметри солоності, світла та температури.",
        keywords:
          "біотопи риб, коралові рифи, амазонка біотоп, чорна вода, ставки для риб, тропічні водойми, відкритий океан, середовища існування",
      }),
      habitats: habitatsWithFishes,
    });
  } catch (err) {
    next(err);
  }
});

// Догляд за акваріумом
app.get("/aquarium", (req, res) => {
  res.render(
    "aquarium.html",
    getMeta({
      path: "/aquarium",
      title: "Догляд за акваріумом — Азотний цикл, запуск та годування | AquaFauna",
      description:
        "Практичний гід з акваріумістики: біологічний азотний цикл (аміак, нітрити, нітрати), правила запуску акваріума, вибір об'єму, годування та освітлення.",
      keywords:
        "догляд за акваріумом, азотний цикл, запуск акваріума, аміак в акваріумі, нітрити, нітрати, підміна води, годування риб, акваскейпінг",
    })
  );
});

// Галерея
app.get("/gallery", async (req, res, next) => {
  try {
    const items = await Gallery.find().lean();
    res.render("gallery.html", {
      ...getMeta({
        path: "/gallery",
        title: "Галерея підводного світу — Фото риб та біотопів | AquaFauna",
        description:
          "Фотогалерея підводного світу високої роздільної здатності: рифові риби, прісноводні види, ставкові коі та акваскейпи. Можливість перегляду на весь екран.",
        keywords:
          "галерея риб, фото акваріумних рибок, фото коралового рифу, акваскейп фото, підводний світ, фотографії риб",
      }),
      items,
    });
  } catch (err) {
    next(err);
  }
});

// Контакти / Авторизація
app.get("/contact", (req, res) => {
  res.render(
    "contact.html",
    getMeta({
      path: "/contact",
      title: "Вхід та Реєстрація — Особистий кабінет | AquaFauna",
      description:
        "Авторизація та реєстрація в енциклопедії AquaFauna. Зберігайте улюблені види риб та отримуйте персональні рекомендації з догляду.",
      keywords: "вхід, реєстрація, авторизація, акаунт aquafauna, особистий профіль",
    })
  );
});

// Карта сайту (HTML)
app.get("/sitemap", async (req, res, next) => {
  try {
    const fishes = await Fish.find().lean();
    const habitats = await Habitat.find().lean();

    res.render("sitemap.html", {
      ...getMeta({
        path: "/sitemap",
        title: "Карта сайту — Структура та сторінки | AquaFauna",
        description: "Повна карта сторінок енциклопедії AquaFauna: каталог видів, біотопи, гід з догляду та фотогалерея.",
        keywords: "карта сайту, sitemap, структура сайту aquafauna",
      }),
      fishes,
      habitats,
    });
  } catch (err) {
    next(err);
  }
});

// SEO: Robots
app.get("/robots.txt", (req, res) => {
  const siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;
  res.type("text/plain").send(
`# robots.txt для енциклопедії AquaFauna
User-agent: *
Allow: /
Allow: /images/
Allow: /css/
Allow: /js/

# Заборона індексації технічних API-ендпоінтів
Disallow: /api/

# Карта сайту
Sitemap: ${siteUrl}/sitemap.xml
`
  );
});

// SEO: Sitemap (XML)
app.get("/sitemap.xml", async (req, res, next) => {
  try {
    const siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;
    const fishes = await Fish.find({}, "slug").lean();
    const urls = [
      "",
      "/species",
      "/habitats",
      "/aquarium",
      "/gallery",
      "/contact",
      "/sitemap",
      ...fishes.map((f) => `/fish/${f.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u === "" ? "1.0" : u.startsWith("/fish/") ? "0.8" : "0.7"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(xml);
  } catch (err) {
    next(err);
  }
});

// --- API Маршрути ---

// Реєстрація
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Всі поля обов'язкові для заповнення" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Користувач з таким email вже існує" });
    }

    const newUser = new User({
      username,
      email,
      password,
      createdAt: new Date(),
    });

    const result = await newUser.save();
    res.status(200).json({ message: "Success", id: result._id, username: result.username });
  } catch (e) {
    console.error("Помилка реєстрації:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Авторизація (Вхід)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Будь ласка, введіть email та пароль" });
    }

    const user = await User.findOne({ email, password });

    if (user) {
      res.status(200).json({
        message: "Успішний вхід!",
        username: user.username,
      });
    } else {
      res.status(401).json({ message: "Невірний email або пароль" });
    }
  } catch (e) {
    console.error("Помилка логіну:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Повідомлення контактної форми
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, topic, body } = req.body;
    if (!name || !email || !body) {
      return res.status(400).json({ error: "Заповніть обов'язкові поля" });
    }
    const message = new Message({ name, email, topic: topic || "Загальне", body });
    await message.save();
    res.status(200).json({ message: "Повідомлення надіслано успішно!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render(
    "404.html",
    getMeta({ path: req.path, title: "Сторінку не знайдено (404) — AquaFauna" })
  );
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Помилка сервера:", err);
  res.status(500).send("Внутрішня помилка сервера");
});

// Export app for Vercel Serverless Functions
module.exports = app;

// Local Development Server (only when not running on Vercel)
if (!process.env.VERCEL) {
  async function startServer() {
    try {
      await connectDB();
      await seedData();
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("Не вдалося запустити локальний сервер:", err);
    }
  }
  startServer();
}
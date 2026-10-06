/**
 * formulaPages.ts
 * "Formula" temasının 12 sayfalık iskeletini (`multiPageScaffold.ts`'in
 * `ThemePageSpec[]` girdisi) derler. Ana Sayfa Formula'ya özgü section'ları
 * kullanır (`formulaTheme.ts`); cart/checkout/ürün/koleksiyon/arama/marka/
 * giriş/kayıt/içerik sayfaları TÜM temalarda ortak olan, tema-bağımsız
 * `universalPages.ts` section'larını kullanır (bkz. o dosyanın başlığı).
 */
import type { EipgBlock } from "@eidea/ei-engine/browser";
import { resolveSectionInstanceRole } from "@eidea/ei-engine/browser";
import type { EiPage, EiSection } from "@eidea/studio-core";
import type { ThemePageSpec, ThemeSectionInstance } from "./multiPageScaffold.js";
import { sectionSlot } from "./sectionSlot.js";
import { getSectionDesigns } from "./sectionDesigns.js";
import { buildThemeBlogPages, themeBlogSectionFiles } from "./themeBlogSections.js";
import {
  FORMULA_NAV_HEADER,
  FORMULA_HERO,
  FORMULA_QUIZ_BANNER,
  FORMULA_BESTSELLERS,
  FORMULA_CONCERNS,
  FORMULA_PHILOSOPHY,
  FORMULA_FOOTER_MENU,
  FORMULA_404,
  FORMULA_CHECKOUT_SUCCESS,
  FORMULA_THEME_CSS,
  FORMULA_LIBRARY_SECTIONS,
} from "./formulaTheme.js";
import {
  MAIN_PRODUCT_CONTENT,
  MAIN_COLLECTION_CONTENT,
  MAIN_BRAND_CONTENT,
  MAIN_CART_CONTENT,
  MAIN_CHECKOUT_CONTENT,
  MAIN_SEARCH_CONTENT,
  CONTENT_PAGE_CONTENT,
  AUTH_LOGIN_CONTENT,
  AUTH_REGISTER_CONTENT,
  ACCOUNT_DASHBOARD_CONTENT,
  ACCOUNT_ORDERS_CONTENT,
} from "./universalPages.js";

function block(id: string, type: string, name: string, settings: Record<string, unknown>, blocks: EipgBlock[] = []): EipgBlock {
  return { id, type, name, settings, blocks };
}

function navHeader(): ThemeSectionInstance {
  return {
    id: "nav-header",
    type: "nav-header",
    name: "Navigasyon",
    src: "sections/nav-header.ei",
    settings: {},
    blocks: [
      block("nav-1", "menu_item", "Menü Öğesi", { label: "Yüz Bakımı", url: "/collection" }),
      block("nav-2", "menu_item", "Menü Öğesi", { label: "Vücut & Saç", url: "/collection" }),
      block("nav-3", "menu_item", "Menü Öğesi", { label: "Kaygıya Göre", url: "/collection" }),
      block("nav-4", "menu_item", "Menü Öğesi", { label: "Tüm Ürünler", url: "/products" }),
    ],
  };
}

function footerMenu(): ThemeSectionInstance {
  return {
    id: "footer-menu",
    type: "footer-menu",
    name: "Footer",
    src: "sections/footer-menu.ei",
    settings: {},
    blocks: [
      block("footer-1", "menu_item", "Menü Öğesi", { label: "Tüm Ürünler", url: "/products" }),
      block("footer-2", "menu_item", "Menü Öğesi", { label: "Kategoriler", url: "/collection" }),
      block("footer-3", "menu_item", "Menü Öğesi", { label: "Hesabım", url: "/account" }),
      block("footer-4", "menu_item", "Menü Öğesi", { label: "Siparişlerim", url: "/account/orders" }),
    ],
  };
}

function utilityPage(
  slug: string,
  title: string,
  route: string,
  template: ThemePageSpec["template"],
  mainSection: ThemeSectionInstance,
): ThemePageSpec {
  return {
    slug,
    title,
    route,
    template,
    sections: [navHeader(), mainSection, footerMenu()],
  };
}

export function buildFormulaPages(): ThemePageSpec[] {
  const homePage: ThemePageSpec = {
    slug: "home",
    title: "Ana Sayfa",
    route: "/",
    template: "page",
    sections: [
      navHeader(),
      { id: "hero", type: "hero", name: "Hero", src: "sections/hero.ei", settings: {} },
      { id: "quiz-banner", type: "quiz-banner", name: "Analiz Bandı", src: "sections/quiz-banner.ei", settings: {} },
      {
        id: "bestsellers",
        type: "bestsellers-grid",
        name: "Çok Satanlar",
        src: "sections/bestsellers-grid.ei",
        settings: {},
        blocks: [
          // GERÇEK KULLANICI RAPORU (2026-10-06): bu demo blokların `url`'i
          // GERÇEK bir ürüne değil, VAR OLMAYAN bir slug'a (404) gidiyordu —
          // panelde bu isimde ürün yoksa canlı mağazada gerçek bir ziyaretçi
          // bu karta tıklayıp kırık sayfaya düşebiliyordu. Merchant kendi
          // ürünlerini ekleyip bu blokları GERÇEK ürünle değiştirene kadar
          // link en azından var olan /products sayfasına gider (404 yok).
          block("best-1", "product", "Ürün", { name: "Niasinamid Serum", active: "%10 Niasinamid", price: "₺349", badge: "Çok Satan", url: "/products" }),
          block("best-2", "product", "Ürün", { name: "Hyalüronik Asit Serum", active: "%2 Hyalüronik Asit", price: "₺389", badge: "", url: "/products" }),
          block("best-3", "product", "Ürün", { name: "Nazik Temizleyici Jel", active: "pH 5.5", price: "₺249", badge: "Yeni", url: "/products" }),
          block("best-4", "product", "Ürün", { name: "SPF 50 Güneş Bakımı", active: "Geniş Spektrum", price: "₺299", badge: "", url: "/products" }),
        ],
      },
      {
        id: "concerns",
        type: "shop-by-concern",
        name: "Kaygıya Göre",
        src: "sections/shop-by-concern.ei",
        settings: {},
        blocks: [
          block("concern-1", "concern", "Kaygı", { label: "Kuruluk", icon: "◆", url: "/collection" }),
          block("concern-2", "concern", "Kaygı", { label: "Kızarıklık", icon: "●", url: "/collection" }),
          block("concern-3", "concern", "Kaygı", { label: "Yaşlanma Belirtileri", icon: "▲", url: "/collection" }),
          block("concern-4", "concern", "Kaygı", { label: "Lekeler", icon: "◇", url: "/collection" }),
          block("concern-5", "concern", "Kaygı", { label: "Gözenekler", icon: "○", url: "/collection" }),
          block("concern-6", "concern", "Kaygı", { label: "Donuk Görünüm", icon: "△", url: "/collection" }),
        ],
      },
      {
        id: "philosophy",
        type: "philosophy-band",
        name: "Felsefe",
        src: "sections/philosophy-band.ei",
        settings: {},
        blocks: [
          block("value-1", "value", "Değer", { icon: "✓", title: "Vegan", text: "Hiçbir üründe hayvansal içerik yok." }),
          block("value-2", "value", "Değer", { icon: "◆", title: "Dermatolojik Test", text: "Tüm formüller bağımsız laboratuvarda test edilir." }),
          block("value-3", "value", "Değer", { icon: "○", title: "Şeffaf Etiket", text: "Her aktifin oranını ambalajda görürsün." }),
        ],
      },
      footerMenu(),
    ],
  };

  const productBlocks: EipgBlock[] = [
    block("product-root", "product", "Product", { source: "page" }, [
      block("product-media", "product-media", "Ürün Görselleri", {}),
      block("product-title", "product-title", "Ürün Başlığı", {}),
      block("product-price", "product-price", "Fiyat", {}),
      block("product-variant", "variant-picker", "Varyant Seçici", {}),
      block("product-qty", "quantity-selector", "Miktar", {}),
      block("product-add", "add-to-cart", "Sepete Ekle", { label: "Sepete Ekle" }),
      block("product-desc", "product-description", "Açıklama", {}),
    ]),
    block("product-trust", "trust_badge", "Güven Rozeti", { icon: "✓", text: "Güvenli alışveriş" }),
  ];

  const collectionBlocks = (eyebrow: string): EipgBlock[] => [
    block("collection-root", "collection", "Koleksiyon", { source: "page" }, [
      block("collection-card-1", "product-card", "Ürün Kartı", { title: eyebrow + " ürünü 1", price: "349", url: "#" }),
      block("collection-card-2", "product-card", "Ürün Kartı", { title: eyebrow + " ürünü 2", price: "389", url: "#" }),
      block("collection-card-3", "product-card", "Ürün Kartı", { title: eyebrow + " ürünü 3", price: "249", url: "#" }),
    ]),
  ];

  const authLoginBlocks: EipgBlock[] = [
    block("login-email", "field", "Form Alanı", { label: "E-posta", name: "email", input_type: "email", placeholder: "ornek@mail.com", autocomplete: "email", required: true }),
    block("login-password", "field", "Form Alanı", { label: "Şifre", name: "password", input_type: "password", placeholder: "••••••••", autocomplete: "current-password", required: true }),
    block("login-forgot", "link", "Yardım Linki", { label: "Şifremi unuttum", url: "/account/recover", align: "end" }),
    block("login-submit", "button", "Buton", { label: "Giriş Yap", button_type: "submit" }),
  ];

  const authRegisterBlocks: EipgBlock[] = [
    block("register-first", "field", "Form Alanı", { label: "Ad", name: "first_name", input_type: "text", placeholder: "Adın", autocomplete: "given-name", required: true }),
    block("register-last", "field", "Form Alanı", { label: "Soyad", name: "last_name", input_type: "text", placeholder: "Soyadın", autocomplete: "family-name", required: false }),
    block("register-email", "field", "Form Alanı", { label: "E-posta", name: "email", input_type: "email", placeholder: "ornek@mail.com", autocomplete: "email", required: true }),
    block("register-password", "field", "Form Alanı", { label: "Şifre", name: "password", input_type: "password", placeholder: "••••••••", autocomplete: "new-password", required: true }),
    block("register-marketing", "checkbox", "Onay Kutusu", { label: "Kampanya ve duyuruları almak istiyorum.", name: "accepts_marketing", required: false }),
    block("register-submit", "button", "Buton", { label: "Kayıt Ol", button_type: "submit" }),
  ];

  const checkoutBlocks: EipgBlock[] = [
    block("checkout-root", "checkout", "Ödeme", { source: "page" }, [
      block("checkout-contact", "checkout-contact", "İletişim", { title: "İletişim" }),
      block("checkout-shipping", "checkout-shipping", "Teslimat", { title: "Teslimat" }),
      block("checkout-payment", "checkout-payment", "Ödeme", { title: "Ödeme", button_label: "Siparişi Tamamla" }),
      block("checkout-summary", "checkout-summary", "Sipariş Özeti", { title: "Sipariş Özeti" }),
    ]),
  ];

  const productsPage = utilityPage("products", "Ürünler", "/products", "collection", {
    id: "main-collection", type: "main-collection", name: "Koleksiyon", src: "sections/main-collection.ei",
    settings: { title: "Tüm Ürünler" }, blocks: collectionBlocks("Tüm"),
  });
  const collectionPage = utilityPage("collection", "Kategori", "/collection", "collection", {
    id: "main-collection", type: "main-collection", name: "Koleksiyon", src: "sections/main-collection.ei",
    settings: { title: "Kategoriler" }, blocks: collectionBlocks("Kategori"),
  });
  const brandsPage = utilityPage("brands", "Markalar", "/brands", "page", {
    id: "main-brand", type: "main-brand", name: "Marka", src: "sections/main-brand.ei", settings: {},
  });
  const searchPage = utilityPage("search", "Arama", "/search", "page", {
    id: "main-search", type: "main-search", name: "Arama", src: "sections/main-search.ei", settings: {},
  });
  const productPage = utilityPage("product", "Ürün Detay", "/products/:handle", "product", {
    id: "main-product", type: "main-product", name: "Ürün Detay", src: "sections/main-product.ei",
    settings: {}, blocks: productBlocks,
  });
  const cartPage = utilityPage("cart", "Sepet", "/cart", "cart", {
    id: "main-cart", type: "main-cart", name: "Sepet", src: "sections/main-cart.ei", settings: {},
  });
  const checkoutPage = utilityPage("checkout", "Ödeme", "/checkout", "checkout", {
    id: "main-checkout", type: "main-checkout", name: "Ödeme", src: "sections/main-checkout.ei",
    settings: {}, blocks: checkoutBlocks,
  });
  const accountDashboardBlocks: EipgBlock[] = [
    block("account-tab-orders", "tab", "Sekme", { key: "orders", label: "Siparişlerim" }),
    block("account-tab-addresses", "tab", "Sekme", { key: "addresses", label: "Adreslerim" }),
    block("account-tab-favorites", "tab", "Sekme", { key: "favorites", label: "Favorilerim" }),
    block("account-tab-loyalty", "tab", "Sekme", { key: "loyalty", label: "Sadakat Puanlarım" }),
    block("account-tab-company", "tab", "Sekme", { key: "company", label: "Firma" }),
  ];

  const accountPage = utilityPage("account", "Hesabım", "/account", "page", {
    id: "account-dashboard", type: "account-dashboard", name: "Hesabım", src: "sections/account-dashboard.ei",
    settings: {}, blocks: accountDashboardBlocks,
  });
  const registerPage = utilityPage("register", "Kayıt Ol", "/register", "page", {
    id: "auth-register", type: "auth-register", name: "Kayıt Ol", src: "sections/auth-register.ei",
    settings: {}, blocks: authRegisterBlocks,
  });
  const loginPage = utilityPage("login", "Giriş Yap", "/login", "page", {
    id: "auth-login", type: "auth-login", name: "Giriş Yap", src: "sections/auth-login.ei",
    settings: {}, blocks: authLoginBlocks,
  });
  const ordersPage = utilityPage("orders", "Siparişlerim", "/account/orders", "page", {
    id: "account-orders", type: "account-orders", name: "Siparişlerim", src: "sections/account-orders.ei",
    settings: {},
  });
  // 2026-08-19 — kullanıcı raporu: "404 sayfası hâlâ yok". `template: "404"`
  // hem doğrudan `/404` ziyaretinde (route eşleşmesiyle) hem de eşleşmeyen
  // HERHANGİ bir route'ta (renderer.ts'in fallback'i, `resolvePublishedPage`
  // BULAMADIĞINDA `template === "404"` sayfasını arıyor) render edilir.
  const notFoundPage = utilityPage("404", "Sayfa Bulunamadı", "/404", "404", {
    id: "main-404", type: "main-404", name: "404", src: "sections/main-404.ei", settings: {},
  });
  // 2026-08-24 — kullanıcı raporu: "siparişiniz alındı sayfası formula
  // temasına özelleştirilmemiş" — `/checkout/success` hiç tema sistemine
  // bağlı değildi (bkz. FORMULA_CHECKOUT_SUCCESS yorumu, formulaTheme.ts).
  // `template: "page"` — EipgTemplate enum'unda "checkout-success" diye bir
  // değer yok, `ecommerceContext.ts` diğer statik sayfalar gibi (brands,
  // search) `page.slug === "checkout-success"` ile dallanıyor.
  const checkoutSuccessPage = utilityPage("checkout-success", "Sipariş Onayı", "/checkout/success", "page", {
    id: "main-checkout-success", type: "main-checkout-success", name: "Sipariş Onayı", src: "sections/main-checkout-success.ei", settings: {},
  });

  return [
    homePage, productsPage, collectionPage, brandsPage, searchPage, productPage,
    cartPage, checkoutPage, accountPage, registerPage, loginPage, ordersPage, notFoundPage,
    checkoutSuccessPage, ...buildThemeBlogPages("formula", utilityPage),
  ];
}

export function formulaSectionFiles(): Record<string, string> {
  return {
    ...themeBlogSectionFiles("formula"),
    "sections/nav-header.ei": FORMULA_NAV_HEADER,
    "sections/hero.ei": FORMULA_HERO,
    "sections/quiz-banner.ei": FORMULA_QUIZ_BANNER,
    "sections/bestsellers-grid.ei": FORMULA_BESTSELLERS,
    "sections/shop-by-concern.ei": FORMULA_CONCERNS,
    "sections/philosophy-band.ei": FORMULA_PHILOSOPHY,
    "sections/footer-menu.ei": FORMULA_FOOTER_MENU,
    "sections/main-product.ei": MAIN_PRODUCT_CONTENT,
    "sections/main-collection.ei": MAIN_COLLECTION_CONTENT,
    "sections/main-brand.ei": MAIN_BRAND_CONTENT,
    "sections/main-cart.ei": MAIN_CART_CONTENT,
    "sections/main-checkout.ei": MAIN_CHECKOUT_CONTENT,
    "sections/main-search.ei": MAIN_SEARCH_CONTENT,
    "sections/content-page.ei": CONTENT_PAGE_CONTENT,
    "sections/auth-login.ei": AUTH_LOGIN_CONTENT,
    "sections/auth-register.ei": AUTH_REGISTER_CONTENT,
    "sections/account-dashboard.ei": ACCOUNT_DASHBOARD_CONTENT,
    "sections/account-orders.ei": ACCOUNT_ORDERS_CONTENT,
    "sections/main-404.ei": FORMULA_404,
    "sections/main-checkout-success.ei": FORMULA_CHECKOUT_SUCCESS,
  };
}

/**
 * 2026-08-19 — kullanıcı raporu: "değişiklik tüm projeleri etkilemeli" (yeni
 * eklenen `reveal_animation` ayarı var olan bir projede hiç görünmüyordu).
 * Kök neden: bir section'ın `.ei` içeriği (template+şema) proje
 * OLUŞTURULDUĞU (ya da o section sayfaya EKLENDİĞİ) anda formulaTheme.ts'teki
 * O ANKİ kaynaktan kopyalanıp dosyaya DONUYOR (`assets/theme.css`'in
 * `patchMissingFormulaLibraryCss`'teki AYNI donma sorunu) — temaya sonradan
 * eklenen bir şema alanı/class var olan projelere hiç yansımıyordu.
 *
 * `formulaSectionFiles()`'in temiz `sections/{type}.ei` yoluna GÜVENEMEYİZ —
 * bu yol SADECE proje oluşturulurken scaffold edilen "çekirdek" section'lar
 * için geçerli. `Ekle` panelinden SONRADAN eklenen bir kütüphane section'ı
 * (`FORMULA_LIBRARY_SECTIONS`, ör. koleksiyon listesi) `StudioShell.tsx`
 * `handleAddSection`'da `sourcePath: null` ile eklenir, kaydedilince
 * `projectFileMap.ts`'in `sectionFilePath()`'i ona RASTGELE bir dosya adı
 * (`sections/{section.id}.ei`) üretir — path'ten type'a asla güvenilir
 * geri dönülemez. Bu yüzden `files` yerine ZATEN PARSE EDİLMİŞ `pages`
 * (`EiPage[]`) üzerinden section.type'a göre eşleştirilip section.sourcePath
 * (gerçek dosya anahtarı, ne olursa olsun) yamanır — `serializeProjectFiles`
 * ile BİREBİR aynı `sectionFilePath` mantığını taklit etmeye gerek kalmaz.
 *
 * Formula'nın canonical section'ları (custom-html'in AKSİNE) Studio'da elle
 * düzenlenebilir bir "kod" alanına sahip değil — section.settings'teki
 * GERÇEK içerik değerleri bu dosyanın İÇİNDE değil, ayrı saklanıyor (bu
 * dosya sadece şema+template) — bu yüzden projenin gerçek verisine
 * dokunmadan güvenle en güncel kaynakla değiştirilebilir. `StudioShell.tsx`
 * proje yüklenirken `parseProjectFiles`'tan HEMEN SONRA çağrılır, sonra
 * `pages` patched `files`'tan TEKRAR parse edilir (bkz. çağrı yeri).
 */
export function patchStaleFormulaSectionContent(
  files: Record<string, string>,
  pages: Array<{ sections: Array<{ type: string; sourcePath: string | null }> }>,
  templateId: string | null | undefined,
): Record<string, string> {
  if (templateId !== "formula") return files;
  const canonicalByType: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(formulaSectionFiles()).map(([path, content]) => [
        path.replace(/^sections\//, "").replace(/\.ei$/, ""),
        content,
      ]),
    ),
    ...Object.fromEntries(FORMULA_LIBRARY_SECTIONS.map((s) => [s.type, s.content])),
  };
  let changed = false;
  const next = { ...files };
  for (const page of pages) {
    for (const section of page.sections) {
      const canonical = canonicalByType[section.type];
      if (!canonical || !section.sourcePath) continue;
      const current = next[section.sourcePath];
      if (current === undefined || current === canonical) continue;
      // 2026-08-19 devamı — GERÇEK bug bulundu (header/footer paylaşım işi
      // sırasında): bir section "Tasarım Değiştir" ile VARSAYILAN-DIŞI bir
      // varyanta geçmiş olabilir (ör. nav-header → "Ortalı Logo") — bu
      // durumda içeriğin `canonical`dan (her zaman varsayılan/klasik
      // varyant) FARKLI olması BEKLENEN bir durumdur, staleness DEĞİLDİR.
      // Eski kod bunu ayırt edemiyordu — HER swap edilmiş section'ı, proje
      // her açıldığında SESSİZCE varsayılana geri döndürüyordu (`getSectionDesigns`
      // ile doğrulandı, "Ortalı Logo" bir sonraki yüklemede "Klasik"e
      // dönüyordu). Fix: mevcut içerik o TİP için bilinen HERHANGİ bir
      // varyantla (default dahil) birebir eşleşiyorsa dokunma — sadece
      // HİÇBİRİYLE eşleşmeyen (artık var olmayan eski bir sürümden kalma,
      // gerçekten stale) içerik varsayılana tazelenir. Bilinen kısıt: zaten
      // seçilmiş NON-default bir varyantın KENDİ koduna sonradan gelen bir
      // düzeltme (ör. CSS class eklenmesi) bu section'a otomatik yansımaz —
      // kullanıcı tasarımı yeniden seçmeli; bu, sessiz-varsayılana-dönmekten
      // çok daha küçük bir kapsam.
      const knownVariants = new Set([canonical, ...getSectionDesigns(section.type, templateId).map((d) => d.content)]);
      if (knownVariants.has(current)) continue;
      next[section.sourcePath] = canonical;
      changed = true;
    }
  }
  return changed ? next : files;
}

/**
 * 2026-08-19 — kullanıcı raporu: "404 sayfası hâlâ yok" — `patchStaleFormulaSectionContent`'in
 * ele almadığı AYRI bir boşluk: bu SADECE var olan section İÇERİĞİNİ
 * tazeler, projeye eksik bir SAYFA eklemez. `page.create`/"404" desteği
 * (bkz. `commandGovernance.ts` `isMandatoryPage`, `formulaPages.ts`
 * `buildFormulaPages`) bu özellikten ÖNCE oluşturulmuş projelerin hiçbirinde
 * `template: "404"` sayfası hiç yoktu — dolayısıyla "404 sayfası hâlâ yok"
 * raporu tam olarak doğruydu, staleness DEĞİLDİ.
 *
 * `reducer.ts`'in `page.create` mutation'ıyla AYNI klonlama mantığı (aktif/
 * "home" sayfasının yapısal — header/footer/duyuru çubuğu — section'larını
 * YENİ id'lerle, `sourcePath: null` ile klonlar) kullanılıyor — böylece
 * kullanıcının nav/footer'da yaptığı "Tasarım Değiştir" seçimi (ör. Ortalı
 * Logo) 404 sayfasına da aynen yansır, ham `formulaTheme.ts` varsayılanına
 * DÜŞMEZ. `StudioShell.tsx`'te `patchStaleFormulaSectionContent`'ten HEMEN
 * SONRA, AYNI parse-patch-reparse döngüsünde çağrılır.
 */
export function patchMissingFormula404Page(pages: EiPage[], templateId: string | null | undefined): EiPage[] {
  if (templateId !== "formula") return pages;
  if (pages.some((p) => p.template === "404")) return pages;
  const source = pages.find((p) => p.slug === "home") ?? pages[0];
  if (!source) return pages;

  const clone = (s: EiSection): EiSection => ({ ...s, id: `section-${crypto.randomUUID().slice(0, 8)}`, sourcePath: null, ownedByPage: false });
  // Header (nav-header + varsa duyuru çubuğu) ile footer AYRI toplanıyor —
  // ikisini de "structural" diye TEK listeye koyup peş peşe klonlamak footer'ı
  // ana içerikten ÖNCE, sayfanın ortasına düşürürdü (gerçek bir bug, ilk
  // sürümde e2e/unit ile yakalandı: [header, footer, main] yanlış sırası).
  const header = source.sections.filter((s) => sectionSlot(resolveSectionInstanceRole(s)) === "header").map(clone);
  const footer = source.sections.filter((s) => sectionSlot(resolveSectionInstanceRole(s)) === "footer").map(clone);
  const mainSection: EiSection = {
    id: `section-${crypto.randomUUID().slice(0, 8)}`,
    type: "main-404",
    name: "404",
    enabled: true,
    settings: {},
    schema: [],
    blocks: [],
    content: FORMULA_404,
    sourcePath: null,
    ownedByPage: false,
  };
  const sections = [...header, mainSection, ...footer];
  const page: EiPage = {
    slug: "404",
    name: "404 Sayfası",
    path: "pages/404.eipg",
    template: "404",
    locale: source.locale,
    requires: [],
    sections,
    sectionOrder: sections.map((s) => s.id),
    dirty: true,
  };
  return [...pages, page];
}

/**
 * 2026-08-24 — kullanıcı raporu: "siparişiniz alındı sayfası formula
 * temasına özelleştirilmemiş" — `patchMissingFormula404Page` ile BİREBİR
 * aynı gerekçe/desen: `/checkout/success` daha önce hiçbir formula
 * projesinde tema-scaffold edilmiş bir sayfa olarak var olmadı (route hep
 * renderer.ts'in hardcoded fallback'ine düşüyordu), bu yüzden zaten var
 * olan (donmuş) projelere bu sayfayı geriye dönük eklemek gerekiyor.
 */
export function patchMissingFormulaCheckoutSuccessPage(pages: EiPage[], templateId: string | null | undefined): EiPage[] {
  if (templateId !== "formula") return pages;
  if (pages.some((p) => p.slug === "checkout-success")) return pages;
  const source = pages.find((p) => p.slug === "home") ?? pages[0];
  if (!source) return pages;

  const clone = (s: EiSection): EiSection => ({ ...s, id: `section-${crypto.randomUUID().slice(0, 8)}`, sourcePath: null, ownedByPage: false });
  const header = source.sections.filter((s) => sectionSlot(resolveSectionInstanceRole(s)) === "header").map(clone);
  const footer = source.sections.filter((s) => sectionSlot(resolveSectionInstanceRole(s)) === "footer").map(clone);
  const mainSection: EiSection = {
    id: `section-${crypto.randomUUID().slice(0, 8)}`,
    type: "main-checkout-success",
    name: "Sipariş Onayı",
    enabled: true,
    settings: {},
    schema: [],
    blocks: [],
    content: FORMULA_CHECKOUT_SUCCESS,
    sourcePath: null,
    ownedByPage: false,
  };
  const sections = [...header, mainSection, ...footer];
  const page: EiPage = {
    slug: "checkout-success",
    name: "Sipariş Onayı",
    path: "pages/checkout-success.eipg",
    template: "page",
    locale: source.locale,
    requires: [],
    sections,
    sectionOrder: sections.map((s) => s.id),
    dirty: true,
  };
  return [...pages, page];
}

/**
 * 2026-08-21 — kullanıcı raporu: giriş yapmamışken de "Hesabım" görünüyor,
 * login/register'a giden gerçek bir yol yok. Kök neden: `account-dashboard`/
 * `account-orders` section tipleri bu özellikten (bkz. `formulaSectionFiles()`)
 * ÖNCE oluşturulmuş projelerde henüz yok — `/account` ve `/account/orders`
 * sayfaları hâlâ eski jenerik `content-page` placeholder'ını taşıyor.
 * `patchStaleFormulaSectionContent` bunu YAKALAMAZ çünkü section TİPİ aynı
 * kalıyorsa (content-page → content-page) çalışır, burada tip'in KENDİSİ
 * değişmesi gerekiyor. `patchMissingFormula404Page`'deki AYNI desen: header/
 * footer KORUNUR (kullanıcının "Tasarım Değiştir" seçimi yansır), sadece
 * ana (content-page tipli) section account-dashboard/account-orders ile
 * DEĞİŞTİRİLİR — `content-page`'in eski eyebrow/title/body ayarları zaten
 * yeni section'da hiç okunmuyor, kayıp veri yok. `StudioShell.tsx`'te
 * `patchMissingFormula404Page`'ten HEMEN SONRA, AYNI parse-patch-reparse
 * döngüsünde çağrılır.
 */
export function patchStaleAccountPages(pages: EiPage[], templateId: string | null | undefined): EiPage[] {
  if (templateId !== "formula") return pages;
  const targets: Record<string, { type: string; name: string; content: string; blocks: EipgBlock[] }> = {
    account: {
      type: "account-dashboard",
      name: "Hesabım",
      content: ACCOUNT_DASHBOARD_CONTENT,
      blocks: [
        block(`block-${crypto.randomUUID().slice(0, 8)}`, "tab", "Sekme", { key: "orders", label: "Siparişlerim" }),
        block(`block-${crypto.randomUUID().slice(0, 8)}`, "tab", "Sekme", { key: "addresses", label: "Adreslerim" }),
        block(`block-${crypto.randomUUID().slice(0, 8)}`, "tab", "Sekme", { key: "loyalty", label: "Sadakat Puanlarım" }),
      ],
    },
    orders: { type: "account-orders", name: "Siparişlerim", content: ACCOUNT_ORDERS_CONTENT, blocks: [] },
  };
  let changed = false;
  const nextPages = pages.map((page) => {
    const target = targets[page.slug];
    if (!target) return page;
    const sections = page.sections.map((section) => {
      if (section.type !== "content-page") return section;
      const role = sectionSlot(resolveSectionInstanceRole(section));
      if (role === "header" || role === "footer") return section;
      changed = true;
      const patched: EiSection = {
        id: `section-${crypto.randomUUID().slice(0, 8)}`,
        type: target.type,
        name: target.name,
        enabled: true,
        settings: {},
        schema: [],
        blocks: target.blocks,
        content: target.content,
        sourcePath: null,
        ownedByPage: false,
      };
      return patched;
    });
    if (sections === page.sections) return page;
    const sectionOrder = sections.map((s) => s.id);
    return { ...page, sections, sectionOrder, dirty: true };
  });
  return changed ? nextPages : pages;
}

/**
 * 2026-08-23 — Faz 3 (Favoriler) frontend'i: `account-dashboard` section'ının
 * blok şemasına yeni bir "favorites" tab seçeneği eklendi (bkz.
 * `universalPages.ts`). `patchStaleAccountPages`'in eklediği (veya yeni
 * scaffold'daki) mevcut section instance'ları bu blok'u İÇERMİYOR — yeni
 * eklenen bir schema seçeneği var olan projelerin donmuş `blocks` dizisine
 * geriye dönük yansımaz. Aynı desen: sadece EKSİKSE ekle (idempotent), var
 * olan tab sırası/etiketleri değişmez.
 */
export function patchMissingFavoritesTab(pages: EiPage[], templateId: string | null | undefined): EiPage[] {
  if (templateId !== "formula") return pages;
  let changed = false;
  const nextPages = pages.map((page) => {
    if (page.slug !== "account") return page;
    const sections = page.sections.map((section) => {
      if (section.type !== "account-dashboard") return section;
      const hasFavoritesTab = section.blocks.some((b) => b.type === "tab" && b.settings?.key === "favorites");
      if (hasFavoritesTab) return section;
      changed = true;
      return {
        ...section,
        blocks: [...section.blocks, block(`block-${crypto.randomUUID().slice(0, 8)}`, "tab", "Sekme", { key: "favorites", label: "Favorilerim" })],
      };
    });
    if (sections === page.sections) return page;
    return { ...page, sections, dirty: true };
  });
  return changed ? nextPages : pages;
}

export { FORMULA_THEME_CSS };

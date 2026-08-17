/**
 * formulaPages.ts
 * "Formula" temasının 12 sayfalık iskeletini (`multiPageScaffold.ts`'in
 * `ThemePageSpec[]` girdisi) derler. Ana Sayfa Formula'ya özgü section'ları
 * kullanır (`formulaTheme.ts`); cart/checkout/ürün/koleksiyon/arama/marka/
 * giriş/kayıt/içerik sayfaları TÜM temalarda ortak olan, tema-bağımsız
 * `universalPages.ts` section'larını kullanır (bkz. o dosyanın başlığı).
 */
import type { EipgBlock } from "@eidea/ei-engine/browser";
import type { ThemePageSpec, ThemeSectionInstance } from "./multiPageScaffold.js";
import {
  FORMULA_NAV_HEADER,
  FORMULA_HERO,
  FORMULA_QUIZ_BANNER,
  FORMULA_BESTSELLERS,
  FORMULA_CONCERNS,
  FORMULA_PHILOSOPHY,
  FORMULA_FOOTER_MENU,
  FORMULA_THEME_CSS,
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
          block("best-1", "product", "Ürün", { name: "Niasinamid Serum", active: "%10 Niasinamid", price: "₺349", badge: "Çok Satan", url: "/products/niasinamid-serum" }),
          block("best-2", "product", "Ürün", { name: "Hyalüronik Asit Serum", active: "%2 Hyalüronik Asit", price: "₺389", badge: "", url: "/products/hyaluronik-asit-serum" }),
          block("best-3", "product", "Ürün", { name: "Nazik Temizleyici Jel", active: "pH 5.5", price: "₺249", badge: "Yeni", url: "/products/nazik-temizleyici-jel" }),
          block("best-4", "product", "Ürün", { name: "SPF 50 Güneş Bakımı", active: "Geniş Spektrum", price: "₺299", badge: "", url: "/products/spf-50-gunes-bakimi" }),
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
  const accountPage = utilityPage("account", "Hesabım", "/account", "page", {
    id: "content-page", type: "content-page", name: "İçerik", src: "sections/content-page.ei",
    settings: { eyebrow: "Hesap", title: "Hesabım", body: "Sipariş geçmişini ve hesap bilgilerini burada yönet." },
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
    id: "content-page", type: "content-page", name: "İçerik", src: "sections/content-page.ei",
    settings: { eyebrow: "Hesap", title: "Siparişlerim", body: "Geçmiş siparişlerini burada görüntüle." },
  });

  return [
    homePage, productsPage, collectionPage, brandsPage, searchPage, productPage,
    cartPage, checkoutPage, accountPage, registerPage, loginPage, ordersPage,
  ];
}

export function formulaSectionFiles(): Record<string, string> {
  return {
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
  };
}

export { FORMULA_THEME_CSS };

/**
 * formulaTheme.ts
 * "Formula" — klinik/minimal cilt bakımı estetiğinden (Typology gibi
 * markaların diliyle: az ama kanıtlanmış içerik, laboratuvar netliği, geniş
 * beyaz alan, "aktif" oranlarının öne çıkarılması) ilham alan, marketplace'in
 * TEK e-ticaret şablonu. Birebir kopya değil — kendi section'ları, kendi
 * palet/tipografi tokenları, kendi blok şeması.
 *
 * `minimalSections.ts` ile AYNI kural: section tipi dosya adından/section
 * nesnesinin `type` alanından gelir, `{% schema %}.name`'den değil. `nav-header`/
 * `footer-menu` rolleri korunuyor (bkz. `section-rules.ts` SECTION_TYPE_ROLES)
 * — içerik Formula'ya özgü, ama section `type` hâlâ "nav-header"/"footer-menu".
 */

/**
 * 2026-08-18 — "görsel ekleyebildiğimiz alanlara daha fazla özellik getir"
 * (kullanıcı raporu). Görsel içeren section'ların (Hero, Koleksiyon/Genel
 * Vitrin, Slider) HEPSİNDE AYNI 6 alan — tek kaynaktan üretilip her
 * `{% schema %}`'ya interpolasyonla ekleniyor (kopya-yapıştır yerine).
 * Liquid'de bir `<style>` bloğu/CSS class'ı DEĞİL — doğrudan `<img>` üzerinde
 * inline `style` (opacity/filter) olarak uygulanıyor, bu yüzden YENİ bir CSS
 * class'ı gerekmiyor (mevcut projelerin donmuş `theme.css`'i için ayrı bir
 * patch/senkron adımı GEREKMEZ, bkz. [[project-formula-theme-enrichment]]'in
 * "eski projede yeni CSS yok" bug'ı — burada aynı sınıf hata riski yok).
 */
function imageEffectSchemaFields(): string {
  return `
    { "type": "range", "id": "image_opacity", "label": "Görsel Saydamlığı", "min": 20, "max": 100, "step": 5, "default": 100 },
    { "type": "range", "id": "image_blur", "label": "Bulanıklık", "min": 0, "max": 20, "step": 1, "default": 0 },
    { "type": "range", "id": "image_grayscale", "label": "Siyah-Beyaz", "min": 0, "max": 100, "step": 5, "default": 0 },
    { "type": "range", "id": "image_brightness", "label": "Parlaklık", "min": 40, "max": 160, "step": 5, "default": 100 },
    { "type": "color", "id": "image_overlay_color", "label": "Kaplama Rengi", "default": "#000000" },
    { "type": "range", "id": "image_overlay_opacity", "label": "Kaplama Yoğunluğu", "min": 0, "max": 80, "step": 5, "default": 0 }`;
}

/** `imageEffectSchemaFields()`'in ürettiği ayarları GERÇEK CSS'e çeviren
 * inline `style` değeri — `prefix` `section.settings`/`block.settings` gibi
 * doğru scope'u belirtir. */
function imageEffectStyle(prefix: string): string {
  return `opacity:{{ ${prefix}.image_opacity | default: 100 }}%;filter:blur({{ ${prefix}.image_blur | default: 0 }}px) grayscale({{ ${prefix}.image_grayscale | default: 0 }}%) brightness({{ ${prefix}.image_brightness | default: 100 }}%)`;
}

/** Kaplama (overlay) katmanı — yoğunluk 0'sa hiç render edilmez (gereksiz DOM). */
function imageEffectOverlay(prefix: string): string {
  return `{% if ${prefix}.image_overlay_opacity > 0 %}<div class="formula-image-overlay" style="background:{{ ${prefix}.image_overlay_color | default: '#000000' }};opacity:{{ ${prefix}.image_overlay_opacity | default: 0 }}%"></div>{% endif %}`;
}

/**
 * 2026-08-19 — kullanıcı isteği: sectionlara hafif, sayfayı yormayan bir
 * "görünürken canlan" animasyonu, sağ panelden section bazlı açılıp
 * kapanabilsin, 5-6 seçenek olsun, İLK AÇILIŞ HIZINI etkilemesin.
 *
 * `imageEffectSchemaFields()` ile AYNI desen: motorda (`eidea-ei-engine`)
 * TÜM section'lara ortak enjekte edilen bir şema mekanizması yok (her
 * section kendi `{% schema %}`'sını kendi yazıyor), o yüzden tek kaynaktan
 * üretilip her ilgili section'ın `"settings"` dizisine interpolasyonla
 * ekleniyor. Varsayılan HER ZAMAN "none" — bu, seçilmediği sürece section'ın
 * `formula-reveal--none` sınıfına düşüp `opacity:1`'de sabit kalması (CSS'te,
 * bkz. `FORMULA_LIBRARY_SECTIONS_CSS`) anlamına gelir; yani mevcut/varsayılan
 * davranışta HİÇBİR ek boya/layout maliyeti yok. Yapısal/chrome section'lara
 * (nav-header, footer-menu, announcement-bar) BİLİNÇLİ OLARAK eklenmedi —
 * her sayfada tekrarlayan bir öğenin kaybolup belirmesi LCP riski taşır ve
 * sayfa geçişlerinde "titreşen header" izlenimi verir. */
function revealAnimationSchemaField(): string {
  return `
    { "type": "select", "id": "reveal_animation", "label": "Görünürken Animasyon", "default": "none",
      "info": "Sayfa kaydırılıp section görünür olduğunda oynar, ilk açılış hızını etkilemez.",
      "options": [
        { "label": "Yok", "value": "none" },
        { "label": "Belirerek gelsin", "value": "fade" },
        { "label": "Aşağıdan gelsin", "value": "up" },
        { "label": "Soldan gelsin", "value": "left" },
        { "label": "Sağdan gelsin", "value": "right" },
        { "label": "Yakınlaşarak gelsin", "value": "zoom" }
      ]
    }`;
}

/** `revealAnimationSchemaField()`'in ürettiği ayarı GERÇEK CSS sınıfına
 * çeviren class-token — section'ın üst-seviye etiketine eklenir. */
function revealAnimationClass(): string {
  return ` formula-reveal formula-reveal--{{ section.settings.reveal_animation | default: 'none' }}`;
}

/**
 * 2026-08-19 — kullanıcı raporu: "ara, hesap, sepet gibi öğeler icon olmalı"
 * (nav'da düz metin linkti). İnline SVG — harici ikon fontu/paket GEREKMEZ,
 * ağ isteği yok, `currentColor` ile mevcut link renginden miras alır.
 * `formula-nav__icon` sınıfı boyut/hizalamayı CSS'te tek yerden kontrol eder.
 */
function navIconSvg(kind: "search" | "account" | "cart" | "close" | "heart" | "menu"): string {
  const paths: Record<typeof kind, string> = {
    search: `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
    account: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>`,
    cart: `<circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6"/>`,
    close: `<path d="M6 6l12 12M18 6L6 18"/>`,
    heart: `<path d="M12 20.5s-7.5-4.6-10-9.3C.4 7.6 2.4 4 6 4c2 0 3.6 1.1 6 3.6C14.4 5.1 16 4 18 4c3.6 0 5.6 3.6 4 7.2-2.5 4.7-10 9.3-10 9.3Z"/>`,
    menu: `<path d="M3 6h18M3 12h18M3 18h18"/>`,
  };
  return `<svg class="formula-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;
}

/**
 * 2026-08-24 — kullanıcı raporu: "footera eklenen sosyal medyalar ikonlu
 * olsun" (önceden platform adı düz metin link olarak basılıyordu — ör.
 * "INSTAGRAM"). Platform Liquid runtime'da (block.settings.platform) bilinen
 * bir değer olduğu için TS seviyesinde tek bir SVG seçilemiyor — bunun yerine
 * her platform için bir `{% when %}` dalı üreten bir Liquid case/when bloğu
 * TS'te BİR KEZ inşa edilip section markup'ına gömülüyor.
 */
const FORMULA_SOCIAL_ICON_PATHS: Record<string, string> = {
  Instagram: `<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/>`,
  Facebook: `<path d="M13.5 21v-7.6h2.6l.4-3h-3v-1.9c0-.9.2-1.5 1.5-1.5h1.6V4.2C15.9 4.1 15 4 14 4c-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2v3h2.6V21h3.7Z" fill="currentColor"/>`,
  TikTok: `<path d="M14.7 3c.3 2 1.7 3.5 3.6 3.8v2.5c-1.4 0-2.6-.4-3.6-1.1v6c0 3.1-2.5 5.4-5.5 5.2-2.8-.2-4.9-2.5-4.8-5.4.1-2.7 2.3-4.9 5.1-4.9.3 0 .5 0 .8.1v2.6a2.6 2.6 0 1 0 1.9 2.5V3h2.5Z" fill="currentColor"/>`,
  YouTube: `<rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10.3 9.6l5 2.4-5 2.4V9.6Z" fill="currentColor"/>`,
  X: `<path d="M4 4l7 8.4L4.4 20H6.6l5.7-6.4L16.8 20H20l-7.4-8.9L19.8 4h-2.2l-5.2 5.9L8.3 4H4Z" fill="currentColor"/>`,
  Pinterest: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.5 19c.5-1.8 1.4-5.5 1.4-5.5m0 0c-.3-.6-.4-1.9.3-2.9.9-1.3 3-1 3.3.6.2 1-.4 2.3-1 3.1-.6.8.1 1.8 1 1.8 1.7 0 2.9-2.2 2.9-4.2 0-2.2-1.7-3.9-4.2-3.9-3 0-4.7 2.1-4.7 4.4 0 .8.3 1.6.7 2.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  WhatsApp: `<path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3Zm5.2 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.1.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.1.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3 0 .1 0 .6-.2 1.2Z" fill="currentColor"/>`,
};
const FORMULA_SOCIAL_ICON_FALLBACK = `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`;
const FORMULA_SOCIAL_ICON_CASE =
  `{% case block.settings.platform %}` +
  Object.entries(FORMULA_SOCIAL_ICON_PATHS)
    .map(([platform, path]) => `{% when "${platform}" %}<svg class="formula-footer__social-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`)
    .join("") +
  `{% else %}<svg class="formula-footer__social-icon" viewBox="0 0 24 24" aria-hidden="true">${FORMULA_SOCIAL_ICON_FALLBACK}</svg>{% endcase %}`;

export const FORMULA_NAV_HEADER = `<section class="formula-nav{% if section.settings.sticky_header %} formula-nav--sticky{% endif %}">
  <button type="button" class="formula-nav__mobile-toggle" aria-label="Menü" aria-expanded="false" data-nav-mobile-toggle>${navIconSvg("menu")}</button>
  <a class="formula-nav__logo" href="/">
    {% if settings.logo != blank %}
      <img src="{{ settings.logo | img_url: '160x' }}" alt="{{ section.settings.logo_text | default: shop.name | escape }}" style="height:{{ settings.logo_width | default: 40 }}px;width:auto;display:block" />
    {% else %}
      {{ section.settings.logo_text | default: shop.name | escape }}
    {% endif %}
  </a>
  <nav class="formula-nav__links">
    {% for block in section.blocks %}
      {% if block.type == "menu_item" %}
        {% if block.blocks.size > 0 %}
          <div class="formula-nav__item">
            <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
            <div class="formula-nav__submenu">
              {% for child in block.blocks %}
                {% if child.type == "submenu_item" %}<a href="{{ child.settings.url | escape }}">{{ child.settings.label | escape }}</a>{% endif %}
              {% endfor %}
            </div>
          </div>
        {% else %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
        {% endif %}
      {% endif %}
    {% endfor %}
  </nav>
  {%- assign search_style = section.settings.search_style | default: 'icon' -%}
  {%- if search_style == 'bar' -%}
    <div class="formula-nav__search formula-nav__search--bar" data-nav-search data-search-mode="bar" style="--formula-search-width: {{ section.settings.search_box_width | default: 240 }}px" data-search-result-count="{{ section.settings.search_result_count | default: 5 }}" data-search-show-price="{{ section.settings.search_show_price | default: true }}">
      <span class="formula-nav__search-bar-icon">${navIconSvg("search")}</span>
      <input type="search" name="q" placeholder="{{ section.settings.search_placeholder | default: 'Ara…' | escape }}" class="formula-nav__search-input" aria-label="Arama sorgusu" autocomplete="off" />
      <div class="formula-nav__search-results" data-nav-search-results></div>
    </div>
  {%- endif -%}
  <div class="formula-nav__actions" data-nav-actions>
    {% if section.settings.quiz_label != blank %}<a href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}" class="formula-nav__quiz">{{ section.settings.quiz_label | escape }}</a>{% endif %}
    {%- if search_style == 'expandable' -%}
      <div class="formula-nav__search" data-nav-search data-search-mode="expandable" style="--formula-search-width: {{ section.settings.search_box_width | default: 240 }}px" data-search-result-count="{{ section.settings.search_result_count | default: 5 }}" data-search-show-price="{{ section.settings.search_show_price | default: true }}">
        <button type="button" class="formula-nav__search-toggle" aria-label="Ara" aria-expanded="false" data-nav-search-toggle>${navIconSvg("search")}</button>
        <form action="/search" method="get" class="formula-nav__search-form" data-nav-search-form>
          <input type="search" name="q" placeholder="{{ section.settings.search_placeholder | default: 'Ara…' | escape }}" class="formula-nav__search-input" aria-label="Arama sorgusu" autocomplete="off" />
          <button type="button" class="formula-nav__search-close" aria-label="Aramayı kapat" data-nav-search-close>${navIconSvg("close")}</button>
        </form>
        <div class="formula-nav__search-results" data-nav-search-results></div>
      </div>
    {%- elsif search_style == 'modal' -%}
      <button type="button" class="formula-nav__search-toggle" aria-label="Ara" aria-expanded="false" data-nav-search-modal-toggle>${navIconSvg("search")}</button>
    {%- elsif search_style == 'bar' -%}
    {%- else -%}
      <a href="/search" aria-label="Ara">${navIconSvg("search")}</a>
    {%- endif -%}
    {% if section.settings.show_wishlist %}<a href="/account#favorites" aria-label="Favorilerim">${navIconSvg("heart")}</a>{% endif %}
    <a href="/account" aria-label="Hesabım">${navIconSvg("account")}</a>
    <a href="/cart" aria-label="Sepet" data-cart-open-mode="{{ section.settings.cart_open_mode | default: 'page' }}">${navIconSvg("cart")}</a>
  </div>
  {%- if search_style == 'modal' -%}
    <div class="formula-nav__search-modal-backdrop" data-nav-search-backdrop></div>
    <div class="formula-nav__search formula-nav__search--modal" data-nav-search data-search-mode="modal" style="--formula-search-width: {{ section.settings.search_box_width | default: 240 }}px" data-search-result-count="{{ section.settings.search_result_count | default: 5 }}" data-search-show-price="{{ section.settings.search_show_price | default: true }}" aria-hidden="true">
      <div class="formula-nav__search-modal-box">
        <div class="formula-nav__search-modal-row">
          <span class="formula-nav__search-modal-icon">${navIconSvg("search")}</span>
          <input type="search" name="q" placeholder="{{ section.settings.search_placeholder | default: 'Ara…' | escape }}" class="formula-nav__search-input" aria-label="Arama sorgusu" autocomplete="off" />
          <button type="button" class="formula-nav__search-close" aria-label="Aramayı kapat" data-nav-search-close>${navIconSvg("close")}</button>
        </div>
        <div class="formula-nav__search-results" data-nav-search-results></div>
      </div>
    </div>
  {%- endif -%}
  <div class="formula-nav__mobile-backdrop" data-nav-mobile-backdrop></div>
  <div class="formula-nav__mobile-drawer" data-nav-mobile-drawer aria-hidden="true">
    <div class="formula-nav__mobile-drawer-head">
      <a class="formula-nav__logo" href="/">
        {% if settings.logo != blank %}
          <img src="{{ settings.logo | img_url: '120x' }}" alt="{{ section.settings.logo_text | default: shop.name | escape }}" style="height:32px;width:auto;display:block" />
        {% else %}
          {{ section.settings.logo_text | default: shop.name | escape }}
        {% endif %}
      </a>
      <button type="button" class="formula-nav__search-close" aria-label="Menüyü kapat" data-nav-mobile-close>${navIconSvg("close")}</button>
    </div>
    <nav class="formula-nav__mobile-links">
      {% for block in section.blocks %}
        {% if block.type == "menu_item" %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
          {% for child in block.blocks %}
            {% if child.type == "submenu_item" %}<a class="formula-nav__mobile-sublink" href="{{ child.settings.url | escape }}">{{ child.settings.label | escape }}</a>{% endif %}
          {% endfor %}
        {% endif %}
      {% endfor %}
    </nav>
    <div class="formula-nav__mobile-drawer-foot">
      {% if section.settings.show_wishlist %}<a href="/account#favorites">${navIconSvg("heart")}<span>Favorilerim</span></a>{% endif %}
      <a href="/account">${navIconSvg("account")}<span>Hesabım</span></a>
      <a href="/cart">${navIconSvg("cart")}<span>Sepetim</span></a>
    </div>
  </div>
  <script>
    (function () {
      var navSection = document.currentScript.closest(".formula-nav");
      if (!navSection) return;
      var mToggle = navSection.querySelector("[data-nav-mobile-toggle]");
      var mDrawer = navSection.querySelector("[data-nav-mobile-drawer]");
      var mBackdrop = navSection.querySelector("[data-nav-mobile-backdrop]");
      var mClose = navSection.querySelector("[data-nav-mobile-close]");
      if (mToggle && mDrawer) {
        var closeMenu = function () {
          mDrawer.classList.remove("is-open");
          mDrawer.setAttribute("aria-hidden", "true");
          if (mBackdrop) mBackdrop.classList.remove("is-open");
          mToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("formula-mobile-menu-open");
        };
        var openMenu = function () {
          mDrawer.classList.add("is-open");
          mDrawer.setAttribute("aria-hidden", "false");
          if (mBackdrop) mBackdrop.classList.add("is-open");
          mToggle.setAttribute("aria-expanded", "true");
          document.body.classList.add("formula-mobile-menu-open");
        };
        mToggle.addEventListener("click", function (e) {
          e.stopPropagation();
          if (mDrawer.classList.contains("is-open")) { closeMenu(); } else { openMenu(); }
        });
        if (mClose) mClose.addEventListener("click", closeMenu);
        if (mBackdrop) mBackdrop.addEventListener("click", closeMenu);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
      }
    })();
  </script>
  {%- if search_style != 'icon' -%}
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-nav");
      if (!root) return;
      var wrap = root.querySelector("[data-nav-search]");
      if (!wrap) return;
      var mode = wrap.getAttribute("data-search-mode");
      var input = wrap.querySelector("input");
      var resultsEl = wrap.querySelector("[data-nav-search-results]");
      var closeBtn = wrap.querySelector("[data-nav-search-close]");
      function escapeHtml(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }
      function formatMoney(n) {
        try { return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(n) || 0); }
        catch (e) { return "₺" + n; }
      }
      function clearResults() {
        if (resultsEl) resultsEl.innerHTML = "";
        wrap.classList.remove("has-results");
      }
      // Eşzamanlı (typeahead) arama — TÜM modlarda aynı: /search.json GERÇEK
      // ürün sonuçlarını (title/description substring, main-search ile AYNI
      // sorgu) döner.
      var debounceTimer = null;
      var lastRequestedQuery = "";
      var resultCount = Math.max(1, Number(wrap.getAttribute("data-search-result-count")) || 5);
      var showPrice = wrap.getAttribute("data-search-show-price") !== "false";
      if (input && resultsEl) {
        input.addEventListener("input", function () {
          var q = input.value.trim();
          if (debounceTimer) clearTimeout(debounceTimer);
          if (q.length < 2) { clearResults(); return; }
          debounceTimer = setTimeout(function () {
            lastRequestedQuery = q;
            fetch("/search.json?q=" + encodeURIComponent(q) + "&limit=" + resultCount)
              .then(function (r) { return r.json(); })
              .then(function (data) {
                if (lastRequestedQuery !== q || input.value.trim() !== q) return;
                var items = data.results || [];
                if (!items.length) {
                  resultsEl.innerHTML = '<div class="formula-nav__search-empty">Sonuç bulunamadı</div>';
                  wrap.classList.add("has-results");
                  return;
                }
                var viewAllHref = "/search?q=" + encodeURIComponent(q);
                resultsEl.innerHTML = items.map(function (p) {
                  var imgUrl = escapeHtml(p.featured_image || "");
                  var img = imgUrl
                    ? '<img src="' + imgUrl + '" alt="" />'
                    : '<span class="formula-nav__search-result-placeholder"></span>';
                  var priceHtml = showPrice ? '<span class="formula-nav__search-result-price">' + formatMoney(p.price) + '</span>' : '';
                  return '<a class="formula-nav__search-result" href="' + escapeHtml(p.url || "#") + '">' + img +
                    '<span><span class="formula-nav__search-result-title">' + escapeHtml(p.title) + '</span>' +
                    priceHtml + '</span></a>';
                }).join("") + '<a class="formula-nav__search-viewall" href="' + escapeHtml(viewAllHref) + '">Tüm sonuçları gör →</a>';
                wrap.classList.add("has-results");
              })
              .catch(function () { /* sessiz — Enter'la tam /search sayfasına her zaman gidilebilir */ });
          }, 250);
        });
      }
      if (mode === "expandable") {
        var actionsRow = root.querySelector("[data-nav-actions]");
        var toggle = wrap.querySelector("[data-nav-search-toggle]");
        var form = wrap.querySelector("[data-nav-search-form]");
        if (!toggle || !form) return;
        function close() {
          wrap.classList.remove("is-open");
          if (actionsRow) actionsRow.classList.remove("formula-nav__actions--search-open");
          toggle.setAttribute("aria-expanded", "false");
          clearResults();
        }
        toggle.addEventListener("click", function (e) {
          e.stopPropagation();
          var open = wrap.classList.toggle("is-open");
          if (actionsRow) actionsRow.classList.toggle("formula-nav__actions--search-open", open);
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) { if (input) input.focus(); } else { clearResults(); }
        });
        if (closeBtn) closeBtn.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); close(); });
        form.addEventListener("click", function (e) { e.stopPropagation(); });
        document.addEventListener("click", close);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      } else if (mode === "modal") {
        var toggle2 = root.querySelector("[data-nav-search-modal-toggle]");
        var backdrop = root.querySelector("[data-nav-search-backdrop]");
        if (!toggle2) return;
        function closeModal() {
          wrap.classList.remove("is-open");
          wrap.setAttribute("aria-hidden", "true");
          if (backdrop) backdrop.classList.remove("is-open");
          toggle2.setAttribute("aria-expanded", "false");
          clearResults();
          document.body.classList.remove("formula-search-modal-open");
        }
        function openModal() {
          wrap.classList.add("is-open");
          wrap.setAttribute("aria-hidden", "false");
          if (backdrop) backdrop.classList.add("is-open");
          toggle2.setAttribute("aria-expanded", "true");
          document.body.classList.add("formula-search-modal-open");
          if (input) input.focus();
        }
        toggle2.addEventListener("click", function (e) {
          e.stopPropagation();
          if (wrap.classList.contains("is-open")) { closeModal(); } else { openModal(); }
        });
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (backdrop) backdrop.addEventListener("click", closeModal);
        wrap.addEventListener("click", function (e) { e.stopPropagation(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
      }
    })();
  </script>
  {%- endif -%}
</section>

{% schema %}
{
  "name": "Formula Navigasyon",
  "settings": [
    { "type": "text", "id": "logo_text", "label": "Logo Metni", "default": "",
      "info": "Sadece Tema Ayarları'nda bir Logo görseli SEÇİLMEMİŞSE kullanılır." },
    { "type": "text", "id": "quiz_label", "label": "Analiz Buton Metni", "default": "Cilt Analizi" },
    { "type": "url", "id": "quiz_url", "label": "Analiz Bağlantısı", "default": "/pages/cilt-analizi" },
    { "type": "select", "id": "cart_open_mode", "label": "Sepet Açılış Şekli", "default": "page",
      "info": "Sepet ikonuna tıklanınca ne olacağını belirler.",
      "options": [
        { "label": "Direkt Sepet Sayfası", "value": "page" },
        { "label": "Yandan Aç (Panel)", "value": "drawer" },
        { "label": "Üstten Aç (Panel)", "value": "top" }
      ]
    },
    { "type": "select", "id": "search_style", "label": "Arama Şekli", "default": "icon",
      "info": "Arama ikonuna tıklanınca ne olacağını belirler.",
      "options": [
        { "label": "Arama Sayfasına Git", "value": "icon" },
        { "label": "Açılır Kutu (Sağda, header içinde)", "value": "expandable" },
        { "label": "Ortada Açılır Pencere", "value": "modal" },
        { "label": "Ortada Her Zaman Görünür Çubuk", "value": "bar" }
      ]
    },
    { "type": "text", "id": "search_placeholder", "label": "Arama Kutusu Yer Tutucu Metni", "default": "Ara…",
      "info": "Yalnızca Açılır Kutu seçiliyken görünür." },
    { "type": "range", "id": "search_result_count", "label": "Eşzamanlı Sonuç Sayısı", "min": 3, "max": 10, "step": 1, "default": 5,
      "info": "Yazarken anında gösterilecek maksimum ürün sayısı." },
    { "type": "range", "id": "search_box_width", "label": "Kutu Genişliği (px)", "min": 160, "max": 360, "step": 10, "default": 240 },
    { "type": "checkbox", "id": "search_show_price", "label": "Sonuçlarda Fiyat Göster", "default": true },
    { "type": "checkbox", "id": "sticky_header", "label": "Kaydırınca Header Sabit Kalsın", "default": false,
      "info": "Açıkken sayfa aşağı kaydırılsa da header ekranın üstünde sabit kalır." },
    { "type": "checkbox", "id": "show_wishlist", "label": "Favoriler İkonu Göster", "default": true }
  ],
  "blocks": [
    {
      "type": "menu_item",
      "name": "Menü Öğesi",
      "settings": [
        { "type": "text", "id": "label", "label": "Metin", "default": "Yüz Bakımı" },
        { "type": "url", "id": "url", "label": "URL", "default": "/collection" }
      ],
      "blocks": [
        {
          "type": "submenu_item",
          "name": "Alt Menü Öğesi",
          "settings": [
            { "type": "text", "id": "label", "label": "Metin", "default": "Alt Kategori" },
            { "type": "url", "id": "url", "label": "URL", "default": "/collection" }
          ]
        }
      ]
    }
  ],
  "presets": [{
    "name": "Formula Navigasyon",
    "blocks": [
      { "type": "menu_item", "settings": { "label": "Yüz Bakımı", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Vücut & Saç", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Kaygıya Göre", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Tüm Ürünler", "url": "/products" } }
    ]
  }]
}
{% endschema %}`;

/**
 * 2026-08-19 — kullanıcı raporu: "klasik sol logo ve orta logo düzgünç
 * çalışmıyor görüntü bozuluyor". Kök neden: `sectionDesigns.ts`'in
 * "Tasarım Değiştir" kataloğu Formula'ya özgü DEĞİLDİ — jenerik/marka-
 * bağımsız `class="nav-header"` + inline `style` kullanan ("classic"/
 * "centered") varyantlardı, Formula'nın GERÇEK CSS'iyle (`.formula-nav`,
 * `assets/theme.css`) hiç eşleşmiyordu. "Ortalı Logo" seçilince section
 * TAMAMEN STİLSİZ (kendi inline style'ları dışında) render oluyordu —
 * kullanıcının "görüntü bozuluyor" raporu buydu. Fix: Formula projelerinde
 * jenerik kataloğun YERİNE bu Formula-özgü varyantlar sunulur (bkz.
 * `sectionDesigns.ts` `getSectionDesigns`'ın templateId parametresi).
 * "Klasik" zaten `FORMULA_NAV_HEADER`'ın kendisi — burada SADECE "Ortalı"
 * gerekiyordu, aynı `.formula-nav` sınıf sözleşmesini (ve ikonlarını)
 * kullanıp `formula-nav--centered` modifier'ıyla dikey/ortalı bir düzene
 * geçiyor (CSS: `FORMULA_THEME_CSS`, `.formula-nav--centered`).
 */
export const FORMULA_NAV_HEADER_CENTERED = `<section class="formula-nav formula-nav--centered{% if section.settings.sticky_header %} formula-nav--sticky{% endif %}">
  <button type="button" class="formula-nav__mobile-toggle" aria-label="Menü" aria-expanded="false" data-nav-mobile-toggle>${navIconSvg("menu")}</button>
  <a class="formula-nav__logo" href="/">
    {% if settings.logo != blank %}
      <img src="{{ settings.logo | img_url: '160x' }}" alt="{{ section.settings.logo_text | default: shop.name | escape }}" style="height:{{ settings.logo_width | default: 40 }}px;width:auto;display:block;margin:0 auto" />
    {% else %}
      {{ section.settings.logo_text | default: shop.name | escape }}
    {% endif %}
  </a>
  <nav class="formula-nav__links">
    {% for block in section.blocks %}
      {% if block.type == "menu_item" %}
        {% if block.blocks.size > 0 %}
          <div class="formula-nav__item">
            <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
            <div class="formula-nav__submenu">
              {% for child in block.blocks %}
                {% if child.type == "submenu_item" %}<a href="{{ child.settings.url | escape }}">{{ child.settings.label | escape }}</a>{% endif %}
              {% endfor %}
            </div>
          </div>
        {% else %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
        {% endif %}
      {% endif %}
    {% endfor %}
  </nav>
  {%- assign search_style = section.settings.search_style | default: 'icon' -%}
  {%- if search_style == 'bar' -%}
    <div class="formula-nav__search formula-nav__search--bar" data-nav-search data-search-mode="bar" style="--formula-search-width: {{ section.settings.search_box_width | default: 240 }}px" data-search-result-count="{{ section.settings.search_result_count | default: 5 }}" data-search-show-price="{{ section.settings.search_show_price | default: true }}">
      <span class="formula-nav__search-bar-icon">${navIconSvg("search")}</span>
      <input type="search" name="q" placeholder="{{ section.settings.search_placeholder | default: 'Ara…' | escape }}" class="formula-nav__search-input" aria-label="Arama sorgusu" autocomplete="off" />
      <div class="formula-nav__search-results" data-nav-search-results></div>
    </div>
  {%- endif -%}
  <div class="formula-nav__actions" data-nav-actions>
    {% if section.settings.quiz_label != blank %}<a href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}" class="formula-nav__quiz">{{ section.settings.quiz_label | escape }}</a>{% endif %}
    {%- if search_style == 'expandable' -%}
      <div class="formula-nav__search" data-nav-search data-search-mode="expandable" style="--formula-search-width: {{ section.settings.search_box_width | default: 240 }}px" data-search-result-count="{{ section.settings.search_result_count | default: 5 }}" data-search-show-price="{{ section.settings.search_show_price | default: true }}">
        <button type="button" class="formula-nav__search-toggle" aria-label="Ara" aria-expanded="false" data-nav-search-toggle>${navIconSvg("search")}</button>
        <form action="/search" method="get" class="formula-nav__search-form" data-nav-search-form>
          <input type="search" name="q" placeholder="{{ section.settings.search_placeholder | default: 'Ara…' | escape }}" class="formula-nav__search-input" aria-label="Arama sorgusu" autocomplete="off" />
          <button type="button" class="formula-nav__search-close" aria-label="Aramayı kapat" data-nav-search-close>${navIconSvg("close")}</button>
        </form>
        <div class="formula-nav__search-results" data-nav-search-results></div>
      </div>
    {%- elsif search_style == 'modal' -%}
      <button type="button" class="formula-nav__search-toggle" aria-label="Ara" aria-expanded="false" data-nav-search-modal-toggle>${navIconSvg("search")}</button>
    {%- elsif search_style == 'bar' -%}
    {%- else -%}
      <a href="/search" aria-label="Ara">${navIconSvg("search")}</a>
    {%- endif -%}
    {% if section.settings.show_wishlist %}<a href="/account#favorites" aria-label="Favorilerim">${navIconSvg("heart")}</a>{% endif %}
    <a href="/account" aria-label="Hesabım">${navIconSvg("account")}</a>
    <a href="/cart" aria-label="Sepet" data-cart-open-mode="{{ section.settings.cart_open_mode | default: 'page' }}">${navIconSvg("cart")}</a>
  </div>
  {%- if search_style == 'modal' -%}
    <div class="formula-nav__search-modal-backdrop" data-nav-search-backdrop></div>
    <div class="formula-nav__search formula-nav__search--modal" data-nav-search data-search-mode="modal" style="--formula-search-width: {{ section.settings.search_box_width | default: 240 }}px" data-search-result-count="{{ section.settings.search_result_count | default: 5 }}" data-search-show-price="{{ section.settings.search_show_price | default: true }}" aria-hidden="true">
      <div class="formula-nav__search-modal-box">
        <div class="formula-nav__search-modal-row">
          <span class="formula-nav__search-modal-icon">${navIconSvg("search")}</span>
          <input type="search" name="q" placeholder="{{ section.settings.search_placeholder | default: 'Ara…' | escape }}" class="formula-nav__search-input" aria-label="Arama sorgusu" autocomplete="off" />
          <button type="button" class="formula-nav__search-close" aria-label="Aramayı kapat" data-nav-search-close>${navIconSvg("close")}</button>
        </div>
        <div class="formula-nav__search-results" data-nav-search-results></div>
      </div>
    </div>
  {%- endif -%}
  <div class="formula-nav__mobile-backdrop" data-nav-mobile-backdrop></div>
  <div class="formula-nav__mobile-drawer" data-nav-mobile-drawer aria-hidden="true">
    <div class="formula-nav__mobile-drawer-head">
      <a class="formula-nav__logo" href="/">
        {% if settings.logo != blank %}
          <img src="{{ settings.logo | img_url: '120x' }}" alt="{{ section.settings.logo_text | default: shop.name | escape }}" style="height:32px;width:auto;display:block" />
        {% else %}
          {{ section.settings.logo_text | default: shop.name | escape }}
        {% endif %}
      </a>
      <button type="button" class="formula-nav__search-close" aria-label="Menüyü kapat" data-nav-mobile-close>${navIconSvg("close")}</button>
    </div>
    <nav class="formula-nav__mobile-links">
      {% for block in section.blocks %}
        {% if block.type == "menu_item" %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
          {% for child in block.blocks %}
            {% if child.type == "submenu_item" %}<a class="formula-nav__mobile-sublink" href="{{ child.settings.url | escape }}">{{ child.settings.label | escape }}</a>{% endif %}
          {% endfor %}
        {% endif %}
      {% endfor %}
    </nav>
    <div class="formula-nav__mobile-drawer-foot">
      {% if section.settings.show_wishlist %}<a href="/account#favorites">${navIconSvg("heart")}<span>Favorilerim</span></a>{% endif %}
      <a href="/account">${navIconSvg("account")}<span>Hesabım</span></a>
      <a href="/cart">${navIconSvg("cart")}<span>Sepetim</span></a>
    </div>
  </div>
  <script>
    (function () {
      var navSection = document.currentScript.closest(".formula-nav");
      if (!navSection) return;
      var mToggle = navSection.querySelector("[data-nav-mobile-toggle]");
      var mDrawer = navSection.querySelector("[data-nav-mobile-drawer]");
      var mBackdrop = navSection.querySelector("[data-nav-mobile-backdrop]");
      var mClose = navSection.querySelector("[data-nav-mobile-close]");
      if (mToggle && mDrawer) {
        var closeMenu = function () {
          mDrawer.classList.remove("is-open");
          mDrawer.setAttribute("aria-hidden", "true");
          if (mBackdrop) mBackdrop.classList.remove("is-open");
          mToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("formula-mobile-menu-open");
        };
        var openMenu = function () {
          mDrawer.classList.add("is-open");
          mDrawer.setAttribute("aria-hidden", "false");
          if (mBackdrop) mBackdrop.classList.add("is-open");
          mToggle.setAttribute("aria-expanded", "true");
          document.body.classList.add("formula-mobile-menu-open");
        };
        mToggle.addEventListener("click", function (e) {
          e.stopPropagation();
          if (mDrawer.classList.contains("is-open")) { closeMenu(); } else { openMenu(); }
        });
        if (mClose) mClose.addEventListener("click", closeMenu);
        if (mBackdrop) mBackdrop.addEventListener("click", closeMenu);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
      }
    })();
  </script>
  {%- if search_style != 'icon' -%}
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-nav");
      if (!root) return;
      var wrap = root.querySelector("[data-nav-search]");
      if (!wrap) return;
      var mode = wrap.getAttribute("data-search-mode");
      var input = wrap.querySelector("input");
      var resultsEl = wrap.querySelector("[data-nav-search-results]");
      var closeBtn = wrap.querySelector("[data-nav-search-close]");
      function escapeHtml(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }
      function formatMoney(n) {
        try { return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(n) || 0); }
        catch (e) { return "₺" + n; }
      }
      function clearResults() {
        if (resultsEl) resultsEl.innerHTML = "";
        wrap.classList.remove("has-results");
      }
      // Eşzamanlı (typeahead) arama — TÜM modlarda aynı: /search.json GERÇEK
      // ürün sonuçlarını (title/description substring, main-search ile AYNI
      // sorgu) döner.
      var debounceTimer = null;
      var lastRequestedQuery = "";
      var resultCount = Math.max(1, Number(wrap.getAttribute("data-search-result-count")) || 5);
      var showPrice = wrap.getAttribute("data-search-show-price") !== "false";
      if (input && resultsEl) {
        input.addEventListener("input", function () {
          var q = input.value.trim();
          if (debounceTimer) clearTimeout(debounceTimer);
          if (q.length < 2) { clearResults(); return; }
          debounceTimer = setTimeout(function () {
            lastRequestedQuery = q;
            fetch("/search.json?q=" + encodeURIComponent(q) + "&limit=" + resultCount)
              .then(function (r) { return r.json(); })
              .then(function (data) {
                if (lastRequestedQuery !== q || input.value.trim() !== q) return;
                var items = data.results || [];
                if (!items.length) {
                  resultsEl.innerHTML = '<div class="formula-nav__search-empty">Sonuç bulunamadı</div>';
                  wrap.classList.add("has-results");
                  return;
                }
                var viewAllHref = "/search?q=" + encodeURIComponent(q);
                resultsEl.innerHTML = items.map(function (p) {
                  var imgUrl = escapeHtml(p.featured_image || "");
                  var img = imgUrl
                    ? '<img src="' + imgUrl + '" alt="" />'
                    : '<span class="formula-nav__search-result-placeholder"></span>';
                  var priceHtml = showPrice ? '<span class="formula-nav__search-result-price">' + formatMoney(p.price) + '</span>' : '';
                  return '<a class="formula-nav__search-result" href="' + escapeHtml(p.url || "#") + '">' + img +
                    '<span><span class="formula-nav__search-result-title">' + escapeHtml(p.title) + '</span>' +
                    priceHtml + '</span></a>';
                }).join("") + '<a class="formula-nav__search-viewall" href="' + escapeHtml(viewAllHref) + '">Tüm sonuçları gör →</a>';
                wrap.classList.add("has-results");
              })
              .catch(function () { /* sessiz — Enter'la tam /search sayfasına her zaman gidilebilir */ });
          }, 250);
        });
      }
      if (mode === "expandable") {
        var actionsRow = root.querySelector("[data-nav-actions]");
        var toggle = wrap.querySelector("[data-nav-search-toggle]");
        var form = wrap.querySelector("[data-nav-search-form]");
        if (!toggle || !form) return;
        function close() {
          wrap.classList.remove("is-open");
          if (actionsRow) actionsRow.classList.remove("formula-nav__actions--search-open");
          toggle.setAttribute("aria-expanded", "false");
          clearResults();
        }
        toggle.addEventListener("click", function (e) {
          e.stopPropagation();
          var open = wrap.classList.toggle("is-open");
          if (actionsRow) actionsRow.classList.toggle("formula-nav__actions--search-open", open);
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) { if (input) input.focus(); } else { clearResults(); }
        });
        if (closeBtn) closeBtn.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); close(); });
        form.addEventListener("click", function (e) { e.stopPropagation(); });
        document.addEventListener("click", close);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      } else if (mode === "modal") {
        var toggle2 = root.querySelector("[data-nav-search-modal-toggle]");
        var backdrop = root.querySelector("[data-nav-search-backdrop]");
        if (!toggle2) return;
        function closeModal() {
          wrap.classList.remove("is-open");
          wrap.setAttribute("aria-hidden", "true");
          if (backdrop) backdrop.classList.remove("is-open");
          toggle2.setAttribute("aria-expanded", "false");
          clearResults();
          document.body.classList.remove("formula-search-modal-open");
        }
        function openModal() {
          wrap.classList.add("is-open");
          wrap.setAttribute("aria-hidden", "false");
          if (backdrop) backdrop.classList.add("is-open");
          toggle2.setAttribute("aria-expanded", "true");
          document.body.classList.add("formula-search-modal-open");
          if (input) input.focus();
        }
        toggle2.addEventListener("click", function (e) {
          e.stopPropagation();
          if (wrap.classList.contains("is-open")) { closeModal(); } else { openModal(); }
        });
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        if (backdrop) backdrop.addEventListener("click", closeModal);
        wrap.addEventListener("click", function (e) { e.stopPropagation(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
      }
    })();
  </script>
  {%- endif -%}
</section>

{% schema %}
{
  "name": "Formula Navigasyon — Ortalı",
  "settings": [
    { "type": "text", "id": "logo_text", "label": "Logo Metni", "default": "",
      "info": "Sadece Tema Ayarları'nda bir Logo görseli SEÇİLMEMİŞSE kullanılır." },
    { "type": "text", "id": "quiz_label", "label": "Analiz Buton Metni", "default": "Cilt Analizi" },
    { "type": "url", "id": "quiz_url", "label": "Analiz Bağlantısı", "default": "/pages/cilt-analizi" },
    { "type": "select", "id": "cart_open_mode", "label": "Sepet Açılış Şekli", "default": "page",
      "info": "Sepet ikonuna tıklanınca ne olacağını belirler.",
      "options": [
        { "label": "Direkt Sepet Sayfası", "value": "page" },
        { "label": "Yandan Aç (Panel)", "value": "drawer" },
        { "label": "Üstten Aç (Panel)", "value": "top" }
      ]
    },
    { "type": "select", "id": "search_style", "label": "Arama Şekli", "default": "icon",
      "info": "Arama ikonuna tıklanınca ne olacağını belirler.",
      "options": [
        { "label": "Arama Sayfasına Git", "value": "icon" },
        { "label": "Açılır Kutu (Sağda, header içinde)", "value": "expandable" },
        { "label": "Ortada Açılır Pencere", "value": "modal" },
        { "label": "Ortada Her Zaman Görünür Çubuk", "value": "bar" }
      ]
    },
    { "type": "text", "id": "search_placeholder", "label": "Arama Kutusu Yer Tutucu Metni", "default": "Ara…",
      "info": "Yalnızca Açılır Kutu seçiliyken görünür." },
    { "type": "range", "id": "search_result_count", "label": "Eşzamanlı Sonuç Sayısı", "min": 3, "max": 10, "step": 1, "default": 5,
      "info": "Yazarken anında gösterilecek maksimum ürün sayısı." },
    { "type": "range", "id": "search_box_width", "label": "Kutu Genişliği (px)", "min": 160, "max": 360, "step": 10, "default": 240 },
    { "type": "checkbox", "id": "search_show_price", "label": "Sonuçlarda Fiyat Göster", "default": true },
    { "type": "checkbox", "id": "sticky_header", "label": "Kaydırınca Header Sabit Kalsın", "default": false,
      "info": "Açıkken sayfa aşağı kaydırılsa da header ekranın üstünde sabit kalır." },
    { "type": "checkbox", "id": "show_wishlist", "label": "Favoriler İkonu Göster", "default": true }
  ],
  "blocks": [
    {
      "type": "menu_item",
      "name": "Menü Öğesi",
      "settings": [
        { "type": "text", "id": "label", "label": "Metin", "default": "Yüz Bakımı" },
        { "type": "url", "id": "url", "label": "URL", "default": "/collection" }
      ],
      "blocks": [
        {
          "type": "submenu_item",
          "name": "Alt Menü Öğesi",
          "settings": [
            { "type": "text", "id": "label", "label": "Metin", "default": "Alt Kategori" },
            { "type": "url", "id": "url", "label": "URL", "default": "/collection" }
          ]
        }
      ]
    }
  ],
  "presets": [{
    "name": "Formula Navigasyon — Ortalı",
    "blocks": [
      { "type": "menu_item", "settings": { "label": "Yüz Bakımı", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Vücut & Saç", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Kaygıya Göre", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Tüm Ürünler", "url": "/products" } }
    ]
  }]
}
{% endschema %}`;

// 2026-08-24 — Formula tema genişletmesi. Üç görsel varyant (split/overlay/
// centered) TEK section dosyasında bir "layout_style" ayarıyla dallanıyor —
// hero'nun ei-engine'de rolü yok (bkz. sectionDesigns.ts başlık yorumu),
// role-tabanlı section.swapDesign mekanizması bu yüzden kullanılamıyor;
// Shopify temalarının da yaygın deseni budur (ayrı dosya yerine section
// içi "style" ayarı). Split = mevcut varsayılan davranış (BİREBİR korundu,
// mevcut projelerde görsel değişiklik YOK). Overlay = tam-genişlik görsel +
// üzerine bindirilmiş metin (kampanya/lansman için). Centered = görselsiz,
// ortalanmış metin+CTA (duyuru/kampanya band'i için, düz veya gradyan zemin).
export const FORMULA_HERO = `<section class="formula-hero{% if section.settings.layout_style == 'overlay' %} formula-hero--overlay{% elsif section.settings.layout_style == 'centered' %} formula-hero--centered{% endif %}{% if section.settings.image_side == 'right' and section.settings.layout_style == 'split' %} formula-hero--reverse{% endif %}${revealAnimationClass()}" style="{% if section.settings.bg_color != blank %}background:{{ section.settings.bg_color }};{% endif %}{% if section.settings.min_height %}min-height:{{ section.settings.min_height }}px;{% endif %}">
  <div class="formula-hero__copy" style="{% if section.settings.text_color != blank %}color:{{ section.settings.text_color }};{% endif %}text-align:{{ section.settings.content_align | default: 'left' }}">
    {% if section.settings.eyebrow != blank %}<p class="formula-hero__eyebrow"{% if section.settings.eyebrow_color != blank %} style="color:{{ section.settings.eyebrow_color }}"{% endif %}>{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h1 class="formula-hero__title">{{ section.settings.title | escape }}</h1>{% endif %}
    {% if section.settings.subtitle != blank %}<p class="formula-hero__sub">{{ section.settings.subtitle | escape }}</p>{% endif %}
    <div class="formula-hero__actions" style="justify-content:{% if section.settings.content_align == 'center' %}center{% else %}flex-start{% endif %}">
      {% if section.settings.cta_label != blank %}<a class="formula-btn formula-btn--solid" href="{{ section.settings.cta_url | default: '/products' | escape }}">{{ section.settings.cta_label | escape }}</a>{% endif %}
      {% if section.settings.quiz_label != blank %}<a class="formula-btn formula-btn--ghost" href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}">{{ section.settings.quiz_label | escape }}</a>{% endif %}
    </div>
  </div>
  {% unless section.settings.layout_style == 'centered' %}
  <div class="formula-hero__media">
    {% if section.settings.image != blank %}
      <picture>
        {% if section.settings.mobile_image != blank %}<source media="(max-width: 767px)" srcset="{{ section.settings.mobile_image | img_url: '900x' }}" />{% endif %}
        <img src="{{ section.settings.image | img_url: '1200x' }}" alt="{{ section.settings.title | escape }}" loading="eager" style="object-position: {{ section.settings.image_position | default: 'center' }};${imageEffectStyle("section.settings")}" />
      </picture>
    {% else %}
      <div class="formula-hero__placeholder" aria-hidden="true"></div>
    {% endif %}
    {% if section.settings.layout_style == 'overlay' %}
      <div class="formula-hero__scrim" style="background:linear-gradient(to top, rgba(0,0,0,{{ section.settings.overlay_opacity | default: 45 | divided_by: 100.0 }}), rgba(0,0,0,0) 60%);"></div>
    {% endif %}
    ${imageEffectOverlay("section.settings")}
  </div>
  {% endunless %}
</section>

{% schema %}
{
  "name": "Formula Hero",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Görünüm", "default": "split",
      "options": [
        { "label": "Bölünmüş (görsel + metin)", "value": "split" },
        { "label": "Tam genişlik görsel + metin üstte", "value": "overlay" },
        { "label": "Ortalanmış metin (görselsiz)", "value": "centered" }
      ]
    },
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket", "default": "Az bileşen, yüksek standart" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Cildin ne istiyorsa, sadece o." },
    { "type": "textarea", "id": "subtitle", "label": "Alt Metin", "default": "Şeffaf formüller, kanıtlanmış aktifler. Her ürünün etiketinde ne olduğunu, neden orada olduğunu görürsün." },
    { "type": "text", "id": "cta_label", "label": "Ana Buton Metni", "default": "Ürünleri Keşfet" },
    { "type": "url", "id": "cta_url", "label": "Ana Buton URL", "default": "/products" },
    { "type": "text", "id": "quiz_label", "label": "İkincil Buton Metni", "default": "Cildini Tanı →" },
    { "type": "url", "id": "quiz_url", "label": "İkincil Buton URL", "default": "/pages/cilt-analizi" },
    { "type": "header", "id": "hero_media", "label": "Görsel (Bölünmüş / Tam genişlik)" },
    { "type": "image_picker", "id": "image", "label": "Görsel" },
    { "type": "image_picker", "id": "mobile_image", "label": "Mobil Görsel (ops.)",
      "info": "Sadece telefon genişliğinde bu görsel kullanılır — boş bırakılırsa masaüstü görseli küçültülerek gösterilir." },
    { "type": "select", "id": "image_position", "label": "Görsel Konumu (kırpma odağı)", "default": "center",
      "options": [
        { "label": "Orta", "value": "center" },
        { "label": "Üst", "value": "top" },
        { "label": "Alt", "value": "bottom" },
        { "label": "Sol", "value": "left" },
        { "label": "Sağ", "value": "right" }
      ]
    },
    { "type": "select", "id": "image_side", "label": "Görsel Yönü (yalnız Bölünmüş)", "default": "right",
      "options": [ { "label": "Sağda", "value": "right" }, { "label": "Solda", "value": "left" } ]
    },
    { "type": "range", "id": "overlay_opacity", "label": "Karartma yoğunluğu (yalnız Tam genişlik)", "min": 0, "max": 80, "step": 5, "default": 45 },
    { "type": "header", "id": "hero_layout", "label": "Yerleşim ve Renk" },
    { "type": "select", "id": "content_align", "label": "Metin hizası", "default": "left",
      "options": [ { "label": "Sol", "value": "left" }, { "label": "Orta", "value": "center" } ]
    },
    { "type": "range", "id": "min_height", "label": "Minimum yükseklik (px)", "min": 320, "max": 900, "step": 20, "default": 560 },
    { "type": "color", "id": "bg_color", "label": "Arka plan (boş = tema rengi)" },
    { "type": "color", "id": "text_color", "label": "Metin rengi (boş = tema rengi)" },
    { "type": "color", "id": "eyebrow_color", "label": "Üst etiket rengi (boş = vurgu rengi)" },${imageEffectSchemaFields()},${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Hero" }]
}
{% endschema %}`;

export const FORMULA_QUIZ_BANNER = `<section class="formula-quiz${revealAnimationClass()}">
  {% if section.settings.title != blank %}<p class="formula-quiz__title">{{ section.settings.title | escape }}</p>{% endif %}
  <p class="formula-quiz__sub">{{ section.settings.subtitle | default: "60 saniyelik analizle sana özel 3 ürünlük rutini çıkaralım." | escape }}</p>
  <a class="formula-btn formula-btn--invert" href="{{ section.settings.url | default: '/pages/cilt-analizi' | escape }}">{{ section.settings.cta_label | default: "Analize Başla" | escape }}</a>
</section>

{% schema %}
{
  "name": "Formula Analiz Bandı",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Cildin için hangi aktifler işe yarar, bilmiyor musun?" },
    { "type": "text", "id": "subtitle", "label": "Alt Metin", "default": "60 saniyelik analizle sana özel 3 ürünlük rutini çıkaralım." },
    { "type": "text", "id": "cta_label", "label": "Buton Metni", "default": "Analize Başla" },
    { "type": "url", "id": "url", "label": "Buton URL", "default": "/pages/cilt-analizi" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Analiz Bandı" }]
}
{% endschema %}`;

export const FORMULA_BESTSELLERS = `<section class="formula-bestsellers{% if section.settings.layout_style == 'carousel' %} formula-bestsellers--carousel{% elsif section.settings.layout_style == 'featured' %} formula-bestsellers--featured{% endif %}${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
    <a href="{{ section.settings.view_all_url | default: '/products' | escape }}">{{ section.settings.view_all_label | default: "Tümünü Gör" | escape }}</a>
  </div>
  <div class="formula-bestsellers__grid">
    {% for block in section.blocks %}
      {% if block.type == "product" %}
        <a class="formula-product-card" href="{{ block.settings.url | default: '#' | escape }}">
          <div class="formula-product-card__media">
            {% if block.settings.image != blank %}
              <img src="{{ block.settings.image | img_url: '700x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" />
            {% else %}
              <div class="formula-product-card__placeholder" aria-hidden="true"></div>
            {% endif %}
            {% if block.settings.badge != blank %}<span class="formula-badge">{{ block.settings.badge | escape }}</span>{% endif %}
          </div>
          {% if block.settings.active != blank %}<p class="formula-product-card__active">{{ block.settings.active | escape }}</p>{% endif %}
          <p class="formula-product-card__name">{{ block.settings.name | default: "Ürün" | escape }}</p>
          <p class="formula-product-card__price">{{ block.settings.price | default: "—" | escape }}</p>
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Çok Satanlar",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid", "options": [{"label":"Grid","value":"grid"},{"label":"Carousel","value":"carousel"},{"label":"Öne çıkan","value":"featured"}] },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Çok satanlar" },
    { "type": "text", "id": "view_all_label", "label": "Tümünü Gör Metni", "default": "Tümünü Gör" },
    { "type": "url", "id": "view_all_url", "label": "Tümünü Gör URL", "default": "/products" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "product",
      "name": "Ürün",
      "settings": [
        { "type": "text", "id": "name", "label": "Ürün Adı", "default": "Niasinamid Serum" },
        { "type": "text", "id": "active", "label": "Aktif İçerik Etiketi", "default": "%10 Niasinamid" },
        { "type": "text", "id": "price", "label": "Fiyat", "default": "₺349" },
        { "type": "text", "id": "badge", "label": "Rozet (ops.)", "default": "" },
        { "type": "url", "id": "url", "label": "Ürün URL", "default": "#" },
        { "type": "image_picker", "id": "image", "label": "Görsel" }
      ]
    }
  ],
  "max_blocks": 12,
  "presets": [{
    "name": "Formula Çok Satanlar",
    "blocks": [
      { "type": "product", "settings": { "name": "Niasinamid Serum", "active": "%10 Niasinamid", "price": "₺349", "badge": "Çok Satan" } },
      { "type": "product", "settings": { "name": "Hyalüronik Asit Serum", "active": "%2 Hyalüronik Asit", "price": "₺389", "badge": "" } },
      { "type": "product", "settings": { "name": "Nazik Temizleyici Jel", "active": "pH 5.5", "price": "₺249", "badge": "Yeni" } },
      { "type": "product", "settings": { "name": "SPF 50 Güneş Bakımı", "active": "Geniş Spektrum", "price": "₺299", "badge": "" } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_CONCERNS = `<section class="formula-concerns${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  <div class="formula-concerns__grid">
    {% for block in section.blocks %}
      {% if block.type == "concern" %}
        <a class="formula-concern-card" href="{{ block.settings.url | default: '#' | escape }}">
          <span class="formula-concern-card__icon" aria-hidden="true">{{ block.settings.icon | default: "◆" | escape }}</span>
          <span class="formula-concern-card__label">{{ block.settings.label | default: "Kaygı" | escape }}</span>
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Kaygıya Göre",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Kaygına göre keşfet" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "concern",
      "name": "Kaygı",
      "settings": [
        { "type": "text", "id": "label", "label": "Etiket", "default": "Kuruluk" },
        { "type": "text", "id": "icon", "label": "Glif", "default": "◆" },
        { "type": "url", "id": "url", "label": "URL", "default": "/collection" }
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [{
    "name": "Formula Kaygıya Göre",
    "blocks": [
      { "type": "concern", "settings": { "label": "Kuruluk", "icon": "◆" } },
      { "type": "concern", "settings": { "label": "Kızarıklık", "icon": "●" } },
      { "type": "concern", "settings": { "label": "Yaşlanma Belirtileri", "icon": "▲" } },
      { "type": "concern", "settings": { "label": "Lekeler", "icon": "◇" } },
      { "type": "concern", "settings": { "label": "Gözenekler", "icon": "○" } },
      { "type": "concern", "settings": { "label": "Donuk Görünüm", "icon": "△" } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_PHILOSOPHY = `<section class="formula-philosophy${revealAnimationClass()}">
  <p class="formula-philosophy__statement">{{ section.settings.statement | default: "Az bileşen. Kanıtlanmış aktifler. Her zaman şeffaf." | escape }}</p>
  <div class="formula-philosophy__grid">
    {% for block in section.blocks %}
      {% if block.type == "value" %}
        <div class="formula-value">
          <span class="formula-value__icon" aria-hidden="true">{{ block.settings.icon | default: "✓" | escape }}</span>
          <p class="formula-value__title">{{ block.settings.title | default: "Değer" | escape }}</p>
          <p class="formula-value__text">{{ block.settings.text | escape }}</p>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Felsefe",
  "settings": [
    { "type": "textarea", "id": "statement", "label": "Ana Cümle", "default": "Az bileşen. Kanıtlanmış aktifler. Her zaman şeffaf." },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "value",
      "name": "Değer",
      "settings": [
        { "type": "text", "id": "icon", "label": "Glif", "default": "✓" },
        { "type": "text", "id": "title", "label": "Başlık", "default": "Vegan" },
        { "type": "text", "id": "text", "label": "Açıklama", "default": "Hiçbir üründe hayvansal içerik yok." }
      ]
    }
  ],
  "max_blocks": 4,
  "presets": [{
    "name": "Formula Felsefe",
    "blocks": [
      { "type": "value", "settings": { "icon": "✓", "title": "Vegan", "text": "Hiçbir üründe hayvansal içerik yok." } },
      { "type": "value", "settings": { "icon": "◆", "title": "Dermatolojik Test", "text": "Tüm formüller bağımsız laboratuvarda test edilir." } },
      { "type": "value", "settings": { "icon": "○", "title": "Şeffaf Etiket", "text": "Her aktifin oranını ambalajda görürsün." } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_FOOTER_MENU = `<section class="formula-footer">
  <div class="formula-footer__top">
    <div class="formula-footer__brand">
      {% if section.settings.show_logo %}
        <p class="formula-footer__logo">
          {% if settings.logo != blank %}
            <img src="{{ settings.logo | img_url: '160x' }}" alt="{{ shop.name | escape }}" style="height:{{ settings.logo_width | default: 40 }}px;width:auto;display:block" />
          {% else %}
            {{ shop.name | escape }}
          {% endif %}
        </p>
      {% endif %}
      <p class="formula-footer__blurb">{{ section.settings.blurb | default: "Az bileşen, yüksek standart. Cilt bakımını şeffaf ve anlaşılır yapıyoruz." | escape }}</p>
      {%- comment -%}
        2026-08-23 — 20.08-revizeler.md madde 2: sosyal ikonlar satırı EKLENDİ
        (mevcut menu_item/nav yapısına DOKUNULMADI — geriye dönük uyumlu,
        var olan footer'lar hiç etkilenmez, yeni block tipi opsiyonel).
        Hiç social_link block'u yoksa for döngüsü hiç iterasyon yapmaz, div
        boş kalır (display:flex + çocuksuz = 0 yükseklik, zararsız) — bir
        "var mı" kontrolüyle sarmalamaya GEREK YOK; ayrıca bu motorda for
        içindeki {% assign %} döngü dışına hiç sızmıyor (bkz.
        reference-ei-engine-liquid-scoping-gotchas), o yaklaşım denendi ve
        gerçek render testinde SESSİZCE render OLMADIĞI görüldü.
      {%- endcomment -%}
      <div class="formula-footer__social">
        {% for block in section.blocks %}
          {% if block.type == "social_link" and block.settings.url != blank %}
            <a href="{{ block.settings.url | escape }}" target="_blank" rel="noopener" aria-label="{{ block.settings.platform | default: 'Sosyal medya' | escape }}" title="{{ block.settings.platform | default: 'Sosyal medya' | escape }}">${FORMULA_SOCIAL_ICON_CASE}</a>
          {% endif %}
        {% endfor %}
      </div>
    </div>
    <nav class="formula-footer__links">
      {% for block in section.blocks %}
        {% if block.type == "menu_item" %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
        {% endif %}
      {% endfor %}
    </nav>
    {%- comment -%}
      Çok sütunlu footer (opsiyonel) — "link_column" block'u başlık +
      kendi içine gömülü "link" bloklarıyla ayrı bir grup oluşturur, düz
      "menu_item" listesinin YANINA eklenir, onu DEĞİŞTİRMEZ.
    {%- endcomment -%}
    {% for block in section.blocks %}
      {% if block.type == "link_column" %}
        <div class="formula-footer__column">
          {% if block.settings.title != blank %}<p class="formula-footer__column-title">{{ block.settings.title | escape }}</p>{% endif %}
          <nav class="formula-footer__column-links">
            {% for link in block.blocks %}
              {% if link.type == "link" %}<a href="{{ link.settings.url | escape }}">{{ link.settings.label | escape }}</a>{% endif %}
            {% endfor %}
          </nav>
        </div>
      {% endif %}
    {% endfor %}
  </div>
  <p class="formula-footer__copy">&copy; {{ "now" | date: "%Y" }} {{ shop.name | escape }}. {{ section.settings.copyright_text | default: "Tüm hakları saklıdır." | escape }}</p>
</section>

{% schema %}
{
  "name": "Formula Footer",
  "settings": [
    { "type": "checkbox", "id": "show_logo", "label": "Logoyu Göster", "default": true,
      "info": "Tema Ayarları'ndaki Logo görselini kullanır (varsa) — burada ayrı bir logo metni/görseli YOK, sadece aç/kapat." },
    { "type": "textarea", "id": "blurb", "label": "Marka Açıklaması", "default": "Az bileşen, yüksek standart. Cilt bakımını şeffaf ve anlaşılır yapıyoruz." },
    { "type": "text", "id": "copyright_text", "label": "Telif Metni", "default": "Tüm hakları saklıdır.",
      "info": "Yıl ve mağaza adı otomatik eklenir (ör. © 2026 Formula), burada sadece sondaki ibareyi değiştirirsin." }
  ],
  "blocks": [
    {
      "type": "menu_item",
      "name": "Menü Öğesi",
      "settings": [
        { "type": "text", "id": "label", "label": "Metin", "default": "Sayfa" },
        { "type": "url", "id": "url", "label": "URL", "default": "/" }
      ]
    },
    {
      "type": "social_link",
      "name": "Sosyal Medya İkonu",
      "settings": [
        { "type": "select", "id": "platform", "label": "Platform", "default": "Instagram",
          "options": [
            { "label": "Instagram", "value": "Instagram" },
            { "label": "Facebook", "value": "Facebook" },
            { "label": "TikTok", "value": "TikTok" },
            { "label": "YouTube", "value": "YouTube" },
            { "label": "X (Twitter)", "value": "X" },
            { "label": "Pinterest", "value": "Pinterest" },
            { "label": "WhatsApp", "value": "WhatsApp" }
          ]
        },
        { "type": "url", "id": "url", "label": "Profil URL", "default": "" }
      ]
    },
    {
      "type": "link_column",
      "name": "Bağlantı Sütunu",
      "settings": [
        { "type": "text", "id": "title", "label": "Sütun Başlığı", "default": "Kurumsal" }
      ],
      "blocks": [
        {
          "type": "link",
          "name": "Bağlantı",
          "settings": [
            { "type": "text", "id": "label", "label": "Metin", "default": "Sayfa" },
            { "type": "url", "id": "url", "label": "URL", "default": "/" }
          ]
        }
      ]
    }
  ],
  "presets": [{
    "name": "Formula Footer",
    "blocks": [
      { "type": "menu_item", "settings": { "label": "Tüm Ürünler", "url": "/products" } },
      { "type": "menu_item", "settings": { "label": "Kategoriler", "url": "/collection" } },
      { "type": "menu_item", "settings": { "label": "Hesabım", "url": "/account" } },
      { "type": "menu_item", "settings": { "label": "Siparişlerim", "url": "/account/orders" } }
    ]
  }]
}
{% endschema %}`;


// ─── Kütüphane section'ları (2026-08-17) ───────────────────────────────────
// Formula'yı zenginleştiren, sayfaya ZORLA eklenmeyen (opsiyonel) 4 yeni
// section — `AddSectionPanel`'de her zaman teklif edilirler (bkz.
// `FORMULA_LIBRARY_SECTIONS`, `StudioShell.tsx`'in `addCatalog`'u). Diğer
// Formula section'larıyla AYNI kural: manuel blok-tabanlı içerik (canlı
// connector/collection verisine bağlı DEĞİL) — `FORMULA_BESTSELLERS`/
// `FORMULA_CONCERNS` ile aynı editoryal desen.

export const FORMULA_ANNOUNCEMENT_BAR = `<section class="formula-announcement">
  <p class="formula-announcement__text">
    {% if section.settings.link != blank %}
      <a href="{{ section.settings.link | escape }}">{{ section.settings.text | default: "Tüm siparişlerde ücretsiz kargo" | escape }}</a>
    {% else %}
      {{ section.settings.text | default: "Tüm siparişlerde ücretsiz kargo" | escape }}
    {% endif %}
  </p>
  {% if section.settings.dismissible %}
    <button type="button" class="formula-announcement__close" aria-label="Kapat" onclick="this.closest('.formula-announcement').style.display='none'">✕</button>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula Duyuru Çubuğu",
  "settings": [
    { "type": "text", "id": "text", "label": "Metin", "default": "Tüm siparişlerde ücretsiz kargo" },
    { "type": "url", "id": "link", "label": "Bağlantı (ops.)", "default": "" },
    { "type": "checkbox", "id": "dismissible", "label": "Kapatılabilir", "default": true }
  ],
  "presets": [{ "name": "Formula Duyuru Çubuğu" }]
}
{% endschema %}`;

export const FORMULA_MARQUEE = `<section class="formula-marquee${revealAnimationClass()}" style="{% if section.settings.bg_color != blank %}background:{{ section.settings.bg_color }};{% endif %}{% if section.settings.text_color != blank %}--color-text:{{ section.settings.text_color }};{% endif %}">
  <div class="formula-marquee__track" style="animation-duration: {{ section.settings.speed | default: 28 }}s;">
    <div class="formula-marquee__group">
      {% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}
      {% if section.blocks.size <= 6 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 3 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 2 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 1 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 1 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
    </div>
    <div class="formula-marquee__group" aria-hidden="true">
      {% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}
      {% if section.blocks.size <= 6 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 3 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 2 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 1 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
      {% if section.blocks.size <= 1 %}{% for block in section.blocks %}{% if block.type == "phrase" %}<span class="formula-marquee__item">{{ block.settings.text | default: "Şeffaf Formüller" | escape }}</span><span class="formula-marquee__dot" aria-hidden="true">✦</span>{% endif %}{% endfor %}{% endif %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Formula Kayan Yazı",
  "settings": [
    { "type": "range", "id": "speed", "label": "Hız (sn)", "min": 10, "max": 60, "step": 2, "default": 28 },
    { "type": "color", "id": "bg_color", "label": "Arka Plan Rengi", "default": "",
      "info": "Boş bırakılırsa temanın varsayılan yüzey rengi kullanılır." },
    { "type": "color", "id": "text_color", "label": "Metin Rengi", "default": "",
      "info": "Boş bırakılırsa temanın varsayılan metin rengi kullanılır." },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "phrase",
      "name": "İfade",
      "settings": [
        { "type": "text", "id": "text", "label": "Metin", "default": "Şeffaf Formüller" }
      ]
    }
  ],
  "max_blocks": 10,
  "presets": [{
    "name": "Formula Kayan Yazı",
    "blocks": [
      { "type": "phrase", "settings": { "text": "Şeffaf Formüller" } },
      { "type": "phrase", "settings": { "text": "Dermatolojik Test" } },
      { "type": "phrase", "settings": { "text": "Vegan & Kruelti-Free" } },
      { "type": "phrase", "settings": { "text": "Ücretsiz Kargo" } }
    ]
  }]
}
{% endschema %}`;

/**
 * 2026-08-18 düzeltme — kullanıcı raporu: kart linki genel `LinkPicker`
 * (Ürün/Koleksiyon/Sayfa/Harici URL, "url" şema tipi) kullanıyordu, "sadece
 * koleksiyon olmalı" dendi; görsel/isim/açıklama da manuel giriliyordu,
 * "backendden çeksin" dendi. Artık blok başına TEK alan var:
 * `{ "type": "collection" }` (`CollectionRefPicker.tsx` — gerçek arama
 * sonucundan seçim anında çözülmüş `id/title/description/image/url`
 * nesnesi), manuel görsel/isim/URL alanı YOK. Ürüne bağlı link isteyen
 * kullanıcılar için ayrı, esnek bir "Genel Vitrin" section'ı var (bkz.
 * `FORMULA_GENERAL_SHOWCASE`) — bu section BİLİNÇLİ olarak koleksiyona kilitli
 * kalıyor.
 */
export const FORMULA_COLLECTION_LIST = `<section class="formula-collection-list formula-collection-list--hover-{{ section.settings.hover_effect | default: 'zoom' }}{% if section.settings.layout_style == 'carousel' %} formula-collection-list--carousel{% elsif section.settings.layout_style == 'circles' %} formula-collection-list--circles{% endif %}${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  <div class="formula-collection-list__grid" style="--formula-collection-cols: {{ section.settings.columns | default: 3 }}; --formula-collection-gap: {{ section.settings.gap | default: 24 }}px">
    {% for block in section.blocks %}
      {% if block.type == "collection" and block.settings.collection != blank %}
        <a class="formula-collection-card formula-collection-card--{% if section.settings.layout_style == 'circles' %}circle{% else %}{{ section.settings.card_style | default: 'below' }}{% endif %}" href="{{ block.settings.collection.url | escape }}">
          <div class="formula-collection-card__media" style="border-radius: {% if section.settings.layout_style == 'circles' %}999{% else %}{{ section.settings.image_shape | default: 14 }}{% endif %}px">
            {% if block.settings.collection.image != blank %}
              <img src="{{ block.settings.collection.image | img_url: '900x' }}" alt="{{ block.settings.collection.title | escape }}" loading="lazy" />
            {% else %}
              <div class="formula-collection-card__placeholder" aria-hidden="true"></div>
            {% endif %}
            {% if section.settings.card_style == 'overlay' and section.settings.layout_style != 'circles' %}<div class="formula-collection-card__scrim" aria-hidden="true"></div>{% endif %}
          </div>
          <div class="formula-collection-card__copy">
            <p class="formula-collection-card__title">{{ block.settings.collection.title | escape }}</p>
            {% if block.settings.collection.description != blank and section.settings.layout_style != 'circles' %}<p class="formula-collection-card__sub">{{ block.settings.collection.description | escape }}</p>{% endif %}
          </div>
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Koleksiyon Listesi",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid",
      "options": [
        { "label": "Grid", "value": "grid" },
        { "label": "Carousel", "value": "carousel" },
        { "label": "Dairesel ikonlar", "value": "circles" }
      ]
    },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Koleksiyonlar" },
    { "type": "select", "id": "columns", "label": "Sütun Sayısı (masaüstü)", "default": "3",
      "options": [
        { "label": "2 sütun", "value": "2" },
        { "label": "3 sütun", "value": "3" },
        { "label": "4 sütun", "value": "4" }
      ]
    },
    { "type": "range", "id": "gap", "label": "Kartlar Arası Boşluk (px)", "min": 8, "max": 48, "step": 4, "default": 24 },
    { "type": "select", "id": "card_style", "label": "Kart Stili", "default": "below",
      "options": [
        { "label": "Başlık görselin altında", "value": "below" },
        { "label": "Başlık görselin üzerinde (kaplamalı)", "value": "overlay" }
      ]
    },
    { "type": "select", "id": "hover_effect", "label": "Üzerine Gelince Efekt", "default": "zoom",
      "options": [
        { "label": "Yakınlaştır", "value": "zoom" },
        { "label": "Yukarı Kalk", "value": "lift" },
        { "label": "Yok", "value": "none" }
      ]
    },
    { "type": "select", "id": "image_shape", "label": "Görsel Şekli", "default": "14",
      "options": [
        { "label": "Köşeli", "value": "0" },
        { "label": "Yumuşak", "value": "14" },
        { "label": "Yuvarlak", "value": "28" },
        { "label": "Oval", "value": "56" }
      ]
    },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "collection",
      "name": "Koleksiyon",
      "settings": [
        { "type": "collection", "id": "collection", "label": "Koleksiyon" }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{ "name": "Formula Koleksiyon Listesi" }]
}
{% endschema %}`;

/**
 * 2026-08-18 düzeltme — kullanıcı raporu: "kapakta koleksiyonu içermeli gibi
 * başka bir şey olmamalı (koleksiyon ürünü görseli de içerebilir)" + "görseli
 * manuel seçemesin, koleksiyon adı ve açıklamasını da backendden çeksin".
 * Manuel `eyebrow/title/subtitle/url/image_picker` alanları kaldırıldı — TEK
 * içerik alanı `collection` (`CollectionRefPicker`), kapak görseli
 * koleksiyonun kendi `coverImage`'ı yoksa admin-server otomatik olarak
 * içindeki ilk ürünün görseline düşüyor (bkz. `picker.routes.ts`'in
 * `productImageUrl`'i, `CollectionRefPicker.tsx`'in `collectionRefFromPicker`'ı).
 * Sadece `cta_label` (buton metni, koleksiyonun verisi değil salt arayüz
 * metni) ve `image_shape` (görsel köşe yuvarlaklığı seçimi) manuel kalıyor.
 */
export const FORMULA_COLLECTION_SHOWCASE = `<section class="formula-collection-showcase formula-collection-showcase--align-{{ section.settings.text_align | default: 'left' }}{% if section.settings.layout == 'image_right' %} formula-collection-showcase--reverse{% endif %}${revealAnimationClass()}">
  {% if section.settings.collection != blank %}
    <div class="formula-collection-showcase__media" style="border-radius: {{ section.settings.image_shape | default: 18 }}px">
      {% if section.settings.collection.image != blank %}
        <img src="{{ section.settings.collection.image | img_url: '1400x' }}" alt="{{ section.settings.collection.title | escape }}" loading="lazy" style="${imageEffectStyle("section.settings")}" />
      {% else %}
        <div class="formula-collection-showcase__placeholder" aria-hidden="true"></div>
      {% endif %}
      ${imageEffectOverlay("section.settings")}
    </div>
    <div class="formula-collection-showcase__copy">
      <h2 class="formula-collection-showcase__title">{{ section.settings.collection.title | escape }}</h2>
      {% if section.settings.collection.description != blank %}<p class="formula-collection-showcase__sub">{{ section.settings.collection.description | escape }}</p>{% endif %}
      <a class="formula-btn formula-btn--solid" href="{{ section.settings.collection.url | escape }}">{{ section.settings.cta_label | default: "Koleksiyonu Gör" | escape }}</a>
    </div>
  {% else %}
    <div class="formula-collection-showcase__empty">Ayarlar panelinden bir koleksiyon seçin.</div>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula Koleksiyon Vitrini",
  "settings": [
    { "type": "collection", "id": "collection", "label": "Koleksiyon" },
    { "type": "text", "id": "cta_label", "label": "Buton Metni", "default": "Koleksiyonu Gör" },
    { "type": "select", "id": "layout", "label": "Yerleşim", "default": "image_left",
      "options": [
        { "label": "Görsel solda", "value": "image_left" },
        { "label": "Görsel sağda", "value": "image_right" }
      ]
    },
    { "type": "select", "id": "text_align", "label": "Metin Hizası", "default": "left",
      "options": [
        { "label": "Sol", "value": "left" },
        { "label": "Orta", "value": "center" }
      ]
    },
    { "type": "select", "id": "image_shape", "label": "Görsel Şekli", "default": "18",
      "options": [
        { "label": "Köşeli", "value": "0" },
        { "label": "Yumuşak", "value": "18" },
        { "label": "Yuvarlak", "value": "32" },
        { "label": "Oval", "value": "64" }
      ]
    },${imageEffectSchemaFields()},${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Koleksiyon Vitrini" }]
}
{% endschema %}`;

/**
 * 2026-08-18 — kullanıcı: "koleksiyon vitrini gibi öğelerde manuel giremesin
 * dedin, o zaman manuel girebileceği GENEL bir vitrin componenti de yapalım"
 * + "url seçimi ürün/koleksiyon/sayfa/harici olmalı" (koleksiyon vitrininden
 * ÇIKARILAN esneklik). `FORMULA_COLLECTION_SHOWCASE`'in bilinçli DIŞLADIĞI
 * her şeyin (serbest metin, serbest görsel, herhangi bir hedefe link) yaşadığı
 * yer — kampanya/indirim/sezon banner'ı gibi koleksiyona bağlı OLMAYAN
 * kullanımlar için. Aynı `image_shape` deseni burada da var.
 */
export const FORMULA_GENERAL_SHOWCASE = `<section class="formula-showcase{% if section.settings.layout == 'image_right' %} formula-showcase--reverse{% endif %}${revealAnimationClass()}">
  <div class="formula-showcase__media" style="border-radius: {{ section.settings.image_shape | default: 18 }}px">
    {% if section.settings.image != blank %}
      <picture>
        {% if section.settings.mobile_image != blank %}<source media="(max-width: 767px)" srcset="{{ section.settings.mobile_image | img_url: '900x' }}" />{% endif %}
        <img src="{{ section.settings.image | img_url: '1400x' }}" alt="{{ section.settings.title | escape }}" loading="lazy" style="${imageEffectStyle("section.settings")}" />
      </picture>
    {% else %}
      <div class="formula-showcase__placeholder" aria-hidden="true"></div>
    {% endif %}
    ${imageEffectOverlay("section.settings")}
  </div>
  <div class="formula-showcase__copy">
    {% if section.settings.eyebrow != blank %}<p class="formula-showcase__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2 class="formula-showcase__title">{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.subtitle != blank %}<p class="formula-showcase__sub">{{ section.settings.subtitle | escape }}</p>{% endif %}
    {% if section.settings.cta_url != blank %}
      <a class="formula-btn formula-btn--solid" href="{{ section.settings.cta_url | escape }}">{{ section.settings.cta_label | default: "Keşfet" | escape }}</a>
    {% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Genel Vitrin",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Yeni Sezon" },
    { "type": "textarea", "id": "subtitle", "label": "Alt Metin", "default": "" },
    { "type": "image_picker", "id": "image", "label": "Görsel" },
    { "type": "image_picker", "id": "mobile_image", "label": "Mobil Görsel (ops.)",
      "info": "Sadece telefon genişliğinde bu görsel kullanılır — boş bırakılırsa masaüstü görseli küçültülerek gösterilir." },
    { "type": "select", "id": "layout", "label": "Yerleşim", "default": "image_left",
      "options": [
        { "label": "Görsel solda", "value": "image_left" },
        { "label": "Görsel sağda", "value": "image_right" }
      ]
    },
    { "type": "select", "id": "image_shape", "label": "Görsel Şekli", "default": "18",
      "options": [
        { "label": "Köşeli", "value": "0" },
        { "label": "Yumuşak", "value": "18" },
        { "label": "Yuvarlak", "value": "32" },
        { "label": "Oval", "value": "64" }
      ]
    },
    { "type": "text", "id": "cta_label", "label": "Buton Metni", "default": "Keşfet" },
    { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı", "default": "" },${imageEffectSchemaFields()},${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Genel Vitrin" }]
}
{% endschema %}`;

/**
 * 2026-08-18 — kullanıcının açık isteği dışında, "aklıma gelen" ek section'lar
 * (Shopify'daki karşılıkları: FAQ accordion, Instagram-story-tipi hızlı
 * koleksiyon navigasyonu, hero slider). Formula'nın var olan editoryal/manuel
 * blok deseniyle veya (story dizisinde) yeni `collection` alanıyla aynı çizgide.
 */

export const FORMULA_FAQ = `<section class="formula-faq{% if section.settings.layout_style == 'two_columns' %} formula-faq--two-columns{% elsif section.settings.layout_style == 'categorized' %} formula-faq--categorized{% endif %}${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  {% if section.settings.layout_style == 'categorized' %}
    <div class="formula-faq__tabs" role="tablist" aria-label="SSS kategorileri">
      <button type="button" class="formula-faq__tab is-active" data-faq-tab="all" aria-selected="true">Tümü</button>
      {% for block in section.blocks %}{% if block.type == "question" and block.settings.category != blank %}<button type="button" class="formula-faq__tab" data-faq-tab="{{ block.settings.category | escape }}" aria-selected="false">{{ block.settings.category | escape }}</button>{% endif %}{% endfor %}
    </div>
  {% endif %}
  <div class="formula-faq__list">
    {% for block in section.blocks %}
      {% if block.type == "question" %}
        <details class="formula-faq__item"{% if section.settings.layout_style == 'categorized' %} data-faq-category="{{ block.settings.category | default: 'Genel' | escape }}"{% endif %}>
          {% if section.settings.layout_style == 'categorized' and block.settings.category != blank %}<span class="formula-faq__category">{{ block.settings.category | escape }}</span>{% endif %}
          <summary class="formula-faq__question">{{ block.settings.question | default: "Soru" | escape }}<span class="formula-faq__chevron" aria-hidden="true">⌄</span></summary>
          <p class="formula-faq__answer">{{ block.settings.answer | default: "Cevap" | escape }}</p>
        </details>
      {% endif %}
    {% endfor %}
  </div>
  {% if section.settings.layout_style == 'categorized' %}
    <script>
      (function () {
        var root = document.currentScript.closest('.formula-faq');
        if (!root) return;
        var tabs = root.querySelectorAll('[data-faq-tab]');
        var items = root.querySelectorAll('[data-faq-category]');
        var seen = new Set(['all']);
        tabs.forEach(function (tab) { var key = tab.getAttribute('data-faq-tab'); if (seen.has(key)) tab.hidden = true; else seen.add(key); });
        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            var category = tab.getAttribute('data-faq-tab');
            tabs.forEach(function (candidate) { var active = candidate === tab; candidate.classList.toggle('is-active', active); candidate.setAttribute('aria-selected', active ? 'true' : 'false'); });
            items.forEach(function (item) { item.hidden = category !== 'all' && item.getAttribute('data-faq-category') !== category; });
          });
        });
      })();
    </script>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula SSS",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "single", "options": [{"label":"Tek kolon accordion","value":"single"},{"label":"İki kolon accordion","value":"two_columns"},{"label":"Kategori sekmeli","value":"categorized"}] },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Sıkça Sorulan Sorular" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "question",
      "name": "Soru",
      "settings": [
        { "type": "text", "id": "question", "label": "Soru", "default": "Kargo ne kadar sürer?" },
        { "type": "textarea", "id": "answer", "label": "Cevap", "default": "Siparişler 1-3 iş günü içinde kargoya verilir." },
        { "type": "text", "id": "category", "label": "Kategori", "default": "Genel" }
      ]
    }
  ],
  "max_blocks": 12,
  "presets": [{
    "name": "Formula SSS",
    "blocks": [
      { "type": "question", "settings": { "question": "Kargo ne kadar sürer?", "answer": "Siparişler 1-3 iş günü içinde kargoya verilir." } },
      { "type": "question", "settings": { "question": "İade/değişim yapabilir miyim?", "answer": "Teslimattan itibaren 14 gün içinde koşulsuz iade hakkınız var." } },
      { "type": "question", "settings": { "question": "Ürünler dermatolojik test edildi mi?", "answer": "Evet, tüm formüllerimiz bağımsız laboratuvarlarda test edilir." } }
    ]
  }]
}
{% endschema %}`;

/**
 * "Instagram story tipi koleksiyon listeleri" — her daire gerçek bir
 * koleksiyona bağlanır (`collection` alanı, `CollectionRefPicker`), aynı
 * `FORMULA_COLLECTION_LIST` deseni ama dairesel/yatay-kaydırmalı sunum.
 */
export const FORMULA_STORY_ROW = `<section class="formula-story-row formula-story-row--{{ section.settings.avatar_size | default: 'md' }}${revealAnimationClass()}">
  <div class="formula-story-row__track">
    {% for block in section.blocks %}
      {% if block.type == "story" and block.settings.collection != blank %}
        <a class="formula-story" href="{{ block.settings.collection.url | escape }}">
          <span class="formula-story__ring">
            <span class="formula-story__avatar" style="{% if block.settings.collection.image != blank %}background-image:url('{{ block.settings.collection.image | img_url: '300x' }}'){% endif %}"></span>
          </span>
          <span class="formula-story__label">{{ block.settings.collection.title | escape }}</span>
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Hızlı Koleksiyonlar",
  "settings": [
    { "type": "select", "id": "avatar_size", "label": "Daire Boyutu", "default": "md",
      "options": [
        { "label": "Küçük", "value": "sm" },
        { "label": "Orta", "value": "md" },
        { "label": "Büyük", "value": "lg" }
      ]
    },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "story",
      "name": "Koleksiyon",
      "settings": [
        { "type": "collection", "id": "collection", "label": "Koleksiyon" }
      ]
    }
  ],
  "max_blocks": 10,
  "presets": [{ "name": "Formula Hızlı Koleksiyonlar" }]
}
{% endschema %}`;

/**
 * Manuel slayt banner'ı. Ok butonları `scrollBy` ile — duyuru çubuğunun
 * kapat butonundaki aynı desen (satır-içi `onclick`, ei-engine'in
 * autoEscape kapalı olduğu için ekstra bir JS runtime/bundle gerekmiyor).
 *
 * 2026-08-18 devamı — kullanıcı raporu: "slider'daki görselin boyutunu
 * ayarlayabilmeli, kırpma özelliği de olmalı, önerilen resim boyutunu
 * belirt, daha fazla özellik ekle". Eklenenler:
 * - `aspect_ratio` (section-seviyesi, TÜM slaytlar için — bir slider'da
 *   slayt slayt farklı oran görsel olarak tutarsız/bozuk dururdu):
 *   21:9 (sinematik, varsayılan) / 16:9 / 4:3 / 1:1 / 3:4 (dikey).
 * - `image_position` (blok-seviyesi "kırpma" — gerçek bir kırpma aracı değil,
 *   CSS `object-position` odak noktası; Shopify'ın kendi "focal point"
 *   özelliğiyle aynı, çok daha hafif/güvenilir bir teknik).
 * - Görsel alanının `info` metninde önerilen piksel boyutu.
 * - Görsel efektleri (opacity/blur/grayscale/brightness/kaplama, paylaşılan
 *   `imageEffect*` yardımcıları).
 * - Ayrı bir CTA butonu (artık TÜM kart değil, SADECE buton tıklanabilir —
 *   `<a>` içinde `<a>` geçersiz HTML olacağından `formula-slide` artık
 *   `<div>`, tıklanabilirlik CTA linkine taşındı).
 * - Metin hizası + metin rengi (açık/koyu — kaplama/arka plana göre).
 */
export const FORMULA_SLIDER = `<section class="formula-slider${revealAnimationClass()}" data-section-id="{{ section.id }}">
  <div class="formula-slider__track" id="formula-slider-track-{{ section.id }}">
    {% for block in section.blocks %}
      {% if block.type == "slide" %}
        <div class="formula-slide" style="aspect-ratio: {{ section.settings.aspect_ratio | default: '21/9' }}">
          {% if block.settings.image != blank %}
            <img src="{{ block.settings.image | img_url: '1600x' }}" alt="{{ block.settings.title | escape }}" loading="lazy" style="object-position: {{ block.settings.image_position | default: 'center' }};${imageEffectStyle("block.settings")}" />
          {% else %}
            <div class="formula-slide__placeholder" aria-hidden="true"></div>
          {% endif %}
          ${imageEffectOverlay("block.settings")}
          <div class="formula-slide__copy formula-slide__copy--{{ block.settings.text_align | default: 'left' }} formula-slide__copy--{{ block.settings.text_color | default: 'light' }}">
            <h3>{{ block.settings.title | default: "Slayt" | escape }}</h3>
            {% if block.settings.subtitle != blank %}<p>{{ block.settings.subtitle | escape }}</p>{% endif %}
            {% if block.settings.cta_url != blank %}
              <a class="formula-btn formula-btn--solid" href="{{ block.settings.cta_url | escape }}">{{ block.settings.cta_label | default: "Keşfet" | escape }}</a>
            {% endif %}
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
  {% if section.blocks.size > 1 %}
    <div class="formula-slider__nav">
      <button type="button" class="formula-slider__arrow" aria-label="Önceki" onclick="document.getElementById('formula-slider-track-{{ section.id }}').scrollBy({left:-document.getElementById('formula-slider-track-{{ section.id }}').clientWidth,behavior:'smooth'})">‹</button>
      <button type="button" class="formula-slider__arrow" aria-label="Sonraki" onclick="document.getElementById('formula-slider-track-{{ section.id }}').scrollBy({left:document.getElementById('formula-slider-track-{{ section.id }}').clientWidth,behavior:'smooth'})">›</button>
    </div>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula Slider",
  "settings": [
    { "type": "select", "id": "aspect_ratio", "label": "Görsel Boyutu (tüm slaytlar)", "default": "21/9",
      "info": "Önerilen görsel: 21:9 için ~1600×686px, 16:9 için ~1600×900px — geniş/yatay ve yüksek çözünürlüklü.",
      "options": [
        { "label": "Sinematik (21:9)", "value": "21/9" },
        { "label": "Geniş Ekran (16:9)", "value": "16/9" },
        { "label": "Standart (4:3)", "value": "4/3" },
        { "label": "Kare (1:1)", "value": "1/1" },
        { "label": "Dikey (3:4)", "value": "3/4" }
      ]
    },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "slide",
      "name": "Slayt",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Görsel", "info": "Önerilen: en az 1600px genişlik, seçilen orana uygun yatay/geniş bir görsel." },
        { "type": "select", "id": "image_position", "label": "Görsel Konumu (kırpma odağı)", "default": "center",
          "options": [
            { "label": "Orta", "value": "center" },
            { "label": "Üst", "value": "top" },
            { "label": "Alt", "value": "bottom" },
            { "label": "Sol", "value": "left" },
            { "label": "Sağ", "value": "right" }
          ]
        },
        { "type": "text", "id": "title", "label": "Başlık", "default": "Slayt" },
        { "type": "text", "id": "subtitle", "label": "Alt Metin (ops.)", "default": "" },
        { "type": "select", "id": "text_align", "label": "Metin Hizası", "default": "left",
          "options": [
            { "label": "Sol", "value": "left" },
            { "label": "Orta", "value": "center" },
            { "label": "Sağ", "value": "right" }
          ]
        },
        { "type": "select", "id": "text_color", "label": "Metin Rengi", "default": "light",
          "options": [
            { "label": "Açık (koyu görsel için)", "value": "light" },
            { "label": "Koyu (açık görsel için)", "value": "dark" }
          ]
        },
        { "type": "text", "id": "cta_label", "label": "Buton Metni (ops.)", "default": "" },
        { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı (ops.)", "default": "" },${imageEffectSchemaFields()}
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [{
    "name": "Formula Slider",
    "blocks": [
      { "type": "slide", "settings": { "title": "Yaz Koleksiyonu", "subtitle": "Hafif dokular, yüksek SPF", "cta_label": "Koleksiyonu Gör", "cta_url": "/collection" } },
      { "type": "slide", "settings": { "title": "Yeni Gelenler", "subtitle": "Bu haftanın favorileri", "cta_label": "Şimdi Keşfet", "cta_url": "/products" } }
    ]
  }]
}
{% endschema %}`;

/** "Rakamlarla" güven bandı — Formula'nın "aktif oranlarının öne çıkarılması"
 * marka diline uygun (bkz. dosya başı notu), somut sayılarla güven inşa eden
 * kısa bir bant. Felsefe section'ının (`FORMULA_PHILOSOPHY`) hemen yanına
 * doğal bir tamamlayıcı. */
export const FORMULA_STATS = `<section class="formula-stats${revealAnimationClass()}">
  {% if section.settings.title != blank %}<h2 class="formula-stats__title">{{ section.settings.title | escape }}</h2>{% endif %}
  <div class="formula-stats__grid">
    {% for block in section.blocks %}
      {% if block.type == "stat" %}
        <div class="formula-stat">
          <p class="formula-stat__number">{{ block.settings.number | default: "10.000+" | escape }}</p>
          <p class="formula-stat__label">{{ block.settings.label | default: "Mutlu Müşteri" | escape }}</p>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Rakamlarla",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "stat",
      "name": "Rakam",
      "settings": [
        { "type": "text", "id": "number", "label": "Rakam", "default": "10.000+" },
        { "type": "text", "id": "label", "label": "Etiket", "default": "Mutlu Müşteri" }
      ]
    }
  ],
  "max_blocks": 5,
  "presets": [{
    "name": "Formula Rakamlarla",
    "blocks": [
      { "type": "stat", "settings": { "number": "10.000+", "label": "Mutlu Müşteri" } },
      { "type": "stat", "settings": { "number": "%98", "label": "Memnuniyet Oranı" } },
      { "type": "stat", "settings": { "number": "50+", "label": "Formül" } },
      { "type": "stat", "settings": { "number": "0", "label": "Hayvan Deneyi" } }
    ]
  }]
}
{% endschema %}`;

/** 2026-08-19 — kullanıcı isteği: "sadece yazı olan" bir section (Shopify'ın
 * "Rich text" karşılığı) — görsel/kart/grid YOK, sadece üst etiket/başlık/
 * gövde metni/opsiyonel buton, hizası ve okunabilir genişliği ayarlanabilir. */
export const FORMULA_TEXT_BLOCK = `<section class="formula-text-block formula-text-block--{{ section.settings.text_align | default: 'center' }}${revealAnimationClass()}">
  <div class="formula-text-block__inner" style="max-width: {{ section.settings.max_width | default: 640 }}px;">
    {% if section.settings.eyebrow != blank %}<p class="formula-text-block__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2 class="formula-text-block__title">{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.body != blank %}<div class="formula-text-block__body">{{ section.settings.body }}</div>{% endif %}
    {% if section.settings.cta_label != blank %}<a class="formula-btn formula-btn--solid" href="{{ section.settings.cta_url | default: '/' | escape }}">{{ section.settings.cta_label | escape }}</a>{% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Yazı Bloğu",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "" },
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "Az bileşen, yüksek standart" },
    { "type": "richtext", "id": "body", "label": "Gövde Metni", "default": "Cilt bakımını şeffaf ve anlaşılır yapıyoruz. Her ürünün etiketinde ne olduğunu, neden orada olduğunu görürsün." },
    { "type": "select", "id": "text_align", "label": "Metin Hizası", "default": "center",
      "options": [
        { "label": "Sol", "value": "left" },
        { "label": "Orta", "value": "center" }
      ]
    },
    { "type": "range", "id": "max_width", "label": "Okunabilir Genişlik (px)", "min": 400, "max": 900, "step": 20, "default": 640 },
    { "type": "text", "id": "cta_label", "label": "Buton Metni (ops.)", "default": "" },
    { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı (ops.)", "default": "" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Yazı Bloğu" }]
}
{% endschema %}`;

/** 2026-08-19 devamı — kullanıcı: `FORMULA_TEXT_BLOCK` (tek varyant) yetersiz
 * bulundu, "birden fazla farklı/özel tasarımlı yazı section'ı" istendi (bkz.
 * [[feedback-theme-section-variants-shopify-style]]). Bu üçü, mevcut Yazı
 * Bloğu'na eklenen 3 farklı yerleşim: iki kolonlu metin, alıntı/referans
 * kartları, numaralı adım listesi — dördü birlikte "yazı ailesi"nin 3-4
 * varyant kuralını karşılıyor. */
export const FORMULA_TEXT_COLUMNS = `<section class="formula-text-columns${revealAnimationClass()}">
  <div class="formula-text-columns__col formula-text-columns__col--heading">
    {% if section.settings.eyebrow != blank %}<p class="formula-text-columns__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2 class="formula-text-columns__title">{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.cta_label != blank %}<a class="formula-btn formula-btn--ghost" href="{{ section.settings.cta_url | default: '/' | escape }}">{{ section.settings.cta_label | escape }}</a>{% endif %}
  </div>
  <div class="formula-text-columns__col formula-text-columns__col--body">
    {% if section.settings.body != blank %}<div class="formula-text-columns__body">{{ section.settings.body }}</div>{% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Formula İki Kolonlu Metin",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Az bileşen. Kanıtlanmış aktifler." },
    { "type": "richtext", "id": "body", "label": "Gövde Metni (sağ kolon)", "default": "Formüllerimizde gereksiz hiçbir şey yok — sadece etkinliği kanıtlanmış aktif bileşenler, şeffaf oranlarda." },
    { "type": "text", "id": "cta_label", "label": "Buton Metni (ops.)", "default": "" },
    { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı (ops.)", "default": "" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula İki Kolonlu Metin" }]
}
{% endschema %}`;

export const FORMULA_TESTIMONIAL = `<section class="formula-testimonial{% if section.settings.layout_style == 'focus' %} formula-testimonial--focus{% elsif section.settings.layout_style == 'carousel' %} formula-testimonial--carousel{% endif %}${revealAnimationClass()}">
  {% if section.settings.title != blank %}<div class="formula-section-head"><h2>{{ section.settings.title | escape }}</h2></div>{% endif %}
  <div class="formula-testimonial__grid">
    {% for block in section.blocks %}
      {% if block.type == "quote" %}
        <div class="formula-testimonial__card">
          {% if block.settings.quote != blank %}<p class="formula-testimonial__quote">"{{ block.settings.quote | escape }}"</p>{% endif %}
          {% if block.settings.name != blank or block.settings.avatar != blank %}
            <div class="formula-testimonial__author">
              {% if block.settings.avatar != blank %}<img class="formula-testimonial__avatar" src="{{ block.settings.avatar | img_url: '80x80' }}" alt="{{ block.settings.name | escape }}" loading="lazy" />{% endif %}
              <div>
                {% if block.settings.name != blank %}<p class="formula-testimonial__name">{{ block.settings.name | escape }}</p>{% endif %}
                {% if block.settings.role != blank %}<p class="formula-testimonial__role">{{ block.settings.role | escape }}</p>{% endif %}
              </div>
            </div>
          {% endif %}
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Alıntı / Referans",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid", "options": [{"label":"Çoklu kart grid","value":"grid"},{"label":"Tek odak alıntı","value":"focus"},{"label":"Carousel","value":"carousel"}] },
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "Müşterilerimiz Ne Diyor" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "quote",
      "name": "Alıntı",
      "settings": [
        { "type": "textarea", "id": "quote", "label": "Alıntı Metni", "default": "Cildim hiç bu kadar dengeli olmamıştı, 4 haftada fark ettim." },
        { "type": "image_picker", "id": "avatar", "label": "Fotoğraf (ops.)" },
        { "type": "text", "id": "name", "label": "İsim", "default": "Elif Y." },
        { "type": "text", "id": "role", "label": "Unvan/Not (ops.)", "default": "Doğrulanmış Müşteri" }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{
    "name": "Formula Alıntı / Referans",
    "blocks": [
      { "type": "quote", "settings": { "quote": "Cildim hiç bu kadar dengeli olmamıştı, 4 haftada fark ettim.", "name": "Elif Y.", "role": "Doğrulanmış Müşteri" } },
      { "type": "quote", "settings": { "quote": "Az bileşen, net etki. Etikette ne yazıyorsa cilt onu hissediyor.", "name": "Deniz K.", "role": "Doğrulanmış Müşteri" } },
      { "type": "quote", "settings": { "quote": "Artık başka marka denemiyorum, rutinim tamamen Formula.", "name": "Aslı T.", "role": "Doğrulanmış Müşteri" } }
    ]
  }]
}
{% endschema %}`;

/** Numara `forloop.index`'ten OTOMATİK türetilmiyor — bilinçli tercih.
 * `reference-ei-engine-liquid-scoping-gotchas` motorun range literal
 * (`(1..N)`) desteklemediğini belgeliyor, `forloop`/filtre zincirleme
 * (`prepend`/`slice`) desteğinin de doğrulanmamış olması riskini taşımamak
 * için `FORMULA_STATS`'ın "number" alanı deseni izlendi — her adımın
 * numarası kendi block ayarında serbest metin (kullanıcı "01" yerine "A"
 * ya da bir emoji de yazabilir). */
export const FORMULA_NUMBERED_LIST = `<section class="formula-steps${revealAnimationClass()}">
  {% if section.settings.title != blank %}<div class="formula-section-head"><h2>{{ section.settings.title | escape }}</h2></div>{% endif %}
  <div class="formula-steps__list">
    {% for block in section.blocks %}
      {% if block.type == "step" %}
        <div class="formula-step">
          {% if block.settings.number != blank %}<p class="formula-step__number">{{ block.settings.number | escape }}</p>{% endif %}
          {% if block.settings.title != blank %}<h3 class="formula-step__title">{{ block.settings.title | escape }}</h3>{% endif %}
          {% if block.settings.description != blank %}<p class="formula-step__desc">{{ block.settings.description | escape }}</p>{% endif %}
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Numaralı Liste",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "Nasıl Çalışır" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "step",
      "name": "Adım",
      "settings": [
        { "type": "text", "id": "number", "label": "Numara/Simge", "default": "01" },
        { "type": "text", "id": "title", "label": "Başlık", "default": "Cildini analiz et" },
        { "type": "textarea", "id": "description", "label": "Açıklama", "default": "3 dakikalık kısa testle cilt tipini ve önceliklerini belirle." }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{
    "name": "Formula Numaralı Liste",
    "blocks": [
      { "type": "step", "settings": { "number": "01", "title": "Cildini analiz et", "description": "3 dakikalık kısa testle cilt tipini ve önceliklerini belirle." } },
      { "type": "step", "settings": { "number": "02", "title": "Formülünü seç", "description": "Sana özel önerilen aktifler arasından formülünü oluştur." } },
      { "type": "step", "settings": { "number": "03", "title": "Rutinini uygula", "description": "Günlük rutine ekle, 4 haftada farkı gör." } }
    ]
  }]
}
{% endschema %}`;

/**
 * 2026-08-19 — kullanıcı raporu: "404 sayfası hâlâ yok". `isMandatoryPage`
 * (`commandGovernance.ts`) `template: "404"` sayfasını zaten korumuyordu ama
 * Formula scaffold'ında böyle bir sayfa HİÇ YOKTU — ve `apps/renderer`
 * eşleşmeyen route'larda temadan tamamen bağımsız, sabit bir `errorPage()`
 * kullanıyordu (bkz. `renderer.ts`'in fix'i). Bu section main-cart/main-
 * checkout gibi `formulaPages.ts`'in kendi `utilityPage()`'iyle "404" sayfasına
 * bağlanıyor — `FORMULA_LIBRARY_SECTIONS`'a EKLENMEDİ (opsiyonel "ekle"
 * kataloğu değil, main-product/main-cart gibi sayfaya özel zorunlu section).
 */
export const FORMULA_404 = `<section class="formula-404${revealAnimationClass()}">
  <p class="formula-404__code" aria-hidden="true">404</p>
  <h1 class="formula-404__title">{{ section.settings.title | default: "Bu sayfa bulunamadı" | escape }}</h1>
  <p class="formula-404__sub">{{ section.settings.subtitle | default: "Aradığın sayfa taşınmış ya da hiç var olmamış olabilir." | escape }}</p>
  <div class="formula-404__actions">
    <a class="formula-btn formula-btn--solid" href="{{ section.settings.cta_url | default: '/' | escape }}">{{ section.settings.cta_label | default: "Ana Sayfaya Dön" | escape }}</a>
    <a class="formula-btn formula-btn--ghost" href="/products">{{ section.settings.secondary_label | default: "Tüm Ürünler" | escape }}</a>
  </div>
</section>

{% schema %}
{
  "name": "Formula 404",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Bu sayfa bulunamadı" },
    { "type": "textarea", "id": "subtitle", "label": "Alt Metin", "default": "Aradığın sayfa taşınmış ya da hiç var olmamış olabilir." },
    { "type": "text", "id": "cta_label", "label": "Ana Buton Metni", "default": "Ana Sayfaya Dön" },
    { "type": "url", "id": "cta_url", "label": "Ana Buton URL", "default": "/" },
    { "type": "text", "id": "secondary_label", "label": "İkincil Buton Metni", "default": "Tüm Ürünler" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula 404" }]
}
{% endschema %}`;

/**
 * 2026-08-24 — kullanıcı raporu: "siparişiniz alındı sayfası formula
 * temasına özelleştirilmemiş". Kök neden: `/checkout/success` hiç Studio'nun
 * theme sistemine bağlı DEĞİLDİ — `apps/renderer/src/templates/checkout.ts`'in
 * (tema-öncesi) tamamen hardcoded, inline-style `checkoutSuccess()`
 * fonksiyonu render ediyordu. Bu section o boşluğu dolduruyor —
 * `ecommerceContext.ts`'in `page.slug === "checkout-success"` dalı gerçek
 * siparişi (`?orderId=` query param, projectId eşleşmesi doğrulanarak) çözüp
 * `order`/`bank_accounts` context'ini dolduruyor. Sipariş bulunamazsa
 * (yanlış/eksik orderId) `{% else %}` dalı jenerik bir "devam et" mesajı
 * gösterir — hata sayfası değil, kullanıcı deneyimini bozmaz.
 *
 * Sepeti temizleme (2026-08-24 kullanıcı raporu: "siparişi tamamlanan
 * müşterinin sepeti boşaltılır") BURADA, sayfa yüklenince — checkout'un
 * KENDİSİNDE değil, çünkü ödeme akışının birden fazla çıkış yolu var
 * (kapıda ödeme direkt, kart/iyzico redirect sonrası) ve hepsi SONUNDA bu
 * sayfaya düşüyor — tek, güvenilir "sipariş GERÇEKTEN tamamlandı" noktası.
 */
export const FORMULA_CHECKOUT_SUCCESS = `<section class="formula-order-result${revealAnimationClass()}">
  <div class="formula-order-result__box">
    {% if order %}
      <div class="formula-order-result__icon formula-order-result__icon--success" aria-hidden="true">✓</div>
      <h1 class="formula-order-result__title">{{ section.settings.success_title | default: "Siparişiniz Alındı!" | escape }}</h1>
      <p class="formula-order-result__sub">{% if bank_accounts %}{{ section.settings.bank_text | default: "Siparişiniz oluşturuldu — ödemeyi aşağıdaki hesaba göndermeniz gerekiyor." | escape }}{% else %}{{ section.settings.success_text | default: "Ödemeniz başarıyla tamamlandı. Sipariş onayı e-posta adresine gönderilecek." | escape }}{% endif %}</p>
      <p class="formula-order-result__number">{{ section.settings.order_number_label | default: "Sipariş No:" | escape }} <strong>{{ order.number }}</strong></p>
      {% if bank_accounts %}
        <div class="formula-order-result__bank">
          <p class="formula-order-result__bank-title">Havale/EFT ile ödeme yapın</p>
          {% for account in bank_accounts %}
            <div class="formula-order-result__bank-row">
              <p class="formula-order-result__bank-name">{{ account.bankName | escape }} — {{ account.accountName | escape }}</p>
              <p class="formula-order-result__bank-iban">{{ account.iban | escape }} · {{ account.currency | escape }}</p>
            </div>
          {% endfor %}
          {% if bank_reference %}<p class="formula-order-result__bank-ref">Açıklamaya <strong>{{ bank_reference | escape }}</strong> referans kodunu yazmayı unutma.</p>{% endif %}
        </div>
      {% endif %}
      {% if order.items.size > 0 %}
        <div class="formula-order-result__items">
          {% for item in order.items %}
            <div class="formula-order-result__item">
              <span class="formula-order-result__item-title">{{ item.title | escape }} <span class="formula-order-result__item-qty">× {{ item.quantity }}</span></span>
              <span class="formula-order-result__item-price">{{ item.price | money }}</span>
            </div>
          {% endfor %}
          <div class="formula-order-result__total"><span>{{ section.settings.total_label | default: "Toplam" | escape }}</span><span>{{ order.total | money }}</span></div>
        </div>
      {% endif %}
      <a class="formula-btn formula-btn--solid" href="{{ section.settings.cta_url | default: '/' | escape }}">{{ section.settings.cta_label | default: "Alışverişe Devam Et" | escape }}</a>
    {% else %}
      <div class="formula-order-result__icon" aria-hidden="true">?</div>
      <h1 class="formula-order-result__title">{{ section.settings.notfound_title | default: "Sipariş bulunamadı" | escape }}</h1>
      <p class="formula-order-result__sub">{{ section.settings.notfound_text | default: "Bu sipariş bağlantısı geçersiz veya süresi dolmuş olabilir." | escape }}</p>
      <a class="formula-btn formula-btn--solid" href="/">{{ section.settings.cta_label | default: "Alışverişe Devam Et" | escape }}</a>
    {% endif %}
  </div>
  {% if order %}
  <script>
    (function () {
      fetch('/cart/clear', { method: 'POST' }).catch(function () {});
    })();
  </script>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula Sipariş Sonucu",
  "settings": [
    { "type": "text", "id": "success_title", "label": "Başlık", "default": "Siparişiniz Alındı!" },
    { "type": "textarea", "id": "success_text", "label": "Açıklama (kart/kapıda ödeme)", "default": "Ödemeniz başarıyla tamamlandı. Sipariş onayı e-posta adresine gönderilecek." },
    { "type": "textarea", "id": "bank_text", "label": "Açıklama (havale/EFT)", "default": "Siparişiniz oluşturuldu — ödemeyi aşağıdaki hesaba göndermeniz gerekiyor." },
    { "type": "text", "id": "order_number_label", "label": "Sipariş No Etiketi", "default": "Sipariş No:" },
    { "type": "text", "id": "total_label", "label": "Toplam Etiketi", "default": "Toplam" },
    { "type": "text", "id": "cta_label", "label": "Buton Metni", "default": "Alışverişe Devam Et" },
    { "type": "url", "id": "cta_url", "label": "Buton URL", "default": "/" },
    { "type": "text", "id": "notfound_title", "label": "Sipariş Bulunamadı Başlığı", "default": "Sipariş bulunamadı" },
    { "type": "textarea", "id": "notfound_text", "label": "Sipariş Bulunamadı Metni", "default": "Bu sipariş bağlantısı geçersiz veya süresi dolmuş olabilir." },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Sipariş Sonucu" }]
}
{% endschema %}`;

/**
 * 2026-08-20 — kullanıcı: "5 section daha ekleyelim, temanın sonlarına
 * yaklaşalım", 7 fikir sunuldu ve "hepsini inşa edelim" onayı geldi. Marka
 * felsefesindeki ("aktif oranlarının öne çıkarılması", bkz. dosya başı
 * yorumu) tek gerçek karşılığı olan Aktif İçerik Vitrini öncelikli; Kullanım
 * Rutini `FORMULA_NUMBERED_LIST`'ten farklı olarak GÖRSELLİ adım kartları
 * (ürün uygulama sırası), Karşılaştırma Tablosu ise sabit 4 satırlık
 * (feature1..4) blok-başına-değer deseniyle — ei-engine'in dinamik alan adı
 * ÇÖZEMEMESİ (bkz. `reference-ei-engine-liquid-scoping-gotchas`) yüzünden
 * satır sayısı bilinçli olarak sabit tutuldu, döngü-içi döngü YOK.
 */
export const FORMULA_INGREDIENT_SPOTLIGHT = `<section class="formula-ingredients${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  {% if section.settings.subtitle != blank %}<p class="formula-ingredients__sub">{{ section.settings.subtitle | escape }}</p>{% endif %}
  <div class="formula-ingredients__grid">
    {% for block in section.blocks %}
      {% if block.type == "ingredient" %}
        <div class="formula-ingredient-card">
          <div class="formula-ingredient-card__top">
            <span class="formula-ingredient-card__icon" aria-hidden="true">{{ block.settings.icon | default: "◆" | escape }}</span>
            {% if block.settings.percent != blank %}<span class="formula-ingredient-card__percent">{{ block.settings.percent | escape }}</span>{% endif %}
          </div>
          <p class="formula-ingredient-card__name">{{ block.settings.name | default: "Aktif İçerik" | escape }}</p>
          {% if block.settings.description != blank %}<p class="formula-ingredient-card__desc">{{ block.settings.description | escape }}</p>{% endif %}
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Aktif İçerik Vitrini",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Aktif İçerikler" },
    { "type": "text", "id": "subtitle", "label": "Alt Metin (ops.)", "default": "Her formülde ne olduğunu, ne kadar olduğunu görürsün." },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "ingredient",
      "name": "Aktif İçerik",
      "settings": [
        { "type": "text", "id": "icon", "label": "Glif", "default": "◆" },
        { "type": "text", "id": "name", "label": "İçerik Adı", "default": "Niasinamid" },
        { "type": "text", "id": "percent", "label": "Oran", "default": "%10" },
        { "type": "textarea", "id": "description", "label": "Açıklama", "default": "Ten tonunu eşitler, gözenek görünümünü azaltır." }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{
    "name": "Formula Aktif İçerik Vitrini",
    "blocks": [
      { "type": "ingredient", "settings": { "icon": "◆", "name": "Niasinamid", "percent": "%10", "description": "Ten tonunu eşitler, gözenek görünümünü azaltır." } },
      { "type": "ingredient", "settings": { "icon": "●", "name": "Hyalüronik Asit", "percent": "%2", "description": "Yoğun nem bağlar, cildi dolgunlaştırır." } },
      { "type": "ingredient", "settings": { "icon": "▲", "name": "Retinol", "percent": "%0.3", "description": "Yenilenmeyi hızlandırır, ince çizgileri azaltır." } },
      { "type": "ingredient", "settings": { "icon": "◇", "name": "Vitamin C", "percent": "%15", "description": "Aydınlatır, serbest radikallere karşı korur." } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_ROUTINE_STEPS = `<section class="formula-routine${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  {% if section.settings.subtitle != blank %}<p class="formula-routine__sub">{{ section.settings.subtitle | escape }}</p>{% endif %}
  <div class="formula-routine__list">
    {% for block in section.blocks %}
      {% if block.type == "routine_step" %}
        <a class="formula-routine-step" href="{{ block.settings.url | default: '#' | escape }}">
          <div class="formula-routine-step__media">
            {% if block.settings.image != blank %}
              <img src="{{ block.settings.image | img_url: '500x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" />
            {% else %}
              <div class="formula-routine-step__placeholder" aria-hidden="true"></div>
            {% endif %}
            <span class="formula-routine-step__badge">{{ block.settings.order | default: "1" | escape }}</span>
          </div>
          <p class="formula-routine-step__name">{{ block.settings.name | default: "Ürün" | escape }}</p>
          {% if block.settings.description != blank %}<p class="formula-routine-step__desc">{{ block.settings.description | escape }}</p>{% endif %}
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Kullanım Rutini",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Günlük Rutin" },
    { "type": "text", "id": "subtitle", "label": "Alt Metin (ops.)", "default": "Sabah ve akşam uygulama sırası." },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "routine_step",
      "name": "Adım",
      "settings": [
        { "type": "text", "id": "order", "label": "Sıra No", "default": "1" },
        { "type": "image_picker", "id": "image", "label": "Görsel" },
        { "type": "text", "id": "name", "label": "Ürün/Adım Adı", "default": "Nazik Temizleyici" },
        { "type": "textarea", "id": "description", "label": "Açıklama", "default": "Cildi kurutmadan temizler, pH dengesini korur." },
        { "type": "url", "id": "url", "label": "Bağlantı (ops.)", "default": "" }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{
    "name": "Formula Kullanım Rutini",
    "blocks": [
      { "type": "routine_step", "settings": { "order": "1", "name": "Nazik Temizleyici", "description": "Cildi kurutmadan temizler, pH dengesini korur." } },
      { "type": "routine_step", "settings": { "order": "2", "name": "Niasinamid Serum", "description": "Ten tonunu eşitler, gözenekleri sıkılaştırır." } },
      { "type": "routine_step", "settings": { "order": "3", "name": "Nemlendirici", "description": "Nem bariyerini onarır, gün boyu korur." } },
      { "type": "routine_step", "settings": { "order": "4", "name": "SPF 50", "description": "Geniş spektrum koruma, her sabah şart." } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_TRUST_BAR = `<section class="formula-trust${revealAnimationClass()}">
  <div class="formula-trust__row">
    {% for block in section.blocks %}
      {% if block.type == "badge" %}
        <div class="formula-trust-badge">
          <span class="formula-trust-badge__icon" aria-hidden="true">{{ block.settings.icon | default: "✓" | escape }}</span>
          <span class="formula-trust-badge__label">{{ block.settings.label | default: "Rozet" | escape }}</span>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Güven Rozetleri",
  "settings": [${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "badge",
      "name": "Rozet",
      "settings": [
        { "type": "text", "id": "icon", "label": "Glif", "default": "✓" },
        { "type": "text", "id": "label", "label": "Etiket", "default": "Dermatolojik Test" }
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [{
    "name": "Formula Güven Rozetleri",
    "blocks": [
      { "type": "badge", "settings": { "icon": "✓", "label": "Dermatolojik Test Edildi" } },
      { "type": "badge", "settings": { "icon": "◆", "label": "Vegan" } },
      { "type": "badge", "settings": { "icon": "●", "label": "Kruelti-Free" } },
      { "type": "badge", "settings": { "icon": "○", "label": "Geri Dönüştürülebilir Ambalaj" } },
      { "type": "badge", "settings": { "icon": "▲", "label": "Şeffaf Etiket" } }
    ]
  }]
}
{% endschema %}`;

/** Video için `imageEffectSchemaFields()` BİLİNÇLİ OLARAK kullanılmadı —
 * opacity/blur/grayscale/brightness bir `<video>` üzerinde de CSS filter ile
 * çalışırdı ama poster/video ikilisini aynı anda derecelendirmek karmaşayı
 * artırır; sabit, hafif bir karartma gradyanı (`formula-video-overlay`,
 * her zaman aktif) metin okunabilirliği için yeterli. */
export const FORMULA_VIDEO_BANNER = `<section class="formula-video${revealAnimationClass()}">
  <div class="formula-video__media">
    {% if section.settings.video_url != blank %}
      <video class="formula-video__el" src="{{ section.settings.video_url | escape }}" {% if section.settings.poster != blank %}poster="{{ section.settings.poster | img_url: '1400x' }}"{% endif %} autoplay muted loop playsinline></video>
    {% elsif section.settings.poster != blank %}
      <img src="{{ section.settings.poster | img_url: '1400x' }}" alt="{{ section.settings.title | escape }}" loading="lazy" />
    {% else %}
      <div class="formula-video__placeholder" aria-hidden="true"></div>
    {% endif %}
    <div class="formula-video-overlay" aria-hidden="true"></div>
  </div>
  <div class="formula-video__copy">
    {% if section.settings.eyebrow != blank %}<p class="formula-video__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2 class="formula-video__title">{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.cta_label != blank %}<a class="formula-btn formula-btn--invert" href="{{ section.settings.cta_url | default: '/' | escape }}">{{ section.settings.cta_label | escape }}</a>{% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Video Banner",
  "settings": [
    { "type": "text", "id": "video_url", "label": "Video Bağlantısı (.mp4)", "default": "",
      "info": "Boş bırakılırsa aşağıdaki kapak görseli statik olarak gösterilir." },
    { "type": "image_picker", "id": "poster", "label": "Kapak Görseli" },
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Rutinini görüntüde izle" },
    { "type": "text", "id": "cta_label", "label": "Buton Metni (ops.)", "default": "" },
    { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı (ops.)", "default": "" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Video Banner" }]
}
{% endschema %}`;

export const FORMULA_JOURNAL_TEASER = `<section class="formula-journal{% if section.settings.layout_style == 'featured' %} formula-journal--featured{% elsif section.settings.layout_style == 'carousel' %} formula-journal--carousel{% elsif section.settings.layout_style == 'compact' %} formula-journal--compact{% endif %}${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
    <a href="{{ section.settings.view_all_url | default: '/' | escape }}">{{ section.settings.view_all_label | default: "Tümünü Oku" | escape }}</a>
  </div>
  <div class="formula-journal__grid">
    {% for block in section.blocks %}
      {% if block.type == "article" %}
        <a class="formula-journal-card" href="{{ block.settings.url | default: '#' | escape }}">
          <div class="formula-journal-card__media">
            {% if block.settings.image != blank %}
              <img src="{{ block.settings.image | img_url: '700x' }}" alt="{{ block.settings.title | escape }}" loading="lazy" />
            {% else %}
              <div class="formula-journal-card__placeholder" aria-hidden="true"></div>
            {% endif %}
          </div>
          {% if block.settings.category != blank %}<p class="formula-journal-card__category">{{ block.settings.category | escape }}</p>{% endif %}
          <p class="formula-journal-card__title">{{ block.settings.title | default: "Başlık" | escape }}</p>
          {% if block.settings.excerpt != blank %}<p class="formula-journal-card__excerpt">{{ block.settings.excerpt | escape }}</p>{% endif %}
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Dergi Vitrini",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid",
      "options": [
        { "label": "Eşit kart grid'i", "value": "grid" },
        { "label": "Öne çıkan + küçükler", "value": "featured" },
        { "label": "Carousel", "value": "carousel" },
        { "label": "Kompakt liste", "value": "compact" }
      ]
    },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Dergi" },
    { "type": "text", "id": "view_all_label", "label": "Tümünü Gör Metni", "default": "Tümünü Oku" },
    { "type": "url", "id": "view_all_url", "label": "Tümünü Gör URL", "default": "/" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "article",
      "name": "Yazı",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Görsel" },
        { "type": "text", "id": "category", "label": "Kategori (ops.)", "default": "Cilt Bakımı" },
        { "type": "text", "id": "title", "label": "Başlık", "default": "Aktif İçerik Nedir, Nasıl Okunur?" },
        { "type": "textarea", "id": "excerpt", "label": "Özet", "default": "Etikette gördüğün oranların ne anlama geldiğini açıklıyoruz." },
        { "type": "url", "id": "url", "label": "Bağlantı", "default": "/pages" }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{
    "name": "Formula Dergi Vitrini",
    "blocks": [
      { "type": "article", "settings": { "category": "Cilt Bakımı", "title": "Aktif İçerik Nedir, Nasıl Okunur?", "excerpt": "Etikette gördüğün oranların ne anlama geldiğini açıklıyoruz." } },
      { "type": "article", "settings": { "category": "Rutin", "title": "Sabah mı Akşam mı: Ne Zaman Ne Kullanılır?", "excerpt": "Aktiflerin doğru sırası ve zamanlaması." } },
      { "type": "article", "settings": { "category": "Kaygılar", "title": "Kızarıklığa Karşı 3 Adımlık Yaklaşım", "excerpt": "Hassas ciltler için minimal ama etkili rutin." } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_COMPARISON_TABLE = `<section class="formula-compare{% if section.settings.layout_style == 'cards' %} formula-compare--cards{% endif %}${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  {% if section.settings.layout_style == 'cards' %}
    <div class="formula-compare__cards">
      {% for block in section.blocks %}
        {% if block.type == "product" %}
          <a class="formula-compare-card" href="{{ block.settings.url | default: '#' | escape }}">
            {% if block.settings.image != blank %}
              <div class="formula-compare-card__media"><img src="{{ block.settings.image | img_url: '500x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" /></div>
            {% endif %}
            <p class="formula-compare-card__name">{{ block.settings.name | default: "Ürün" | escape }}</p>
            <dl class="formula-compare-card__specs">
              {% if section.settings.feature1_label != blank %}<div><dt>{{ section.settings.feature1_label | escape }}</dt><dd>{{ block.settings.feature1_value | default: "—" | escape }}</dd></div>{% endif %}
              {% if section.settings.feature2_label != blank %}<div><dt>{{ section.settings.feature2_label | escape }}</dt><dd>{{ block.settings.feature2_value | default: "—" | escape }}</dd></div>{% endif %}
              {% if section.settings.feature3_label != blank %}<div><dt>{{ section.settings.feature3_label | escape }}</dt><dd>{{ block.settings.feature3_value | default: "—" | escape }}</dd></div>{% endif %}
              {% if section.settings.feature4_label != blank %}<div><dt>{{ section.settings.feature4_label | escape }}</dt><dd>{{ block.settings.feature4_value | default: "—" | escape }}</dd></div>{% endif %}
            </dl>
          </a>
        {% endif %}
      {% endfor %}
    </div>
  {% else %}
    <div class="formula-compare__scroll">
      <div class="formula-compare__table" style="--formula-compare-cols: {{ section.blocks.size }}">
        <div class="formula-compare__row formula-compare__row--head">
          <div class="formula-compare__cell formula-compare__cell--label"></div>
          {% for block in section.blocks %}
            {% if block.type == "product" %}
              <a class="formula-compare__cell formula-compare__cell--product" href="{{ block.settings.url | default: '#' | escape }}">
                {% if block.settings.image != blank %}
                  <img src="{{ block.settings.image | img_url: '300x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" />
                {% endif %}
                <p>{{ block.settings.name | default: "Ürün" | escape }}</p>
              </a>
            {% endif %}
          {% endfor %}
        </div>
        {% if section.settings.feature1_label != blank %}
          <div class="formula-compare__row">
            <div class="formula-compare__cell formula-compare__cell--label">{{ section.settings.feature1_label | escape }}</div>
            {% for block in section.blocks %}{% if block.type == "product" %}<div class="formula-compare__cell">{{ block.settings.feature1_value | default: "—" | escape }}</div>{% endif %}{% endfor %}
          </div>
        {% endif %}
        {% if section.settings.feature2_label != blank %}
          <div class="formula-compare__row">
            <div class="formula-compare__cell formula-compare__cell--label">{{ section.settings.feature2_label | escape }}</div>
            {% for block in section.blocks %}{% if block.type == "product" %}<div class="formula-compare__cell">{{ block.settings.feature2_value | default: "—" | escape }}</div>{% endif %}{% endfor %}
          </div>
        {% endif %}
        {% if section.settings.feature3_label != blank %}
          <div class="formula-compare__row">
            <div class="formula-compare__cell formula-compare__cell--label">{{ section.settings.feature3_label | escape }}</div>
            {% for block in section.blocks %}{% if block.type == "product" %}<div class="formula-compare__cell">{{ block.settings.feature3_value | default: "—" | escape }}</div>{% endif %}{% endfor %}
          </div>
        {% endif %}
        {% if section.settings.feature4_label != blank %}
          <div class="formula-compare__row">
            <div class="formula-compare__cell formula-compare__cell--label">{{ section.settings.feature4_label | escape }}</div>
            {% for block in section.blocks %}{% if block.type == "product" %}<div class="formula-compare__cell">{{ block.settings.feature4_value | default: "—" | escape }}</div>{% endif %}{% endfor %}
          </div>
        {% endif %}
      </div>
    </div>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula Karşılaştırma Tablosu",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "table",
      "options": [
        { "label": "Klasik tablo", "value": "table" },
        { "label": "Ürün kartları (mobil dostu)", "value": "cards" }
      ]
    },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Ürünleri Karşılaştır" },
    { "type": "text", "id": "feature1_label", "label": "1. Satır Etiketi", "default": "Cilt Tipi" },
    { "type": "text", "id": "feature2_label", "label": "2. Satır Etiketi", "default": "Ana Aktif" },
    { "type": "text", "id": "feature3_label", "label": "3. Satır Etiketi", "default": "Kullanım Sıklığı" },
    { "type": "text", "id": "feature4_label", "label": "4. Satır Etiketi (ops.)", "default": "Fiyat" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "product",
      "name": "Ürün",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Görsel" },
        { "type": "text", "id": "name", "label": "Ürün Adı", "default": "Niasinamid Serum" },
        { "type": "url", "id": "url", "label": "Ürün URL", "default": "#" },
        { "type": "text", "id": "feature1_value", "label": "1. Satır Değeri", "default": "Tüm Cilt Tipleri" },
        { "type": "text", "id": "feature2_value", "label": "2. Satır Değeri", "default": "%10 Niasinamid" },
        { "type": "text", "id": "feature3_value", "label": "3. Satır Değeri", "default": "Günde 2 kez" },
        { "type": "text", "id": "feature4_value", "label": "4. Satır Değeri (ops.)", "default": "₺349" }
      ]
    }
  ],
  "max_blocks": 4,
  "presets": [{
    "name": "Formula Karşılaştırma Tablosu",
    "blocks": [
      { "type": "product", "settings": { "name": "Niasinamid Serum", "feature1_value": "Yağlı/Karma", "feature2_value": "%10 Niasinamid", "feature3_value": "Günde 2 kez", "feature4_value": "₺349" } },
      { "type": "product", "settings": { "name": "Hyalüronik Asit Serum", "feature1_value": "Tüm Cilt Tipleri", "feature2_value": "%2 Hyalüronik Asit", "feature3_value": "Günde 2 kez", "feature4_value": "₺389" } },
      { "type": "product", "settings": { "name": "Retinol Bakım", "feature1_value": "Yaşlanma Karşıtı", "feature2_value": "%0.3 Retinol", "feature3_value": "Haftada 3 kez", "feature4_value": "₺429" } }
    ]
  }]
}
{% endschema %}`;

/**
 * 2026-08-20 devamı — kullanıcı: "eposta bültenine kayıt olan, kayıt
 * olurken pazarlama bildirimlerini kabul eden tüm müşteriler admin
 * müşteriler sayfasında pazarlama epostalarını onayladı gibi belirtilsin".
 * Bu section BİLEREK diğer library section'larından FARKLI — tek başına
 * markup DEĞİL, gerçek bir POST akışına bağlı: form `data-formula-
 * newsletter-form` attribute'uyla işaretli, submit'i `cartRuntimeClient.ts`
 * (ECOMMERCE proje tipinde her sayfaya enjekte edilen TEK runtime script,
 * bkz. `renderer.ts`) yakalayıp zaten PUBLIC olan `/marketing/consent`
 * uç noktasına `{ email, emailConsent: true }` gönderir. O uç nokta
 * (`marketing.ts` `upsertConsent`) artık `Customer.acceptsMarketing`'i de
 * günceliyor — admin `customers/index.tsx` listesi tam olarak bu alanı
 * okuyor ("Pazarlama ✓" rozeti). Diğer library section'larının aksine
 * (`theme-extensions.ts`'in "sahte özellik eklemeyelim" ilkesi, bkz.
 * newsletter-popup yorumu) BU form GERÇEKTEN bir yere gidiyor — o ilkeye
 * aykırı değil, TAM TERSİNE onu karşılıyor.
 */
export const FORMULA_NEWSLETTER = `<section class="formula-newsletter${revealAnimationClass()}">
  <div class="formula-newsletter__inner">
    {% if section.settings.eyebrow != blank %}<p class="formula-newsletter__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2 class="formula-newsletter__title">{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.subtitle != blank %}<p class="formula-newsletter__sub">{{ section.settings.subtitle | escape }}</p>{% endif %}
    <form class="formula-newsletter__form" data-formula-newsletter-form>
      <input class="formula-newsletter__input" type="email" name="email" placeholder="{{ section.settings.placeholder | default: 'E-posta adresin' | escape }}" required />
      <button class="formula-btn formula-btn--solid" type="submit">{{ section.settings.cta_label | default: "Katıl" | escape }}</button>
    </form>
    <p class="formula-newsletter__message" data-formula-newsletter-message></p>
    {% if section.settings.disclaimer != blank %}<p class="formula-newsletter__disclaimer">{{ section.settings.disclaimer | escape }}</p>{% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Bülten Kaydı",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Bültenimize Katıl" },
    { "type": "textarea", "id": "subtitle", "label": "Alt Metin (ops.)", "default": "Yeni formüller ve rutin önerileri e-postana gelsin." },
    { "type": "text", "id": "placeholder", "label": "Girdi Yer Tutucusu", "default": "E-posta adresin" },
    { "type": "text", "id": "cta_label", "label": "Buton Metni", "default": "Katıl" },
    { "type": "text", "id": "disclaimer", "label": "Küçük Not (ops.)", "default": "İstediğin zaman abonelikten çıkabilirsin." },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Bülten Kaydı" }]
}
{% endschema %}`;

/**
 * 2026-08-20 devamı — kullanıcı: "shopify'a bak oradan ilham al". Dawn
 * temasının (shopify/dawn GitHub) section listesinden 3 tanesi Formula'da
 * hiç karşılığı olmayan, saf-frontend (backend gerektirmeyen) desenler:
 * `collage.liquid` (asimetrik mozaik grid), `multirow.liquid` (tek section
 * içinde tekrarlayan görsel+metin satırları) ve cilt bakımı temalarına özgü
 * "öncesi/sonrası" karşılaştırma (Dawn'da yok ama niş araştırmasında en çok
 * istenen özellik). Diğer 3 fikir (basında biz, tüm koleksiyonlar arşivi,
 * ilgili ürünler, iletişim formu) backend/veri gerektirdiği için ayrı
 * araştırmadan sonra ekleniyor.
 */
/** Blok ayarı adı bilinçli olarak "scale" — "size" DEĞİL. E2E ile bulunan
 * gerçek bug: bir block ayarına literal "size" adı verilince ei-engine
 * onu Liquid'in HER nesnede örtük var olan .size (uzunluk/eleman sayısı)
 * özelliğiyle karıştırıyor ve gerçek değer yerine (block'un kendi iç
 * temsilinin alan sayısına benzer) sabit bir sayı döndürüyor — render
 * çıktısı `formula-collage__item--large` yerine `formula-collage__item--3`
 * oluyordu, TÜM bloklarda AYNI sabit değerle. `reference-ei-engine-liquid-
 * scoping-gotchas`'a eklenmesi gereken yeni bir motor tuzağı. */
export const FORMULA_COLLAGE = `<section class="formula-collage${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  <div class="formula-collage__grid">
    {% for block in section.blocks %}
      {% if block.type == "item" %}
        <a class="formula-collage__item formula-collage__item--{{ block.settings.scale | default: 'normal' }}" href="{{ block.settings.url | default: '#' | escape }}">
          {% if block.settings.image != blank %}
            <img src="{{ block.settings.image | img_url: '900x' }}" alt="{{ block.settings.label | escape }}" loading="lazy" />
          {% else %}
            <div class="formula-collage__placeholder" aria-hidden="true"></div>
          {% endif %}
          {% if block.settings.label != blank %}<span class="formula-collage__label">{{ block.settings.label | escape }}</span>{% endif %}
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Kolaj",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Koleksiyon" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "item",
      "name": "Öğe",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Görsel" },
        { "type": "text", "id": "label", "label": "Etiket (ops.)", "default": "" },
        { "type": "url", "id": "url", "label": "Bağlantı (ops.)", "default": "" },
        { "type": "select", "id": "scale", "label": "Boyut", "default": "normal",
          "options": [
            { "label": "Normal", "value": "normal" },
            { "label": "Büyük (2×2)", "value": "large" }
          ]
        }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [{
    "name": "Formula Kolaj",
    "blocks": [
      { "type": "item", "settings": { "label": "Yeni Sezon", "scale": "large" } },
      { "type": "item", "settings": { "scale": "normal" } },
      { "type": "item", "settings": { "scale": "normal" } },
      { "type": "item", "settings": { "label": "Koleksiyonu Gör", "scale": "normal" } },
      { "type": "item", "settings": { "scale": "normal" } }
    ]
  }]
}
{% endschema %}`;

export const FORMULA_MULTIROW = `<section class="formula-multirow${revealAnimationClass()}">
  {% for block in section.blocks %}
    {% if block.type == "row" %}
      <div class="formula-multirow__row{% if block.settings.layout == 'image_right' %} formula-multirow__row--reverse{% endif %}">
        <div class="formula-multirow__media" style="border-radius: {{ block.settings.image_shape | default: 18 }}px">
          {% if block.settings.image != blank %}
            <img src="{{ block.settings.image | img_url: '1200x' }}" alt="{{ block.settings.title | escape }}" loading="lazy" />
          {% else %}
            <div class="formula-multirow__placeholder" aria-hidden="true"></div>
          {% endif %}
        </div>
        <div class="formula-multirow__copy">
          {% if block.settings.eyebrow != blank %}<p class="formula-multirow__eyebrow">{{ block.settings.eyebrow | escape }}</p>{% endif %}
          <h2 class="formula-multirow__title">{{ block.settings.title | default: "Başlık" | escape }}</h2>
          {% if block.settings.body != blank %}<p class="formula-multirow__body">{{ block.settings.body | escape }}</p>{% endif %}
          {% if block.settings.cta_label != blank %}<a class="formula-btn formula-btn--solid" href="{{ block.settings.cta_url | default: '/' | escape }}">{{ block.settings.cta_label | escape }}</a>{% endif %}
        </div>
      </div>
    {% endif %}
  {% endfor %}
</section>

{% schema %}
{
  "name": "Formula Alternatif Sıra Vitrini",
  "settings": [${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "row",
      "name": "Satır",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Görsel" },
        { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "" },
        { "type": "text", "id": "title", "label": "Başlık", "default": "Başlık" },
        { "type": "textarea", "id": "body", "label": "Metin", "default": "" },
        { "type": "text", "id": "cta_label", "label": "Buton Metni (ops.)", "default": "" },
        { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı (ops.)", "default": "" },
        { "type": "select", "id": "layout", "label": "Yerleşim", "default": "image_left",
          "options": [
            { "label": "Görsel solda", "value": "image_left" },
            { "label": "Görsel sağda", "value": "image_right" }
          ]
        },
        { "type": "select", "id": "image_shape", "label": "Görsel Şekli", "default": "18",
          "options": [
            { "label": "Köşeli", "value": "0" },
            { "label": "Yumuşak", "value": "18" },
            { "label": "Yuvarlak", "value": "32" },
            { "label": "Oval", "value": "64" }
          ]
        }
      ]
    }
  ],
  "max_blocks": 4,
  "presets": [{
    "name": "Formula Alternatif Sıra Vitrini",
    "blocks": [
      { "type": "row", "settings": { "eyebrow": "01", "title": "Temizle", "body": "Cildi kurutmadan, koruma bariyerine dokunmadan temizler.", "layout": "image_left" } },
      { "type": "row", "settings": { "eyebrow": "02", "title": "Besle", "body": "Aktif oranları etikette — ne sürdüğünü tam olarak bilirsin.", "layout": "image_right" } },
      { "type": "row", "settings": { "eyebrow": "03", "title": "Koru", "body": "Gün boyu koruma, gece boyu onarım.", "layout": "image_left" } }
    ]
  }]
}
{% endschema %}`;

/** Sürükleme YOK — sürekli `pointermove` takibi gerektirir, bu dosyadaki
 * TÜM diğer etkileşimler (slider okları dahil) tek satırlık `onclick`
 * attribute'u, kalıcı bir `<script>` bloğu YOK (bkz. dosyanın geri kalanı).
 * Onun yerine native `<input type="range">` (opacity:0, tüm görselin
 * üzerine kaplanmış) + TEK `oninput` attribute'u `--ba-pos` CSS custom
 * property'sini günceller; "before" katmanı `clip-path: inset()` ile o
 * değere göre kırpılır. Klavyeyle de (ok tuşları) çalışır — native range
 * input olduğu için ekstra bir şey gerekmedi. */
export const FORMULA_BEFORE_AFTER = `<section class="formula-before-after${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  <div class="formula-ba" style="--ba-pos: 50%; aspect-ratio: {{ section.settings.aspect_ratio | default: '4/3' }}">
    <div class="formula-ba__layer formula-ba__layer--after">
      {% if section.settings.after_image != blank %}
        <img src="{{ section.settings.after_image | img_url: '1200x' }}" alt="{{ section.settings.after_label | default: 'Sonra' | escape }}" loading="lazy" />
      {% else %}
        <div class="formula-ba__placeholder" aria-hidden="true"></div>
      {% endif %}
    </div>
    <div class="formula-ba__layer formula-ba__layer--before" style="clip-path: inset(0 calc(100% - var(--ba-pos)) 0 0)">
      {% if section.settings.before_image != blank %}
        <img src="{{ section.settings.before_image | img_url: '1200x' }}" alt="{{ section.settings.before_label | default: 'Önce' | escape }}" loading="lazy" />
      {% else %}
        <div class="formula-ba__placeholder" aria-hidden="true"></div>
      {% endif %}
    </div>
    <div class="formula-ba__divider" style="left: var(--ba-pos)" aria-hidden="true"></div>
    {% if section.settings.before_label != blank %}<span class="formula-ba__tag formula-ba__tag--before">{{ section.settings.before_label | escape }}</span>{% endif %}
    {% if section.settings.after_label != blank %}<span class="formula-ba__tag formula-ba__tag--after">{{ section.settings.after_label | escape }}</span>{% endif %}
    <input class="formula-ba__range" type="range" min="0" max="100" value="50" aria-label="Öncesi sonrası kaydırıcısı" oninput="this.closest('.formula-ba').style.setProperty('--ba-pos', this.value + '%')" />
  </div>
</section>

{% schema %}
{
  "name": "Formula Öncesi / Sonrası",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Öncesi / Sonrası" },
    { "type": "image_picker", "id": "before_image", "label": "Önce Görseli" },
    { "type": "text", "id": "before_label", "label": "Önce Etiketi", "default": "Önce" },
    { "type": "image_picker", "id": "after_image", "label": "Sonra Görseli" },
    { "type": "text", "id": "after_label", "label": "Sonra Etiketi", "default": "Sonra" },
    { "type": "select", "id": "aspect_ratio", "label": "Görsel Oranı", "default": "4/3",
      "options": [
        { "label": "Standart (4:3)", "value": "4/3" },
        { "label": "Kare (1:1)", "value": "1/1" },
        { "label": "Geniş (16:9)", "value": "16/9" }
      ]
    },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Öncesi / Sonrası" }]
}
{% endschema %}`;

/**
 * 2026-08-20 devamı — kullanıcı: "en son bakılanlar sectionı ekle genel
 * temaya". Backend'de ID-listesiyle toplu ürün getiren public bir route YOK
 * (araştırıldı) — yeni bir tane eklemek yerine `eipgTheme.ts`'in ürün
 * sayfasında zaten bastığı `window.__EI_PRODUCT__` anlık görüntüsünü
 * (cartRuntimeClient.ts) localStorage'a biriktirip buradan okuyoruz. Bu
 * section Studio'nun KENDİ önizlemesinde (gerçek sayfa geçmişi yok) hep boş
 * görünür — `data-formula-recently-viewed` grid'i sadece yayınlanmış sitede,
 * gerçek gezinme sonrası dolar; aynı cart-badge/checkout gibi "sadece
 * published'ta çalışır" sınıfı (bkz. formulaPages.ts'in cart runtime notu).
 */
export const FORMULA_RECENTLY_VIEWED = `<section class="formula-recently-viewed{% if section.settings.layout_style == 'carousel' %} formula-recently-viewed--carousel{% elsif section.settings.layout_style == 'compact' %} formula-recently-viewed--compact{% endif %}${revealAnimationClass()}" style="--formula-recently-viewed-cols: {{ section.settings.columns | default: 4 }}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  <div class="formula-recently-viewed__grid" data-formula-recently-viewed data-limit="{{ section.settings.limit | default: 4 }}" data-card-style="{{ section.settings.card_style | default: 'minimal' }}"></div>
</section>

{% schema %}
{
  "name": "Formula Son Bakılanlar",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid",
      "options": [
        { "label": "Grid", "value": "grid" },
        { "label": "Carousel", "value": "carousel" },
        { "label": "Kompakt yatay satır", "value": "compact" }
      ]
    },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Son Baktıkların" },
    { "type": "range", "id": "limit", "label": "Gösterilecek Ürün Sayısı", "min": 2, "max": 8, "step": 1, "default": 4 },
    { "type": "range", "id": "columns", "label": "Sütun Sayısı", "min": 2, "max": 6, "step": 1, "default": 4 },
    { "type": "select", "id": "card_style", "label": "Kart Stili", "default": "minimal",
      "options": [
        { "label": "Minimal", "value": "minimal" },
        { "label": "Çerçeveli", "value": "bordered" },
        { "label": "Gölgeli", "value": "shadow" }
      ]
    },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Son Bakılanlar" }]
}
{% endschema %}`;

/**
 * 2026-08-20 devamı — kullanıcı: önerilen 6 Dawn-ilhamlı fikirden "İlgili
 * Ürünler" (Related Products). Bu TAMAMEN sunucu tarafında render edilir —
 * `recommendations` context anahtarı zaten VAR (ecommerceContext.ts'in
 * buildRecommendations'ı, sadece ürün detay sayfasında dolduruluyor:
 * manuel product.metafields.crossSell → "birlikte alınanlar" → aynı
 * kategori sırasıyla). Bu section ürün sayfası DIŞINDA bir sayfaya eklenirse
 * `recommendations.performed` yok/false olur ve section HİÇBİR ŞEY
 * render etmez (sessiz no-op, hata değil) — kütüphaneye eklenmiş olması
 * her sayfada anlamlı olacağı anlamına gelmez, sadece HER ZAMAN teklif
 * edilen ortak kataloğun (`AddSectionPanel`) bir parçası.
 */
export const FORMULA_RELATED_PRODUCTS = `<section{% if recommendations.performed %} class="formula-related{% if section.settings.layout_style == 'carousel' %} formula-related--carousel{% elsif section.settings.layout_style == 'compact' %} formula-related--compact{% endif %}${revealAnimationClass()}" style="--formula-related-cols: {{ section.settings.columns | default: 4 }}"{% endif %}>
  {% if recommendations.performed %}
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
  </div>
  <div class="formula-related__grid">
    {% for p in recommendations.products %}
      <a class="formula-product-card formula-product-card--{{ section.settings.card_style | default: 'minimal' }}" href="{{ p.url | escape }}">
        <div class="formula-product-card__media">
          {% if p.images.size > 0 %}
            <img src="{{ p.images.first | img_url: '700x' }}" alt="{{ p.title | escape }}" loading="lazy" />
          {% else %}
            <div class="formula-product-card__placeholder" aria-hidden="true"></div>
          {% endif %}
        </div>
        {% if section.settings.show_vendor and p.vendor != blank %}<p class="formula-product-card__vendor">{{ p.vendor | escape }}</p>{% endif %}
        <p class="formula-product-card__name">{{ p.title | escape }}</p>
        <p class="formula-product-card__price">{{ p.price | money }}</p>
      </a>
    {% endfor %}
  </div>
  {% endif %}
</section>

{% schema %}
{
  "name": "Formula İlgili Ürünler",
  "settings": [
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid",
      "options": [
        { "label": "Grid", "value": "grid" },
        { "label": "Carousel", "value": "carousel" },
        { "label": "Kompakt yatay satır", "value": "compact" }
      ]
    },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Bunları da Beğenebilirsin" },
    { "type": "range", "id": "columns", "label": "Sütun Sayısı", "min": 2, "max": 5, "step": 1, "default": 4 },
    { "type": "select", "id": "card_style", "label": "Kart Stili", "default": "minimal",
      "options": [
        { "label": "Minimal", "value": "minimal" },
        { "label": "Çerçeveli", "value": "bordered" },
        { "label": "Gölgeli", "value": "shadow" }
      ]
    },
    { "type": "checkbox", "id": "show_vendor", "label": "Marka göster", "default": false },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula İlgili Ürünler" }]
}
{% endschema %}`;

/**
 * 2026-08-23 — 20.08-revizeler.md madde 6: "iletişim formu MOCK değil GERÇEK
 * olmalı, backend'de de karşılığı olmalı". Gönderilen mesaj gerçekten DB'ye
 * yazılıyor (`ContactMessage`, `packages/modules/ecommerce/src/routes/messages.ts`,
 * `POST /api/v1/p/:projectId/contact`, auth yok — herkes iletişim kurabilmeli)
 * ve admin panelde gerçek bir "Mesajlar" gelen kutusunda (`/messages`)
 * görünüyor. E-posta bildirimi BİLİNÇLİ atlandı — bu ortamda hiçbir e-posta
 * sağlayıcısı (RESEND_API_KEY) yapılandırılı değil, o kodu yazmak
 * doğrulanamaz/çalışmayan bir özellik eklemek olurdu; DB'ye kalıcı yazılıp
 * gerçek bir admin sayfasından okunması "mock değil gerçek" şartını zaten
 * karşılıyor. Diğer library section'ların aksine bir class/CSS bağımlılığı
 * YOK — tamamen inline stil (favoriler/hesabım'daki AYNI tercih, bkz.
 * universalPages.ts) — böylece `FORMULA_LIBRARY_SECTIONS_CSS`'in eski
 * projelere patch'lenmesi gereken staleness sorununa hiç girmiyor.
 */
export const FORMULA_CONTACT_FORM = `<section data-section-id="{{ section.id }}" style="padding:64px 24px;background:{{ section.settings.bg | default: 'var(--color-background)' }}">
  <div style="width:min(100%,{{ section.settings.max_width | default: 640 }}px);margin:0 auto;text-align:{{ section.settings.align | default: 'left' }}">
    {% if section.settings.eyebrow != blank %}<p style="font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:{{ section.settings.accent | default: 'var(--color-accent)' }};margin:0 0 10px">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2 style="font-size:clamp(24px,4vw,34px);font-weight:900;letter-spacing:-.03em;margin:0 0 12px;color:{{ section.settings.text | default: 'var(--color-text)' }}">{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.subtitle != blank %}<p style="font-size:15px;line-height:1.7;color:{{ section.settings.muted | default: 'var(--color-muted)' }};margin:0 0 28px">{{ section.settings.subtitle | escape }}</p>{% endif %}
    <form data-eidea-contact-form data-success-message="{{ section.settings.success_message | default: 'Mesajın alındı, en kısa sürede dönüş yapacağız.' | escape }}" style="display:grid;gap:12px;text-align:left">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label style="display:grid;gap:6px;font-size:13px;font-weight:700;color:{{ section.settings.text | default: 'var(--color-text)' }}"><span>Ad Soyad</span><input name="name" required style="height:46px;border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:0 14px"></label>
        <label style="display:grid;gap:6px;font-size:13px;font-weight:700;color:{{ section.settings.text | default: 'var(--color-text)' }}"><span>E-posta</span><input type="email" name="email" required style="height:46px;border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:0 14px"></label>
      </div>
      {% if section.settings.show_phone %}<label style="display:grid;gap:6px;font-size:13px;font-weight:700;color:{{ section.settings.text | default: 'var(--color-text)' }}"><span>Telefon (ops.)</span><input name="phone" type="tel" inputmode="numeric" pattern="[0-9]*" placeholder="05XX XXX XX XX" data-eidea-phone-field style="height:46px;border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:0 14px"></label>{% endif %}
      {% if section.settings.show_subject %}<label style="display:grid;gap:6px;font-size:13px;font-weight:700;color:{{ section.settings.text | default: 'var(--color-text)' }}"><span>Konu (ops.)</span><input name="subject" style="height:46px;border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:0 14px"></label>{% endif %}
      <label style="display:grid;gap:6px;font-size:13px;font-weight:700;color:{{ section.settings.text | default: 'var(--color-text)' }}"><span>Mesajın</span><textarea name="message" required rows="5" style="border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:12px 14px;font-family:inherit;resize:vertical"></textarea></label>
      {%- comment -%}
        2026-08-23 — kullanıcı isteği: Studio'dan mağaza sahibi formu
        istediği kadar özel soruyla genişletebilsin (kısa metin/uzun metin/
        çoktan seçmeli/dosya). Her "question" block'u kendi tipine göre
        farklı bir alan basıyor, cevaplar q_{{ block.id }} adıyla submit
        edilip messages.ts'te answers JSON'a toplanıyor.
      {%- endcomment -%}
      {% for block in section.blocks %}
        {% if block.type == "question" %}
          <label data-eidea-contact-question data-question-id="{{ block.id }}" data-question-type="{{ block.settings.field_type | default: 'short_text' }}" data-question-label="{{ block.settings.label | default: 'Soru' | escape }}" style="display:grid;gap:6px;font-size:13px;font-weight:700;color:{{ section.settings.text | default: 'var(--color-text)' }}">
            <span>{{ block.settings.label | default: "Soru" | escape }}{% if block.settings.required %} *{% endif %}</span>
            {% if block.settings.field_type == "long_text" %}
              <textarea name="q_{{ block.id }}" rows="4" {% if block.settings.required %}required{% endif %} style="border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:12px 14px;font-family:inherit;resize:vertical"></textarea>
            {% elsif block.settings.field_type == "choice" %}
              {%- comment -%}
                ei-engine'in for tag'i "in X" kısmını evaluatePipeline DEĞİL
                evaluateExpression ile çözüyor — filtre (| split) desteklemiyor,
                sessizce boş array'e düşüyor (gerçek render testiyle bulundu,
                reference-ei-engine-liquid-scoping-gotchas'a eklenmeli). Bu
                yüzden önce assign ile ayrı bir adımda bölünüyor (assign
                evaluatePipeline kullanıyor, filtre destekliyor) — bu assign
                bir for İÇİNDE DEĞİL, sadece if/elsif içinde (if kendi scope
                kopyası oluşturmuyor, aynı obje referansını paylaşıyor), o
                yüzden hemen altındaki for tarafından güvenle okunabiliyor.
              {%- endcomment -%}
              {% assign contact_choice_options = block.settings.options | split: "," %}
              <select name="q_{{ block.id }}" {% if block.settings.required %}required{% endif %} style="height:46px;border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:0 14px;background:#fff">
                <option value="">Seçiniz</option>
                {% for opt in contact_choice_options %}
                  {% if opt != blank %}<option value="{{ opt | strip | escape }}">{{ opt | strip | escape }}</option>{% endif %}
                {% endfor %}
              </select>
            {% elsif block.settings.field_type == "file" %}
              <input type="file" name="q_{{ block.id }}" data-eidea-contact-file {% if block.settings.required %}required{% endif %} style="border-radius:10px;border:1px dashed {{ section.settings.border | default: '#e5e7eb' }};padding:12px 14px">
            {% else %}
              <input type="text" name="q_{{ block.id }}" {% if block.settings.required %}required{% endif %} style="height:46px;border-radius:10px;border:1px solid {{ section.settings.border | default: '#e5e7eb' }};padding:0 14px">
            {% endif %}
          </label>
        {% endif %}
      {% endfor %}
      <button type="submit" style="justify-self:start;height:48px;padding:0 28px;border:0;border-radius:10px;background:{{ section.settings.button_bg | default: '#111827' }};color:{{ section.settings.button_text | default: '#ffffff' }};font-weight:800;cursor:pointer">{{ section.settings.submit_label | default: "Gönder" | escape }}</button>
      <p data-eidea-contact-form-message style="font-size:13px;margin:0"></p>
    </form>
  </div>
</section>

{% schema %}
{
  "name": "İletişim Formu",
  "settings": [
    { "type": "header", "content": "İçerik" },
    { "type": "text", "id": "eyebrow", "label": "Üst etiket", "default": "" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Bize Ulaşın" },
    { "type": "textarea", "id": "subtitle", "label": "Alt metin", "default": "Sorularınız için formu doldurun, en kısa sürede dönüş yapalım." },
    { "type": "text", "id": "submit_label", "label": "Gönder buton metni", "default": "Gönder" },
    { "type": "text", "id": "success_message", "label": "Başarı mesajı", "default": "Mesajın alındı, en kısa sürede dönüş yapacağız." },
    { "type": "checkbox", "id": "show_phone", "label": "Telefon alanı göster", "default": true },
    { "type": "checkbox", "id": "show_subject", "label": "Konu alanı göster", "default": false },
    { "type": "header", "content": "Layout" },
    { "type": "select", "id": "align", "label": "Hiza", "default": "left", "options": [{"label":"Sol","value":"left"},{"label":"Orta","value":"center"}] },
    { "type": "range", "id": "max_width", "label": "Maksimum genişlik", "min": 420, "max": 900, "step": 20, "unit": "px", "default": 640 },
    { "type": "header", "content": "Renkler" },
    { "type": "color", "id": "bg", "label": "Arka plan" },
    { "type": "color", "id": "text", "label": "Yazı" },
    { "type": "color", "id": "muted", "label": "İkincil yazı" },
    { "type": "color", "id": "accent", "label": "Vurgu" },
    { "type": "color", "id": "border", "label": "Çizgi", "default": "#e5e7eb" },
    { "type": "color", "id": "button_bg", "label": "Buton arka plan", "default": "#111827" },
    { "type": "color", "id": "button_text", "label": "Buton yazı", "default": "#ffffff" }
  ],
  "blocks": [
    {
      "type": "question",
      "name": "Özel Soru",
      "settings": [
        { "type": "text", "id": "label", "label": "Soru metni", "default": "Soru" },
        { "type": "select", "id": "field_type", "label": "Cevap tipi", "default": "short_text",
          "options": [
            { "label": "Kısa metin", "value": "short_text" },
            { "label": "Uzun metin", "value": "long_text" },
            { "label": "Çoktan seçmeli", "value": "choice" },
            { "label": "Dosya", "value": "file" }
          ]
        },
        { "type": "text", "id": "options", "label": "Seçenekler (virgülle ayır, sadece Çoktan seçmeli için)", "default": "Seçenek 1, Seçenek 2" },
        { "type": "checkbox", "id": "required", "label": "Zorunlu", "default": false }
      ]
    }
  ],
  "presets": [{ "name": "İletişim Formu" }]
}
{% endschema %}`;

/**
 * 2026-08-23 — Faz 6. `FORMULA_MARQUEE`'den (brand-marquee) FARKI: o section
 * manuel/editoryal bloklarla düz METİN kayan yazı basıyor (gerçek marka
 * verisine hiç bağlı değil). Bu section GERÇEK `Brand` kayıtlarını (logoUrl
 * dahil) kullanıyor — `ecommerceContext.ts`'teki `resolveBrandsSlider()`
 * SADECE bu section tipi sayfada varsa çalışıyor (lazy, her sayfada ekstra
 * sorguya girmemek için — bkz. o fonksiyonun kendi yorumu). Native CSS
 * `scroll-snap` ile kaydırılabilir/dokunmatik-dostu bir "slider" — ayrı bir
 * JS kütüphanesi/karousel motoru GEREKMİYOR, sadece iki ok butonu
 * `scrollBy` ile (inline onclick, quantity-selector'daki AYNI desen).
 */
export const FORMULA_BRANDS_SLIDER = `<section class="formula-brands-slider${revealAnimationClass()}">
  <div class="formula-section-head">
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.show_arrows %}
      <div class="formula-brands-slider__nav">
        <button type="button" aria-label="Önceki" onclick="this.closest('.formula-brands-slider').querySelector('.formula-brands-slider__track').scrollBy({left:-240,behavior:'smooth'})">←</button>
        <button type="button" aria-label="Sonraki" onclick="this.closest('.formula-brands-slider').querySelector('.formula-brands-slider__track').scrollBy({left:240,behavior:'smooth'})">→</button>
      </div>
    {% endif %}
  </div>
  <div class="formula-brands-slider__track">
    {% for brand in all_brands %}
      <a class="formula-brands-slider__item" href="{{ brand.url | escape }}">
        {% if brand.logo_url != blank %}
          <img src="{{ brand.logo_url | img_url: '300x' }}" alt="{{ brand.title | escape }}" loading="lazy" />
        {% else %}
          <span class="formula-brands-slider__name">{{ brand.title | escape }}</span>
        {% endif %}
      </a>
    {% else %}
      <p class="formula-brands-slider__empty">Henüz marka eklenmemiş.</p>
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Markalar Slider",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Markalarımız" },
    { "type": "checkbox", "id": "show_arrows", "label": "Ok butonları göster", "default": true },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Markalar Slider" }]
}
{% endschema %}`;

// 2026-08-24 — Formula tema genişletmesi, Codex'in önerdiği yeni section
// tiplerinden ilki (bkz. 24.08-formula-genisletme-codex-fikirleri.md madde 4,
// "en basit/izole — yeni veri modeli gerektirmiyor" notu). Geri sayım
// istemci tarafında saniye başı güncelleniyor (SSR sadece bitiş zamanını
// data-attribute olarak taşır) — diğer section'lardaki inline <script>
// deseniyle (ör. FORMULA_BRANDS_SLIDER'ın onclick'i, reviews'ün star-picker'ı)
// tutarlı, ekstra bağımlılık yok. `end_at` boşsa veya geçersizse sayaç hiç
// gösterilmez (sessizce bozuk görünmek yerine).
export const FORMULA_COUNTDOWN_PROMOTION = `<section class="formula-countdown${revealAnimationClass()}" data-countdown-end="{{ section.settings.end_at | escape }}" data-countdown-behavior="{{ section.settings.expired_behavior | default: 'message' }}" style="{% if section.settings.bg_color != blank %}background:{{ section.settings.bg_color }};{% endif %}{% if section.settings.text_color != blank %}color:{{ section.settings.text_color }};{% endif %}">
  <div class="formula-countdown__inner">
    {% if section.settings.heading != blank %}<p class="formula-countdown__heading">{{ section.settings.heading | escape }}</p>{% endif %}
    {% if section.settings.subtitle != blank %}<p class="formula-countdown__sub">{{ section.settings.subtitle | escape }}</p>{% endif %}
    <div class="formula-countdown__timer" data-countdown-timer>
      <div class="formula-countdown__unit"><span data-countdown-days>00</span><label>Gün</label></div>
      <div class="formula-countdown__unit"><span data-countdown-hours>00</span><label>Saat</label></div>
      <div class="formula-countdown__unit"><span data-countdown-minutes>00</span><label>Dk</label></div>
      <div class="formula-countdown__unit"><span data-countdown-seconds>00</span><label>Sn</label></div>
    </div>
    <p class="formula-countdown__expired" data-countdown-expired hidden>{{ section.settings.expired_message | default: "Kampanya sona erdi." | escape }}</p>
    {% if section.settings.cta_label != blank %}
      <a class="formula-btn{% if section.settings.accent_color != blank %} formula-btn--solid{% else %} formula-btn--solid{% endif %}" href="{{ section.settings.cta_url | default: '/products' | escape }}"{% if section.settings.accent_color != blank %} style="background:{{ section.settings.accent_color }};border-color:{{ section.settings.accent_color }}"{% endif %}>{{ section.settings.cta_label | escape }}</a>
    {% endif %}
  </div>
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-countdown");
      if (!root) return;
      var endRaw = root.getAttribute("data-countdown-end");
      var end = endRaw ? new Date(endRaw).getTime() : NaN;
      var timerEl = root.querySelector("[data-countdown-timer]");
      var expiredEl = root.querySelector("[data-countdown-expired]");
      if (!end || isNaN(end)) {
        if (timerEl) timerEl.hidden = true;
        return;
      }
      var daysEl = root.querySelector("[data-countdown-days]");
      var hoursEl = root.querySelector("[data-countdown-hours]");
      var minutesEl = root.querySelector("[data-countdown-minutes]");
      var secondsEl = root.querySelector("[data-countdown-seconds]");
      var pad = function (n) { return String(n).length < 2 ? "0" + n : String(n); };
      var intervalId;
      function tick() {
        var diff = end - Date.now();
        if (diff <= 0) {
          clearInterval(intervalId);
          if (timerEl) timerEl.hidden = true;
          var behavior = root.getAttribute("data-countdown-behavior");
          if (behavior === "hide") {
            root.style.display = "none";
          } else if (expiredEl) {
            expiredEl.hidden = false;
          }
          return;
        }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        if (daysEl) daysEl.textContent = pad(d);
        if (hoursEl) hoursEl.textContent = pad(h);
        if (minutesEl) minutesEl.textContent = pad(m);
        if (secondsEl) secondsEl.textContent = pad(s);
      }
      tick();
      intervalId = setInterval(tick, 1000);
    })();
  </script>
</section>

{% schema %}
{
  "name": "Formula Kampanya Geri Sayımı",
  "settings": [
    { "type": "text", "id": "heading", "label": "Başlık", "default": "Kampanya bitmeden yakala" },
    { "type": "text", "id": "subtitle", "label": "Alt Metin", "default": "Sınırlı süreli fırsat" },
    { "type": "text", "id": "end_at", "label": "Bitiş Tarihi/Saati (ör. 2026-12-31T23:59)", "default": "" },
    { "type": "select", "id": "expired_behavior", "label": "Süre Dolunca", "default": "message",
      "options": [
        { "label": "Mesaj göster", "value": "message" },
        { "label": "Section'ı gizle", "value": "hide" }
      ]
    },
    { "type": "text", "id": "expired_message", "label": "Süre Dolunca Mesajı", "default": "Kampanya sona erdi." },
    { "type": "text", "id": "cta_label", "label": "Buton Metni", "default": "Şimdi Al" },
    { "type": "url", "id": "cta_url", "label": "Buton URL", "default": "/products" },
    { "type": "header", "id": "countdown_design", "label": "Tasarım" },
    { "type": "color", "id": "bg_color", "label": "Arka plan (boş = tema rengi)" },
    { "type": "color", "id": "text_color", "label": "Metin rengi (boş = tema rengi)" },
    { "type": "color", "id": "accent_color", "label": "Buton rengi (boş = tema vurgu rengi)" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Kampanya Geri Sayımı" }]
}
{% endschema %}`;

/** Alışveriş Yapılabilir Görsel (2026-08-24, Codex'in `shoppable-image`
 * önerisi) — büyük bir görsel üzerinde ürün noktaları (hotspot), tıklanınca
 * küçük bir kart (görsel/ad/fiyat/rozet/link) açılır. `comparison-table`'ın
 * "product" bloğuyla AYNI desen: gerçek connector ürün bağlantısı YOK
 * (ei-engine'in `{"type":"product"}` şema alanı var ama renderer'da
 * (`ecommerceContext.ts`) hiç çözümlenmiyor — araştırıldı, kullanılmadı),
 * bunun yerine manuel ad/fiyat/URL alanları. Kart açma/kapama TEK
 * self-contained script (`document.currentScript.closest`, FAQ/countdown'la
 * aynı desen), dışarı tıklayınca kapanır. */
export const FORMULA_SHOPPABLE_IMAGE = `<section class="formula-shoppable-image{% if section.settings.image_ratio == 'portrait' %} formula-shoppable-image--portrait{% elsif section.settings.image_ratio == 'landscape' %} formula-shoppable-image--landscape{% endif %}${revealAnimationClass()}" style="{% if section.settings.bg_color != blank %}background:{{ section.settings.bg_color }};{% endif %}{% if section.settings.text_color != blank %}color:{{ section.settings.text_color }};{% endif %}">
  {% if section.settings.title != blank %}<h2 class="formula-shoppable-image__title">{{ section.settings.title | escape }}</h2>{% endif %}
  <div class="formula-shoppable-image__stage">
    {% if section.settings.image != blank %}
      <img class="formula-shoppable-image__media" src="{{ section.settings.image | img_url: '1400x' }}" alt="{{ section.settings.title | default: '' | escape }}" loading="lazy" />
    {% endif %}
    {% for block in section.blocks %}
      {% if block.type == "hotspot" %}
        <button type="button" class="formula-shoppable-image__dot" style="left:{{ block.settings.position_x | default: 50 }}%;top:{{ block.settings.position_y | default: 50 }}%;{% if section.settings.dot_color != blank %}background:{{ section.settings.dot_color }};{% endif %}" data-hotspot-toggle aria-expanded="false" aria-label="{{ block.settings.name | escape }}">
          <span class="formula-shoppable-image__dot-pulse" style="{% if section.settings.dot_color != blank %}background:{{ section.settings.dot_color }};{% endif %}"></span>
        </button>
        <div class="formula-shoppable-image__card" style="left:{{ block.settings.position_x | default: 50 }}%;top:{{ block.settings.position_y | default: 50 }}%" data-hotspot-card hidden>
          {% if block.settings.image != blank %}<img class="formula-shoppable-image__card-media" src="{{ block.settings.image | img_url: '160x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" />{% endif %}
          <div class="formula-shoppable-image__card-body">
            {% if block.settings.badge != blank %}<span class="formula-shoppable-image__card-badge">{{ block.settings.badge | escape }}</span>{% endif %}
            <p class="formula-shoppable-image__card-name">{{ block.settings.name | escape }}</p>
            {% if block.settings.price != blank %}<p class="formula-shoppable-image__card-price">{{ block.settings.price | escape }}</p>{% endif %}
            <a class="formula-shoppable-image__card-link" href="{{ block.settings.url | default: '#' | escape }}">Ürünü Gör</a>
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-shoppable-image");
      if (!root) return;
      var stage = root.querySelector(".formula-shoppable-image__stage");
      if (!stage) return;
      var toggles = stage.querySelectorAll("[data-hotspot-toggle]");
      function closeAll(except) {
        toggles.forEach(function (btn) {
          if (btn === except) return;
          btn.setAttribute("aria-expanded", "false");
          var card = btn.nextElementSibling;
          if (card) card.hidden = true;
        });
      }
      toggles.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var card = btn.nextElementSibling;
          var isOpen = btn.getAttribute("aria-expanded") === "true";
          closeAll(btn);
          if (card) card.hidden = isOpen;
          btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
        });
      });
      document.addEventListener("click", function () { closeAll(null); });
    })();
  </script>
</section>

{% schema %}
{
  "name": "Formula Alışveriş Yapılabilir Görsel",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "Görünümü Satın Al" },
    { "type": "image_picker", "id": "image", "label": "Ana Görsel" },
    { "type": "select", "id": "image_ratio", "label": "Görsel Oranı", "default": "square",
      "options": [
        { "label": "Kare", "value": "square" },
        { "label": "Dikey (portre)", "value": "portrait" },
        { "label": "Yatay", "value": "landscape" }
      ]
    },
    { "type": "color", "id": "bg_color", "label": "Arka plan (boş = tema rengi)" },
    { "type": "color", "id": "text_color", "label": "Metin rengi (boş = tema rengi)" },
    { "type": "color", "id": "dot_color", "label": "Nokta rengi", "default": "#111111" },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "hotspot",
      "name": "Ürün Noktası",
      "settings": [
        { "type": "range", "id": "position_x", "label": "Yatay Konum (%)", "min": 0, "max": 100, "step": 1, "default": 50 },
        { "type": "range", "id": "position_y", "label": "Dikey Konum (%)", "min": 0, "max": 100, "step": 1, "default": 50 },
        { "type": "image_picker", "id": "image", "label": "Küçük Görsel (ops.)" },
        { "type": "text", "id": "name", "label": "Ürün Adı", "default": "Ürün Adı" },
        { "type": "text", "id": "price", "label": "Fiyat", "default": "₺349" },
        { "type": "text", "id": "badge", "label": "Rozet (ops.)", "default": "" },
        { "type": "url", "id": "url", "label": "Ürün URL", "default": "#" }
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [{
    "name": "Formula Alışveriş Yapılabilir Görsel",
    "blocks": [
      { "type": "hotspot", "settings": { "position_x": 32, "position_y": 45, "name": "Niasinamid Serum", "price": "₺349" } },
      { "type": "hotspot", "settings": { "position_x": 68, "position_y": 62, "name": "Nazik Temizleyici Jel", "price": "₺249" } }
    ]
  }]
}
{% endschema %}`;

/** Sabit paket v1: connector ürün seçicisi Liquid'de çözülmediği için ürün ve
 * varyant kimlikleri açıkça girilir. İstek yine storefront'un kanonik
 * `/cart/add` endpoint'ine gider; fiyat hiçbir zaman client'tan gönderilmez. */
export const FORMULA_BUNDLE_BUILDER = `<section class="formula-bundle${revealAnimationClass()}" data-bundle-root>
  <div class="formula-section-head">
    {% if section.settings.eyebrow != blank %}<p class="formula-bundle__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.description != blank %}<p>{{ section.settings.description | escape }}</p>{% endif %}
  </div>
  <div class="formula-bundle__grid">
    {% for block in section.blocks %}
      {% if block.type == "item" %}
        <label class="formula-bundle-card">
          <input type="checkbox" data-bundle-item data-product-id="{{ block.settings.product_id | escape }}" data-variant-id="{{ block.settings.variant_id | escape }}" {% if block.settings.selected %}checked{% endif %} {% if block.settings.product_id == blank %}disabled{% endif %} />
          {% if block.settings.image != blank %}<span class="formula-bundle-card__media"><img src="{{ block.settings.image | img_url: '600x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" /></span>{% endif %}
          <span class="formula-bundle-card__body">
            {% if block.settings.badge != blank %}<span class="formula-bundle-card__badge">{{ block.settings.badge | escape }}</span>{% endif %}
            {% if block.settings.name != blank %}<strong>{{ block.settings.name | escape }}</strong>{% endif %}
            {% if block.settings.price != blank %}<span>{{ block.settings.price | escape }}</span>{% endif %}
          </span>
        </label>
      {% endif %}
    {% endfor %}
  </div>
  <div class="formula-bundle__action">
    {% if section.settings.button_label != blank %}<button type="button" data-bundle-add>{{ section.settings.button_label | escape }}</button>{% endif %}
    <p data-bundle-status aria-live="polite"></p>
  </div>
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-bundle");
      if (!root) return;
      var button = root.querySelector("[data-bundle-add]");
      var status = root.querySelector("[data-bundle-status]");
      if (!button) return;
      button.addEventListener("click", function () {
        var items = Array.prototype.slice.call(root.querySelectorAll("[data-bundle-item]:checked"));
        if (!items.length) { if (status) status.textContent = "Lütfen en az bir ürün seçin."; return; }
        var original = button.textContent;
        button.disabled = true;
        button.textContent = "Ekleniyor…";
        var chain = Promise.resolve();
        var lastData = null;
        items.forEach(function (item) {
          chain = chain.then(function () {
            var params = new URLSearchParams();
            params.append("product_id", item.getAttribute("data-product-id"));
            var variantId = item.getAttribute("data-variant-id");
            if (variantId) params.append("variant_id", variantId);
            params.append("quantity", "1");
            return fetch("/cart/add", { method: "POST", body: params, headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" } })
              .then(function (response) { if (!response.ok) throw new Error("add-failed"); return response.json(); })
              .then(function (data) { lastData = data; });
          });
        });
        chain.then(function () {
          button.textContent = "Eklendi ✓";
          if (status) {
            var appliedDiscount = lastData && Number(lastData.discount_total);
            status.textContent = items.length + " ürün sepete eklendi." + (appliedDiscount > 0
              ? " Otomatik kampanya uygulandı: ₺" + appliedDiscount.toFixed(2) + " indirim."
              : " Uygun otomatik kampanyalar ödeme adımında da hesaplanır.");
          }
          // cartRuntimeClient.ts'in header sepet rozeti (updateBadge) kendi
          // kapanışında (IIFE) tanımlı, bu ayrı <script>'ten erişilemiyor —
          // aynı seçici/mantık burada tekrarlanıyor, aksi halde rozet
          // ürün gerçekten eklenmiş olsa bile güncel sayıyı göstermiyor.
          var count = lastData && typeof lastData.item_count === "number" ? lastData.item_count : null;
          if (count !== null) {
            document.querySelectorAll('a[aria-label="Sepet"]').forEach(function (a) {
              var span = a.querySelector("span");
              if (!span && count > 0) {
                span = document.createElement("span");
                span.style.cssText = "position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;border-radius:99px;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px;line-height:1;pointer-events:none";
                a.style.position = a.style.position || "relative";
                a.appendChild(span);
              }
              if (span) { span.textContent = String(count); span.style.display = count > 0 ? "flex" : "none"; }
            });
          }
          setTimeout(function () { button.textContent = original; button.disabled = false; }, 1500);
        }).catch(function () {
          button.textContent = original;
          button.disabled = false;
          if (status) status.textContent = "Paket sepete eklenemedi. Lütfen tekrar deneyin.";
        });
      });
    })();
  </script>
</section>

{% schema %}
{
  "name": "Formula Paket Oluşturucu",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "Rutin Paketi" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Rutininizi Birlikte Alın" },
    { "type": "textarea", "id": "description", "label": "Açıklama (ops.)", "default": "Sabit paket ürünlerini seçip tek adımda sepetinize ekleyin." },
    { "type": "text", "id": "button_label", "label": "Buton", "default": "Seçilenleri Sepete Ekle" },${revealAnimationSchemaField()}
  ],
  "blocks": [{
    "type": "item", "name": "Paket Ürünü", "settings": [
      { "type": "text", "id": "product_id", "label": "Ürün ID (zorunlu)" },
      { "type": "text", "id": "variant_id", "label": "Varyant ID (ops.)" },
      { "type": "image_picker", "id": "image", "label": "Görsel" },
      { "type": "text", "id": "name", "label": "Ürün Adı", "default": "Paket Ürünü" },
      { "type": "text", "id": "price", "label": "Gösterim Fiyatı (ops.)" },
      { "type": "text", "id": "badge", "label": "Rozet (ops.)" },
      { "type": "checkbox", "id": "selected", "label": "Başlangıçta Seçili", "default": true }
    ]
  }],
  "max_blocks": 6,
  "presets": [{ "name": "Formula Paket Oluşturucu", "blocks": [{ "type": "item" }, { "type": "item" }, { "type": "item" }] }]
}
{% endschema %}`;

export const FORMULA_SHOPPABLE_VIDEO = `<section class="formula-shoppable-video{% if section.settings.layout_style == 'stacked' %} formula-shoppable-video--stacked{% endif %}${revealAnimationClass()}" data-shoppable-video>
  {%- assign shoppable_video_url = section.settings.video_url -%}
  {%- assign shoppable_video_is_embed = false -%}
  {%- if shoppable_video_url contains 'youtube.com' or shoppable_video_url contains 'youtu.be' -%}
    {%- assign shoppable_video_is_embed = true -%}
    {%- assign shoppable_video_embed_src = shoppable_video_url | replace: 'youtu.be/', 'youtube.com/embed/' | replace: 'watch?v=', 'embed/' -%}
  {%- elsif shoppable_video_url contains 'vimeo.com' -%}
    {%- assign shoppable_video_is_embed = true -%}
    {%- assign shoppable_video_embed_src = shoppable_video_url | replace: 'vimeo.com/', 'player.vimeo.com/video/' -%}
  {%- endif -%}
  {% if section.settings.title != blank or section.settings.description != blank %}<div class="formula-section-head">{% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}{% if section.settings.description != blank %}<p>{{ section.settings.description | escape }}</p>{% endif %}</div>{% endif %}
  <div class="formula-shoppable-video__layout">
    <div class="formula-shoppable-video__media">
      {% if shoppable_video_is_embed %}<iframe class="formula-shoppable-video__iframe" src="{{ shoppable_video_embed_src | escape }}" title="{{ section.settings.title | default: 'Video' | escape }}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>{% elsif shoppable_video_url != blank %}<video controls playsinline {% if section.settings.poster != blank %}poster="{{ section.settings.poster | img_url: '1200x' }}"{% endif %}><source src="{{ shoppable_video_url | escape }}" /></video>{% elsif section.settings.poster != blank %}<img src="{{ section.settings.poster | img_url: '1200x' }}" alt="{{ section.settings.title | escape }}" loading="lazy" />{% endif %}
    </div>
    <div class="formula-shoppable-video__products">
      {% for block in section.blocks %}{% if block.type == "product" %}
        <article class="formula-video-product" data-video-time="{{ block.settings.time_seconds | default: 0 }}">
          {% if block.settings.image != blank %}<img src="{{ block.settings.image | img_url: '240x' }}" alt="{{ block.settings.name | escape }}" loading="lazy" />{% endif %}
          <div>{% if block.settings.time_label != blank %}{% if shoppable_video_is_embed %}<span class="formula-video-product__time">{{ block.settings.time_label | escape }}</span>{% else %}<button type="button" data-video-seek>{{ block.settings.time_label | escape }}</button>{% endif %}{% endif %}{% if block.settings.name != blank %}<h3>{{ block.settings.name | escape }}</h3>{% endif %}{% if block.settings.price != blank %}<p>{{ block.settings.price | escape }}</p>{% endif %}{% if block.settings.url != blank %}<a href="{{ block.settings.url | escape }}">Ürünü Gör →</a>{% endif %}</div>
        </article>
      {% endif %}{% endfor %}
    </div>
  </div>
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-shoppable-video");
      if (!root) return;
      var video = root.querySelector("video");
      if (!video) return;
      root.querySelectorAll("[data-video-seek]").forEach(function (button) {
        button.addEventListener("click", function () {
          var card = button.closest("[data-video-time]");
          video.currentTime = Number(card && card.getAttribute("data-video-time")) || 0;
          video.play().catch(function () {});
        });
      });
    })();
  </script>
</section>
{% schema %}
{
  "name": "Formula Alışveriş Yapılabilir Video",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "Videodaki Rutini Keşfedin" },
    { "type": "textarea", "id": "description", "label": "Açıklama (ops.)" },
    { "type": "url", "id": "video_url", "label": "Video Bağlantısı",
      "info": "YouTube, Vimeo linki veya doğrudan bir .mp4 dosya adresi yapıştır — dosya yüklemek değil, bağlantı yapıştırmak gerekir." },
    { "type": "image_picker", "id": "poster", "label": "Yedek Görsel",
      "info": "Video bağlantısı boşsa (veya video hâlâ yüklenirken) gösterilir." },
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "side", "options": [{"label":"Yan yana","value":"side"},{"label":"Alt alta","value":"stacked"}] },${revealAnimationSchemaField()}
  ],
  "blocks": [{ "type": "product", "name": "Video Ürünü", "settings": [
    { "type": "range", "id": "time_seconds", "label": "Zaman (saniye)", "min": 0, "max": 600, "step": 1, "default": 0 },
    { "type": "text", "id": "time_label", "label": "Zaman Etiketi (ops.)", "default": "00:00",
      "info": "Tıklayınca videoyu o saniyeye atlatır — sadece doğrudan .mp4 bağlantısında çalışır, YouTube/Vimeo'da sadece etiket olarak görünür." },
    { "type": "image_picker", "id": "image", "label": "Görsel" },
    { "type": "text", "id": "name", "label": "Ürün Adı", "default": "Ürün Adı" },
    { "type": "text", "id": "price", "label": "Fiyat (ops.)" },
    { "type": "url", "id": "url", "label": "Ürün URL" }
  ] }], "max_blocks": 8,
  "presets": [{ "name": "Formula Alışveriş Yapılabilir Video", "blocks": [{"type":"product","settings":{"time_seconds":12,"time_label":"00:12"}},{"type":"product","settings":{"time_seconds":45,"time_label":"00:45"}}] }]
}
{% endschema %}`;

/** ShippingZone şehir bazlıdır; posta kodu eşleme/veri endpoint'i yoktur.
 * Bu v1 yalnız mağazanın yazdığı genel bilgiyi gösterir ve sonucu açıkça
 * tahmini/bilgilendirme olarak niteler. */
export const FORMULA_DELIVERY_AVAILABILITY = `<section class="formula-delivery${revealAnimationClass()}" data-delivery-root>
  <div class="formula-delivery__content">
    {% if section.settings.eyebrow != blank %}<p class="formula-delivery__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    {% if section.settings.title != blank %}<h2>{{ section.settings.title | escape }}</h2>{% endif %}
    {% if section.settings.description != blank %}<p>{{ section.settings.description | escape }}</p>{% endif %}
    <form data-delivery-form>
      <label for="delivery-postcode-{{ section.id }}">Posta kodu</label>
      <div><input id="delivery-postcode-{{ section.id }}" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" maxlength="5" required />{% if section.settings.button_label != blank %}<button type="submit">{{ section.settings.button_label | escape }}</button>{% endif %}</div>
    </form>
    <div class="formula-delivery__result" data-delivery-result hidden aria-live="polite">
      {% if section.settings.estimate_text != blank %}<strong>{{ section.settings.estimate_text | escape }}</strong>{% endif %}
      {% if section.settings.disclaimer != blank %}<p>{{ section.settings.disclaimer | escape }}</p>{% endif %}
    </div>
  </div>
  <script>
    (function () {
      var root = document.currentScript.closest(".formula-delivery");
      if (!root) return;
      var form = root.querySelector("[data-delivery-form]");
      var result = root.querySelector("[data-delivery-result]");
      if (!form || !result) return;
      form.addEventListener("submit", function (event) { event.preventDefault(); if (form.checkValidity()) result.hidden = false; });
    })();
  </script>
</section>
{% schema %}
{
  "name": "Formula Teslimat Bilgisi",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket (ops.)", "default": "Teslimat" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Teslimat Süresini Görün" },
    { "type": "textarea", "id": "description", "label": "Açıklama (ops.)", "default": "Posta kodunuzu girerek mağazanın genel teslimat bilgisini görüntüleyin." },
    { "type": "text", "id": "button_label", "label": "Buton", "default": "Bilgiyi Göster" },
    { "type": "text", "id": "estimate_text", "label": "Genel Tahmin", "default": "Tahmini teslimat: 2–5 iş günü" },
    { "type": "textarea", "id": "disclaimer", "label": "Bilgilendirme Notu", "default": "Bu süre posta koduna göre doğrulanmaz; kesin seçenekler ödeme adımında gösterilir." },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Teslimat Bilgisi" }]
}
{% endschema %}`;

/** Kullanıcı İçerikleri / Sosyal Kanıt Galerisi (2026-08-24, Codex'in
 * `ugc-gallery` önerisi) — müşteri fotoğrafı + isim + alıntı + puan +
 * opsiyonel ürün linki. `shoppable-image` ile AYNI mimari karar: gerçek
 * connector ürün bağlantısı yok, manuel ad/URL. Puan (rating) `{% for i in
 * (1..5) %}` gibi bir range-literal döngüsü GEREKTİRMİYOR — bilinçli tercih,
 * `reference-ei-engine-liquid-scoping-gotchas`'ın belgelediği "range literal
 * desteklenmiyor" riskini taşımamak için yıldız dizisi doğrudan bir
 * `select`'in seçenek DEĞERİ olarak veriliyor (ör. value: "★★★★☆"). */
export const FORMULA_UGC_GALLERY = `<section class="formula-ugc{% if section.settings.layout_style == 'masonry' %} formula-ugc--masonry{% elsif section.settings.layout_style == 'scroll' %} formula-ugc--scroll{% endif %}${revealAnimationClass()}">
  {% if section.settings.title != blank %}<div class="formula-section-head"><h2>{{ section.settings.title | escape }}</h2></div>{% endif %}
  <div class="formula-ugc__grid">
    {% for block in section.blocks %}
      {% if block.type == "post" %}
        <div class="formula-ugc-card">
          {% if block.settings.image != blank %}<div class="formula-ugc-card__media"><img src="{{ block.settings.image | img_url: '600x' }}" alt="{{ block.settings.author | escape }}" loading="lazy" /></div>{% endif %}
          <div class="formula-ugc-card__body">
            {% if block.settings.rating != blank %}<p class="formula-ugc-card__rating">{{ block.settings.rating }}</p>{% endif %}
            {% if block.settings.caption != blank %}<p class="formula-ugc-card__caption">{{ block.settings.caption | escape }}</p>{% endif %}
            {% if block.settings.author != blank %}<p class="formula-ugc-card__author">{{ block.settings.author | escape }}</p>{% endif %}
            {% if block.settings.product_name != blank %}<a class="formula-ugc-card__product" href="{{ block.settings.product_url | default: '#' | escape }}">{{ block.settings.product_name | escape }} →</a>{% endif %}
          </div>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Kullanıcı İçerikleri",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "Müşterilerimizden" },
    { "type": "select", "id": "layout_style", "label": "Yerleşim", "default": "grid",
      "options": [
        { "label": "Grid", "value": "grid" },
        { "label": "Masonry (kesişik yükseklik)", "value": "masonry" },
        { "label": "Yatay akış", "value": "scroll" }
      ]
    },${revealAnimationSchemaField()}
  ],
  "blocks": [
    {
      "type": "post",
      "name": "Gönderi",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Fotoğraf" },
        { "type": "text", "id": "author", "label": "Kullanıcı Adı", "default": "@kullanici" },
        { "type": "textarea", "id": "caption", "label": "Kısa Metin (ops.)", "default": "" },
        { "type": "select", "id": "rating", "label": "Puan (ops.)", "default": "",
          "options": [
            { "label": "Gösterme", "value": "" },
            { "label": "★☆☆☆☆", "value": "★☆☆☆☆" },
            { "label": "★★☆☆☆", "value": "★★☆☆☆" },
            { "label": "★★★☆☆", "value": "★★★☆☆" },
            { "label": "★★★★☆", "value": "★★★★☆" },
            { "label": "★★★★★", "value": "★★★★★" }
          ]
        },
        { "type": "text", "id": "product_name", "label": "İlgili Ürün Adı (ops.)", "default": "" },
        { "type": "url", "id": "product_url", "label": "İlgili Ürün URL", "default": "#" }
      ]
    }
  ],
  "max_blocks": 12,
  "presets": [{
    "name": "Formula Kullanıcı İçerikleri",
    "blocks": [
      { "type": "post", "settings": { "author": "@elifyy", "caption": "Rutinimin vazgeçilmezi oldu.", "rating": "★★★★★", "product_name": "Niasinamid Serum" } },
      { "type": "post", "settings": { "author": "@denizk", "caption": "Cildim çok daha dengeli.", "rating": "★★★★☆" } },
      { "type": "post", "settings": { "author": "@asli.t", "caption": "Kokusunu ve dokusunu çok sevdim.", "rating": "★★★★★" } }
    ]
  }]
}
{% endschema %}`;

/** `StudioShell.tsx`'in `addCatalog`'una `templateId === "formula"` iken
 * eklenen sabit kütüphane girdileri — sayfada henüz var olmasalar bile her
 * zaman teklif edilirler (bkz. `custom-html`'in aynı deseni). */
export const FORMULA_LIBRARY_SECTIONS: { type: string; content: string }[] = [
  { type: "announcement-bar", content: FORMULA_ANNOUNCEMENT_BAR },
  { type: "countdown-promotion", content: FORMULA_COUNTDOWN_PROMOTION },
  { type: "shoppable-image", content: FORMULA_SHOPPABLE_IMAGE },
  { type: "bundle-builder", content: FORMULA_BUNDLE_BUILDER },
  { type: "shoppable-video", content: FORMULA_SHOPPABLE_VIDEO },
  { type: "delivery-availability", content: FORMULA_DELIVERY_AVAILABILITY },
  { type: "ugc-gallery", content: FORMULA_UGC_GALLERY },
  { type: "brand-marquee", content: FORMULA_MARQUEE },
  { type: "brands-slider", content: FORMULA_BRANDS_SLIDER },
  { type: "collection-list", content: FORMULA_COLLECTION_LIST },
  { type: "collection-showcase", content: FORMULA_COLLECTION_SHOWCASE },
  { type: "general-showcase", content: FORMULA_GENERAL_SHOWCASE },
  { type: "stats", content: FORMULA_STATS },
  { type: "faq", content: FORMULA_FAQ },
  { type: "story-row", content: FORMULA_STORY_ROW },
  { type: "slider", content: FORMULA_SLIDER },
  { type: "text-block", content: FORMULA_TEXT_BLOCK },
  { type: "text-columns", content: FORMULA_TEXT_COLUMNS },
  { type: "testimonial", content: FORMULA_TESTIMONIAL },
  { type: "numbered-list", content: FORMULA_NUMBERED_LIST },
  { type: "ingredient-spotlight", content: FORMULA_INGREDIENT_SPOTLIGHT },
  { type: "routine-steps", content: FORMULA_ROUTINE_STEPS },
  { type: "trust-bar", content: FORMULA_TRUST_BAR },
  { type: "video-banner", content: FORMULA_VIDEO_BANNER },
  { type: "journal-teaser", content: FORMULA_JOURNAL_TEASER },
  { type: "comparison-table", content: FORMULA_COMPARISON_TABLE },
  { type: "newsletter-signup", content: FORMULA_NEWSLETTER },
  { type: "collage", content: FORMULA_COLLAGE },
  { type: "multirow", content: FORMULA_MULTIROW },
  { type: "before-after", content: FORMULA_BEFORE_AFTER },
  { type: "recently-viewed", content: FORMULA_RECENTLY_VIEWED },
  { type: "related-products", content: FORMULA_RELATED_PRODUCTS },
  { type: "contact-form", content: FORMULA_CONTACT_FORM },
];

// `--color-*`/`--font-*` sözleşmesi `minimalSections.ts`'teki ile birebir aynı
// (Tema Ayarları paneli bu adlarla eşleşiyor) — sadece varsayılan DEĞERLER ve
// section-özel sınıf kuralları Formula'ya özgü.

/** `FORMULA_LIBRARY_SECTIONS`'ın (2026-08-17) CSS'i — ayrı bir sabit olarak
 * tutulur çünkü `FORMULA_THEME_CSS`'e sadece YENİ scaffold edilen projelerde
 * kavuşur (`scaffoldTemplate.ts`, sadece proje oluşturma anında çalışır).
 * O TARİHTEN ÖNCE oluşturulmuş projelerin `assets/theme.css`'i donmuş bir
 * kopya olduğu için bu 4 yeni section'ı hâlâ TAMAMEN stilsiz render ediyordu
 * ("css'leri çalışmıyor" — kullanıcı raporu, sadece hover-önizleme
 * `/render/section` eksikliği değil, gerçek sayfaya eklenince de aynı bug).
 * `StudioShell.tsx` proje yüklenirken bu bloğun eksik olup olmadığını
 * kontrol edip varsa yama olarak ekliyor (bkz. `patchMissingLibraryCss`). */
export const FORMULA_LIBRARY_SECTIONS_CSS = `
/* Görsel efektleri (opacity/blur/grayscale/brightness inline style ile
   uygulanıyor, bkz. formulaTheme.ts'in imageEffectStyle()'ı) — kaplama
   katmanı TEK paylaşılan class, Hero/Koleksiyon-Genel Vitrin/Slider hepsi
   kullanıyor. */
.formula-image-overlay { position: absolute; inset: 0; pointer-events: none; }

/* Duyuru çubuğu */
.formula-announcement { position: relative; display: flex; align-items: center; justify-content: center; background: var(--color-secondary); color: #ffffff; padding: 9px 40px; font-size: 12px; letter-spacing: 0.02em; text-align: center; }
.formula-announcement__text a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
.formula-announcement__close { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: 0; color: rgba(255,255,255,.7); cursor: pointer; font-size: 12px; padding: 4px; }
.formula-announcement__close:hover { color: #ffffff; }
@media (max-width: 767.98px) { .formula-announcement { padding: 8px 44px 8px 16px; font-size: 11px; } }

/* Kayan yazı */
.formula-marquee { overflow: hidden; background: var(--color-surface); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: 14px 0; }
.formula-marquee__track { display: flex; width: max-content; animation-name: formula-marquee-scroll; animation-timing-function: linear; animation-iteration-count: infinite; }
.formula-marquee__group { display: flex; align-items: center; flex-shrink: 0; }
.formula-marquee__item { font-family: var(--font-heading); font-size: 14px; font-weight: 600; letter-spacing: 0.02em; color: var(--color-text); padding: 0 20px; white-space: nowrap; }
.formula-marquee__dot { color: var(--color-primary); font-size: 12px; }
@keyframes formula-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* Markalar slider (2026-08-23) — native CSS scroll-snap, JS kütüphanesi yok. */
.formula-brands-slider { padding: 56px 40px; }
.formula-brands-slider__nav { display: flex; gap: 8px; }
.formula-brands-slider__nav button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--color-border); background: #fff; cursor: pointer; font-size: 15px; color: var(--color-text); }
.formula-brands-slider__nav button:hover { background: var(--color-surface); }
.formula-brands-slider__track { display: flex; gap: 32px; overflow-x: auto; scroll-snap-type: x proximity; padding-bottom: 8px; scrollbar-width: thin; }
.formula-brands-slider__item { flex: 0 0 auto; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; height: 64px; min-width: 120px; opacity: .7; transition: opacity .2s; }
.formula-brands-slider__item:hover { opacity: 1; }
.formula-brands-slider__item img { max-height: 100%; max-width: 160px; object-fit: contain; filter: grayscale(1); transition: filter .2s; }
.formula-brands-slider__item:hover img { filter: grayscale(0); }
.formula-brands-slider__name { font-family: var(--font-heading); font-size: 16px; font-weight: 600; color: var(--color-text); white-space: nowrap; }
.formula-brands-slider__empty { color: var(--color-muted); font-size: 13px; }
@media (max-width: 700px) { .formula-brands-slider { padding: 40px 20px; } }

/* Koleksiyon listesi — 2026-08-19: sütun sayısı/boşluk artık
   --formula-collection-cols / --formula-collection-gap (section
   ayarlarından, inline style ile) — mobil media query'ler BİLİNÇLİ OLARAK
   var() KULLANMIYOR, sabit değer yazıyor, böylece masaüstünde 4 sütun
   seçilse bile mobilde hâlâ 1-2 sütuna düşüyor (cascade sırası kazanıyor). */
.formula-collection-list { padding: 64px 40px; }
.formula-collection-list__grid { display: grid; grid-template-columns: repeat(var(--formula-collection-cols, 3), minmax(0,1fr)); gap: var(--formula-collection-gap, 24px); }
.formula-collection-card { text-decoration: none; color: var(--color-text); display: block; position: relative; }
.formula-collection-card__media { position: relative; aspect-ratio: 4/3; background: var(--color-surface); border-radius: 14px; overflow: hidden; }
.formula-collection-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.formula-collection-card__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-collection-card__copy { margin-top: 14px; }
.formula-collection-card__title { font-family: var(--font-heading); font-size: 16px; font-weight: 600; margin: 0 0 4px; }
.formula-collection-card__sub { font-size: 12px; color: var(--color-muted); margin: 0; }
/* Üzerine gelince efekt varyantları */
.formula-collection-list--hover-zoom .formula-collection-card:hover .formula-collection-card__media img { transform: scale(1.04); }
.formula-collection-list--hover-lift .formula-collection-card { transition: transform .25s; }
.formula-collection-list--hover-lift .formula-collection-card:hover { transform: translateY(-6px); }
/* Kart stili: "overlay" — başlık görselin İÇİNDE, alt kaplama gradyanıyla */
.formula-collection-card--overlay .formula-collection-card__copy { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; padding: 20px; z-index: 1; }
.formula-collection-card--overlay .formula-collection-card__title,
.formula-collection-card--overlay .formula-collection-card__sub { color: #ffffff; }
.formula-collection-card__scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.7), transparent 60%); pointer-events: none; }
@media (max-width: 900px) { .formula-collection-list__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .formula-collection-list { padding: 44px 20px; } }
@media (max-width: 560px) { .formula-collection-list__grid { grid-template-columns: 1fr; } }
.formula-collection-list--carousel .formula-collection-list__grid { display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px;grid-template-columns:none; }
.formula-collection-list--carousel .formula-collection-card { flex:0 0 min(70vw,320px);scroll-snap-align:start; }
.formula-collection-list--circles .formula-collection-list__grid { grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:20px; }
.formula-collection-list--circles .formula-collection-card { text-align:center; }
.formula-collection-list--circles .formula-collection-card__media { aspect-ratio:1;max-width:120px;margin:0 auto; }
.formula-collection-list--circles .formula-collection-card__copy { margin-top:10px; }
.formula-collection-list--circles .formula-collection-card__title { font-size:13px; }

/* Koleksiyon vitrini — 2026-08-19: --reverse (görsel sağda), --align-center
   metni ortalar (koleksiyonun kendi görselini büyük/kampanya-tarzı
   kullanmak isteyenler için).
   2026-08-19 devamı — GERÇEK bug: önceki direction:rtl + order:2
   kombinasyonu birbirini İPTAL EDİYORDU (direction:rtl grid'in 1.
   kolonunu zaten sağa taşıyor, order:2 de görseli 2. sıraya (rtl'de SOL)
   itiyor — net sonuç görsel HER İKİ ayarda da SOLDA kalıyordu, "sol/sağ
   çalışmıyor" kullanıcı raporuyla eşleşiyor, gerçek bir tarayıcıda
   getBoundingClientRect ile doğrulandı). Fix: rtl hilesi tamamen
   kaldırıldı, düz LTR'de SADECE order:2 yeterli (order:0 varsayılanı
   önce, order:2 sonra yerleşir — 2 kolonlu grid'de bu tek başına görseli
   sağa taşımaya yeter). */
.formula-collection-showcase { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 64px 40px; background: var(--color-background); }
.formula-collection-showcase--reverse .formula-collection-showcase__media { order: 2; }
.formula-collection-showcase--align-center .formula-collection-showcase__copy { text-align: center; }
.formula-collection-showcase--align-center .formula-collection-showcase__sub { margin-left: auto; margin-right: auto; }
.formula-collection-showcase__media { position: relative; aspect-ratio: 5/4; border-radius: 18px; overflow: hidden; background: var(--color-surface); }
.formula-collection-showcase__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-collection-showcase__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-accent) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-collection-showcase__empty { grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--color-muted); font-size: 13px; border: 1px dashed var(--color-border); border-radius: 14px; }
.formula-collection-showcase__title { font-family: var(--font-heading); font-size: clamp(30px, 3.6vw, 44px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 14ch; }
.formula-collection-showcase__sub { color: var(--color-muted); line-height: 1.6; max-width: 40ch; margin: 0 0 28px; }
@media (max-width: 900px) { .formula-collection-showcase, .formula-collection-showcase--reverse { grid-template-columns: 1fr; padding: 48px 24px; text-align: center; } .formula-collection-showcase--reverse .formula-collection-showcase__media { order: 0; } .formula-collection-showcase__sub { max-width: none; margin-left: auto; margin-right: auto; } }

/* Genel Vitrin — AYNI 2026-08-19 rtl/order çakışma fix'i (yukarıdaki
   koleksiyon vitrini yorumuna bkz.) */
.formula-showcase { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 64px 40px; background: var(--color-background); }
.formula-showcase--reverse .formula-showcase__media { order: 2; }
.formula-showcase__media { position: relative; aspect-ratio: 5/4; overflow: hidden; background: var(--color-surface); }
.formula-showcase__media picture { display: block; width: 100%; height: 100%; }
.formula-showcase__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-showcase__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-primary) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-showcase__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 16px; font-weight: 600; }
.formula-showcase__title { font-family: var(--font-heading); font-size: clamp(28px, 3.4vw, 42px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 16ch; }
.formula-showcase__sub { color: var(--color-muted); line-height: 1.6; max-width: 42ch; margin: 0 0 28px; }
@media (max-width: 900px) { .formula-showcase, .formula-showcase--reverse { grid-template-columns: 1fr; padding: 48px 24px; text-align: center; } .formula-showcase--reverse .formula-showcase__media { order: 0; } .formula-showcase__sub { max-width: none; margin-left: auto; margin-right: auto; } }

/* SSS */
.formula-faq { padding: 64px 40px; max-width: 760px; margin: 0 auto; }
.formula-faq__list { display: flex; flex-direction: column; gap: 4px; }
.formula-faq__item { border-bottom: 1px solid var(--color-border); padding: 18px 0; }
.formula-faq__question { display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; font-family: var(--font-heading); font-weight: 600; font-size: 15px; color: var(--color-text); list-style: none; }
.formula-faq__question::-webkit-details-marker { display: none; }
.formula-faq__chevron { color: var(--color-muted); transition: transform .2s; flex-shrink: 0; }
.formula-faq__item[open] .formula-faq__chevron { transform: rotate(180deg); }
.formula-faq__answer { margin: 12px 0 0; color: var(--color-muted); line-height: 1.6; font-size: 14px; }
.formula-faq--two-columns { max-width:1100px; }
.formula-faq--two-columns .formula-faq__list { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:40px;align-items:start; }
.formula-faq--categorized { max-width:1000px; }
.formula-faq__tabs { display:flex;gap:8px;overflow-x:auto;margin:0 0 24px;padding-bottom:4px; }
.formula-faq__tab { flex:0 0 auto;border:1px solid var(--color-border);border-radius:999px;background:transparent;color:var(--color-text);padding:9px 16px;font:inherit;font-size:13px;cursor:pointer; }
.formula-faq__tab.is-active { background:var(--color-text);border-color:var(--color-text);color:var(--color-background); }
.formula-faq--categorized .formula-faq__list { display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px; }
.formula-faq--categorized .formula-faq__item { border:1px solid var(--color-border);border-radius:14px;padding:18px; }
.formula-faq__category { display:inline-flex;margin-bottom:10px;padding:5px 10px;border-radius:999px;background:var(--color-surface);color:var(--color-muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em; }
@media (max-width: 700px) { .formula-faq { padding: 44px 20px; } }
@media (max-width: 700px) { .formula-faq--two-columns .formula-faq__list { grid-template-columns:1fr; } }

/* Instagram-story tipi hızlı koleksiyonlar */
.formula-story-row { padding: 32px 40px; }
.formula-story-row__track { display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none; }
.formula-story-row__track::-webkit-scrollbar { display: none; }
.formula-story { display: flex; flex-direction: column; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; width: 76px; }
.formula-story__ring { display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 999px; padding: 3px; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); }
.formula-story__avatar { display: block; width: 100%; height: 100%; border-radius: 999px; background: var(--color-surface) center/cover no-repeat; border: 2px solid var(--color-background); }
.formula-story__label { font-size: 11px; text-align: center; color: var(--color-text); line-height: 1.3; }
/* Daire boyutu varyantları (2026-08-19) */
.formula-story-row--sm .formula-story { width: 60px; }
.formula-story-row--sm .formula-story__ring { width: 56px; height: 56px; }
.formula-story-row--lg .formula-story { width: 96px; }
.formula-story-row--lg .formula-story__ring { width: 92px; height: 92px; }
.formula-story-row--lg .formula-story__label { font-size: 12px; }
@media (max-width: 700px) { .formula-story-row { padding: 24px 20px; } }

/* Slider */
.formula-slider { position: relative; padding: 0; }
.formula-slider__track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.formula-slider__track::-webkit-scrollbar { display: none; }
.formula-slide { position: relative; flex: 0 0 100%; scroll-snap-align: start; aspect-ratio: 21/9; display: block; background: var(--color-surface); overflow: hidden; }
.formula-slide img { width: 100%; height: 100%; object-fit: cover; }
.formula-slide__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-primary) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-slide__copy { position: absolute; left: 0; bottom: 0; padding: 32px 40px; color: #fff; background: linear-gradient(0deg, rgba(0,0,0,.55), transparent); width: 100%; display: flex; flex-direction: column; gap: 6px; }
.formula-slide__copy h3 { font-family: var(--font-heading); font-size: clamp(22px, 3vw, 34px); margin: 0; }
.formula-slide__copy p { margin: 0; opacity: .9; font-size: 14px; }
.formula-slide__copy .formula-btn { align-self: flex-start; margin-top: 10px; }
.formula-slide__copy--center { align-items: center; text-align: center; }
.formula-slide__copy--center .formula-btn { align-self: center; }
.formula-slide__copy--right { align-items: flex-end; text-align: right; }
.formula-slide__copy--right .formula-btn { align-self: flex-end; }
.formula-slide__copy--dark { color: var(--color-text); background: linear-gradient(0deg, rgba(255,255,255,.75), transparent); }
.formula-slide__copy--dark p { opacity: .75; }
.formula-slide__copy--dark .formula-btn--solid { background: var(--color-text); }
.formula-slider__nav { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; pointer-events: none; }
.formula-slider__arrow { pointer-events: auto; width: 40px; height: 40px; border-radius: 999px; border: 0; background: rgba(255,255,255,.85); color: var(--color-text); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.formula-slider__arrow:hover { background: #fff; }
@media (max-width: 700px) { .formula-slide__copy { padding: 20px; } }

/* Rakamlarla */
.formula-stats { padding: 56px 40px; background: var(--color-secondary); color: #ffffff; text-align: center; }
.formula-stats__title { font-family: var(--font-heading); font-size: 22px; font-weight: 600; margin: 0 0 32px; }
.formula-stats__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 24px; max-width: 900px; margin: 0 auto; }
.formula-stat__number { font-family: var(--font-heading); font-size: clamp(28px, 3.4vw, 40px); font-weight: 700; margin: 0 0 6px; letter-spacing: -0.01em; }
.formula-stat__label { font-size: 13px; opacity: .78; margin: 0; }
@media (max-width: 700px) { .formula-stats { padding: 40px 20px; } .formula-stats__grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 28px 16px; } }

/* Yazı Bloğu (2026-08-19) — sadece metin, görsel/kart yok */
.formula-text-block { padding: 64px 40px; }
.formula-text-block__inner { margin: 0 auto; }
.formula-text-block--center { text-align: center; }
.formula-text-block--center .formula-text-block__inner { margin-left: auto; margin-right: auto; }
.formula-text-block--left .formula-text-block__inner { margin-left: 0; margin-right: auto; }
.formula-text-block__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 14px; font-weight: 600; }
.formula-text-block__title { font-family: var(--font-heading); font-size: clamp(24px, 3vw, 34px); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 16px; }
.formula-text-block__body { color: var(--color-muted); line-height: 1.7; margin: 0 0 24px; }
.formula-text-block__body :last-child { margin-bottom: 0; }
@media (max-width: 700px) { .formula-text-block { padding: 44px 20px; } }

/* İki Kolonlu Metin (2026-08-19 devamı) */
.formula-text-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 64px 40px; align-items: start; }
.formula-text-columns__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 14px; font-weight: 600; }
.formula-text-columns__title { font-family: var(--font-heading); font-size: clamp(26px, 3.2vw, 38px); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 20px; }
.formula-text-columns__body { color: var(--color-muted); line-height: 1.7; }
.formula-text-columns__body :last-child { margin-bottom: 0; }
@media (max-width: 700px) { .formula-text-columns { grid-template-columns: 1fr; gap: 20px; padding: 44px 20px; } }

/* Alıntı / Referans kartları (2026-08-19 devamı) */
.formula-testimonial { padding: 64px 40px; }
.formula-testimonial__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.formula-testimonial__card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 18px; padding: 28px; }
.formula-testimonial__quote { font-family: var(--font-heading); font-size: 16px; line-height: 1.55; margin: 0 0 20px; color: var(--color-text); }
.formula-testimonial__author { display: flex; align-items: center; gap: 12px; }
.formula-testimonial__avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.formula-testimonial__name { font-size: 13px; font-weight: 600; margin: 0; color: var(--color-text); }
.formula-testimonial__role { font-size: 12px; margin: 2px 0 0; color: var(--color-muted); }
.formula-testimonial--focus { max-width:900px;margin:0 auto;text-align:center; }
.formula-testimonial--focus .formula-testimonial__grid { display:block; }
.formula-testimonial--focus .formula-testimonial__card { display:none;border:0;background:transparent;padding:24px; }
.formula-testimonial--focus .formula-testimonial__card:first-child { display:block; }
.formula-testimonial--focus .formula-testimonial__quote { font-size:clamp(24px,4vw,42px);line-height:1.3; }
.formula-testimonial--focus .formula-testimonial__author { justify-content:center; }
.formula-testimonial--carousel .formula-testimonial__grid { display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px; }
.formula-testimonial--carousel .formula-testimonial__card { flex:0 0 min(82vw,380px);scroll-snap-align:start; }
@media (max-width: 700px) { .formula-testimonial { padding: 44px 20px; } }

/* Numaralı Liste / Adımlar (2026-08-19 devamı) */
.formula-steps { padding: 64px 40px; }
.formula-steps__list { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
.formula-step__number { font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--color-primary); letter-spacing: 0.04em; margin: 0 0 10px; }
.formula-step__title { font-family: var(--font-heading); font-size: 18px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.01em; }
.formula-step__desc { color: var(--color-muted); line-height: 1.6; margin: 0; font-size: 14px; }
@media (max-width: 700px) { .formula-steps { padding: 44px 20px; } .formula-steps__list { gap: 24px; } }

/* Aktif İçerik Vitrini (2026-08-20) */
.formula-ingredients { padding: 64px 40px; }
.formula-ingredients__sub { color: var(--color-muted); font-size: 14px; margin: -16px 0 28px; }
.formula-ingredients__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
.formula-ingredient-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 24px; }
.formula-ingredient-card__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.formula-ingredient-card__icon { font-size: 18px; color: var(--color-primary); }
.formula-ingredient-card__percent { font-family: var(--font-heading); font-size: 20px; font-weight: 700; letter-spacing: -0.01em; color: var(--color-text); }
.formula-ingredient-card__name { font-family: var(--font-heading); font-size: 16px; font-weight: 600; margin: 0 0 6px; }
.formula-ingredient-card__desc { color: var(--color-muted); font-size: 13px; line-height: 1.6; margin: 0; }
@media (max-width: 700px) { .formula-ingredients { padding: 44px 20px; } }

/* Kullanım Rutini (2026-08-20) */
.formula-routine { padding: 64px 40px; }
.formula-routine__sub { color: var(--color-muted); font-size: 14px; margin: -16px 0 28px; }
.formula-routine__list { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 24px; }
.formula-routine-step { text-decoration: none; color: var(--color-text); display: block; }
.formula-routine-step__media { position: relative; aspect-ratio: 1; border-radius: 50%; overflow: hidden; background: var(--color-surface); margin-bottom: 14px; }
.formula-routine-step__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-routine-step__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-routine-step__badge { position: absolute; top: 8px; left: 8px; width: 24px; height: 24px; border-radius: 50%; background: var(--color-primary); color: #fff; font-family: var(--font-heading); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.formula-routine-step__name { font-family: var(--font-heading); font-size: 15px; font-weight: 600; margin: 0 0 4px; text-align: center; }
.formula-routine-step__desc { color: var(--color-muted); font-size: 12px; line-height: 1.5; margin: 0; text-align: center; }
@media (max-width: 700px) { .formula-routine { padding: 44px 20px; } }

/* Güven Rozetleri (2026-08-20) */
.formula-trust { padding: 40px 40px; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.formula-trust__row { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
.formula-trust-badge { display: flex; align-items: center; gap: 8px; }
.formula-trust-badge__icon { color: var(--color-primary); font-size: 14px; }
.formula-trust-badge__label { font-size: 12px; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-muted); font-weight: 600; }
@media (max-width: 700px) { .formula-trust { padding: 28px 20px; } .formula-trust__row { gap: 20px 24px; } }

/* Video Banner (2026-08-20) */
.formula-video { position: relative; min-height: 480px; display: flex; align-items: flex-end; overflow: hidden; }
.formula-video__media { position: absolute; inset: 0; z-index: 0; }
.formula-video__el, .formula-video__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.formula-video__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-secondary), var(--color-surface)); }
.formula-video-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 55%); pointer-events: none; }
.formula-video__copy { position: relative; z-index: 1; padding: 40px; color: #ffffff; max-width: 480px; }
.formula-video__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; margin: 0 0 12px; opacity: .85; }
.formula-video__title { font-family: var(--font-heading); font-size: clamp(24px, 3vw, 36px); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 20px; }
@media (max-width: 700px) { .formula-video { min-height: 360px; } .formula-video__copy { padding: 28px 20px; } }

/* Dergi Vitrini (2026-08-20) */
.formula-journal { padding: 64px 40px; }
.formula-journal__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 28px; }
.formula-journal-card { text-decoration: none; color: var(--color-text); display: block; }
.formula-journal-card__media { position: relative; aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; background: var(--color-surface); margin-bottom: 14px; }
.formula-journal-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.formula-journal-card:hover .formula-journal-card__media img { transform: scale(1.04); }
.formula-journal-card__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-journal-card__category { text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; color: var(--color-primary); font-weight: 600; margin: 0 0 6px; }
.formula-journal-card__title { font-family: var(--font-heading); font-size: 17px; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.01em; }
.formula-journal-card__excerpt { color: var(--color-muted); font-size: 13px; line-height: 1.6; margin: 0; }
@media (max-width: 700px) { .formula-journal { padding: 44px 20px; } }
.formula-journal--featured .formula-journal__grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
.formula-journal--featured .formula-journal-card:first-child { grid-column: span 2; grid-row: span 2; }
.formula-journal--featured .formula-journal-card:first-child .formula-journal-card__media { aspect-ratio: 16/10; }
.formula-journal--featured .formula-journal-card:first-child .formula-journal-card__title { font-size: 22px; }
.formula-journal--carousel .formula-journal__grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 12px; grid-template-columns: none; }
.formula-journal--carousel .formula-journal-card { flex: 0 0 min(78vw, 300px); scroll-snap-align: start; }
.formula-journal--compact .formula-journal__grid { display: flex; flex-direction: column; gap: 0; }
.formula-journal--compact .formula-journal-card { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--color-border); }
.formula-journal--compact .formula-journal-card__media { width: 88px; height: 88px; aspect-ratio: auto; flex-shrink: 0; margin-bottom: 0; border-radius: 10px; }
.formula-journal--compact .formula-journal-card__excerpt { display: none; }
.formula-journal--compact .formula-journal-card__title { font-size: 14px; }

/* Karşılaştırma Tablosu (2026-08-20) — display:contents ile grid hücreleri
   satır-wrapper'larını "görünmez" kılıyor, gerçek bir table yerine CSS
   grid'in kendisi tablo düzenini kuruyor (bkz. formulaTheme.ts'in yorumu:
   satır sayısı sabit 4, ei-engine dinamik alan adı çözmüyor). */
.formula-compare { padding: 64px 40px; }
.formula-compare__scroll { overflow-x: auto; }
.formula-compare__table { display: grid; grid-template-columns: 160px repeat(var(--formula-compare-cols, 3), minmax(140px, 1fr)); min-width: 560px; }
.formula-compare__row { display: contents; }
.formula-compare__cell { padding: 14px 16px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; font-size: 13px; color: var(--color-text); }
.formula-compare__row--head .formula-compare__cell { border-bottom: 2px solid var(--color-border); align-items: flex-start; }
.formula-compare__cell--label { color: var(--color-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
.formula-compare__cell--product { flex-direction: column; align-items: flex-start; gap: 8px; text-decoration: none; }
.formula-compare__cell--product img { width: 64px; height: 64px; object-fit: cover; border-radius: 10px; background: var(--color-surface); }
.formula-compare__cell--product p { margin: 0; font-family: var(--font-heading); font-weight: 600; color: var(--color-text); font-size: 13px; }
@media (max-width: 700px) { .formula-compare { padding: 44px 20px; } }
.formula-compare--cards .formula-compare__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.formula-compare-card { display: block; text-decoration: none; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 16px; padding: 20px; }
.formula-compare-card__media { aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: var(--color-surface); margin-bottom: 14px; }
.formula-compare-card__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-compare-card__name { font-family: var(--font-heading); font-weight: 700; font-size: 16px; margin: 0 0 14px; }
.formula-compare-card__specs { margin: 0; }
.formula-compare-card__specs > div { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--color-border); font-size: 13px; }
.formula-compare-card__specs dt { color: var(--color-muted); margin: 0; }
.formula-compare-card__specs dd { margin: 0; font-weight: 600; text-align: right; }

/* Bülten Kaydı (2026-08-20) — gerçek fetch akışı cartRuntimeClient.ts'te,
   bu section sadece markup+state class'ları sağlıyor. */
.formula-newsletter { padding: 72px 40px; background: var(--color-surface); text-align: center; }
.formula-newsletter__inner { max-width: 480px; margin: 0 auto; }
.formula-newsletter__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 14px; font-weight: 600; }
.formula-newsletter__title { font-family: var(--font-heading); font-size: clamp(24px, 3vw, 32px); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 12px; }
.formula-newsletter__sub { color: var(--color-muted); line-height: 1.6; margin: 0 0 24px; }
.formula-newsletter__form { display: flex; gap: 10px; }
.formula-newsletter__input { flex: 1; min-width: 0; padding: 12px 16px; border: 1px solid var(--color-border); border-radius: 999px; font-size: 14px; background: var(--color-background); color: var(--color-text); }
.formula-newsletter__input:focus { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.formula-newsletter__form .formula-btn { white-space: nowrap; }
.formula-newsletter__message { min-height: 18px; margin: 12px 0 0; font-size: 13px; }
.formula-newsletter__message--ok { color: var(--color-primary); }
.formula-newsletter__message--err { color: #b3261e; }
.formula-newsletter__disclaimer { color: var(--color-muted); font-size: 11px; margin: 10px 0 0; }
@media (max-width: 560px) { .formula-newsletter { padding: 48px 20px; } .formula-newsletter__form { flex-direction: column; } }

/* Kolaj (2026-08-20) — 4 sütunlu grid, "büyük" öğeler 2x2 span (grid-auto-
   flow: dense boşlukları otomatik dolduruyor). */
.formula-collage { padding: 64px 40px; }
.formula-collage__grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 160px; gap: 16px; grid-auto-flow: dense; }
.formula-collage__item { position: relative; display: block; overflow: hidden; border-radius: 14px; background: var(--color-surface); grid-column: span 1; grid-row: span 1; text-decoration: none; }
.formula-collage__item--large { grid-column: span 2; grid-row: span 2; }
.formula-collage__item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.formula-collage__item:hover img { transform: scale(1.04); }
.formula-collage__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-collage__label { position: absolute; left: 14px; bottom: 14px; color: #fff; font-family: var(--font-heading); font-size: 14px; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,.4); }
@media (max-width: 900px) { .formula-collage__grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; } .formula-collage { padding: 44px 20px; } }

/* Alternatif Sıra Vitrini (2026-08-20) — her satır kendi image_left/
   image_right ayarını taşır (otomatik forloop.index alternation YOK, ei-
   engine'in modulo/forloop desteği doğrulanmadığı için bilinçli tercih). */
.formula-multirow__row { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 48px 40px; }
.formula-multirow__row--reverse .formula-multirow__media { order: 2; }
.formula-multirow__media { position: relative; aspect-ratio: 5/4; overflow: hidden; background: var(--color-surface); }
.formula-multirow__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-multirow__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-primary) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-multirow__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 16px; font-weight: 600; }
.formula-multirow__title { font-family: var(--font-heading); font-size: clamp(24px, 3vw, 36px); line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 16ch; }
.formula-multirow__body { color: var(--color-muted); line-height: 1.6; max-width: 42ch; margin: 0 0 24px; }
@media (max-width: 900px) { .formula-multirow__row, .formula-multirow__row--reverse { grid-template-columns: 1fr; padding: 32px 20px; text-align: center; } .formula-multirow__row--reverse .formula-multirow__media { order: 0; } .formula-multirow__body { max-width: none; margin-left: auto; margin-right: auto; } }

/* Öncesi/Sonrası (2026-08-20) — clip-path tabanlı, native range input ile
   sürüklenir (bkz. formulaTheme.ts'in yorumu, kalıcı script YOK).
   2026-08-23 — 20.08-revizeler.md madde 1: "buglı, çalışmıyor" raporunun
   KÖK NEDENİ gerçek bir tarayıcıda (Playwright, mouse.down+move+up ile
   GERÇEK sürükleme simülasyonu) bulundu: ::-webkit-slider-thumb'ın
   width/height'i track'le AYNI (100%/100%) yapılmıştı — "her yerden
   sürüklenebilsin" niyetiyle, ama Chromium'da thumb track'le TAM aynı
   boyuttayken sürükleme matematiği BOZULUYOR: sağa sürüklemek değeri 0'a
   (beklenenin TERSİ) düşürüyordu. Klavye (Home/End) doğru çalıştığı için
   önceki "yapısal var mı" testleri (input[type=range] var mı) bunu hiç
   yakalayamamıştı. Fix DOĞRULANDI: thumb küçük/normal boyuta (28px)
   çekilince (aynı invisible-thumb + tüm alanı kaplayan invisible TRACK
   deseni korunarak) sürükleme GERÇEKTEN çalışıyor — 85% pozisyona sürükleme
   artık 85% civarı bir değer veriyor, 0 değil. */
.formula-before-after { padding: 64px 40px; }
.formula-ba { position: relative; max-width: 720px; margin: 0 auto; border-radius: 18px; overflow: hidden; background: var(--color-surface); }
.formula-ba__layer { position: absolute; inset: 0; }
.formula-ba__layer img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.formula-ba__placeholder { position: absolute; inset: 0; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-ba__divider { position: absolute; top: 0; bottom: 0; width: 3px; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.15); transform: translateX(-50%); pointer-events: none; }
.formula-ba__tag { position: absolute; top: 14px; padding: 4px 12px; border-radius: 999px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.formula-ba__tag--before { left: 14px; }
.formula-ba__tag--after { right: 14px; }
.formula-ba__range { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: ew-resize; appearance: none; -webkit-appearance: none; }
.formula-ba__range::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px; }
.formula-ba__range::-moz-range-thumb { border: 0; width: 28px; height: 28px; }
.formula-ba__range::-moz-range-track { background: transparent; border: 0; }
@media (max-width: 700px) { .formula-before-after { padding: 44px 20px; } }

/* Son Bakılanlar (2026-08-20) — grid boşken JS section'ı gizler (bkz.
   cartRuntimeClient.ts), bu yüzden burada boş-durum CSS'i gerekmiyor. */
.formula-recently-viewed { padding: 64px 40px; }
.formula-recently-viewed__grid { display: grid; grid-template-columns: repeat(var(--formula-recently-viewed-cols, 4), minmax(0,1fr)); gap: 20px; }
.formula-recently-viewed__card { text-decoration: none; color: var(--color-text); display: block; }
.formula-recently-viewed__media { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: var(--color-surface); margin-bottom: 10px; }
.formula-recently-viewed__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-recently-viewed__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-recently-viewed__name { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
.formula-recently-viewed__price { font-size: 12px; color: var(--color-muted); margin: 0; }
.formula-recently-viewed__card--bordered .formula-recently-viewed__media { border: 1px solid var(--color-border); }
.formula-recently-viewed__card--shadow .formula-recently-viewed__media { box-shadow: 0 18px 44px rgba(15,23,42,.10); }
@media (max-width: 700px) { .formula-recently-viewed__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 700px) { .formula-recently-viewed { padding: 44px 20px; } }
.formula-recently-viewed--carousel .formula-recently-viewed__grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 12px; grid-template-columns: none; }
.formula-recently-viewed--carousel .formula-recently-viewed__card { flex: 0 0 min(46vw, 200px); scroll-snap-align: start; }
.formula-recently-viewed--compact .formula-recently-viewed__grid { display: flex; flex-direction: column; gap: 0; }
.formula-recently-viewed--compact .formula-recently-viewed__card { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.formula-recently-viewed--compact .formula-recently-viewed__media { width: 56px; height: 56px; aspect-ratio: auto; flex-shrink: 0; margin-bottom: 0; }

/* İlgili Ürünler (2026-08-20) — .formula-product-card/__grid deseni
   FORMULA_BESTSELLERS ile PAYLAŞILIYOR.
   2026-08-23 — 20.08-revizeler.md madde 5: sütun sayısı artık section'ın
   inline style'ında yazan --formula-related-cols'a göre (bkz. şablonun
   kendisi), kart stili (bordered/shadow) .formula-product-card--*
   modifier'larıyla (aşağıda, .formula-product-card'ın hemen altında). */
.formula-related { padding: 64px 40px; }
.formula-related__grid { display: grid; grid-template-columns: repeat(var(--formula-related-cols, 4), minmax(0,1fr)); gap: 24px; }
@media (max-width: 900px) { .formula-related__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .formula-related { padding: 44px 20px; } }
.formula-related--carousel .formula-related__grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 12px; grid-template-columns: none; }
.formula-related--carousel .formula-product-card { flex: 0 0 min(60vw, 240px); scroll-snap-align: start; }
.formula-related--compact .formula-related__grid { display: flex; flex-direction: column; gap: 0; }
.formula-related--compact .formula-product-card { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.formula-related--compact .formula-product-card__media { width: 56px; height: 56px; aspect-ratio: auto; flex-shrink: 0; margin-bottom: 0; }

/* Kampanya Geri Sayımı (2026-08-24) — GERÇEK BUG DÜZELTMESİ: section eklenirken
   bu CSS bloğu unutulmuştu, section tamamen stilsiz render ediliyordu (sadece
   sayaç sayıları JS ile doluyor, kutu/hizalama/renk hiç yoktu). */
.formula-countdown { padding: 48px 40px; text-align: center; background: var(--color-secondary); color: #ffffff; }
.formula-countdown__inner { max-width: 640px; margin: 0 auto; }
.formula-countdown__heading { font-family: var(--font-heading); font-size: clamp(20px, 2.6vw, 30px); font-weight: 600; margin: 0 0 6px; }
.formula-countdown__sub { font-size: 14px; opacity: .8; margin: 0 0 24px; }
.formula-countdown__timer { display: flex; justify-content: center; gap: 16px; margin-bottom: 24px; }
.formula-countdown__unit { display: flex; flex-direction: column; align-items: center; min-width: 56px; }
.formula-countdown__unit span { font-family: var(--font-heading); font-size: clamp(24px, 3.4vw, 36px); font-weight: 700; line-height: 1; }
.formula-countdown__unit label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: .7; margin-top: 6px; }
.formula-countdown__expired { font-size: 15px; margin: 0 0 20px; }
@media (max-width: 600px) { .formula-countdown { padding: 36px 20px; } .formula-countdown__timer { gap: 10px; } .formula-countdown__unit { min-width: 46px; } }

/* Alışveriş Yapılabilir Görsel (2026-08-24) */
.formula-shoppable-image { padding: 64px 40px; }
.formula-shoppable-image__title { font-family: var(--font-heading); font-size: clamp(22px, 2.8vw, 32px); font-weight: 600; text-align: center; margin: 0 0 28px; }
.formula-shoppable-image__stage { position: relative; max-width: 720px; margin: 0 auto; aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden; background: var(--color-surface); }
.formula-shoppable-image--portrait .formula-shoppable-image__stage { aspect-ratio: 3 / 4; }
.formula-shoppable-image--landscape .formula-shoppable-image__stage { aspect-ratio: 16 / 9; max-width: 960px; }
.formula-shoppable-image__media { width: 100%; height: 100%; object-fit: cover; display: block; }
.formula-shoppable-image__dot { position: absolute; width: 26px; height: 26px; border-radius: 50%; background: #111111; border: 3px solid #ffffff; box-shadow: 0 1px 6px rgba(0,0,0,.35); transform: translate(-50%, -50%); cursor: pointer; padding: 0; z-index: 2; }
.formula-shoppable-image__dot-pulse { position: absolute; inset: -6px; border-radius: 50%; background: #111111; opacity: .45; animation: formula-shoppable-pulse 2.2s ease-out infinite; }
@keyframes formula-shoppable-pulse { 0% { transform: scale(.6); opacity: .5; } 100% { transform: scale(1.7); opacity: 0; } }
.formula-shoppable-image__card { position: absolute; transform: translate(-50%, calc(-100% - 20px)); width: 200px; background: #ffffff; border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.18); padding: 12px; display: flex; gap: 10px; z-index: 3; text-align: left; }
.formula-shoppable-image__card-media { width: 52px; height: 52px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.formula-shoppable-image__card-body { min-width: 0; }
.formula-shoppable-image__card-badge { display: inline-block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; background: var(--color-primary); color: #ffffff; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; }
.formula-shoppable-image__card-name { font-size: 13px; font-weight: 600; color: #111111; margin: 0 0 2px; line-height: 1.3; }
.formula-shoppable-image__card-price { font-size: 13px; color: #6b7280; margin: 0 0 6px; }
.formula-shoppable-image__card-link { font-size: 12px; font-weight: 600; color: var(--color-primary); text-decoration: underline; text-underline-offset: 2px; }
@media (max-width: 600px) { .formula-shoppable-image { padding: 40px 20px; } .formula-shoppable-image__card { width: 168px; } }

/* Sabit Paket Oluşturucu (2026-08-24) */
.formula-bundle { padding: 64px 40px; background: var(--color-surface); }
.formula-bundle__eyebrow,.formula-delivery__eyebrow { color: var(--color-primary); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 8px; }
.formula-bundle__grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; max-width: 980px; margin: 0 auto; }
.formula-bundle-card { position: relative; display: block; cursor: pointer; border: 1px solid var(--color-border); border-radius: 14px; overflow: hidden; background: var(--color-background); }
.formula-bundle-card:has(input:checked) { border-color: var(--color-primary); box-shadow: 0 0 0 2px color-mix(in srgb,var(--color-primary) 25%,transparent); }
.formula-bundle-card input { position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; accent-color: var(--color-primary); z-index: 1; }
.formula-bundle-card__media { display: block; aspect-ratio: 1 / 1; background: var(--color-surface); }
.formula-bundle-card__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.formula-bundle-card__body { display: flex; flex-direction: column; gap: 5px; padding: 16px; font-size: 13px; color: var(--color-muted); }
.formula-bundle-card__body strong { color: var(--color-text); font-size: 15px; }
.formula-bundle-card__badge { align-self: flex-start; border-radius: 999px; padding: 3px 8px; background: var(--color-accent); color: #fff; font-size: 10px; }
.formula-bundle__action { text-align: center; margin-top: 24px; }
.formula-bundle__action button { min-height: 46px; padding: 0 24px; border: 0; border-radius: 999px; background: var(--color-primary); color: #fff; font-weight: 700; cursor: pointer; }
.formula-bundle__action p { min-height: 20px; margin: 10px 0 0; color: var(--color-muted); font-size: 12px; }

/* Alışveriş Yapılabilir Video (2026-08-24) */
.formula-shoppable-video { padding: 64px 40px; }
.formula-shoppable-video__layout { display: grid; grid-template-columns: minmax(0,1.65fr) minmax(280px,.75fr); gap: 28px; max-width: 1120px; margin: 0 auto; align-items: start; }
.formula-shoppable-video--stacked .formula-shoppable-video__layout { grid-template-columns: 1fr; }
.formula-shoppable-video__media { aspect-ratio: 16 / 9; overflow: hidden; border-radius: 16px; background: #111; }
.formula-shoppable-video__media video,.formula-shoppable-video__media img,.formula-shoppable-video__media iframe { width: 100%; height: 100%; object-fit: cover; display: block; border: 0; }
.formula-shoppable-video__products { display: flex; flex-direction: column; gap: 12px; }
.formula-video-product { display: grid; grid-template-columns: 76px minmax(0,1fr); gap: 12px; padding: 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); }
.formula-video-product img { width: 76px; height: 76px; object-fit: cover; border-radius: 8px; }
.formula-video-product h3 { font-size: 14px; margin: 4px 0; }.formula-video-product p { color: var(--color-muted); font-size: 12px; margin: 0 0 5px; }
.formula-video-product button { border: 0; padding: 0; background: none; color: var(--color-primary); font-size: 11px; font-weight: 700; cursor: pointer; }.formula-video-product a { color: var(--color-text); font-size: 12px; font-weight: 600; }
.formula-video-product__time { display: inline-block; color: var(--color-muted); font-size: 11px; font-weight: 700; }

/* Teslimat Bilgisi (2026-08-24) */
.formula-delivery { padding: 64px 40px; background: var(--color-surface); }
.formula-delivery__content { max-width: 680px; margin: 0 auto; padding: 32px; border: 1px solid var(--color-border); border-radius: 18px; background: var(--color-background); }
.formula-delivery h2 { font-family: var(--font-heading); margin: 0 0 8px; }.formula-delivery__content>p { color: var(--color-muted); line-height: 1.6; }
.formula-delivery form label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 7px; }.formula-delivery form>div { display: flex; gap: 8px; }
.formula-delivery input { min-width: 0; flex: 1; min-height: 46px; border: 1px solid var(--color-border); border-radius: 8px; padding: 0 13px; background: var(--color-background); color: var(--color-text); }
.formula-delivery button { min-height: 46px; border: 0; border-radius: 8px; padding: 0 18px; background: var(--color-primary); color: #fff; font-weight: 700; cursor: pointer; }
.formula-delivery__result { margin-top: 16px; padding: 14px; border-radius: 10px; background: var(--color-surface); }.formula-delivery__result p { margin: 6px 0 0; color: var(--color-muted); font-size: 12px; line-height: 1.5; }
@media (max-width: 760px) { .formula-bundle,.formula-shoppable-video,.formula-delivery { padding: 40px 20px; }.formula-bundle__grid,.formula-shoppable-video__layout { grid-template-columns: 1fr; }.formula-delivery__content { padding: 22px; }.formula-delivery form>div { flex-direction: column; } }

/* Kullanıcı İçerikleri Galerisi (2026-08-24) */
.formula-ugc { padding: 64px 40px; }
.formula-ugc__grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 20px; }
.formula-ugc-card { border-radius: 10px; overflow: hidden; background: var(--color-surface); border: 1px solid var(--color-border); }
.formula-ugc-card__media { aspect-ratio: 1 / 1; overflow: hidden; }
.formula-ugc-card__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.formula-ugc-card__body { padding: 14px; }
.formula-ugc-card__rating { color: #f59e0b; font-size: 13px; margin: 0 0 6px; letter-spacing: 1px; }
.formula-ugc-card__caption { font-size: 13px; color: var(--color-text); line-height: 1.5; margin: 0 0 8px; }
.formula-ugc-card__author { font-size: 12px; color: var(--color-muted); margin: 0; }
.formula-ugc-card__product { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 600; color: var(--color-primary); text-decoration: underline; text-underline-offset: 2px; }
.formula-ugc--masonry .formula-ugc__grid { display: block; column-count: 4; column-gap: 20px; }
.formula-ugc--masonry .formula-ugc-card { break-inside: avoid; margin-bottom: 20px; }
.formula-ugc--scroll .formula-ugc__grid { display: flex; overflow-x: auto; scroll-snap-type: x proximity; gap: 16px; padding-bottom: 8px; grid-template-columns: none; }
.formula-ugc--scroll .formula-ugc-card { flex: 0 0 min(72vw, 240px); scroll-snap-align: start; }
@media (max-width: 900px) { .formula-ugc__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .formula-ugc--masonry .formula-ugc__grid { column-count: 2; } }
@media (max-width: 600px) { .formula-ugc { padding: 40px 20px; } }

/* 404 (2026-08-19) */
.formula-404 { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 96px 24px; min-height: 50vh; }
.formula-404__code { font-family: var(--font-heading); font-size: clamp(64px, 12vw, 140px); font-weight: 700; line-height: 1; margin: 0; color: var(--color-border); letter-spacing: -0.03em; }
.formula-404__title { font-family: var(--font-heading); font-size: clamp(22px, 2.6vw, 32px); margin: 12px 0 8px; }
.formula-404__sub { color: var(--color-muted); max-width: 42ch; margin: 0 0 32px; line-height: 1.6; }
.formula-404__actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

/* Sipariş Sonucu (2026-08-24) */
.formula-order-result { display: flex; align-items: center; justify-content: center; padding: 80px 24px; min-height: 60vh; }
.formula-order-result__box { max-width: 480px; width: 100%; text-align: center; }
.formula-order-result__icon { width: 64px; height: 64px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; background: var(--color-surface); color: var(--color-muted); }
.formula-order-result__icon--success { background: #16a34a1a; color: #16a34a; }
.formula-order-result__title { font-family: var(--font-heading); font-size: clamp(22px, 2.6vw, 30px); margin: 0 0 10px; }
.formula-order-result__sub { color: var(--color-muted); line-height: 1.6; margin: 0 0 16px; }
.formula-order-result__number { font-size: 14px; color: var(--color-muted); margin: 0 0 28px; }
.formula-order-result__number strong { color: var(--color-text); }
.formula-order-result__bank { text-align: left; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); margin: 0 0 28px; padding: 20px 0; }
.formula-order-result__bank-title { font-weight: 700; font-size: 14px; margin: 0 0 12px; }
.formula-order-result__bank-row { background: var(--color-surface); border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; }
.formula-order-result__bank-name { font-weight: 600; font-size: 13px; margin: 0; }
.formula-order-result__bank-iban { font-family: monospace; font-size: 13px; color: var(--color-muted); margin: 4px 0 0; }
.formula-order-result__bank-ref { font-size: 12px; color: var(--color-muted); margin: 8px 0 0; }
.formula-order-result__items { text-align: left; margin: 0 0 28px; }
.formula-order-result__item { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); font-size: 14px; }
.formula-order-result__item-qty { color: var(--color-muted); }
.formula-order-result__total { display: flex; justify-content: space-between; font-weight: 700; padding-top: 14px; font-size: 15px; }
@media (max-width: 600px) { .formula-order-result { padding: 56px 20px; } }

/* Görünürken animasyon (2026-08-19) — varsayılan "none", HİÇBİR ek boya/
   layout maliyeti yok (bkz. revealAnimationSchemaField() yorumu). Gerçek
   gizleme/ortaya çıkarma sadece section explicit bir varyant seçtiğinde
   devreye girer (:not(.formula-reveal--none)), bu yüzden mevcut/varsayılan
   sayfalarda bu blok tamamen no-op'tur. Görünürlüğü tetikleyen minik
   IntersectionObserver script'i apps/renderer/src/eipgTheme.ts ve
   apps/studio-server/src/index.ts'te (motorun HİÇ script eklemediği tek
   nokta, bkz. render fonksiyonları) — ikisi de AYNI script'i (FORMULA_REVEAL_SCRIPT
   ile birebir) body kapanışından hemen önce basar. */
.formula-reveal--none { opacity: 1; }
.formula-reveal:not(.formula-reveal--none) {
  opacity: 0;
  transition: opacity .6s cubic-bezier(.22,.61,.36,1), transform .6s cubic-bezier(.22,.61,.36,1);
}
.formula-reveal--fade:not(.formula-reveal--none) { transform: none; }
.formula-reveal--up:not(.formula-reveal--none) { transform: translateY(28px); }
.formula-reveal--left:not(.formula-reveal--none) { transform: translateX(-28px); }
.formula-reveal--right:not(.formula-reveal--none) { transform: translateX(28px); }
.formula-reveal--zoom:not(.formula-reveal--none) { transform: scale(.94); }
.formula-reveal.is-visible { opacity: 1 !important; transform: none !important; }
/* JS kapalıysa (tarayıcı ayarı ya da script engellendi) içerik sonsuza dek
   gizli KALMASIN — noscript bu durumda HER ZAMAN devrede, JS'e bağlı
   bir zamanlama riski yok (bkz. eipgTheme.ts/studio-server/index.ts'in
   head'e eklediği noscript+style fallback'i). */
@media (prefers-reduced-motion: reduce) {
  .formula-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`;

export const FORMULA_THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --color-primary: #4b5d46;
  --color-secondary: #14140f;
  --color-accent: #c9704f;
  --color-background: #ffffff;
  --color-surface: #f6f4ef;
  --color-text: #14140f;
  --color-muted: #6b6a63;
  --color-border: #e7e4db;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
* { box-sizing: border-box; }
/* 2026-08-19 — kullanıcı isteği: içeriği az/boş bir sayfada footer ekranın
   ALTINA yapışık kalmalı (sayfa en az 1 ekran yüksekliğinde), araya section
   eklenmemişse ortada boşluk kalması normal. Klasik "sticky footer" deseni:
   body flex-column + min-height:100vh, footer'a margin-top:auto (aşağıdaki
   .formula-footer kuralına eklendi) — section sayısı 0 da olsa çalışır,
   sections body'nin DÜZ (wrapper'sız) çocukları olduğu için main gibi bir
   sarmalayıcıya ihtiyaç yok. */
body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; font-family: var(--font-body); color: var(--color-text); background: var(--color-background); -webkit-font-smoothing: antialiased; }
a { color: inherit; }

.formula-btn { display: inline-flex; align-items: center; justify-content: center; padding: 13px 26px; border-radius: 999px; font-size: 13px; letter-spacing: 0.02em; text-decoration: none; border: 1px solid transparent; transition: opacity .15s; }
.formula-btn:hover { opacity: .82; }
.formula-btn--solid { background: var(--color-primary); color: #ffffff; }
.formula-btn--ghost { border-color: var(--color-text); color: var(--color-text); }
.formula-btn--invert { background: #ffffff; color: var(--color-primary); }

.formula-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 28px; }
.formula-section-head h2 { font-family: var(--font-heading); font-size: 26px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.formula-section-head a { font-size: 13px; color: var(--color-muted); text-decoration: underline; text-underline-offset: 3px; }

/* Nav */
.formula-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 40px; border-bottom: 1px solid var(--color-border); background: var(--color-background); gap: 24px; }
.formula-nav__logo { font-family: var(--font-heading); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; text-decoration: none; color: var(--color-text); }
.formula-nav__links { display: flex; gap: 26px; }
.formula-nav__links a { font-size: 13px; text-decoration: none; color: var(--color-text); text-transform: uppercase; letter-spacing: 0.04em; }
/* 2026-08-23 — 20.08-revizeler.md madde 2: alt menü (dropdown) — sadece
   "submenu_item" alt bloğu OLAN menu_item'lar için sarmalayıcı div basılıyor
   (bkz. şablon), diğerleri eski düz <a>'ya dokunulmadan devam ediyor. */
.formula-nav__item { position: relative; }
.formula-nav__item > a { display: block; }
.formula-nav__submenu { position: absolute; top: 100%; left: 0; min-width: 180px; padding: 10px 0; margin-top: 8px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 10px; box-shadow: 0 18px 44px rgba(15,23,42,.10); display: flex; flex-direction: column; opacity: 0; visibility: hidden; transform: translateY(4px); transition: opacity .15s, transform .15s; z-index: 20; }
.formula-nav__item:hover .formula-nav__submenu, .formula-nav__item:focus-within .formula-nav__submenu { opacity: 1; visibility: visible; transform: translateY(0); }
.formula-nav__submenu a { padding: 8px 16px; text-transform: none; letter-spacing: normal; font-size: 13px; }
.formula-nav__submenu a:hover { color: var(--color-primary); }
.formula-nav--centered .formula-nav__submenu { left: 50%; transform: translate(-50%, 4px); }
.formula-nav--centered .formula-nav__item:hover .formula-nav__submenu, .formula-nav--centered .formula-nav__item:focus-within .formula-nav__submenu { transform: translate(-50%, 0); }
.formula-nav__actions { display: flex; align-items: center; gap: 16px; font-size: 13px; }
/* 2026-08-19 — GERÇEK bug: position:relative kullanıcı raporuyla
   ("sepet rozeti ikondan uzak/kötü konumlanmış") bulundu — sepet sayacı
   apps/renderer/src/cartRuntimeClient.ts'in enjekte ettiği position:
   absolute bir span, hiçbir üst öğede position:relative OLMADIĞI
   için en yakın konumlanmış atayı (varsa) ya da viewport'un kendisini
   referans alıp ikondan kopuk duruyordu. */
.formula-nav__actions a { text-decoration: none; color: var(--color-text); display: flex; align-items: center; position: relative; }
.formula-nav__actions a:hover { color: var(--color-primary); }
/* Açılır arama kutusu (2026-08-24, "Arama Şekli" ayarı) — kullanıcı raporu:
   "header içinde olsun, altta açılmasın, eşzamanlı arama yapsın". Input
   artık header'ın KENDİ satırında (position:absolute DEĞİL) genişliyor —
   [[feedback-navbar-must-fit]] sert kuralı gereği taşma riskini önlemek
   için açılınca kardeş ikonlar (hesap/sepet/quiz) GİZLENİYOR (bkz.
   formula-nav__actions--search-open). Sadece SONUÇ listesi (kullanıcının
   "altta açılmasın" dediği asıl input değil) position:absolute bindirme. */
.formula-nav__search { position: relative; display: flex; align-items: center; }
.formula-nav__search-toggle { background: none; border: none; cursor: pointer; padding: 4px; margin: -4px; border-radius: 50%; display: flex; color: inherit; flex-shrink: 0; transition: color .15s, background .15s; }
.formula-nav__search-toggle:hover { color: var(--color-primary); background: var(--color-surface); }
.formula-nav__search-form { display: flex; align-items: center; width: 0; overflow: hidden; opacity: 0; transition: width .22s ease, opacity .22s ease; }
.formula-nav__search.is-open .formula-nav__search-form { width: clamp(160px, 32vw, var(--formula-search-width, 240px)); opacity: 1; margin-left: 8px; }
.formula-nav__search-input { flex: 1; min-width: 0; box-sizing: border-box; height: 38px; border: 1px solid var(--color-border); border-radius: 999px; padding: 0 14px; font-size: 13px; background: var(--color-surface); color: var(--color-text); transition: border-color .15s, box-shadow .15s; }
.formula-nav__search-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent); }
/* Tarayıcının kendi input[type=search] "temizle" X'i KAPATILIYOR — bizim
   kendi kapatma butonumuzla YAN YANA görünüp "2 tane X var" izlenimi
   veriyordu (kullanıcı raporu 2026-08-24). */
.formula-nav__search-input::-webkit-search-decoration,
.formula-nav__search-input::-webkit-search-cancel-button,
.formula-nav__search-input::-webkit-search-results-button,
.formula-nav__search-input::-webkit-search-results-decoration { -webkit-appearance: none; appearance: none; }
.formula-nav__search-close { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: none; border: none; cursor: pointer; margin-left: 4px; color: var(--color-muted); transition: color .15s, background .15s; }
.formula-nav__search-close svg { width: 15px; height: 15px; }
.formula-nav__search-close:hover { color: var(--color-text); background: var(--color-surface); }
.formula-nav__actions--search-open > a { display: none; }
.formula-nav__search-results { display: none; position: absolute; top: calc(100% + 10px); right: 0; width: min(320px, 90vw); max-height: 380px; overflow-y: auto; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: 0 20px 48px rgba(15,23,42,.14); z-index: 30; }
.formula-nav__search.has-results .formula-nav__search-results { display: block; }
.formula-nav__search-result { display: flex; align-items: center; gap: 12px; padding: 10px 14px; text-decoration: none; color: var(--color-text); border-bottom: 1px solid var(--color-border); transition: background .12s; }
.formula-nav__search-result:hover { background: var(--color-surface); }
.formula-nav__search-result:last-child { border-bottom: none; }
.formula-nav__search-result img, .formula-nav__search-result-placeholder { width: 44px; height: 44px; object-fit: cover; border-radius: 8px; background: var(--color-surface); flex-shrink: 0; display: block; }
.formula-nav__search-result-title { display: block; font-size: 13px; line-height: 1.35; }
.formula-nav__search-result-price { display: block; font-size: 12px; color: var(--color-muted); margin-top: 3px; }
.formula-nav__search-empty { padding: 16px; font-size: 13px; color: var(--color-muted); text-align: center; }
.formula-nav__search-viewall { display: block; text-align: center; padding: 11px; font-size: 12px; font-weight: 600; color: var(--color-primary); text-decoration: none; border-top: 1px solid var(--color-border); }
.formula-nav__search-viewall:hover { background: var(--color-surface); }
/* Ortada her zaman görünür çubuk (2026-08-24, "Arama Şekli" — "Ortada Her
   Zaman Görünür Çubuk"). Sabit genişlik yerine flex item'ın kendi kalan
   boşlukta ortalanmasına güveniliyor (margin:auto) — nav'ı grid'e çevirmek
   gibi daha büyük bir yeniden yapılanma gerekmeden gerçek ortalama etkisi. */
.formula-nav__search--bar { flex: 1 1 auto; max-width: var(--formula-search-width, 240px); margin: 0 auto; gap: 8px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 0 14px; height: 38px; }
.formula-nav__search--bar .formula-nav__search-input { border: none; background: none; padding: 0; height: auto; }
.formula-nav__search--bar .formula-nav__search-input:focus { box-shadow: none; }
.formula-nav__search--bar .formula-nav__search-bar-icon { display: flex; color: var(--color-muted); flex-shrink: 0; }
.formula-nav__search--bar .formula-nav__search-results { left: 0; right: 0; width: 100%; }
@media (max-width: 767.98px) { .formula-nav__search--bar { max-width: none; } }
/* Ortada açılır pencere (modal/spotlight-stili). */
.formula-nav__search-modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.45); opacity: 0; pointer-events: none; transition: opacity .18s ease; z-index: 60; }
.formula-nav__search-modal-backdrop.is-open { opacity: 1; pointer-events: auto; }
.formula-nav__search--modal { position: fixed; top: 12vh; left: 50%; transform: translateX(-50%) translateY(-10px) scale(.98); width: min(600px, 92vw); opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; z-index: 61; display: block; }
.formula-nav__search--modal.is-open { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0) scale(1); }
.formula-nav__search-modal-box { background: var(--color-background); border-radius: 16px; border: 1px solid var(--color-border); box-shadow: 0 30px 80px rgba(15,23,42,.28); overflow: hidden; }
.formula-nav__search-modal-row { display: flex; align-items: center; gap: 10px; padding: 18px 20px; border-bottom: 1px solid var(--color-border); }
.formula-nav__search-modal-icon { display: flex; align-items: center; color: var(--color-muted); flex-shrink: 0; }
.formula-nav__search-modal-icon svg { width: 19px; height: 19px; }
.formula-nav__search--modal .formula-nav__search-input { flex: 1; height: 46px; border: none; background: none; padding: 0; font-size: 16px; }
.formula-nav__search--modal .formula-nav__search-input:focus { box-shadow: none; }
.formula-nav__search--modal .formula-nav__search-close { width: 34px; height: 34px; }
.formula-nav__search--modal .formula-nav__search-close svg { width: 16px; height: 16px; }
.formula-nav__search--modal .formula-nav__search-results { display: block; position: static; width: 100%; max-height: 50vh; overflow-y: auto; border: none; box-shadow: none; border-radius: 0; }
.formula-nav__search--modal .formula-nav__search-result { padding: 12px 20px; }
.formula-nav__search--modal .formula-nav__search-viewall { border-top: 1px solid var(--color-border); padding: 13px; }
.formula-nav__search--modal .formula-nav__search-empty { padding: 28px 20px; }
body.formula-search-modal-open { overflow: hidden; }
.formula-nav__icon { width: 19px; height: 19px; display: block; }
.formula-nav__quiz { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 7px 14px; color: var(--color-primary) !important; font-weight: 500; }
/* Kaydırınca sabit header ("Kaydırınca Header Sabit Kalsın" ayarı, 2026-08-24). */
.formula-nav--sticky { position: sticky; top: 0; z-index: 40; }
/* Mobil hamburger menü (2026-08-24 — kullanıcı raporu: "header'ı geliştir,
   e-ticaret sitesinde ne olması gerekiyorsa" — 768px altında .formula-nav__links
   TAMAMEN kayboluyordu, YERİNE HİÇBİR ŞEY konulmamıştı; mobil ziyaretçi
   navigasyona hiç erişemiyordu). Sol taraftan açılan panel, alt menüler
   düz liste olarak (accordion YOK — basitlik + ek JS state gerektirmeden
   doğru çalışma tercih edildi). */
.formula-nav__mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; margin: -4px; border-radius: 50%; color: var(--color-text); flex-shrink: 0; transition: background .15s; }
.formula-nav__mobile-toggle:hover { background: var(--color-surface); }
.formula-nav__mobile-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.45); opacity: 0; pointer-events: none; transition: opacity .18s ease; z-index: 70; }
.formula-nav__mobile-backdrop.is-open { opacity: 1; pointer-events: auto; }
.formula-nav__mobile-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(320px, 84vw); background: var(--color-background); box-shadow: 8px 0 40px rgba(15,23,42,.18); transform: translateX(-100%); transition: transform .22s ease; z-index: 71; display: flex; flex-direction: column; overflow-y: auto; }
.formula-nav__mobile-drawer.is-open { transform: translateX(0); }
.formula-nav__mobile-drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.formula-nav__mobile-links { display: flex; flex-direction: column; padding: 10px 0; }
.formula-nav__mobile-links a { padding: 12px 18px; font-size: 14px; text-decoration: none; color: var(--color-text); text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid var(--color-border); }
.formula-nav__mobile-links a.formula-nav__mobile-sublink { padding-left: 32px; font-size: 13px; text-transform: none; letter-spacing: normal; color: var(--color-muted); }
.formula-nav__mobile-drawer-foot { margin-top: auto; display: flex; flex-direction: column; border-top: 1px solid var(--color-border); padding: 8px 0; flex-shrink: 0; }
.formula-nav__mobile-drawer-foot a { display: flex; align-items: center; gap: 10px; padding: 12px 18px; font-size: 14px; text-decoration: none; color: var(--color-text); }
.formula-nav__mobile-drawer-foot a:hover { color: var(--color-primary); }
.formula-nav__mobile-drawer-foot a svg { width: 18px; height: 18px; }
body.formula-mobile-menu-open { overflow: hidden; }
@media (max-width: 767.98px) {
  .formula-nav__links { display: none; }
  .formula-nav { padding: 14px 20px; }
  .formula-nav__mobile-toggle { display: flex; }
  .formula-nav__quiz { display: none; }
}
/* "Ortalı Logo" tasarım varyantı (2026-08-19) — logo üstte ortalı, altında
   linkler, aksiyonlar (ara/hesap/sepet) sağ üst köşede mutlak konumlanır. */
.formula-nav--centered { flex-direction: column; justify-content: center; text-align: center; position: relative; padding-top: 16px; padding-bottom: 14px; }
.formula-nav--centered .formula-nav__actions { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); }
.formula-nav--centered .formula-nav__mobile-toggle { position: absolute; left: 20px; top: 18px; }
@media (max-width: 767.98px) { .formula-nav--centered .formula-nav__actions { position: static; transform: none; justify-content: center; margin-top: 2px; } }

/* Hero */
.formula-hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 64px 40px; background: var(--color-surface); min-height: 560px; }
.formula-hero__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 18px; font-weight: 600; }
.formula-hero__title { font-family: var(--font-heading); font-size: clamp(36px, 4.5vw, 56px); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 20px; max-width: 12ch; }
.formula-hero__sub { color: var(--color-muted); line-height: 1.6; max-width: 42ch; margin: 0 0 32px; }
.formula-hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }
.formula-hero__media { position: relative; aspect-ratio: 4/5; border-radius: 18px; overflow: hidden; background: #ffffff; }
.formula-hero__media picture { display: block; width: 100%; height: 100%; }
.formula-hero__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-hero__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-primary) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-hero--reverse { grid-template-columns: 1fr 1fr; direction: rtl; }
.formula-hero--reverse > * { direction: ltr; }
.formula-hero--overlay { display: block; position: relative; padding: 0; min-height: 480px; }
.formula-hero--overlay .formula-hero__copy { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; padding: 56px 40px; color: #ffffff; }
.formula-hero--overlay .formula-hero__eyebrow { color: rgba(255,255,255,.85); }
.formula-hero--overlay .formula-hero__media { position: absolute; inset: 0; aspect-ratio: auto; border-radius: 0; z-index: 1; }
.formula-hero__scrim { position: absolute; inset: 0; pointer-events: none; }
.formula-hero--centered { display: block; text-align: center; padding: 96px 40px; }
.formula-hero--centered .formula-hero__copy { max-width: 640px; margin: 0 auto; }
.formula-hero--centered .formula-hero__title { max-width: none; }
.formula-hero--centered .formula-hero__sub { margin-left: auto; margin-right: auto; }
@media (max-width: 900px) { .formula-hero { grid-template-columns: 1fr; padding: 48px 24px; text-align: center; } .formula-hero--reverse { direction: ltr; } .formula-hero__actions { justify-content: center; } .formula-hero__sub { max-width: none; margin-left: auto; margin-right: auto; } .formula-hero--overlay .formula-hero__copy, .formula-hero--centered { padding: 40px 24px; } }

/* Quiz banner */
.formula-quiz { background: var(--color-primary); color: #ffffff; text-align: center; padding: 56px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.formula-quiz__title { font-family: var(--font-heading); font-size: 24px; font-weight: 600; margin: 0; max-width: 32ch; }
.formula-quiz__sub { margin: 0 0 14px; opacity: .85; font-size: 14px; }

/* Bestsellers / product cards */
.formula-bestsellers, .formula-concerns, .formula-philosophy { padding: 64px 40px; }
.formula-bestsellers__grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 24px; }
.formula-bestsellers--carousel .formula-bestsellers__grid { display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px; }
.formula-bestsellers--carousel .formula-product-card { flex:0 0 min(78vw,300px);scroll-snap-align:start; }
.formula-bestsellers--featured .formula-bestsellers__grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
.formula-bestsellers--featured .formula-product-card:first-child { grid-column:span 2;grid-row:span 2; }
.formula-bestsellers--featured .formula-product-card:first-child .formula-product-card__media { aspect-ratio:1; }
.formula-product-card { text-decoration: none; color: var(--color-text); display: block; }
.formula-product-card__media { position: relative; aspect-ratio: 3/4; background: var(--color-surface); border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
.formula-product-card__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-product-card__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-badge { position: absolute; top: 10px; left: 10px; background: var(--color-accent); color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; padding: 4px 9px; border-radius: 999px; }
.formula-product-card__active { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-primary); margin: 0 0 4px; }
.formula-product-card__vendor { font-size: 11px; color: var(--color-muted); margin: 0 0 2px; text-transform: uppercase; letter-spacing: 0.04em; }
.formula-product-card__name { font-size: 14px; font-weight: 500; margin: 0 0 4px; }
.formula-product-card__price { font-size: 14px; color: var(--color-muted); margin: 0; }
/* 2026-08-23 — 20.08-revizeler.md madde 5: kart stili varyantları
   (related-products/recently-viewed'in yeni "Kart Stili" ayarı). */
.formula-product-card--bordered .formula-product-card__media { border: 1px solid var(--color-border); }
.formula-product-card--shadow .formula-product-card__media { box-shadow: 0 18px 44px rgba(15,23,42,.10); }
@media (max-width: 900px) { .formula-bestsellers__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .formula-bestsellers, .formula-concerns, .formula-philosophy { padding: 44px 20px; } }

/* Concerns */
.formula-concerns__grid { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 16px; }
.formula-concern-card { display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; color: var(--color-text); background: var(--color-surface); border-radius: 14px; padding: 26px 12px; text-align: center; }
.formula-concern-card__icon { font-size: 20px; color: var(--color-primary); }
.formula-concern-card__label { font-size: 12px; font-weight: 500; }
@media (max-width: 900px) { .formula-concerns__grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }

/* Philosophy */
.formula-philosophy { background: var(--color-background); text-align: center; }
.formula-philosophy__statement { font-family: var(--font-heading); font-size: 28px; font-weight: 600; max-width: 26ch; margin: 0 auto 48px; letter-spacing: -0.01em; }
.formula-philosophy__grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 32px; max-width: 900px; margin: 0 auto; }
.formula-value__icon { font-size: 20px; color: var(--color-primary); display: block; margin-bottom: 10px; }
.formula-value__title { font-weight: 600; margin: 0 0 6px; }
.formula-value__text { color: var(--color-muted); font-size: 13px; line-height: 1.6; margin: 0; }
@media (max-width: 700px) { .formula-philosophy__grid { grid-template-columns: 1fr; gap: 28px; } }

/* Footer */
.formula-footer { background: var(--color-surface); padding: 56px 40px 28px; margin-top: auto; }
.formula-footer__top { display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; margin-bottom: 32px; }
.formula-footer__brand { max-width: 340px; }
.formula-footer__logo { font-family: var(--font-heading); font-weight: 700; font-size: 18px; margin: 0 0 10px; }
.formula-footer__blurb { color: var(--color-muted); font-size: 13px; line-height: 1.6; margin: 0; }
.formula-footer__links { display: flex; gap: 22px; flex-wrap: wrap; }
.formula-footer__links a { font-size: 13px; text-decoration: none; color: var(--color-text); }
.formula-footer__copy { font-size: 12px; color: var(--color-muted); border-top: 1px solid var(--color-border); padding-top: 20px; margin: 0; }
/* 2026-08-23 — 20.08-revizeler.md madde 2: sosyal ikonlar + çok sütunlu footer */
.formula-footer__social { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.formula-footer__social a { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--color-border); color: var(--color-muted); transition: color .15s, border-color .15s, background .15s; }
.formula-footer__social a:hover { color: var(--color-text); border-color: var(--color-text); background: var(--color-surface); }
.formula-footer__social-icon { width: 17px; height: 17px; display: block; }
.formula-footer__column { min-width: 140px; }
.formula-footer__column-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; color: var(--color-text); }
.formula-footer__column-links { display: flex; flex-direction: column; gap: 10px; }
.formula-footer__column-links a { font-size: 13px; text-decoration: none; color: var(--color-muted); }
.formula-footer__column-links a:hover { color: var(--color-text); }
` + FORMULA_LIBRARY_SECTIONS_CSS;

/** `assets/theme.css`, sadece proje OLUŞTURULURKEN scaffold edilir
 * (`scaffoldTemplate.ts`, proje oluşturma anında çalışır) — o TARİHTEN
 * ÖNCE oluşturulmuş projelerin dosyaları donmuş bir kopya. Bu bug SINIFI
 * (2026-08-17: marquee CSS'i eksik, 2026-08-19: nav ikon CSS'i eksik) her
 * yeni core CSS değişikliğinde TEKRARLANIYORDU çünkü eski sürüm tek bir
 * imza sınıfın (`.formula-marquee`) VARLIĞINA bakıyordu — bir proje bir kez
 * yamalandıktan sonra o imza sınıf artık orada olduğu için, ONDAN SONRAKİ
 * hiçbir CSS güncellemesi bir daha yansımıyordu (idempotent kontrol yanlış
 * şeyi kontrol ediyordu). Formula'da Studio'dan elle CSS düzenleme özelliği
 * YOK (tema ayarları renkleri/fontları AYRI, render zamanında `:root`
 * enjeksiyonuyla uygulanıyor, bkz. `buildThemeSettingsCss`) — yani
 * `assets/theme.css` HER ZAMAN o anki `FORMULA_THEME_CSS`'in birebir aynısı
 * OLMALI. Fix: imza-sınıf kontrolü yerine DOĞRUDAN EŞİTLİK — farklıysa
 * güncel kaynakla DEĞİŞTİRİLİR (append değil, TAM senkron), bu da gelecekteki
 * her CSS değişikliğini otomatik kalıcı hale getirir, ayrı bir yama daha
 * gerekmez. `StudioShell.tsx` proje yüklenirken çağırır, sonraki kayıtta
 * kalıcı hale gelir. */
export function patchMissingFormulaLibraryCss(files: Record<string, string>, templateId: string | null | undefined): Record<string, string> {
  if (templateId !== "formula") return files;
  const css = files["assets/theme.css"];
  if (css === undefined || css === FORMULA_THEME_CSS) return files;
  return { ...files, "assets/theme.css": FORMULA_THEME_CSS };
}

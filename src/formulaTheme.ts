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

export const FORMULA_NAV_HEADER = `<section class="formula-nav">
  <a class="formula-nav__logo" href="/">{{ section.settings.logo_text | default: shop.name | escape }}</a>
  <nav class="formula-nav__links">
    {% for block in section.blocks %}
      {% if block.type == "menu_item" %}
        <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
      {% endif %}
    {% endfor %}
  </nav>
  <div class="formula-nav__actions">
    <a href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}" class="formula-nav__quiz">{{ section.settings.quiz_label | default: "Cilt Analizi" | escape }}</a>
    <a href="/search" aria-label="Ara">Ara</a>
    <a href="/account" aria-label="Hesabım">Hesap</a>
    <a href="/cart" aria-label="Sepet">Sepet</a>
  </div>
</section>

{% schema %}
{
  "name": "Formula Navigasyon",
  "settings": [
    { "type": "text", "id": "logo_text", "label": "Logo Metni", "default": "" },
    { "type": "text", "id": "quiz_label", "label": "Analiz Buton Metni", "default": "Cilt Analizi" },
    { "type": "url", "id": "quiz_url", "label": "Analiz Bağlantısı", "default": "/pages/cilt-analizi" }
  ],
  "blocks": [
    {
      "type": "menu_item",
      "name": "Menü Öğesi",
      "settings": [
        { "type": "text", "id": "label", "label": "Metin", "default": "Yüz Bakımı" },
        { "type": "url", "id": "url", "label": "URL", "default": "/collection" }
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

export const FORMULA_HERO = `<section class="formula-hero">
  <div class="formula-hero__copy">
    <p class="formula-hero__eyebrow">{{ section.settings.eyebrow | default: "Az bileşen, yüksek standart" | escape }}</p>
    <h1 class="formula-hero__title">{{ section.settings.title | default: "Cildin ne istiyorsa, sadece o." | escape }}</h1>
    <p class="formula-hero__sub">{{ section.settings.subtitle | default: "Şeffaf formüller, kanıtlanmış aktifler. Her ürünün etiketinde ne olduğunu, neden orada olduğunu görürsün." | escape }}</p>
    <div class="formula-hero__actions">
      <a class="formula-btn formula-btn--solid" href="{{ section.settings.cta_url | default: '/products' | escape }}">{{ section.settings.cta_label | default: "Ürünleri Keşfet" | escape }}</a>
      <a class="formula-btn formula-btn--ghost" href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}">{{ section.settings.quiz_label | default: "Cildini Tanı →" | escape }}</a>
    </div>
  </div>
  <div class="formula-hero__media">
    {% if section.settings.image != blank %}
      <img src="{{ section.settings.image | img_url: '1200x' }}" alt="{{ section.settings.title | escape }}" loading="eager" style="${imageEffectStyle("section.settings")}" />
    {% else %}
      <div class="formula-hero__placeholder" aria-hidden="true"></div>
    {% endif %}
    ${imageEffectOverlay("section.settings")}
  </div>
</section>

{% schema %}
{
  "name": "Formula Hero",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Üst Etiket", "default": "Az bileşen, yüksek standart" },
    { "type": "text", "id": "title", "label": "Başlık", "default": "Cildin ne istiyorsa, sadece o." },
    { "type": "textarea", "id": "subtitle", "label": "Alt Metin", "default": "Şeffaf formüller, kanıtlanmış aktifler. Her ürünün etiketinde ne olduğunu, neden orada olduğunu görürsün." },
    { "type": "text", "id": "cta_label", "label": "Ana Buton Metni", "default": "Ürünleri Keşfet" },
    { "type": "url", "id": "cta_url", "label": "Ana Buton URL", "default": "/products" },
    { "type": "text", "id": "quiz_label", "label": "İkincil Buton Metni", "default": "Cildini Tanı →" },
    { "type": "url", "id": "quiz_url", "label": "İkincil Buton URL", "default": "/pages/cilt-analizi" },
    { "type": "image_picker", "id": "image", "label": "Görsel" },${imageEffectSchemaFields()}
  ],
  "presets": [{ "name": "Formula Hero" }]
}
{% endschema %}`;

export const FORMULA_QUIZ_BANNER = `<section class="formula-quiz">
  <p class="formula-quiz__title">{{ section.settings.title | default: "Cildin için hangi aktifler işe yarar, bilmiyor musun?" | escape }}</p>
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
    { "type": "url", "id": "url", "label": "Buton URL", "default": "/pages/cilt-analizi" }
  ],
  "presets": [{ "name": "Formula Analiz Bandı" }]
}
{% endschema %}`;

export const FORMULA_BESTSELLERS = `<section class="formula-bestsellers">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Çok satanlar" | escape }}</h2>
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
    { "type": "text", "id": "title", "label": "Başlık", "default": "Çok satanlar" },
    { "type": "text", "id": "view_all_label", "label": "Tümünü Gör Metni", "default": "Tümünü Gör" },
    { "type": "url", "id": "view_all_url", "label": "Tümünü Gör URL", "default": "/products" }
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
  "max_blocks": 8,
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

export const FORMULA_CONCERNS = `<section class="formula-concerns">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Kaygına göre keşfet" | escape }}</h2>
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
    { "type": "text", "id": "title", "label": "Başlık", "default": "Kaygına göre keşfet" }
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

export const FORMULA_PHILOSOPHY = `<section class="formula-philosophy">
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
    { "type": "textarea", "id": "statement", "label": "Ana Cümle", "default": "Az bileşen. Kanıtlanmış aktifler. Her zaman şeffaf." }
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
      <p class="formula-footer__logo">{{ section.settings.logo_text | default: shop.name | escape }}</p>
      <p class="formula-footer__blurb">{{ section.settings.blurb | default: "Az bileşen, yüksek standart. Cilt bakımını şeffaf ve anlaşılır yapıyoruz." | escape }}</p>
    </div>
    <nav class="formula-footer__links">
      {% for block in section.blocks %}
        {% if block.type == "menu_item" %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
        {% endif %}
      {% endfor %}
    </nav>
  </div>
  <p class="formula-footer__copy">&copy; {{ "now" | date: "%Y" }} {{ shop.name | escape }}. Tüm hakları saklıdır.</p>
</section>

{% schema %}
{
  "name": "Formula Footer",
  "settings": [
    { "type": "text", "id": "logo_text", "label": "Logo Metni", "default": "" },
    { "type": "textarea", "id": "blurb", "label": "Marka Açıklaması", "default": "Az bileşen, yüksek standart. Cilt bakımını şeffaf ve anlaşılır yapıyoruz." }
  ],
  "blocks": [
    {
      "type": "menu_item",
      "name": "Menü Öğesi",
      "settings": [
        { "type": "text", "id": "label", "label": "Metin", "default": "Sayfa" },
        { "type": "url", "id": "url", "label": "URL", "default": "/" }
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

export const FORMULA_MARQUEE = `<section class="formula-marquee">
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
    { "type": "range", "id": "speed", "label": "Hız (sn)", "min": 10, "max": 60, "step": 2, "default": 28 }
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
export const FORMULA_COLLECTION_LIST = `<section class="formula-collection-list">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Koleksiyonlar" | escape }}</h2>
  </div>
  <div class="formula-collection-list__grid">
    {% for block in section.blocks %}
      {% if block.type == "collection" and block.settings.collection != blank %}
        <a class="formula-collection-card" href="{{ block.settings.collection.url | escape }}">
          <div class="formula-collection-card__media" style="border-radius: {{ section.settings.image_shape | default: 14 }}px">
            {% if block.settings.collection.image != blank %}
              <img src="{{ block.settings.collection.image | img_url: '900x' }}" alt="{{ block.settings.collection.title | escape }}" loading="lazy" />
            {% else %}
              <div class="formula-collection-card__placeholder" aria-hidden="true"></div>
            {% endif %}
          </div>
          <p class="formula-collection-card__title">{{ block.settings.collection.title | escape }}</p>
          {% if block.settings.collection.description != blank %}<p class="formula-collection-card__sub">{{ block.settings.collection.description | escape }}</p>{% endif %}
        </a>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula Koleksiyon Listesi",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Koleksiyonlar" },
    { "type": "select", "id": "image_shape", "label": "Görsel Şekli", "default": "14",
      "options": [
        { "label": "Köşeli", "value": "0" },
        { "label": "Yumuşak", "value": "14" },
        { "label": "Yuvarlak", "value": "28" },
        { "label": "Oval", "value": "56" }
      ]
    }
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
export const FORMULA_COLLECTION_SHOWCASE = `<section class="formula-collection-showcase">
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
    { "type": "select", "id": "image_shape", "label": "Görsel Şekli", "default": "18",
      "options": [
        { "label": "Köşeli", "value": "0" },
        { "label": "Yumuşak", "value": "18" },
        { "label": "Yuvarlak", "value": "32" },
        { "label": "Oval", "value": "64" }
      ]
    },${imageEffectSchemaFields()}
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
export const FORMULA_GENERAL_SHOWCASE = `<section class="formula-showcase{% if section.settings.layout == 'image_right' %} formula-showcase--reverse{% endif %}">
  <div class="formula-showcase__media" style="border-radius: {{ section.settings.image_shape | default: 18 }}px">
    {% if section.settings.image != blank %}
      <img src="{{ section.settings.image | img_url: '1400x' }}" alt="{{ section.settings.title | escape }}" loading="lazy" style="${imageEffectStyle("section.settings")}" />
    {% else %}
      <div class="formula-showcase__placeholder" aria-hidden="true"></div>
    {% endif %}
    ${imageEffectOverlay("section.settings")}
  </div>
  <div class="formula-showcase__copy">
    {% if section.settings.eyebrow != blank %}<p class="formula-showcase__eyebrow">{{ section.settings.eyebrow | escape }}</p>{% endif %}
    <h2 class="formula-showcase__title">{{ section.settings.title | default: "Yeni Sezon" | escape }}</h2>
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
    { "type": "url", "id": "cta_url", "label": "Buton Bağlantısı", "default": "" },${imageEffectSchemaFields()}
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

export const FORMULA_FAQ = `<section class="formula-faq">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Sıkça Sorulan Sorular" | escape }}</h2>
  </div>
  <div class="formula-faq__list">
    {% for block in section.blocks %}
      {% if block.type == "question" %}
        <details class="formula-faq__item">
          <summary class="formula-faq__question">{{ block.settings.question | default: "Soru" | escape }}<span class="formula-faq__chevron" aria-hidden="true">⌄</span></summary>
          <p class="formula-faq__answer">{{ block.settings.answer | default: "Cevap" | escape }}</p>
        </details>
      {% endif %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Formula SSS",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Sıkça Sorulan Sorular" }
  ],
  "blocks": [
    {
      "type": "question",
      "name": "Soru",
      "settings": [
        { "type": "text", "id": "question", "label": "Soru", "default": "Kargo ne kadar sürer?" },
        { "type": "textarea", "id": "answer", "label": "Cevap", "default": "Siparişler 1-3 iş günü içinde kargoya verilir." }
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
export const FORMULA_STORY_ROW = `<section class="formula-story-row">
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
  "settings": [],
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
export const FORMULA_SLIDER = `<section class="formula-slider" data-section-id="{{ section.id }}">
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
    }
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
export const FORMULA_STATS = `<section class="formula-stats">
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
    { "type": "text", "id": "title", "label": "Başlık (ops.)", "default": "" }
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

/** `StudioShell.tsx`'in `addCatalog`'una `templateId === "formula"` iken
 * eklenen sabit kütüphane girdileri — sayfada henüz var olmasalar bile her
 * zaman teklif edilirler (bkz. `custom-html`'in aynı deseni). */
export const FORMULA_LIBRARY_SECTIONS: { type: string; content: string }[] = [
  { type: "announcement-bar", content: FORMULA_ANNOUNCEMENT_BAR },
  { type: "brand-marquee", content: FORMULA_MARQUEE },
  { type: "collection-list", content: FORMULA_COLLECTION_LIST },
  { type: "collection-showcase", content: FORMULA_COLLECTION_SHOWCASE },
  { type: "general-showcase", content: FORMULA_GENERAL_SHOWCASE },
  { type: "stats", content: FORMULA_STATS },
  { type: "faq", content: FORMULA_FAQ },
  { type: "story-row", content: FORMULA_STORY_ROW },
  { type: "slider", content: FORMULA_SLIDER },
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

/* Koleksiyon listesi */
.formula-collection-list { padding: 64px 40px; }
.formula-collection-list__grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 24px; }
.formula-collection-card { text-decoration: none; color: var(--color-text); display: block; }
.formula-collection-card__media { position: relative; aspect-ratio: 4/3; background: var(--color-surface); border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
.formula-collection-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.formula-collection-card:hover .formula-collection-card__media img { transform: scale(1.04); }
.formula-collection-card__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-collection-card__title { font-family: var(--font-heading); font-size: 16px; font-weight: 600; margin: 0 0 4px; }
.formula-collection-card__sub { font-size: 12px; color: var(--color-muted); margin: 0; }
@media (max-width: 900px) { .formula-collection-list__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .formula-collection-list { padding: 44px 20px; } }
@media (max-width: 560px) { .formula-collection-list__grid { grid-template-columns: 1fr; } }

/* Koleksiyon vitrini */
.formula-collection-showcase { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 64px 40px; background: var(--color-background); }
.formula-collection-showcase__media { position: relative; aspect-ratio: 5/4; border-radius: 18px; overflow: hidden; background: var(--color-surface); }
.formula-collection-showcase__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-collection-showcase__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-accent) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-collection-showcase__empty { grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--color-muted); font-size: 13px; border: 1px dashed var(--color-border); border-radius: 14px; }
.formula-collection-showcase__title { font-family: var(--font-heading); font-size: clamp(30px, 3.6vw, 44px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 14ch; }
.formula-collection-showcase__sub { color: var(--color-muted); line-height: 1.6; max-width: 40ch; margin: 0 0 28px; }
@media (max-width: 900px) { .formula-collection-showcase { grid-template-columns: 1fr; padding: 48px 24px; text-align: center; } .formula-collection-showcase__sub { max-width: none; margin-left: auto; margin-right: auto; } }

/* Genel Vitrin */
.formula-showcase { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 64px 40px; background: var(--color-background); }
.formula-showcase--reverse { direction: rtl; }
.formula-showcase--reverse > * { direction: ltr; }
.formula-showcase--reverse .formula-showcase__media { order: 2; }
.formula-showcase__media { position: relative; aspect-ratio: 5/4; overflow: hidden; background: var(--color-surface); }
.formula-showcase__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-showcase__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-primary) 0%, var(--color-surface) 70%); opacity: .5; }
.formula-showcase__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 16px; font-weight: 600; }
.formula-showcase__title { font-family: var(--font-heading); font-size: clamp(28px, 3.4vw, 42px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 16ch; }
.formula-showcase__sub { color: var(--color-muted); line-height: 1.6; max-width: 42ch; margin: 0 0 28px; }
@media (max-width: 900px) { .formula-showcase, .formula-showcase--reverse { grid-template-columns: 1fr; direction: ltr; padding: 48px 24px; text-align: center; } .formula-showcase--reverse .formula-showcase__media { order: 0; } .formula-showcase__sub { max-width: none; margin-left: auto; margin-right: auto; } }

/* SSS */
.formula-faq { padding: 64px 40px; max-width: 760px; margin: 0 auto; }
.formula-faq__list { display: flex; flex-direction: column; gap: 4px; }
.formula-faq__item { border-bottom: 1px solid var(--color-border); padding: 18px 0; }
.formula-faq__question { display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; font-family: var(--font-heading); font-weight: 600; font-size: 15px; color: var(--color-text); list-style: none; }
.formula-faq__question::-webkit-details-marker { display: none; }
.formula-faq__chevron { color: var(--color-muted); transition: transform .2s; flex-shrink: 0; }
.formula-faq__item[open] .formula-faq__chevron { transform: rotate(180deg); }
.formula-faq__answer { margin: 12px 0 0; color: var(--color-muted); line-height: 1.6; font-size: 14px; }
@media (max-width: 700px) { .formula-faq { padding: 44px 20px; } }

/* Instagram-story tipi hızlı koleksiyonlar */
.formula-story-row { padding: 32px 40px; }
.formula-story-row__track { display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none; }
.formula-story-row__track::-webkit-scrollbar { display: none; }
.formula-story { display: flex; flex-direction: column; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; width: 76px; }
.formula-story__ring { display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 999px; padding: 3px; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); }
.formula-story__avatar { display: block; width: 100%; height: 100%; border-radius: 999px; background: var(--color-surface) center/cover no-repeat; border: 2px solid var(--color-background); }
.formula-story__label { font-size: 11px; text-align: center; color: var(--color-text); line-height: 1.3; }
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
body { margin: 0; font-family: var(--font-body); color: var(--color-text); background: var(--color-background); -webkit-font-smoothing: antialiased; }
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
.formula-nav__logo { font-family: var(--font-heading); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; text-decoration: none; color: var(--color-secondary); }
.formula-nav__links { display: flex; gap: 26px; }
.formula-nav__links a { font-size: 13px; text-decoration: none; color: var(--color-text); text-transform: uppercase; letter-spacing: 0.04em; }
.formula-nav__actions { display: flex; align-items: center; gap: 18px; font-size: 13px; }
.formula-nav__actions a { text-decoration: none; color: var(--color-text); }
.formula-nav__quiz { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 7px 14px; color: var(--color-primary) !important; font-weight: 500; }
@media (max-width: 767.98px) { .formula-nav__links { display: none; } .formula-nav { padding: 14px 20px; } }

/* Hero */
.formula-hero { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 48px; padding: 64px 40px; background: var(--color-surface); min-height: 560px; }
.formula-hero__eyebrow { text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: var(--color-primary); margin: 0 0 18px; font-weight: 600; }
.formula-hero__title { font-family: var(--font-heading); font-size: clamp(36px, 4.5vw, 56px); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 20px; max-width: 12ch; }
.formula-hero__sub { color: var(--color-muted); line-height: 1.6; max-width: 42ch; margin: 0 0 32px; }
.formula-hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }
.formula-hero__media { position: relative; aspect-ratio: 4/5; border-radius: 18px; overflow: hidden; background: #ffffff; }
.formula-hero__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-hero__placeholder { width: 100%; height: 100%; background: linear-gradient(155deg, var(--color-primary) 0%, var(--color-surface) 70%); opacity: .5; }
@media (max-width: 900px) { .formula-hero { grid-template-columns: 1fr; padding: 48px 24px; text-align: center; } .formula-hero__actions { justify-content: center; } .formula-hero__sub { max-width: none; margin-left: auto; margin-right: auto; } }

/* Quiz banner */
.formula-quiz { background: var(--color-primary); color: #ffffff; text-align: center; padding: 56px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.formula-quiz__title { font-family: var(--font-heading); font-size: 24px; font-weight: 600; margin: 0; max-width: 32ch; }
.formula-quiz__sub { margin: 0 0 14px; opacity: .85; font-size: 14px; }

/* Bestsellers / product cards */
.formula-bestsellers, .formula-concerns, .formula-philosophy { padding: 64px 40px; }
.formula-bestsellers__grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 24px; }
.formula-product-card { text-decoration: none; color: var(--color-text); display: block; }
.formula-product-card__media { position: relative; aspect-ratio: 3/4; background: var(--color-surface); border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
.formula-product-card__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-product-card__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-badge { position: absolute; top: 10px; left: 10px; background: var(--color-accent); color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; padding: 4px 9px; border-radius: 999px; }
.formula-product-card__active { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-primary); margin: 0 0 4px; }
.formula-product-card__name { font-size: 14px; font-weight: 500; margin: 0 0 4px; }
.formula-product-card__price { font-size: 14px; color: var(--color-muted); margin: 0; }
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
.formula-footer { background: var(--color-surface); padding: 56px 40px 28px; }
.formula-footer__top { display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; margin-bottom: 32px; }
.formula-footer__brand { max-width: 340px; }
.formula-footer__logo { font-family: var(--font-heading); font-weight: 700; font-size: 18px; margin: 0 0 10px; }
.formula-footer__blurb { color: var(--color-muted); font-size: 13px; line-height: 1.6; margin: 0; }
.formula-footer__links { display: flex; gap: 22px; flex-wrap: wrap; }
.formula-footer__links a { font-size: 13px; text-decoration: none; color: var(--color-text); }
.formula-footer__copy { font-size: 12px; color: var(--color-muted); border-top: 1px solid var(--color-border); padding-top: 20px; margin: 0; }
` + FORMULA_LIBRARY_SECTIONS_CSS;

/** `FORMULA_LIBRARY_SECTIONS`'ın CSS'i sadece YENİ scaffold edilen projelerin
 * `assets/theme.css`'ine girer (`scaffoldTemplate.ts`, sadece proje oluşturma
 * anında çalışır) — o TARİHTEN ÖNCE oluşturulmuş projelerin dosyaları donmuş
 * bir kopya, `.formula-marquee` gibi sınıflar hiç tanımlı değil ("yeni
 * eklediğin section'ların css'leri çalışmıyor" — kullanıcı raporu, 2026-08-17/18).
 * `StudioShell.tsx` proje yüklenirken imza sınıfın (`.formula-marquee`) eksik
 * olup olmadığına bakıp eksikse CSS'i client-side yamıyor — sonraki kayıtta
 * kalıcı hale gelir, ayrı bir "senkronize et" adımı gerekmez. İdempotent:
 * imza sınıf zaten varsa (yeni scaffold ya da önceden yamalanmış proje)
 * hiçbir şey değişmez. */
export function patchMissingFormulaLibraryCss(files: Record<string, string>, templateId: string | null | undefined): Record<string, string> {
  if (templateId !== "formula") return files;
  const css = files["assets/theme.css"];
  if (css === undefined || css.includes(".formula-marquee")) return files;
  return { ...files, "assets/theme.css": css + FORMULA_LIBRARY_SECTIONS_CSS };
}

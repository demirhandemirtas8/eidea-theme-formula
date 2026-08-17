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
      <img src="{{ section.settings.image | img_url: '1200x' }}" alt="{{ section.settings.title | escape }}" loading="eager" />
    {% else %}
      <div class="formula-hero__placeholder" aria-hidden="true"></div>
    {% endif %}
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
    { "type": "image_picker", "id": "image", "label": "Görsel" }
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

// `--color-*`/`--font-*` sözleşmesi `minimalSections.ts`'teki ile birebir aynı
// (Tema Ayarları paneli bu adlarla eşleşiyor) — sadece varsayılan DEĞERLER ve
// section-özel sınıf kuralları Formula'ya özgü.
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
`;

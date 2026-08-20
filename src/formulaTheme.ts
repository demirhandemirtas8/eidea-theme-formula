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
function navIconSvg(kind: "search" | "account" | "cart"): string {
  const paths: Record<typeof kind, string> = {
    search: `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
    account: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>`,
    cart: `<circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6"/>`,
  };
  return `<svg class="formula-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;
}

export const FORMULA_NAV_HEADER = `<section class="formula-nav">
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
        <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
      {% endif %}
    {% endfor %}
  </nav>
  <div class="formula-nav__actions">
    {% if section.settings.quiz_label != blank %}<a href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}" class="formula-nav__quiz">{{ section.settings.quiz_label | escape }}</a>{% endif %}
    <a href="/search" aria-label="Ara">${navIconSvg("search")}</a>
    <a href="/account" aria-label="Hesabım">${navIconSvg("account")}</a>
    <a href="/cart" aria-label="Sepet" data-cart-open-mode="{{ section.settings.cart_open_mode | default: 'page' }}">${navIconSvg("cart")}</a>
  </div>
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
    }
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
export const FORMULA_NAV_HEADER_CENTERED = `<section class="formula-nav formula-nav--centered">
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
        <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
      {% endif %}
    {% endfor %}
  </nav>
  <div class="formula-nav__actions">
    {% if section.settings.quiz_label != blank %}<a href="{{ section.settings.quiz_url | default: '/pages/cilt-analizi' | escape }}" class="formula-nav__quiz">{{ section.settings.quiz_label | escape }}</a>{% endif %}
    <a href="/search" aria-label="Ara">${navIconSvg("search")}</a>
    <a href="/account" aria-label="Hesabım">${navIconSvg("account")}</a>
    <a href="/cart" aria-label="Sepet" data-cart-open-mode="{{ section.settings.cart_open_mode | default: 'page' }}">${navIconSvg("cart")}</a>
  </div>
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
    }
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

export const FORMULA_HERO = `<section class="formula-hero${revealAnimationClass()}">
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
      <img src="{{ section.settings.image | img_url: '1200x' }}" alt="{{ section.settings.title | escape }}" loading="eager" style="object-position: {{ section.settings.image_position | default: 'center' }};${imageEffectStyle("section.settings")}" />
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
    { "type": "image_picker", "id": "image", "label": "Görsel" },
    { "type": "select", "id": "image_position", "label": "Görsel Konumu (kırpma odağı)", "default": "center",
      "options": [
        { "label": "Orta", "value": "center" },
        { "label": "Üst", "value": "top" },
        { "label": "Alt", "value": "bottom" },
        { "label": "Sol", "value": "left" },
        { "label": "Sağ", "value": "right" }
      ]
    },${imageEffectSchemaFields()},${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Hero" }]
}
{% endschema %}`;

export const FORMULA_QUIZ_BANNER = `<section class="formula-quiz${revealAnimationClass()}">
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
    { "type": "url", "id": "url", "label": "Buton URL", "default": "/pages/cilt-analizi" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula Analiz Bandı" }]
}
{% endschema %}`;

export const FORMULA_BESTSELLERS = `<section class="formula-bestsellers${revealAnimationClass()}">
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
    </div>
    <nav class="formula-footer__links">
      {% for block in section.blocks %}
        {% if block.type == "menu_item" %}
          <a href="{{ block.settings.url | escape }}">{{ block.settings.label | escape }}</a>
        {% endif %}
      {% endfor %}
    </nav>
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
export const FORMULA_COLLECTION_LIST = `<section class="formula-collection-list formula-collection-list--hover-{{ section.settings.hover_effect | default: 'zoom' }}${revealAnimationClass()}">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Koleksiyonlar" | escape }}</h2>
  </div>
  <div class="formula-collection-list__grid" style="--formula-collection-cols: {{ section.settings.columns | default: 3 }}; --formula-collection-gap: {{ section.settings.gap | default: 24 }}px">
    {% for block in section.blocks %}
      {% if block.type == "collection" and block.settings.collection != blank %}
        <a class="formula-collection-card formula-collection-card--{{ section.settings.card_style | default: 'below' }}" href="{{ block.settings.collection.url | escape }}">
          <div class="formula-collection-card__media" style="border-radius: {{ section.settings.image_shape | default: 14 }}px">
            {% if block.settings.collection.image != blank %}
              <img src="{{ block.settings.collection.image | img_url: '900x' }}" alt="{{ block.settings.collection.title | escape }}" loading="lazy" />
            {% else %}
              <div class="formula-collection-card__placeholder" aria-hidden="true"></div>
            {% endif %}
            {% if section.settings.card_style == 'overlay' %}<div class="formula-collection-card__scrim" aria-hidden="true"></div>{% endif %}
          </div>
          <div class="formula-collection-card__copy">
            <p class="formula-collection-card__title">{{ block.settings.collection.title | escape }}</p>
            {% if block.settings.collection.description != blank %}<p class="formula-collection-card__sub">{{ block.settings.collection.description | escape }}</p>{% endif %}
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

export const FORMULA_FAQ = `<section class="formula-faq${revealAnimationClass()}">
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
    { "type": "text", "id": "title", "label": "Başlık", "default": "Sıkça Sorulan Sorular" },${revealAnimationSchemaField()}
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

export const FORMULA_TESTIMONIAL = `<section class="formula-testimonial${revealAnimationClass()}">
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
    <h2>{{ section.settings.title | default: "Aktif İçerikler" | escape }}</h2>
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
    <h2>{{ section.settings.title | default: "Günlük Rutin" | escape }}</h2>
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

export const FORMULA_JOURNAL_TEASER = `<section class="formula-journal${revealAnimationClass()}">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Dergi" | escape }}</h2>
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

export const FORMULA_COMPARISON_TABLE = `<section class="formula-compare${revealAnimationClass()}">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Ürünleri Karşılaştır" | escape }}</h2>
  </div>
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
</section>

{% schema %}
{
  "name": "Formula Karşılaştırma Tablosu",
  "settings": [
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
    <h2 class="formula-newsletter__title">{{ section.settings.title | default: "Bültenimize Katıl" | escape }}</h2>
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
    <h2>{{ section.settings.title | default: "Koleksiyon" | escape }}</h2>
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
    <h2>{{ section.settings.title | default: "Öncesi / Sonrası" | escape }}</h2>
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
export const FORMULA_RECENTLY_VIEWED = `<section class="formula-recently-viewed${revealAnimationClass()}">
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Son Baktıkların" | escape }}</h2>
  </div>
  <div class="formula-recently-viewed__grid" data-formula-recently-viewed data-limit="{{ section.settings.limit | default: 4 }}"></div>
</section>

{% schema %}
{
  "name": "Formula Son Bakılanlar",
  "settings": [
    { "type": "text", "id": "title", "label": "Başlık", "default": "Son Baktıkların" },
    { "type": "range", "id": "limit", "label": "Gösterilecek Ürün Sayısı", "min": 2, "max": 8, "step": 1, "default": 4 },${revealAnimationSchemaField()}
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
export const FORMULA_RELATED_PRODUCTS = `<section{% if recommendations.performed %} class="formula-related${revealAnimationClass()}"{% endif %}>
  {% if recommendations.performed %}
  <div class="formula-section-head">
    <h2>{{ section.settings.title | default: "Bunları da Beğenebilirsin" | escape }}</h2>
  </div>
  <div class="formula-related__grid">
    {% for p in recommendations.products %}
      <a class="formula-product-card" href="{{ p.url | escape }}">
        <div class="formula-product-card__media">
          {% if p.images.size > 0 %}
            <img src="{{ p.images.first | img_url: '700x' }}" alt="{{ p.title | escape }}" loading="lazy" />
          {% else %}
            <div class="formula-product-card__placeholder" aria-hidden="true"></div>
          {% endif %}
        </div>
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
    { "type": "text", "id": "title", "label": "Başlık", "default": "Bunları da Beğenebilirsin" },${revealAnimationSchemaField()}
  ],
  "presets": [{ "name": "Formula İlgili Ürünler" }]
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
@media (max-width: 700px) { .formula-faq { padding: 44px 20px; } }

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
   sürüklenir (bkz. formulaTheme.ts'in yorumu, kalıcı script YOK). */
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
.formula-ba__range::-webkit-slider-thumb { -webkit-appearance: none; width: 100%; height: 100%; }
@media (max-width: 700px) { .formula-before-after { padding: 44px 20px; } }

/* Son Bakılanlar (2026-08-20) — grid boşken JS section'ı gizler (bkz.
   cartRuntimeClient.ts), bu yüzden burada boş-durum CSS'i gerekmiyor. */
.formula-recently-viewed { padding: 64px 40px; }
.formula-recently-viewed__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
.formula-recently-viewed__card { text-decoration: none; color: var(--color-text); display: block; }
.formula-recently-viewed__media { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: var(--color-surface); margin-bottom: 10px; }
.formula-recently-viewed__media img { width: 100%; height: 100%; object-fit: cover; }
.formula-recently-viewed__placeholder { width: 100%; height: 100%; background: linear-gradient(160deg, var(--color-border), var(--color-surface)); }
.formula-recently-viewed__name { font-size: 13px; font-weight: 600; margin: 0 0 4px; }
.formula-recently-viewed__price { font-size: 12px; color: var(--color-muted); margin: 0; }
@media (max-width: 700px) { .formula-recently-viewed { padding: 44px 20px; } }

/* İlgili Ürünler (2026-08-20) — .formula-product-card/__grid deseni
   FORMULA_BESTSELLERS ile PAYLAŞILIYOR, ayrı bir kart stili gerekmedi. */
.formula-related { padding: 64px 40px; }
.formula-related__grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 24px; }
@media (max-width: 900px) { .formula-related__grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .formula-related { padding: 44px 20px; } }

/* 404 (2026-08-19) */
.formula-404 { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 96px 24px; min-height: 50vh; }
.formula-404__code { font-family: var(--font-heading); font-size: clamp(64px, 12vw, 140px); font-weight: 700; line-height: 1; margin: 0; color: var(--color-border); letter-spacing: -0.03em; }
.formula-404__title { font-family: var(--font-heading); font-size: clamp(22px, 2.6vw, 32px); margin: 12px 0 8px; }
.formula-404__sub { color: var(--color-muted); max-width: 42ch; margin: 0 0 32px; line-height: 1.6; }
.formula-404__actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

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
.formula-nav__logo { font-family: var(--font-heading); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; text-decoration: none; color: var(--color-secondary); }
.formula-nav__links { display: flex; gap: 26px; }
.formula-nav__links a { font-size: 13px; text-decoration: none; color: var(--color-text); text-transform: uppercase; letter-spacing: 0.04em; }
.formula-nav__actions { display: flex; align-items: center; gap: 16px; font-size: 13px; }
/* 2026-08-19 — GERÇEK bug: position:relative kullanıcı raporuyla
   ("sepet rozeti ikondan uzak/kötü konumlanmış") bulundu — sepet sayacı
   apps/renderer/src/cartRuntimeClient.ts'in enjekte ettiği position:
   absolute bir span, hiçbir üst öğede position:relative OLMADIĞI
   için en yakın konumlanmış atayı (varsa) ya da viewport'un kendisini
   referans alıp ikondan kopuk duruyordu. */
.formula-nav__actions a { text-decoration: none; color: var(--color-text); display: flex; align-items: center; position: relative; }
.formula-nav__actions a:hover { color: var(--color-primary); }
.formula-nav__icon { width: 19px; height: 19px; display: block; }
.formula-nav__quiz { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 7px 14px; color: var(--color-primary) !important; font-weight: 500; }
@media (max-width: 767.98px) { .formula-nav__links { display: none; } .formula-nav { padding: 14px 20px; } }
/* "Ortalı Logo" tasarım varyantı (2026-08-19) — logo üstte ortalı, altında
   linkler, aksiyonlar (ara/hesap/sepet) sağ üst köşede mutlak konumlanır. */
.formula-nav--centered { flex-direction: column; justify-content: center; text-align: center; position: relative; padding-top: 16px; padding-bottom: 14px; }
.formula-nav--centered .formula-nav__actions { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); }
@media (max-width: 767.98px) { .formula-nav--centered .formula-nav__actions { position: static; transform: none; justify-content: center; margin-top: 2px; } }

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
.formula-footer { background: var(--color-surface); padding: 56px 40px 28px; margin-top: auto; }
.formula-footer__top { display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; margin-bottom: 32px; }
.formula-footer__brand { max-width: 340px; }
.formula-footer__logo { font-family: var(--font-heading); font-weight: 700; font-size: 18px; margin: 0 0 10px; }
.formula-footer__blurb { color: var(--color-muted); font-size: 13px; line-height: 1.6; margin: 0; }
.formula-footer__links { display: flex; gap: 22px; flex-wrap: wrap; }
.formula-footer__links a { font-size: 13px; text-decoration: none; color: var(--color-text); }
.formula-footer__copy { font-size: 12px; color: var(--color-muted); border-top: 1px solid var(--color-border); padding-top: 20px; margin: 0; }
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

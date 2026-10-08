# @eidea/theme-formula

Eidea Studio'nun "Formula" teması — platformun en olgun ve en kapsamlı
temalarından biri. **Bu repo açık kaynak ve public** — amacı EI şablon
dilini (Shopify Liquid'e çok benzer bir sözdizimi) öğrenmek isteyen
geliştiriciler için gerçek, çalışan bir referans olmak.

> Not: bu, Eidea'nın ücretli/kapalı kaynak diğer temalarının (Aura,
> Basalt, Foundry, ...) aksine, bilinçli olarak public bırakılmış bir
> öğrenme kaynağıdır — Shopify'ın `Dawn` temasının buradaki karşılığı.

> **GitHub dil etiketi hakkında**: GitHub bu repoyu "TypeScript" olarak
> gösterir — bu TEKNİK OLARAK doğru (dosyalar gerçekten `.ts`, import/
> export/fonksiyon tanımları içerir), ama asıl öğretici içerik (section
> markup'ı, `{% schema %}` blokları) bu dosyaların İÇİNDEKİ büyük template
> literal string'lerde EI/Liquid-benzeri sözdizimiyle yazılı. GitHub'ın
> Linguist aracı "EI"yi tanımadığı için (henüz kayıtlı bir dil değil) bu
> etiketi değiştiremiyoruz — okurken bunu bilerek yaklaşın: TypeScript
> kısmı sadece "hangi string'i hangi fonksiyon hangi koşulda üretiyor"
> mantığı, asıl aradığınız EI sözdizimi string'lerin İÇİNDE.

## EI dilini bu repodan öğrenmek

Her section şablonu üç şeyi birlikte tanımlar: HTML/Liquid-benzeri
markup, inline CSS, ve bir `{% schema %}` JSON bloğu (hangi ayarların
Studio panelinde düzenlenebilir olduğunu tanımlar). Örnek desenler için:

- **Settings-driven içerik**: hiçbir section'da sabit (hardcoded) metin/
  renk yok — hepsi `{{ section.settings.xxx | default: "..." }}` ile
  okunur. `src/formulaTheme.ts` içinde `section.settings.` için grep
  yapın, 240+ kullanım göreceksiniz.
- **`{% render %}` ile paylaşılan snippet** (Shopify'daki `{% render %}`
  tag'inin karşılığı) — `src/formulaTheme.ts:157`'deki
  `FORMULA_PRODUCT_CARD_SNIPPET`'e bakın: ürün kartı markup'ı TEK yerde
  tanımlı, `src/formulaTheme.ts:968` ve `:2879`'da
  `{% render 'product-card', url: ..., image: ... %}` ile birden fazla
  section'dan çağrılıyor — kopyala-yapıştır değil.
- **Block (tekrarlanan alt-öğe) deseni**: `{% for block in section.blocks %}`
  ile section içindeki block'lar (örn. bir karusel'in her slaytı) döner.
- **Schema → ayar paneli eşlemesi**: her `{% schema %}` bloğundaki
  `"settings"` dizisi, Studio'da o section seçildiğinde sağ panelde
  OTOMATİK olarak render edilen ayar formunu üretir — yeni bir alan
  eklemek için sadece şemaya bir satır eklemeniz, panel kodunu
  DEĞİŞTİRMENİZ gerekmez.

## Yapı

- `src/formulaTheme.ts` — 48 section şablonu + tema CSS'i + kütüphane
- `src/formulaPages.ts` — sayfa iskeleti (hangi section hangi sayfada) +
  eski projeleri güncel tutan patch fonksiyonları
- `src/formulaDesigns.ts` — "Tasarım Değiştir" kataloğu (bir section'ın
  alternatif düzen varyantları)

## Bağımlılıklar

Bu repo [eidea-studio](https://github.com/demirhandemirtas8/eidea-studio)
monorepo'suna `packages/themes/formula` altında bir git submodule olarak
bağlanır ve `@eidea/theme-kit` (paylaşılan platform altyapısı: evrensel
sayfalar, boşluk/gizleme ayarları) ile `@eidea/ei-engine` (şablonu
gerçekten render eden motor) paketlerine bağımlıdır — ikisi de ana
repo'da yaşar, bu yüzden bu repo TEK BAŞINA derlenemez/çalıştırılamaz,
sadece okuma/öğrenme amaçlıdır.

## Geçmiş

Bu repo `git filter-repo` ile eidea-studio monorepo'sundaki Formula'ya
özgü commit geçmişinden çıkarıldı — gerçek bir repo, snapshot değil.

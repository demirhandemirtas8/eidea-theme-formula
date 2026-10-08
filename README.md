# @eidea/theme-formula

Eidea Studio'nun "Formula" temasının kendi paketi — platformun en eski ve
en kapsamlı teması.

Bu repo [eidea-studio](https://github.com/demirhandemirtas8/eidea-studio)
monorepo'suna `packages/themes/formula` altında bir **git submodule**
olarak bağlanır. Bağımsız geliştirilemez — `@eidea/theme-kit` (paylaşılan
platform altyapısı) ve `@eidea/ei-engine` (şablon motoru) paketlerine
bağımlıdır, her ikisi de ana repo'da yaşar.

## Yapı

- `src/formulaTheme.ts` — section şablonları + tema CSS'i + kütüphane
- `src/formulaPages.ts` — sayfa iskeleti + patch fonksiyonları
- `src/formulaDesigns.ts` — "Tasarım Değiştir" kataloğu

## Geçmiş

Bu repo `git filter-repo` ile eidea-studio monorepo'sundaki Formula'ya
özgü commit geçmişinden çıkarıldı — gerçek bir repo, snapshot değil.

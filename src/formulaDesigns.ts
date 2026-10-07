/**
 * formulaDesigns.ts
 * 2026-10-07 — tema-repo ayrıştırması: eski `theme-scaffold/src/sectionDesigns.ts`
 * içindeki `FORMULA_SECTION_DESIGNS` kataloğu buraya taşındı (Aura'nın
 * auraDesigns.ts ile BİREBİR aynı desen — registry'ye/`getTheme`'e bağımlı
 * jenerik dispatcher'dan AYRILARAK, döngüsel paket bağımlılığı olmaması
 * için `formulaPages.ts` artık `getSectionDesigns()` DEĞİL, doğrudan
 * `FORMULA_SECTION_DESIGNS`'ı kullanıyor — templateId zaten her zaman
 * "formula").
 *
 * 2026-08-19 — kullanıcı raporu: "klasik sol logo ve orta logo düzgünç
 * çalışmıyor görüntü bozuluyor". Jenerik `SECTION_DESIGNS`'in kataloğu
 * `class="nav-header"` + inline style kullanıyor, Formula'nın GERÇEK CSS
 * sözleşmesiyle (`.formula-nav`) hiç eşleşmiyordu — Formula'da "Ortalı Logo"
 * seçmek section'ı tamamen stilsiz bırakıyordu. Formula projelerinde
 * bunun YERİNE bu Formula-özgü katalog sunuluyor.
 *
 * Footer için ise kullanıcı AÇIKÇA "tasarım değiştir kısmı alakasız" dedi —
 * boş dizi dönmek "Tasarım Değiştir" bölümünü TAMAMEN gizler. Formula
 * footer'ı zaten kendi `show_logo` aç/kapat ayarına sahip — ayrı bir
 * "tasarım" seçimine gerek yok.
 */
import { SECTION_DESIGNS, type SectionDesignOption } from "@eidea/theme-kit";
import { FORMULA_NAV_HEADER, FORMULA_NAV_HEADER_CENTERED } from "./formulaTheme.js";

export const FORMULA_SECTION_DESIGNS: Record<string, SectionDesignOption[]> = {
  "nav-header": [
    { id: "classic", name: "Klasik — Sol Logo", content: FORMULA_NAV_HEADER },
    { id: "centered", name: "Ortalı Logo", content: FORMULA_NAV_HEADER_CENTERED },
  ],
  "footer-menu": [],
  // main-search inline style ile yazıldı (Formula'nın .formula-nav gibi bir
  // CSS sözleşmesine bağımlı değil) — nav-header'ın aksine Formula-özgü bir
  // yeniden yazıma gerek yok, jenerik kataloğun AYNI 3 varyantı burada da geçerli.
  "main-search": SECTION_DESIGNS["main-search"],
  "main-collection": SECTION_DESIGNS["main-collection"],
  "main-brand": SECTION_DESIGNS["main-brand"],
};

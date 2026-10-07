/**
 * @eidea/theme-formula — Formula temasının kendi paketi.
 * 2026-10-07 — Aura ile BİREBİR aynı migrasyon deseni, son tema (formula
 * en eski/en büyük olduğu için en son yapıldı — bkz. WORKLOG'un bu
 * tarihli notu).
 */
export * from "./formulaTheme.js";
export { FORMULA_SECTION_DESIGNS } from "./formulaDesigns.js";
export {
  buildFormulaPages,
  formulaSectionFiles,
  patchStaleFormulaSectionContent,
  patchMissingFormula404Page,
  patchMissingFormulaCheckoutSuccessPage,
  patchStaleAccountPages,
  patchMissingFavoritesTab,
} from "./formulaPages.js";

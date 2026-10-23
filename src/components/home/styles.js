// The public pages' few shared styles, defined once: plain white sections and light grey bands, navy headings
// and solid navy buttons (the logo's navy; no blue), small corners, thin borders instead of shadows.

export const CONTAINER = "mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10";
/** A light grey band that separates one section from the next. */
export const BAND = "border-y border-slate-200 bg-slate-50";
export const SECTION_SPACING = "py-16 lg:py-20";

export const EYEBROW = "text-sm font-semibold text-slate-500";
/** The title of a page of its own (School needs, How it works, …). */
export const PAGE_TITLE = "font-heading text-[1.75rem] font-bold tracking-tight text-brand-navy sm:text-[2rem]";
export const H2 = "font-heading text-2xl font-bold tracking-tight text-brand-navy sm:text-[1.75rem]";
export const LEAD = "mt-3 max-w-2xl text-base leading-7 text-slate-600";

export const BUTTON_PRIMARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-navy px-5 text-[15px] font-semibold text-white transition-colors hover:bg-slate-800";
export const BUTTON_SECONDARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-[15px] font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50";
import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CONTAINER, EYEBROW } from "./styles";

// The photo: a typical government school in Karnataka, shown for illustration only (it is not a school on
// VIDYADAAN). Cropped to the building (no flag-post statue). Licence CC BY 3.0: credited on the photo.
const PHOTO = "/images/home/karnataka-government-school-wide";
const PHOTO_CREDIT = {
  author: "Vaikoovery",
  source: "https://commons.wikimedia.org/wiki/File:Dakshina-Kannada-Jilla-Parishath-Kiriya-Prathamika-Shalai-Pavoor-Uliya-Mangalore.jpg",
  licence: "CC BY 3.0",
  licenceUrl: "https://creativecommons.org/licenses/by/3.0/",
};
const CREDIT_LINK = "underline underline-offset-2";

// The whole process in three short steps (the How it works page has the details).
const STEPS = ["A school posts a need", "Our team reviews it", "NGOs and donors fund it"];

/**
 * The first screen: a real government school across the full width, with a white card over its corner that says
 * what VIDYADAAN does (two lines) and where to go next; then the process in three steps.
 * `start` is "Get started", or "Go to your dashboard" when someone is signed in.
 */
const HomeHero = ({ start }) => (
  <section aria-labelledby="hero-heading" className="border-b border-slate-200 bg-white">
    <div className="relative">
      <img
        src={`${PHOTO}-1920.jpg`}
        srcSet={`${PHOTO}-960.jpg 960w, ${PHOTO}-1920.jpg 1920w`}
        sizes="100vw"
        width="1920"
        height="960"
        alt="A government school in Dakshina Kannada, Karnataka: a single-storey building with a tiled roof, a verandah and pillars painted in the national colours"
        fetchPriority="high"
        decoding="async"
        className="block h-[17rem] w-full object-cover object-[50%_45%] sm:h-[24rem] lg:h-[34rem]"
      />
      {/* The credit (the licence asks for it): on the photo from tablets up; under the card on phones. */}
      <p className="on-dark absolute right-3 top-3 hidden max-w-[calc(100%-1.5rem)] rounded-md bg-slate-900/65 px-2.5 py-1 text-[11px] leading-4 text-white sm:block lg:bottom-3 lg:top-auto">
        A government school in Pavoor Uliya, Mangaluru, shown for illustration. Photo:{" "}
        <a href={PHOTO_CREDIT.source} target="_blank" rel="noreferrer" className={CREDIT_LINK}>{PHOTO_CREDIT.author}</a>,{" "}
        <a href={PHOTO_CREDIT.licenceUrl} target="_blank" rel="noreferrer" className={CREDIT_LINK}>{PHOTO_CREDIT.licence}</a>, cropped.
      </p>

      {/* The card: over the photo's lower-left corner, hanging a little below it on laptops and larger screens. */}
      <div className={`${CONTAINER} relative -mt-16 sm:-mt-24 lg:absolute lg:inset-x-0 lg:-bottom-16 lg:mt-0`}>
        <div className="max-w-[38rem] rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
          <p className={EYEBROW}>For government schools in India</p>
          <h1 id="hero-heading" className="mt-3 text-balance font-heading text-[2rem] font-bold leading-[1.12] tracking-tight text-brand-navy sm:text-[2.375rem]">
            Help government schools build what students need.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-[17px]">
            Schools post their needs. Our team reviews each one before NGOs, donors and former students can help.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/needs" className={BUTTON_PRIMARY}>
              Explore school needs <LuArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to={start.to} className={BUTTON_SECONDARY}>{start.label}</Link>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500 sm:hidden">
          Photo: a government school in Pavoor Uliya, Mangaluru, shown for illustration.{" "}
          <a href={PHOTO_CREDIT.source} target="_blank" rel="noreferrer" className={CREDIT_LINK}>{PHOTO_CREDIT.author}</a>,{" "}
          <a href={PHOTO_CREDIT.licenceUrl} target="_blank" rel="noreferrer" className={CREDIT_LINK}>{PHOTO_CREDIT.licence}</a>, cropped.
        </p>
      </div>
    </div>

    <div className="mt-10 border-t border-slate-200 lg:mt-24">
      <div className={`${CONTAINER} flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between`}>
        <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8" aria-label="How VIDYADAAN works">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-brand-navy">{i + 1}</span>
              <span className="text-[15px] font-semibold text-brand-navy">{step}</span>
            </li>
          ))}
        </ol>
        <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy underline underline-offset-2 hover:decoration-2">
          See how it works <LuArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
);

export default HomeHero;

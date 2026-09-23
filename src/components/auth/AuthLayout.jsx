import { Link } from "react-router-dom";
import VidyadaanLogo from "../ui/VidyadaanLogo";

/**
 * Two-column sign-in layout: brand photo panel (≥1024px) + form column.
 * The photo stays because it carries the product's identity; the overlay uses the brand navy.
 */
const AuthLayout = ({ image, quote, children }) => (
  <div className="min-h-screen flex bg-white">
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-navy">
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/40 to-brand-ink/10" aria-hidden="true" />
      <div className="relative flex flex-col justify-between w-full p-10">
        <Link to="/" className="self-start">
          <VidyadaanLogo variant="light" showTagline={false} />
        </Link>
        {quote && (
          <figure className="max-w-md">
            <blockquote className="text-xl font-medium leading-snug text-white">“{quote}”</blockquote>
            <figcaption className="mt-3 text-sm text-slate-300">VIDYADAAN Platform</figcaption>
          </figure>
        )}
      </div>
    </div>

    <main className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-10">
      <div className="w-full max-w-sm mx-auto">
        <Link to="/" className="inline-flex mb-10 lg:hidden">
          <VidyadaanLogo variant="dark" showTagline={false} />
        </Link>
        {children}
      </div>
    </main>
  </div>
);

export default AuthLayout;

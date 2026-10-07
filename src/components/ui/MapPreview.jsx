import { LuExternalLink } from "react-icons/lu";
import { formatCoordinates, googleMapsEmbedUrl, googleMapsUrl } from "../../../shared/mapLocationRules.js";

/** A small Google map with a pin on `point` ({ lat, lng }). Google's own embed: no API key. */
const MapPreview = ({ point, title, className = "h-64" }) => (
  <iframe
    title={title}
    src={googleMapsEmbedUrl(point)}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    className={`block w-full border-0 bg-slate-100 ${className}`}
  />
);

/** The point's coordinates as a link that opens it in Google Maps (a new tab). */
export const MapLink = ({ point, children }) => (
  <a
    href={googleMapsUrl(point)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 font-medium text-primary-700 hover:underline"
  >
    {children || formatCoordinates(point)}
    <LuExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <span className="sr-only">(opens Google Maps in a new tab)</span>
  </a>
);

export default MapPreview;

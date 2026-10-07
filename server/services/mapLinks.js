// Turns a Google Maps link into coordinates (shared/mapLocationRules.js reads full links). A short share
// link (maps.app.goo.gl/…) carries no coordinates: it is a redirect, so the server asks it where it
// leads, without following it, and reads the coordinates from that address.
//
// Safety: the only addresses ever requested are Google's short-link hosts, over HTTPS. Where a link
// leads is only read, never requested, and anything that isn't Google Maps is refused. No Google API
// key, no page scraping.
import { NO_COORDINATES, SHORT_MAP_LINK_HOSTS, isGoogleMapsHost, readMapLink } from "../../shared/mapLocationRules.js";

const MAX_REDIRECTS = 5;
const COULD_NOT_OPEN = "We couldn't open this link. Check that it's a Google Maps share link, or try again in a moment.";
const NOT_TO_GOOGLE_MAPS = "This link doesn't lead to Google Maps. Open your school in Google Maps, tap Share, copy the link and paste it here.";

/** A link that can't give a location; the message is safe to show. `status`: 400 bad link, 502 couldn't reach Google. */
export class MapLinkError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const realFetch = (url, init) => fetch(url, init);
let send = realFetch;

/** Tests replace the request to Google's short-link service: fn(url, init) must resolve to a Response. */
export const setMapLinkFetch = (fn) => {
    send = fn || realFetch;
};

/** Where a short link points (its redirect), without going there. */
const nextHop = async (href) => {
    let response;
    try {
        response = await send(href, { method: "GET", redirect: "manual", headers: { Accept: "text/html" }, signal: AbortSignal.timeout(8_000) });
    } catch {
        throw new MapLinkError(COULD_NOT_OPEN, 502);
    }
    await response.body?.cancel().catch(() => {});
    const location = response.status >= 300 && response.status < 400 ? response.headers.get("location") : null;
    if (!location) throw new MapLinkError(COULD_NOT_OPEN, response.status >= 500 ? 502 : 400);
    try {
        return new URL(location, href);
    } catch {
        throw new MapLinkError(NOT_TO_GOOGLE_MAPS);
    }
};

/**
 * The coordinates for what a school pasted: a full Google Maps link, a short share link, or "lat, lng".
 * @returns {Promise<{ lat: number, lng: number }>} checked to be a real point in India
 * @throws {MapLinkError}
 */
export const resolveMapLink = async (input) => {
    const read = readMapLink(input);
    if (read.error) throw new MapLinkError(read.error);
    if (read.value) return read.value;

    let current = read.shortLink;
    for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
        let next = await nextHop(current);
        // Some regions see Google's cookie-consent page first; the real address is its "continue" parameter.
        if (next.hostname === "consent.google.com" && next.searchParams.get("continue")) {
            try {
                next = new URL(next.searchParams.get("continue"));
            } catch {
                throw new MapLinkError(NOT_TO_GOOGLE_MAPS);
            }
        }
        if (next.protocol !== "https:" && next.protocol !== "http:") throw new MapLinkError(NOT_TO_GOOGLE_MAPS);
        const host = next.hostname.toLowerCase();

        if (SHORT_MAP_LINK_HOSTS.includes(host) && !next.username && !next.password && !next.port) {
            current = `https://${host}${next.pathname}${next.search}`;
            continue;
        }
        if (isGoogleMapsHost(host)) {
            const found = readMapLink(next.href);
            if (found.value) return found.value;
            throw new MapLinkError(found.error || NO_COORDINATES);
        }
        throw new MapLinkError(NOT_TO_GOOGLE_MAPS);
    }
    throw new MapLinkError(COULD_NOT_OPEN);
};

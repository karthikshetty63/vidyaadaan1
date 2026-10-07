// VIDYADAAN — rules for a school's location on the map. Imported by BOTH the React form (instant feedback)
// and the Express API (the authoritative check). Keep it free of browser- and Node-only APIs.
//
// A school sets its location in one of two ways, with no Google API key involved:
//   LINK    it pastes a Google Maps link to the school; the coordinates are read from the link.
//           Short share links (maps.app.goo.gl/…) carry no coordinates, so the server opens them
//           first to see the full Google Maps address they lead to (services/mapLinks.js).
//   DEVICE  it taps "Use my current location" while at the school; the browser's location is used.
// Only the coordinates are stored (never the link). Only the school and VIDYADAAN admins see them.

export const MAP_LOCATION_SOURCES = ["LINK", "DEVICE"];
export const MAP_LINK_MAX = 2000;
// "Use my current location" must be at least this precise (metres). A computer without GPS often
// only knows the town, which would put the school in the wrong place.
export const DEVICE_ACCURACY_MAX_METRES = 1000;

// India with a small margin, islands included. A point outside it is a wrong link or swapped numbers.
const INDIA = { minLat: 6, maxLat: 37.6, minLng: 68, maxLng: 97.6 };

// Short share links, opened by the server to find the full link they lead to.
export const SHORT_MAP_LINK_HOSTS = ["maps.app.goo.gl", "goo.gl"];
// Full Google Maps links: google.com or google.co.in, optionally with www. or maps. in front.
export const isGoogleMapsHost = (host) => /^(?:www\.|maps\.)?google\.(?:com|co\.in)$/i.test(host);

const NOT_A_LINK = "Paste a link from Google Maps. It starts with https://";
const NOT_GOOGLE_MAPS = "This isn't a Google Maps link. Open your school in Google Maps, tap Share, copy the link and paste it here.";
export const NO_COORDINATES =
  "This link doesn't include the map position. In Google Maps, press and hold on your school to drop a pin, then share that pin's link. Or use your current location while you are at the school.";
const OUTSIDE_INDIA = "This location is outside India. Check that the link or pin is for your school.";

/** Six decimal places: about 11 cm, far finer than any map pin. */
const round = (n) => Math.round(n * 1e6) / 1e6;

/** A point on the map: real numbers, in range, inside India. → { value: { lat, lng } } | { error } */
export const checkCoordinates = (lat, lng) => {
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "The location must be a latitude and a longitude." };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { error: "These aren't valid map coordinates." };
  if (lat < INDIA.minLat || lat > INDIA.maxLat || lng < INDIA.minLng || lng > INDIA.maxLng) return { error: OUTSIDE_INDIA };
  return { value: { lat: round(lat), lng: round(lng) } };
};

// "12.9716, 77.5946" (also "12.9716,+77.5946" as Google writes it in links).
const PAIR = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*\+?\s*(-?\d{1,3}(?:\.\d+)?)/;
const pairFrom = (text) => {
  const m = PAIR.exec(text || "");
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null;
};
const decode = (s) => {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
};

/**
 * The coordinates written in a full Google Maps URL, most exact first: the place's own pin (!3d…!4d…),
 * a q/query/ll parameter, a /search/ or /place/ path of coordinates, then the map's centre (@lat,lng).
 * @param {URL} url
 */
const coordinatesInUrl = (url) => {
  const full = decode(url.pathname + url.search + url.hash);
  const pin = /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/.exec(full);
  if (pin) return { lat: Number(pin[1]), lng: Number(pin[2]) };
  for (const name of ["q", "query", "ll", "center", "destination", "daddr"]) {
    const value = url.searchParams.get(name);
    const pair = value && pairFrom(value.replace(/^loc:/i, ""));
    if (pair) return pair;
  }
  const inPath = /\/maps\/(?:search|place|dir)\/([^/@]+)/.exec(decode(url.pathname));
  const pathPair = inPath && pairFrom(inPath[1]);
  if (pathPair) return pathPair;
  const centre = /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/.exec(full);
  if (centre) return { lat: Number(centre[1]), lng: Number(centre[2]) };
  return null;
};

/**
 * Read a school's location from what it pasted: a Google Maps link, or plain "lat, lng".
 * @returns {{ value: { lat: number, lng: number } } | { shortLink: string } | { error: string }}
 *   shortLink: a maps.app.goo.gl / goo.gl/maps link the server must open first.
 */
export const readMapLink = (input) => {
  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return { error: "Paste a Google Maps link." };
  if (text.length > MAP_LINK_MAX) return { error: "This link is too long." };

  const plain = /^(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{2,3}\.\d{3,})$/.exec(text);
  if (plain) return checkCoordinates(Number(plain[1]), Number(plain[2]));

  let url;
  try {
    url = new URL(text);
  } catch {
    return { error: NOT_A_LINK };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { error: NOT_A_LINK };
  if (url.username || url.password || url.port) return { error: NOT_GOOGLE_MAPS };
  const host = url.hostname.toLowerCase();

  if (host === "maps.app.goo.gl" || (host === "goo.gl" && url.pathname.startsWith("/maps/"))) {
    return { shortLink: `https://${host}${url.pathname}` };
  }
  if (!isGoogleMapsHost(host) || (!host.startsWith("maps.") && !url.pathname.startsWith("/maps"))) return { error: NOT_GOOGLE_MAPS };

  const found = coordinatesInUrl(url);
  return found ? checkCoordinates(found.lat, found.lng) : { error: NO_COORDINATES };
};

/** "13.340912, 74.742146" */
export const formatCoordinates = ({ lat, lng }) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

/** "Open in Google Maps": Google's documented Maps URL for a point. Needs no API key. */
export const googleMapsUrl = ({ lat, lng }) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

/** A small Google map centred on the point, for an <iframe>. Needs no API key. */
export const googleMapsEmbedUrl = ({ lat, lng }) => `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

/** Keys a browser may send when saving (mass-assignment protection). */
export const MAP_LOCATION_FIELDS = { LINK: ["source", "link"], DEVICE: ["source", "lat", "lng", "accuracy"] };

/**
 * Check a device location: the coordinates the browser reported, and how precise they are.
 * @returns {{ value: { lat, lng, accuracy } } | { error }}
 */
export const checkDeviceLocation = ({ lat, lng, accuracy }) => {
  if (typeof accuracy !== "number" || !Number.isFinite(accuracy) || accuracy < 0) return { error: "The location's accuracy is missing." };
  if (accuracy > DEVICE_ACCURACY_MAX_METRES) {
    const km = accuracy >= 2000 ? `${Math.round(accuracy / 1000)} km` : `${Math.round(accuracy)} m`;
    return {
      error: `Your device could only find your location to within about ${km}, which isn't exact enough. Use a phone with location turned on at the school, or paste a Google Maps link instead.`,
    };
  }
  const checked = checkCoordinates(lat, lng);
  return checked.error ? checked : { value: { ...checked.value, accuracy: Math.round(accuracy) } };
};

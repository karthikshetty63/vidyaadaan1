import { useState } from "react";
import { LuLocateFixed, LuMapPin, LuSearch } from "react-icons/lu";
import { resolveMapLink, saveMapLocation } from "../../../api/profile";
import { checkDeviceLocation, formatCoordinates, readMapLink } from "../../../../shared/mapLocationRules.js";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import FormField, { Input } from "../../ui/FormField";
import MapPreview, { MapLink } from "../../ui/MapPreview";
import Modal from "../../ui/Modal";
import SegmentedControl from "../../ui/SegmentedControl";

const MODES = [
  { value: "LINK", label: "Google Maps link" },
  { value: "DEVICE", label: "My current location" },
];

const LOCATION_ERRORS = {
  1: "Location permission was turned off for this site. Allow it in your browser's site settings and try again, or paste a Google Maps link instead.",
  2: "Your device couldn't find its location. Turn on location (GPS) and try again, or paste a Google Maps link instead.",
  3: "Finding your location took too long. Try again outdoors or near a window, or paste a Google Maps link instead.",
};

/** The browser's position, as precise as the device can give it. Asks the person for permission. */
const currentPosition = () =>
  new Promise((resolve, reject) => {
    if (!window.isSecureContext || !navigator.geolocation) {
      reject(new Error("This browser can't share its location here. Paste a Google Maps link instead."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (err) => reject(new Error(LOCATION_ERRORS[err.code] || LOCATION_ERRORS[2])), {
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 0,
    });
  });

/**
 * Set (or change) where the school is on the map: paste a Google Maps link, or use the device's location
 * while at the school. The pin is shown on a map before anything is saved; the server checks it again.
 */
const MapLocationModal = ({ hasLocation, onClose, onSaved }) => {
  const [mode, setMode] = useState("LINK");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  // What would be saved: { source, point: { lat, lng }, accuracy? }. Shown on the map before saving.
  const [candidate, setCandidate] = useState(null);
  const [deviceError, setDeviceError] = useState("");
  const [busy, setBusy] = useState(""); // "find" | "locate" | "save" | ""
  const [error, setError] = useState("");

  const switchMode = (next) => {
    setMode(next);
    setCandidate(null);
    setError("");
  };

  const findLink = async (event) => {
    event.preventDefault();
    if (busy) return;
    setCandidate(null);
    setError("");
    const read = readMapLink(link);
    if (read.error) return setLinkError(read.error);
    setLinkError("");
    // A full link is read here; a short share link (maps.app.goo.gl) is opened by the server.
    if (read.value) return setCandidate({ source: "LINK", point: read.value });
    setBusy("find");
    try {
      const res = await resolveMapLink(link);
      setCandidate({ source: "LINK", point: res.location });
    } catch (findError) {
      setLinkError(findError.errors?.link || findError.message);
    } finally {
      setBusy("");
    }
    return undefined;
  };

  const locate = async () => {
    if (busy) return;
    setBusy("locate");
    setCandidate(null);
    setDeviceError("");
    setError("");
    try {
      const { coords } = await currentPosition();
      const checked = checkDeviceLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
      if (checked.error) setDeviceError(checked.error);
      else setCandidate({ source: "DEVICE", point: { lat: checked.value.lat, lng: checked.value.lng }, accuracy: checked.value.accuracy });
    } catch (locateError) {
      setDeviceError(locateError.message);
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    if (!candidate || busy) return;
    setBusy("save");
    setError("");
    try {
      const body =
        candidate.source === "LINK" ? { source: "LINK", link } : { source: "DEVICE", lat: candidate.point.lat, lng: candidate.point.lng, accuracy: candidate.accuracy };
      const res = await saveMapLocation(body);
      onSaved(res.mapLocation, res.message);
      onClose();
    } catch (saveError) {
      setError(saveError.errors?.link || saveError.errors?.location || saveError.message);
      setBusy("");
    }
  };

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      size="lg"
      icon={LuMapPin}
      title={hasLocation ? "Change your school's location" : "Add your school's location"}
      description="Only your school and the VIDYADAAN team can see it."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={Boolean(busy)}>Cancel</Button>
          <Button onClick={save} disabled={!candidate || Boolean(busy)} loading={busy === "save"}>{busy === "save" ? "Saving…" : "Save location"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <SegmentedControl label="How to set the location" options={MODES} value={mode} onChange={switchMode} />

        {mode === "LINK" ? (
          <form onSubmit={findLink} noValidate className="space-y-3">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
              <li>Open Google Maps and find your school, or press and hold on it to drop a pin.</li>
              <li>Tap <span className="font-medium text-slate-900">Share</span>, then <span className="font-medium text-slate-900">Copy link</span>.</li>
              <li>Paste the link here.</li>
            </ol>
            <FormField label="Google Maps link" error={linkError}>
              {(f) => (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    {...f}
                    data-autofocus
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    maxLength={2000}
                    placeholder="https://maps.app.goo.gl/…"
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      setCandidate(null);
                      setLinkError("");
                    }}
                    className="min-w-0 flex-1"
                  />
                  <Button type="submit" variant="secondary" icon={LuSearch} loading={busy === "find"} disabled={!link.trim() || Boolean(busy)}>
                    {busy === "find" ? "Finding…" : "Find on map"}
                  </Button>
                </div>
              )}
            </FormField>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Do this while you are <span className="font-medium text-slate-900">at the school</span>, ideally on a phone with location turned on. Your browser will ask for permission. The location is read once, only when you tap the button.
            </p>
            <Button variant="secondary" icon={LuLocateFixed} onClick={locate} loading={busy === "locate"} disabled={Boolean(busy)}>
              {busy === "locate" ? "Finding your location…" : "Use my current location"}
            </Button>
            {deviceError && <Alert tone="warning">{deviceError}</Alert>}
          </div>
        )}

        {candidate && (
          <section aria-label="Location preview" className="overflow-hidden rounded-xl border border-surface-line">
            <MapPreview point={candidate.point} title="Preview of the location on Google Maps" className="h-56 sm:h-64" />
            <div className="flex flex-wrap items-center justify-between gap-2 bg-surface px-4 py-3 text-sm">
              <p className="text-slate-700">
                <span className="font-medium tabular-nums text-slate-900">{formatCoordinates(candidate.point)}</span>
                {candidate.source === "DEVICE" && <span className="text-slate-500"> · accurate to about {candidate.accuracy} m</span>}
              </p>
              <MapLink point={candidate.point}>Check in Google Maps</MapLink>
            </div>
            <p className="border-t border-surface-divider bg-surface px-4 py-2.5 text-xs text-slate-500">Is the pin on your school? If so, save it. If not, try another link or pin.</p>
          </section>
        )}

        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </Modal>
  );
};

export default MapLocationModal;

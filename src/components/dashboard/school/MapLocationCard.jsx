import { useState } from "react";
import { LuMapPin, LuPencil, LuTrash2 } from "react-icons/lu";
import { removeMapLocation } from "../../../api/profile";
import { formatCoordinates } from "../../../../shared/mapLocationRules.js";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import Card, { CardHeader } from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import MapPreview, { MapLink } from "../../ui/MapPreview";
import MapLocationModal from "./MapLocationModal";

const formatWhen = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * The school's location on the map (School Profile). `mapLocation` comes from GET /api/profile/me:
 * { lat, lng, source: "LINK" | "DEVICE", accuracy, setAt } or null. Only the school and admins see it.
 */
const MapLocationCard = ({ mapLocation, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [status, setStatus] = useState({ tone: "", text: "" });

  const remove = async () => {
    if (removing) return;
    setRemoving(true);
    setStatus({ tone: "", text: "" });
    try {
      const res = await removeMapLocation();
      onChange(null);
      setStatus({ tone: "success", text: res.message });
    } catch (removeError) {
      setStatus({ tone: "danger", text: removeError.message || "Couldn't remove the location. Please try again." });
    } finally {
      setRemoving(false);
    }
  };

  const open = () => {
    setStatus({ tone: "", text: "" });
    setEditing(true);
  };

  return (
    <Card>
      <CardHeader
        title="Location on map"
        description="Where your school is, from Google Maps. Only your school and the VIDYADAAN team can see it."
        actions={mapLocation && <Button variant="secondary" size="sm" icon={LuPencil} onClick={open}>Change</Button>}
      />

      {status.text && <Alert tone={status.tone} className="mx-5 mt-4">{status.text}</Alert>}

      {mapLocation ? (
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-5">
          <div className="overflow-hidden rounded-xl border border-surface-line md:col-span-3">
            <MapPreview point={mapLocation} title="Your school's location on Google Maps" className="h-64 sm:h-72" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <dl className="divide-y divide-surface-divider text-sm">
              <div className="py-2.5 first:pt-0">
                <dt className="text-slate-500">Coordinates</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-slate-900">{formatCoordinates(mapLocation)}</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-slate-500">Set from</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {mapLocation.source === "DEVICE" ? `This device's location (accurate to about ${mapLocation.accuracy} m)` : "A Google Maps link"}
                </dd>
              </div>
              <div className="py-2.5">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{formatWhen(mapLocation.setAt)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-auto">
              <MapLink point={mapLocation}>Open in Google Maps</MapLink>
              <Button variant="ghost" size="sm" icon={LuTrash2} loading={removing} onClick={remove} className="text-red-700 hover:bg-red-50 hover:text-red-800">
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={LuMapPin}
          title="Add your school's location"
          description="Paste a Google Maps link, or use your phone's location while you are at the school. It helps the VIDYADAAN team confirm where your school is."
          action={<Button icon={LuMapPin} onClick={open}>Add location</Button>}
        />
      )}

      {editing && (
        <MapLocationModal
          hasLocation={Boolean(mapLocation)}
          onClose={() => setEditing(false)}
          onSaved={(saved, message) => {
            onChange(saved);
            setStatus({ tone: "success", text: message });
          }}
        />
      )}
    </Card>
  );
};

export default MapLocationCard;

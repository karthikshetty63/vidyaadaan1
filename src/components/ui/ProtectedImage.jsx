import { useEffect, useState } from "react";
import { fetchFileObjectUrl } from "../../api/auth";

/**
 * Shows a private uploaded image (e.g. the school photograph).
 * Files are not public, so the image is downloaded with the auth cookie and shown via a temporary URL.
 */
const ProtectedImage = ({ fileId, alt, className = "", fallback = null }) => {
  const [loaded, setLoaded] = useState({ id: null, url: null, failed: false });

  useEffect(() => {
    if (!fileId) return undefined;
    let cancelled = false;
    let objectUrl = null;
    fetchFileObjectUrl(fileId)
      .then((url) => {
        objectUrl = url;
        if (cancelled) URL.revokeObjectURL(url);
        else setLoaded({ id: fileId, url, failed: false });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: fileId, url: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (!fileId || loaded.id !== fileId || !loaded.url) return fallback;
  return <img src={loaded.url} alt={alt} className={className} />;
};

export default ProtectedImage;

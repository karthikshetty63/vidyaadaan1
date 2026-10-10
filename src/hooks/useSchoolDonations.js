import { listSchoolDonations } from "../api/donations";
import useApiList from "./useApiList";

const load = () => listSchoolDonations().then((data) => data.donations);

/** Confirmed donor donations to the signed-in school's projects, newest first (amounts and dates only). */
const useSchoolDonations = () => {
  const { items: donations, loading, error, reload } = useApiList(load, "Could not load donations.");
  return { donations, loading, error, reload };
};

export default useSchoolDonations;

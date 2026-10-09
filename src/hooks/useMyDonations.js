import { listMyDonations } from "../api/donations";
import useApiList from "./useApiList";

const load = () => listMyDonations().then((data) => data.donations);

/** The signed-in donor's confirmed donations (newest first), with loading and error states. */
const useMyDonations = () => {
  const { items: donations, loading, error, reload, refresh } = useApiList(load, "Could not load your donations.");
  return { donations, loading, error, reload, refresh };
};

export default useMyDonations;

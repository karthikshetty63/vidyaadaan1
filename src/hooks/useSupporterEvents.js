import { listMyEventOffers, listOpenEvents } from "../api/events";
import useApiList from "./useApiList";

const loadOpen = () => listOpenEvents().then((data) => data.events);
const loadMine = () => listMyEventOffers().then((data) => data.events);

/**
 * School events for an NGO or donor: the approved ones still to come (`open`) and every one the
 * account has offered to help with (`mine`, past ones too), with loading and error states.
 */
const useSupporterEvents = () => {
  const open = useApiList(loadOpen, "Could not load school events.");
  const mine = useApiList(loadMine, "Could not load your offers.");
  return {
    open: open.items,
    mine: mine.items,
    loading: open.loading || mine.loading,
    error: open.error || mine.error,
    reload: () => {
      open.reload();
      mine.reload();
    },
    /** Load both again in the background (after offering or withdrawing); resolves once both have arrived. */
    refresh: () => Promise.all([open.refresh(), mine.refresh()]),
  };
};

export default useSupporterEvents;

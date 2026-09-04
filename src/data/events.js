import { initialEvents as dashboardEvents } from "./eventsData.js";
import { SCHOOL_EVENTS_LIST as schoolEvents } from "./schoolDataStore.js";
import { SCHOOL_EVENTS_DATA as transparencyEvents } from "./transparencyData.js";
import { getFundingSummary } from "../utils/funding.js";

const financials = (event) => {
    return getFundingSummary(event);
};

const canonicalEvent = (canonicalId, variants, sourceIds) => {
    const primary = variants[0];
    return {
        ...primary,
        id: canonicalId,
        canonicalId,
        financial: financials(primary),
        sourceIds,
        sourceVariants: variants,
    };
};

// Explicit identity map. Only the first two records share enough identity to merge safely.
// initialEvents evt-1 + SCHOOL_EVENTS_LIST evt-101 -> event-sports-honnali-2026
// transparency evt-1 remains separate because its date, budget, location, and participation differ.
const canonicalEvents = [
    canonicalEvent(
        "event-sports-honnali-2026",
        [dashboardEvents[0], schoolEvents[0]],
        { dashboard: "evt-1", school: "evt-101" }
    ),
    canonicalEvent("event-sports-honnali-transparency-2026", [transparencyEvents[0]], { transparency: "evt-1" }),
    canonicalEvent("event-science-shikaripura-2026", [dashboardEvents[1]], { dashboard: "evt-2" }),
    canonicalEvent("event-children-tumkur-2026", [dashboardEvents[2]], { dashboard: "evt-3" }),
    canonicalEvent("event-science-tumakuru-2026", [schoolEvents[1]], { school: "evt-102" }),
    canonicalEvent("event-children-ramanagara-2026", [transparencyEvents[2]], { transparency: "evt-3" }),
    canonicalEvent("event-science-tumakuru-transparency-2026", [transparencyEvents[1]], { transparency: "evt-2" }),
    canonicalEvent("event-health-channapatna-2026", [transparencyEvents[3]], { transparency: "evt-4" }),
];

export const EVENTS = canonicalEvents;
export const getEventById = (id) => EVENTS.find((event) => event.id === id || Object.values(event.sourceIds).includes(id));

// Compatibility adapters preserve each consumer's existing object shape and legacy IDs.
export const initialEvents = EVENTS.flatMap((event) =>
    event.sourceVariants.filter((_, index) => event.sourceIds.dashboard && index === 0)
);
export const SCHOOL_EVENTS_LIST = EVENTS.flatMap((event) =>
    event.sourceVariants.filter((_, index) => event.sourceIds.school && (event.sourceIds.dashboard ? index === 1 : index === 0))
);
export const SCHOOL_EVENTS_DATA = EVENTS.flatMap((event) =>
    event.sourceVariants.filter((_, index) => event.sourceIds.transparency && index === 0)
);

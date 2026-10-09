// The help assistant's personas. The server picks one from the signed-in account's role (which
// requireAuth/optionalAuth read from the database) — never from anything the browser sends.
// Alumni have no VIDYADAAN login: they arrive from a project email, so everyone who isn't signed in
// gets the alumni & visitor assistant.

export const PERSONAS = {
    school: {
        key: "school",
        name: "School Assistant",
        audience: "a school's principal or staff, signed in to the school's VIDYADAAN account",
        // Which rows of the knowledge file it may use.
        knowledge: ["school", "general"],
    },
    ngo: {
        key: "ngo",
        name: "NGO Assistant",
        audience: "someone from an NGO, signed in to the NGO's VIDYADAAN account",
        knowledge: ["ngo", "general"],
    },
    donor: {
        key: "donor",
        name: "Donor Assistant",
        audience: "an individual donor, signed in to their VIDYADAAN donor account",
        knowledge: ["donor", "general"],
    },
    admin: {
        key: "admin",
        name: "System Admin Assistant",
        audience: "a VIDYADAAN administrator, signed in to the admin portal",
        knowledge: ["admin", "general"],
    },
    visitor: {
        key: "visitor",
        name: "Alumni & Visitor Assistant",
        audience: "a visitor who is not signed in, often a school's former student who opened a project link from an email",
        knowledge: ["alumni", "general"],
    },
};

/** Every persona value the knowledge file may use. */
export const KNOWLEDGE_PERSONAS = ["general", "school", "ngo", "donor", "admin", "alumni"];

/** The persona for this request: the signed-in account's role, or the visitor persona. */
export const personaFor = (user) => (user && PERSONAS[user.role]) || PERSONAS.visitor;

/** What the browser is told about its persona. */
export const publicPersona = (persona) => ({ key: persona.key, name: persona.name });

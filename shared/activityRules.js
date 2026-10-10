// The activity the admin Control Tower can show: every action that is recorded, its category and a label.
// Shared by the server (which records and filters events) and the admin page (which labels them).
//
// Two sources:
//   live     recorded at the moment it happened, by the server, since the activity log was introduced.
//   records  reconstructed once, when the log was introduced, from the dates already stored on accounts,
//            projects, payments, donations and QRs. They show each record's latest state only (for example,
//            a project rejected and later resubmitted shows only its latest submission).
//   system   the log's own events (when history was imported).

export const ACTIVITY_SOURCES = ["live", "records", "system"];
export const ACTIVITY_RESULTS = ["success", "failure", "info"];
export const ACTIVITY_ROLES = ["school", "ngo", "donor", "admin", "visitor", "system"];

export const ACTIVITY_CATEGORIES = {
    auth: "Sign-in",
    account: "Accounts",
    project: "Projects",
    funding: "NGO commitments",
    payment: "NGO payments",
    donation: "Donations",
    qr: "Payment QRs",
    school: "School records",
    system: "System",
};

export const ACTIVITY_ACTIONS = {
    "auth.signed_in": { category: "auth", label: "Signed in" },
    "auth.sign_in_failed": { category: "auth", label: "Sign-in failed" },
    "auth.signed_out": { category: "auth", label: "Signed out" },
    "auth.google_linked": { category: "auth", label: "Linked Google sign-in" },
    "auth.password_reset_requested": { category: "auth", label: "Asked for a password reset" },
    "auth.password_reset": { category: "auth", label: "Reset password" },

    "account.registered": { category: "account", label: "Registered" },
    "account.approved": { category: "account", label: "Account approved" },
    "account.rejected": { category: "account", label: "Account rejected" },

    "project.submitted": { category: "project", label: "Project submitted" },
    "project.updated": { category: "project", label: "Project edited" },
    "project.resubmitted": { category: "project", label: "Project resubmitted" },
    "project.approved": { category: "project", label: "Project approved" },
    "project.rejected": { category: "project", label: "Project rejected" },

    "commitment.created": { category: "funding", label: "Committed to fund parts" },
    "commitment.withdrawn": { category: "funding", label: "Withdrew a commitment" },

    "payment.submitted": { category: "payment", label: "Direct payment recorded" },
    "payment.accepted": { category: "payment", label: "Payment accepted by school" },
    "payment.rejected": { category: "payment", label: "Payment rejected by school" },
    "payment.online_started": { category: "payment", label: "Online payment started" },
    "payment.online_verified": { category: "payment", label: "Online payment verified" },
    "payment.refund_due": { category: "payment", label: "Online payment needs a refund" },
    "payment.verification_failed": { category: "payment", label: "Online payment failed verification" },

    "donation.started": { category: "donation", label: "Donation started" },
    "donation.verified": { category: "donation", label: "Donation verified" },
    "donation.verification_failed": { category: "donation", label: "Donation failed verification" },

    "qr.submitted": { category: "qr", label: "Payment QR saved" },
    "qr.removed": { category: "qr", label: "Payment QR removed" },
    "qr.approved": { category: "qr", label: "Payment QR approved" },
    "qr.rejected": { category: "qr", label: "Payment QR rejected" },

    "profile.updated": { category: "school", label: "School profile edited" },
    "map_location.saved": { category: "school", label: "Map location saved" },
    "map_location.removed": { category: "school", label: "Map location removed" },
    "alumni.added": { category: "school", label: "Alumni added" },
    "alumni.updated": { category: "school", label: "Alumni details edited" },
    "alumni.status_changed": { category: "school", label: "Alumni status changed" },

    "system.history_imported": { category: "system", label: "Earlier activity imported from records" },
};

export const activityLabel = (action) => ACTIVITY_ACTIONS[action]?.label || action;

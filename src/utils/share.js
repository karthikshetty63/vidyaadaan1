import { formatINR } from "./format";

// Sharing a school need on WhatsApp: in India, that's how alumni groups and communities pass things on.

/** A link that opens WhatsApp (the app on phones, WhatsApp Web on computers) with `text` ready to send. */
export const whatsappLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** The public page of one approved need. */
export const projectUrl = (projectId) => `${window.location.origin}/projects/${projectId}`;

/** The message: what the need is, where, how far it is (the server's figures) and the link. */
export const projectShareText = (project) => {
  const place = [project.school?.district, project.school?.state].filter(Boolean).join(", ");
  const school = project.school?.name ? ` at ${project.school.name}${place ? ` (${place})` : ""}` : "";
  return [
    `Help a government school: “${project.title}”${school}.`,
    `${formatINR(project.raised)} of ${formatINR(project.budget)} raised so far.`,
    `See the need on VIDYADAAN: ${projectUrl(project.id)}`,
  ].join("\n");
};

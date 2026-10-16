import { FaWhatsapp } from "react-icons/fa";
import { projectShareText, whatsappLink } from "../../utils/share";

/**
 * "Share on WhatsApp" for one approved need. Opens WhatsApp in a new tab with a ready message; nothing is
 * sent until the person chooses a chat and presses send. `compact`: an icon button (cards).
 */
const WhatsAppShare = ({ project, compact = false, className = "" }) => {
  const label = `Share “${project.title}” on WhatsApp`;
  return (
    <a
      href={whatsappLink(projectShareText(project))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-colors active:scale-[0.98] motion-reduce:active:scale-100 ${
        compact ? "h-10 w-10 shrink-0" : "h-11 px-5 text-sm"
      } bg-[#1a7f4b] shadow-sm shadow-emerald-900/10 hover:bg-[#15693e] ${className}`}
    >
      <FaWhatsapp className={compact ? "h-5 w-5" : "h-[18px] w-[18px]"} aria-hidden="true" />
      {!compact && "Share on WhatsApp"}
    </a>
  );
};

export default WhatsAppShare;

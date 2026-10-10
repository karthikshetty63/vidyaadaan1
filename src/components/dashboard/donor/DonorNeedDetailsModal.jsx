import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuExternalLink, LuHeart, LuMapPin, LuSchool } from "react-icons/lu";
import Alert from "../../ui/Alert";
import Badge, { StatusBadge } from "../../ui/Badge";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import ProgressBar from "../../ui/ProgressBar";
import { getPublicProject } from "../../../api/projects";
import { formatINR } from "../../../utils/format";
import { getFundingPercentage } from "../../../utils/funding";

const formatDay = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * A need in full, for a donor deciding whether to give: what the school wrote, who benefits and how
 * far its funding has come. It shows the same information as the need's public page (never the
 * school's contact or bank details), loaded fresh when opened.
 */
const DonorNeedDetailsModal = ({ need, onClose, onDonate }) => {
  const [state, setState] = useState({ project: null, error: "" });
  useEffect(() => {
    let cancelled = false;
    getPublicProject(need.id)
      .then((data) => !cancelled && setState({ project: data.project, error: "" }))
      .catch((error) => !cancelled && setState({ project: null, error: error.message || "Could not load this need." }));
    return () => {
      cancelled = true;
    };
  }, [need.id]);

  // The list's figures until the fresh ones arrive.
  const project = state.project || need;
  const funded = getFundingPercentage(project.budget, project.raised);
  const fullyFunded = project.raised >= project.budget;
  const place = [project.school.district, project.school.state].filter(Boolean).join(", ");

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={project.title}
      description={project.school.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {!fullyFunded && project.status !== "Completed" && (
            <Button variant="brand" icon={LuHeart} onClick={() => onDonate(need)}>Donate to this need</Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{project.category}</Badge>
          <StatusBadge status={project.priority}>{project.priority} priority</StatusBadge>
          {project.status !== "Open" && <StatusBadge status={project.status} />}
        </div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><LuSchool className="h-4 w-4 text-slate-400" aria-hidden="true" /> {project.school.name}</span>
          {place && <span className="inline-flex items-center gap-1.5"><LuMapPin className="h-4 w-4 text-slate-400" aria-hidden="true" /> {place}</span>}
        </p>

        <div className="rounded-xl bg-surface-muted p-4">
          <div className="flex items-end justify-between gap-3">
            <p>
              <span className="block text-xl font-bold tabular-nums text-slate-900">{formatINR(project.raised)}</span>
              <span className="text-xs text-slate-500">raised of <span className="tabular-nums">{formatINR(project.budget)}</span>, from NGOs and donors</span>
            </p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${fullyFunded ? "bg-emerald-50 text-emerald-700" : "bg-primary-50 text-primary-700"}`}>{funded}% funded</span>
          </div>
          <ProgressBar value={funded} size="md" label={`${project.title} funding`} className="mt-3" />
        </div>

        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {!state.project && !state.error && <p className="text-sm text-slate-500" role="status">Loading the details…</p>}
        {state.project && (
          <>
            <section aria-labelledby="need-problem-heading">
              <h3 id="need-problem-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">The need, in the school&rsquo;s own words</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{state.project.problem}</p>
            </section>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Students who will benefit</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">{state.project.studentsBenefited.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Planned completion</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-900">{formatDay(state.project.expectedCompletion)}</dd>
              </div>
              {state.project.materials.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Materials needed</dt>
                  <dd className="mt-0.5 text-sm text-slate-900">{state.project.materials.join(", ")}</dd>
                </div>
              )}
            </dl>
          </>
        )}
        <p className="text-xs text-slate-500">
          Checked and approved by the VIDYADAAN team.{" "}
          <Link to={`/projects/${need.id}`} className="inline-flex items-center gap-1 font-medium text-primary-700 hover:underline">
            Open its public page to share it <LuExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </Modal>
  );
};

export default DonorNeedDetailsModal;

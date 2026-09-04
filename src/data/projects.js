import { INFRA_PROJECTS as infrastructureProjects } from "./infrastructureData.js";
import { SCHOOL_PROJECTS_LIST as schoolProjects } from "./schoolDataStore.js";
import { PROJECT_TRANSPARENCY_DATA as transparencyProject } from "./transparencyData.js";
import { getFundingSummary } from "../utils/funding.js";

const toNumber = (value) => (typeof value === "number" ? value : Number(value) || 0);

const createProject = ({ canonicalId, infrastructure, school, transparency, sourceIds }) => {
    const { budget, amountRaised, amountRemaining, fundingPercentage } = getFundingSummary({
        budget: toNumber(infrastructure?.budget ?? school?.budget ?? transparency?.projectMeta?.targetBudget),
        amountRaised: toNumber(infrastructure?.raised ?? school?.raised ?? transparency?.projectMeta?.raisedAmount),
    });
    const source = infrastructure || school || transparency?.projectMeta || {};

    return {
        ...source,
        id: canonicalId,
        canonicalId,
        financial: {
            budget,
            amountRaised,
            amountRemaining,
            fundingPercentage,
        },
        sourceIds,
        sources: {
            infrastructure,
            school,
            transparency,
        },
    };
};

// Explicit identity map. Similar names alone do not merge projects: school/location are compared too.
// infra-001 + proj-001 + proj-1 -> project-smart-classroom-honnali
// infra-003 -> project-computer-lab-hosadurga; proj-004 -> project-computer-lab-honnali
// infra-004 -> project-water-purifier-chitradurga; proj-003 -> project-water-purifier-honnali
const canonicalProjects = [
    createProject({
        canonicalId: "project-smart-classroom-honnali",
        infrastructure: infrastructureProjects[0],
        school: schoolProjects[0],
        transparency: transparencyProject,
        sourceIds: { infrastructure: "infra-001", school: "proj-001", transparency: "proj-1" },
    }),
    ...infrastructureProjects.slice(1).map((project) => createProject({
        canonicalId: `project-${project.id}`,
        infrastructure: project,
        sourceIds: { infrastructure: project.id },
    })),
    ...schoolProjects.slice(1).map((project) => createProject({
        canonicalId: `project-${project.id}`,
        school: project,
        sourceIds: { school: project.id },
    })),
];

export const PROJECTS = canonicalProjects;
export const getProjectById = (id) => PROJECTS.find((project) => project.id === id || Object.values(project.sourceIds).includes(id));

// Compatibility adapters preserve the exact legacy object shapes and IDs used by existing pages.
export const INFRA_PROJECTS = PROJECTS.filter((project) => project.sources.infrastructure).map((project) => project.sources.infrastructure);
export const SCHOOL_PROJECTS_LIST = PROJECTS.filter((project) => project.sources.school).map((project) => project.sources.school);
export const PROJECT_TRANSPARENCY_DATA = PROJECTS.find(
    (project) => project.sources.transparency
).sources.transparency;

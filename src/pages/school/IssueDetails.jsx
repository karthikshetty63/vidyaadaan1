import { useParams, Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";
import {
  FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaUsers,
  FaRupeeSign, FaCheckCircle, FaClock, FaHandsHelping,
} from "react-icons/fa";

/* Dummy issue data — in a real app this would be fetched by id */
const issueData = {
  1: {
    id: 1,
    title: "Classroom Roof Repair",
    category: "Infrastructure",
    priority: "High",
    status: "Active",
    description:
      "Two classrooms (Room 3 and Room 5) have severe roof leakage that affects 80 students during monsoon. The roof tiles are cracked and water seeps in, damaging furniture and making the rooms unusable during rain. Immediate repair is required to ensure uninterrupted education.",
    raised: 65000,
    goal: 100000,
    progress: 65,
    beneficiaries: 80,
    submittedDate: "12 Jan 2025",
    verifiedBy: "Pratham NGO",
    location: "Sullia, Karnataka",
    beforeImages: [
      "https://placehold.co/500x350/1d4ed8/ffffff?text=Before+Photo+1",
      "https://placehold.co/500x350/1d4ed8/ffffff?text=Before+Photo+2",
    ],
    afterImages: [],
    donors: [
      { name: "Priya Sharma", amount: "₹25,000", date: "22 Jan 2025" },
      { name: "Vikram Nair", amount: "₹15,000", date: "18 Jan 2025" },
      { name: "Ananya Rao", amount: "₹10,000", date: "15 Jan 2025" },
      { name: "Anonymous", amount: "₹15,000", date: "12 Jan 2025" },
    ],
    timeline: [
      { event: "Issue Submitted", date: "12 Jan 2025", done: true },
      { event: "NGO Verification", date: "14 Jan 2025", done: true },
      { event: "Published for Donations", date: "15 Jan 2025", done: true },
      { event: "Work in Progress", date: "Pending", done: false },
      { event: "Completion Report", date: "Pending", done: false },
    ],
  },
};

const statusVariant = { Active: "blue", Pending: "yellow", Completed: "emerald" };
const priorityVariant = { High: "red", Medium: "yellow", Low: "emerald" };

const IssueDetails = () => {
  /* Read :id from URL; fall back to issue 1 for demo */
  const { id } = useParams();
  const issue = issueData[id] || issueData[1];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          to="/school/manage-issues"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
        >
          <FaArrowLeft size={11} /> Back to Issues
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{issue.title}</h1>
              <Badge variant={statusVariant[issue.status]}>{issue.status}</Badge>
              <Badge variant={priorityVariant[issue.priority]}>{issue.priority} Priority</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {issue.location}
              </span>
              <span className="flex items-center gap-1">
                <FaCalendarAlt /> Submitted {issue.submittedDate}
              </span>
              <span className="flex items-center gap-1">
                <FaHandsHelping /> Verified by {issue.verifiedBy}
              </span>
            </div>
          </div>
          <Link to="/school/create-issue">
            <Button variant="outline" size="sm">Edit Issue</Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-3">Description</h2>
            <p className="text-slate-600 text-sm leading-7">{issue.description}</p>
          </Card>

          {/* Before Photos */}
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-4">Before Photos</h2>
            {issue.beforeImages.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {issue.beforeImages.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden">
                    <img src={src} alt={`Before ${i + 1}`} className="w-full h-44 object-cover" />
                    <span className="absolute top-2 left-2">
                      <Badge variant="blue">Before</Badge>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No before photos uploaded yet.</p>
            )}
          </Card>

          {/* After Photos */}
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-4">After Photos</h2>
            {issue.afterImages.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {issue.afterImages.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden">
                    <img src={src} alt={`After ${i + 1}`} className="w-full h-44 object-cover" />
                    <span className="absolute top-2 left-2">
                      <Badge variant="emerald">After</Badge>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-slate-400">After photos will appear here once work is completed.</p>
              </div>
            )}
          </Card>

          {/* Donors */}
          <Card className="p-6">
            <h2 className="font-bold text-slate-800 mb-4">
              Donors ({issue.donors.length})
            </h2>
            <div className="divide-y divide-gray-50">
              {issue.donors.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                      {d.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm">{d.amount}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-5">

          {/* Funding Progress */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Funding Progress</h3>
            <ProgressBar value={issue.progress} />
            <div className="flex justify-between text-sm mt-3">
              <div>
                <p className="text-xs text-slate-400">Raised</p>
                <p className="font-bold text-emerald-600">₹{issue.raised.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Goal</p>
                <p className="font-bold text-slate-800">₹{issue.goal.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-blue-600">{issue.donors.length}</p>
                <p className="text-xs text-slate-400">Donors</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600 flex items-center justify-center gap-0.5">
                  <FaUsers size={14} /> {issue.beneficiaries}
                </p>
                <p className="text-xs text-slate-400">Students</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Timeline</h3>
            <ol className="space-y-4">
              {issue.timeline.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    step.done ? "bg-emerald-500" : "bg-gray-200"
                  }`}>
                    {step.done
                      ? <FaCheckCircle className="text-white text-xs" />
                      : <FaClock className="text-slate-400 text-xs" />
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.done ? "text-slate-800" : "text-slate-400"}`}>
                      {step.event}
                    </p>
                    <p className="text-xs text-slate-400">{step.date}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          {/* Category Info */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-700">{issue.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority</span>
                <Badge variant={priorityVariant[issue.priority]}>{issue.priority}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified By</span>
                <span className="font-medium text-slate-700">{issue.verifiedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted</span>
                <span className="font-medium text-slate-700">{issue.submittedDate}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;

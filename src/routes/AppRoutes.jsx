import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";

// Authentication
import JoinVidyadaan from "../pages/auth/JoinVidyadaan";
import SchoolLogin from "../pages/auth/SchoolLogin";
import SchoolRegister from "../pages/auth/SchoolRegister";
import DonorLogin from "../pages/auth/DonorLogin";
import DonorRegister from "../pages/auth/DonorRegister";
import NGOLogin from "../pages/auth/NGOLogin";
import NGORegister from "../pages/auth/NGORegister";

// Dashboard Layout
import DashboardLayout from "../layouts/DashboardLayout";

// School Pages
import SchoolDashboard from "../pages/school/Dashboard";
import SchoolProfile from "../pages/school/Profile";
import Infrastructure from "../pages/school/Infrastructure";
import CreateIssue from "../pages/school/CreateIssue";
import ManageIssues from "../pages/school/ManageIssues";
import IssueDetails from "../pages/school/IssueDetails";
import SchoolDonationHistory from "../pages/school/DonationHistory";
import SchoolGallery from "../pages/school/Gallery";
import SchoolReports from "../pages/school/Reports";
import SchoolNotifications from "../pages/school/Notifications";
import SchoolSettings from "../pages/school/Settings";

// Donor Pages
import DonorDashboard from "../pages/donor/Dashboard";
import BrowseSchools from "../pages/donor/BrowseSchools";
import SchoolDetails from "../pages/donor/SchoolDetails";
import Donate from "../pages/donor/Donate";
import DonorDonationHistory from "../pages/donor/DonationHistory";
import SavedProjects from "../pages/donor/SavedProjects";
import DonorNotifications from "../pages/donor/Notifications";
import DonorProfile from "../pages/donor/Profile";

// NGO Pages
import NGODashboard from "../pages/ngo/Dashboard";
import NGOProfile from "../pages/ngo/Profile";
import AssignedProjects from "../pages/ngo/AssignedProjects";
import ManageSchools from "../pages/ngo/ManageSchools";
import Volunteers from "../pages/ngo/Volunteers";
import NGONotifications from "../pages/ngo/Notifications";
import NGOReports from "../pages/ngo/Reports";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import SchoolManagement from "../pages/admin/SchoolManagement";
import DonationManagement from "../pages/admin/DonationManagement";
import NGOManagement from "../pages/admin/NGOManagement";
import UserManagement from "../pages/admin/UserManagement";
import AdminReports from "../pages/admin/Reports";
import AdminSettings from "../pages/admin/Settings";

const ComingSoon = ({ label }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-blue-600">{label}</h1>
      <p className="mt-3 text-slate-500">Coming Soon...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/impact" element={<ComingSoon label="Live Impact" />} />

      {/* Join Page */}
      <Route path="/join" element={<JoinVidyadaan />} />

      {/* School Auth */}
      <Route path="/school/login" element={<SchoolLogin />} />
      <Route path="/school/register" element={<SchoolRegister />} />

      {/* Donor Auth */}
      <Route path="/donor/login" element={<DonorLogin />} />
      <Route path="/donor/register" element={<DonorRegister />} />

      {/* NGO Auth */}
      <Route path="/ngo/login" element={<NGOLogin />} />
      <Route path="/ngo/register" element={<NGORegister />} />

      {/* School Dashboard */}
      <Route path="/school" element={<DashboardLayout role="school" />}>
        <Route path="dashboard" element={<SchoolDashboard />} />
        <Route path="profile" element={<SchoolProfile />} />
        <Route path="infrastructure" element={<Infrastructure />} />
        <Route path="create-issue" element={<CreateIssue />} />
        <Route path="manage-issues" element={<ManageIssues />} />
        <Route path="manage-issues/:id" element={<IssueDetails />} />
        <Route path="donation-history" element={<SchoolDonationHistory />} />
        <Route path="gallery" element={<SchoolGallery />} />
        <Route path="reports" element={<SchoolReports />} />
        <Route path="notifications" element={<SchoolNotifications />} />
        <Route path="settings" element={<SchoolSettings />} />
      </Route>

      {/* Donor Dashboard */}
      <Route path="/donor" element={<DashboardLayout role="donor" />}>
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="browse" element={<BrowseSchools />} />
        <Route path="school/:id" element={<SchoolDetails />} />
        <Route path="donate" element={<Donate />} />
        <Route path="donation-history" element={<DonorDonationHistory />} />
        <Route path="saved" element={<SavedProjects />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="profile" element={<DonorProfile />} />
      </Route>

      {/* NGO Dashboard */}
      <Route path="/ngo" element={<DashboardLayout role="ngo" />}>
        <Route path="dashboard" element={<NGODashboard />} />
        <Route path="schools" element={<ManageSchools />} />
        <Route path="projects" element={<AssignedProjects />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="reports" element={<NGOReports />} />
        <Route path="notifications" element={<NGONotifications />} />
        <Route path="profile" element={<NGOProfile />} />
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin" element={<DashboardLayout role="admin" />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="schools" element={<SchoolManagement />} />
        <Route path="donations" element={<DonationManagement />} />
        <Route path="ngos" element={<NGOManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="analytics" element={<ComingSoon label="Analytics" />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <h1 className="text-6xl font-black text-blue-600">404</h1>
              <p className="text-xl font-semibold text-slate-700 mt-3">Page Not Found</p>
              <a href="/" className="mt-6 inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                Back to Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
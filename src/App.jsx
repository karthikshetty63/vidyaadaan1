import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoleSelector from "./pages/auth/RoleSelector";
import SchoolLogin from "./pages/auth/SchoolLogin";
import NGOLogin from "./pages/auth/NGOLogin";
import DonorLogin from "./pages/auth/DonorLogin";
import JoinSelector from "./pages/auth/JoinSelector";
import SchoolRegister from "./pages/auth/SchoolRegister";
import NGORegister from "./pages/auth/NGORegister";
import DonorRegister from "./pages/auth/DonorRegister";
import SchoolDashboard from "./pages/dashboard/school/SchoolDashboard";
import NGODashboard from "./pages/dashboard/ngo/NGODashboard";
import DonorDashboard from "./pages/dashboard/donor/DonorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Auth — Login */}
        <Route path="/login" element={<RoleSelector />} />
        <Route path="/login/school" element={<SchoolLogin />} />
        <Route path="/login/ngo" element={<NGOLogin />} />
        <Route path="/login/donor" element={<DonorLogin />} />

        {/* Auth — Register */}
        <Route path="/join" element={<JoinSelector />} />
        <Route path="/join/school" element={<SchoolRegister />} />
        <Route path="/join/ngo" element={<NGORegister />} />
        <Route path="/join/donor" element={<DonorRegister />} />

        {/* Dashboards */}
        <Route path="/dashboard/school" element={<SchoolDashboard />} />
        <Route path="/dashboard/ngo" element={<NGODashboard />} />
        <Route path="/dashboard/donor" element={<DonorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
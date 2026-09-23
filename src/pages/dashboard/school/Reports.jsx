import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import SchoolReportsWidget from "../../../components/dashboard/school/SchoolReportsWidget";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";

const Reports = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="Reports" subtitle={profile.name} notifications={[1, 2]}>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="Reports"
            description="Generate and export infrastructure, donation, event, completion and student impact reports."
            actions={
              <>
                <Button variant="secondary" icon={LuDownload} onClick={() => alert("Downloaded PDF Report Bundle.")}>PDF</Button>
                <Button variant="secondary" icon={LuDownload} onClick={() => alert("Downloaded Excel Report Bundle.")}>Excel</Button>
              </>
            }
          />
          <SchoolReportsWidget />
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Reports;

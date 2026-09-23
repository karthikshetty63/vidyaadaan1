import { useRef, useState } from "react";
import { LuCircleCheck, LuPencil, LuSchool } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import SchoolProfileModal from "../../../components/dashboard/school/SchoolProfileModal";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card, { CardHeader } from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import ProtectedImage from "../../../components/ui/ProtectedImage";
import StatCard from "../../../components/ui/StatCard";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";
import { removeSchoolPhoto, uploadSchoolPhoto } from "../../../api/profile";
import useMyProfile, { toSchoolDisplayProfile } from "../../../hooks/useMyProfile";
import { UPLOAD_RULES, getUploadError } from "../../../../shared/registrationRules.js";

const PHOTO_RULE = UPLOAD_RULES.school.schoolPhoto;

const DetailList = ({ items }) => (
  <dl className="divide-y divide-slate-200">
    {items.map(([label, value]) => (
      <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-5 py-3 text-sm">
        <dt className="text-slate-500">{label}</dt>
        <dd className="sm:col-span-2 font-medium text-slate-900 break-words">{value || "—"}</dd>
      </div>
    ))}
  </dl>
);

const SchoolProfile = () => {
  // Registered details + photo come from the API; local edits from the (existing) edit modal stay on this page.
  const { profile: myProfile, setProfile: setMyProfile } = useMyProfile();
  const [localEdits, setLocalEdits] = useState({});
  const profile = { ...toSchoolDisplayProfile(myProfile, INITIAL_SCHOOL_PROFILE), ...localEdits };
  const [isEditOpen, setIsEditOpen] = useState(false);

  const photoInput = useRef(null);
  const [photoStatus, setPhotoStatus] = useState({ busy: false, error: "", message: "" });

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = getUploadError(PHOTO_RULE, file);
    if (problem) return setPhotoStatus({ busy: false, error: problem, message: "" });
    setPhotoStatus({ busy: true, error: "", message: "" });
    try {
      const res = await uploadSchoolPhoto(file);
      setMyProfile((p) => ({ ...p, photo: res.photo }));
      setPhotoStatus({ busy: false, error: "", message: "Photo updated." });
    } catch (err) {
      setPhotoStatus({ busy: false, error: err.message, message: "" });
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoStatus({ busy: true, error: "", message: "" });
    try {
      await removeSchoolPhoto();
      setMyProfile((p) => ({ ...p, photo: null }));
      setPhotoStatus({ busy: false, error: "", message: "Photo removed." });
    } catch (err) {
      setPhotoStatus({ busy: false, error: err.message, message: "" });
    }
  };

  const facilities = [
    { label: "Smart Digital Classroom", available: true, note: "65-Inch Smart Screen" },
    { label: "Computer Laboratory", available: true, note: "10 Refurbished PCs" },
    { label: "Girls Sanitation Block", available: true, note: "Running Water & Tiles" },
    { label: "Commercial RO Water Unit", available: false, note: "Funding Request Active" },
    { label: "Sports Playground", available: true, note: "2-Acre Multipurpose Field" },
    { label: "Rooftop Solar Backup", available: false, note: "Pending CSR Sponsorship" },
  ];

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="School profile" subtitle={profile.name} notifications={[1, 2]}>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="School profile"
            description="Details from your registration. Keep them accurate so NGOs and donors can trust your requests."
            actions={<Button variant="secondary" icon={LuPencil} onClick={() => setIsEditOpen(true)}>Edit profile</Button>}
          />

          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex items-center gap-4">
                <span className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                  <ProtectedImage
                    fileId={profile.photo?.id}
                    alt={`${profile.name} photograph`}
                    className="w-full h-full object-cover"
                    fallback={<LuSchool className="w-8 h-8 text-slate-400" aria-hidden="true" />}
                  />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">UDISE {profile.udise} · Established {profile.established}</p>
                  <Badge tone="success" icon={LuCircleCheck} className="mt-2">Verified school</Badge>
                </div>
              </div>

              <div className="sm:ml-auto flex flex-wrap items-center gap-2">
                <input ref={photoInput} type="file" accept={PHOTO_RULE.types.join(",")} onChange={handlePhotoSelected} className="sr-only" aria-label="Choose school photograph" />
                <Button variant="secondary" size="sm" loading={photoStatus.busy} disabled={!myProfile} onClick={() => photoInput.current?.click()}>
                  {photoStatus.busy ? "Saving…" : profile.photo ? "Change photo" : "Add photo"}
                </Button>
                {profile.photo && !photoStatus.busy && (
                  <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={handlePhotoRemove}>Remove</Button>
                )}
              </div>
            </div>

            {photoStatus.error && <Alert tone="danger" className="mt-4">{photoStatus.error}</Alert>}
            {photoStatus.message && <Alert tone="success" className="mt-4">{photoStatus.message}</Alert>}
            <p className="mt-4 text-xs text-slate-500">School photograph: JPG, PNG or WebP, up to 5 MB.</p>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Students enrolled" value={profile.studentsCount} />
            <StatCard label="Teaching staff" value={profile.teachersCount} />
            <StatCard label="Development score" value={`${profile.developmentScore} / 100`} />
            <StatCard label="Verification" value="Verified" hint="Approved by VIDYADAAN" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Principal & contact" />
              <DetailList
                items={[
                  ["Principal", profile.principalName],
                  ["Phone", profile.phone],
                  ["Official email", profile.email],
                  ["Address", profile.location],
                ]}
              />
            </Card>

            <Card>
              <CardHeader title="Campus facilities" />
              <ul className="divide-y divide-slate-200">
                {facilities.map((f) => (
                  <li key={f.label} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{f.label}</p>
                      <p className="text-xs text-slate-500">{f.note}</p>
                    </div>
                    <Badge tone={f.available ? "success" : "warning"}>{f.available ? "Operational" : "Needs support"}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </main>
      <SchoolProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        schoolData={profile}
        onSave={(updated) => setLocalEdits((edits) => ({ ...edits, ...updated }))}
      />
    </DashboardLayout>
  );
};

export default SchoolProfile;

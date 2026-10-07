import { useState } from "react";
import { LuGraduationCap, LuPencil, LuSearch, LuUserCheck, LuUserPlus, LuUserX } from "react-icons/lu";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import AlumniFormModal from "../../../components/dashboard/school/AlumniFormModal";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { Input } from "../../../components/ui/FormField";
import PageHeader from "../../../components/ui/PageHeader";
import { setAlumniStatus } from "../../../api/alumni";
import { useAuth } from "../../../context/AuthContext";
import useSchoolAlumni from "../../../hooks/useSchoolAlumni";

const matches = (alum, query) => {
  const q = query.trim().toLowerCase();
  return !q || [alum.name, alum.registerNumber, alum.email].some((v) => v.toLowerCase().includes(q));
};

const StatusLabel = ({ status }) => (status === "ACTIVE" ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>);

/** Edit, and Deactivate or Reactivate. */
const RowActions = ({ alum, busy, onEdit, onStatus }) => (
  <>
    <Button variant="ghost" size="sm" icon={LuPencil} onClick={() => onEdit(alum)} disabled={busy} aria-label={`Edit ${alum.name}`}>Edit</Button>
    {alum.status === "ACTIVE" ? (
      <Button variant="ghost" size="sm" icon={LuUserX} loading={busy} onClick={() => onStatus(alum, "INACTIVE")} aria-label={`Deactivate ${alum.name}`}>
        Deactivate
      </Button>
    ) : (
      <Button variant="ghost" size="sm" icon={LuUserCheck} loading={busy} onClick={() => onStatus(alum, "ACTIVE")} aria-label={`Reactivate ${alum.name}`}>
        Reactivate
      </Button>
    )}
  </>
);

/**
 * The school's alumni list. Active alumni get an email whenever the VIDYADAAN team approves one of
 * the school's projects; inactive ones stay on the list but get nothing.
 */
const Alumni = () => {
  const { user } = useAuth();
  const { alumni, loading, error, reload, upsert } = useSchoolAlumni();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // null: closed · {}: adding · an alum: editing
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const active = alumni.filter((a) => a.status === "ACTIVE").length;
  const shown = alumni.filter((a) => matches(a, query));

  const openForm = (alum = {}) => {
    setNotice("");
    setActionError("");
    setEditing(alum);
  };

  const changeStatus = async (alum, status) => {
    if (busyId) return;
    setBusyId(alum.id);
    setNotice("");
    setActionError("");
    try {
      const data = await setAlumniStatus(alum.id, status);
      upsert(data.alum);
      setNotice(data.message);
    } catch (statusError) {
      setActionError(statusError.message || "Could not change the status. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const addButton = <Button icon={LuUserPlus} onClick={() => openForm()}>Add alumni</Button>;

  return (
    <DashboardLayout role="school" userName={user?.name} userSub={user?.email} title="Alumni" subtitle="Your school's former students">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <PageHeader
            title="Alumni"
            description="Former students of your school. When the VIDYADAAN team approves one of your projects, every active alum gets an email about it."
            actions={!loading && !error && addButton}
          />

          {notice && <Alert tone="success">{notice}</Alert>}
          {actionError && <Alert tone="danger">{actionError}</Alert>}
          {error && (
            <Alert tone="danger">
              {error}{" "}
              <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Try again</button>
            </Alert>
          )}

          {loading && (
            <Card>
              <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading alumni…</p>
            </Card>
          )}

          {!loading && !error && alumni.length === 0 && (
            <Card>
              <EmptyState
                icon={LuGraduationCap}
                title="No alumni yet"
                description="Add your school's former students. Each active alum gets an email when one of your projects is approved."
                action={addButton}
              />
            </Card>
          )}

          {!loading && alumni.length > 0 && (
            <>
              <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 min-w-0">
                  <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <Input
                    type="search"
                    aria-label="Search alumni"
                    placeholder="Search by name, register number or email…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-sm text-slate-500 whitespace-nowrap" aria-live="polite">
                  {query.trim() ? `${shown.length} of ${alumni.length} alumni` : `${alumni.length} alumni · ${active} active`}
                </p>
              </Card>

              <Card className="overflow-hidden">
                {shown.length === 0 ? (
                  <EmptyState
                    icon={LuSearch}
                    title="No alumni match your search"
                    action={<Button variant="secondary" onClick={() => setQuery("")}>Clear search</Button>}
                  />
                ) : (
                  <>
                    {/* Phones: one row per alum instead of a squeezed table. */}
                    <ul className="divide-y divide-slate-200 md:hidden">
                      {shown.map((a) => (
                        <li key={a.id} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`text-sm font-medium ${a.status === "ACTIVE" ? "text-slate-900" : "text-slate-500"}`}>{a.name}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                <span className="tabular-nums">{a.registerNumber}</span>
                                {a.graduationYear && <> · Class of {a.graduationYear}</>}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-600 break-words">{a.email}</p>
                            </div>
                            <StatusLabel status={a.status} />
                          </div>
                          <div className="mt-2 flex gap-1 -ml-2">
                            <RowActions alum={a} busy={busyId === a.id} onEdit={openForm} onStatus={changeStatus} />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* relative: keeps the sr-only header inside the scroller, so it can't widen the page */}
                    <div className="relative hidden overflow-x-auto md:block">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-surface-muted text-left">
                            {["Name", "Register number", "Email", "Status"].map((h) => (
                              <th key={h} scope="col" className="whitespace-nowrap px-5 py-2.5 text-xs font-medium text-slate-500">{h}</th>
                            ))}
                            <th scope="col" className="px-5 py-2.5"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {shown.map((a) => (
                            <tr key={a.id}>
                              <td className="px-5 py-3">
                                <p className={`font-medium ${a.status === "ACTIVE" ? "text-slate-900" : "text-slate-500"}`}>{a.name}</p>
                                {a.graduationYear && <p className="text-xs text-slate-500">Class of {a.graduationYear}</p>}
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">{a.registerNumber}</td>
                              <td className="px-5 py-3 text-slate-600 break-words">{a.email}</td>
                              <td className="px-5 py-3"><StatusLabel status={a.status} /></td>
                              <td className="whitespace-nowrap px-5 py-3 text-right">
                                <RowActions alum={a} busy={busyId === a.id} onEdit={openForm} onStatus={changeStatus} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      </main>

      {editing && (
        <AlumniFormModal
          alum={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(alum, message) => {
            upsert(alum);
            setNotice(message);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Alumni;

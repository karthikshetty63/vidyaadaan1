import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import EventCard from "../../../components/events/EventCard";
import CreateEventModal from "../../../components/events/CreateEventModal";
import PostEventUploadModal from "../../../components/events/PostEventUploadModal";
import { INITIAL_SCHOOL_PROFILE } from "../../../data/schoolDataStore";
import { SCHOOL_EVENTS_LIST } from "../../../data/events";

const SchoolEvents = () => {
  const [profile] = useState(INITIAL_SCHOOL_PROFILE);
  const [events, setEvents] = useState(SCHOOL_EVENTS_LIST);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEventForUpload, setSelectedEventForUpload] = useState(null);

  const handleCreateEvent = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  const handlePostReport = ({ eventId, thankYouMessage, studentsBenefited, photos }) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
            ...e,
            status: "Completed",
            impactReport: { completionDate: "Just now", studentsBenefited, thankYouMessage, photos },
          }
          : e
      )
    );
  };

  return (
    <DashboardLayout role="school" userName={profile.name} userSub={profile.district} title="School Events & Program Sponsorship" subtitle={profile.name} notifications={[1, 2]}>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <PageHeader
          title="School events"
          description="Organise Sports Day, Annual Day, Science Fair, Children's Day and midday meal drives visible to NGOs and donors."
          actions={<Button icon={LuPlus} onClick={() => setIsCreateOpen(true)}>Create event</Button>}
        />

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              userRole="school"
              onPostEventUpload={(e) => setSelectedEventForUpload(e)}
            />
          ))}
        </div>

        </div>
      </main>

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      <PostEventUploadModal
        isOpen={!!selectedEventForUpload}
        onClose={() => setSelectedEventForUpload(null)}
        event={selectedEventForUpload}
        onSubmitReport={handlePostReport}
      />
    </DashboardLayout >
  );
};

export default SchoolEvents;

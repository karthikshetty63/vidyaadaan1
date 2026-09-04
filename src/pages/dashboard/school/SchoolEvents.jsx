import React, { useState } from "react";
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

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">School Events & Fundraiser Campaigns</h1>
            <p className="text-xs text-slate-500">Organize Sports Day, Annual Day, Science Fair, Children's Day, and Midday Meal drives visible to NGOs & Donors.</p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-full shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>➕</span> Create School Event
          </button>
        </div>

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

      </main >

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

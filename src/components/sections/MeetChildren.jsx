import React from "react";
import Container from "../layout/Container";
import ChildCard from "../cards/ChildCard";

const childrenList = [
  {
    id: "c-1",
    name: "Asha",
    dream: "I want to become a Doctor.",
    schoolNeed: "Science Lab",
    needIcon: "🧪",
    cardBg: "bg-amber-50/70",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "c-2",
    name: "Rahul",
    dream: "I want to become an Engineer.",
    schoolNeed: "Computer Lab",
    needIcon: "💻",
    cardBg: "bg-emerald-50/70",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "c-3",
    name: "Pooja",
    dream: "I want to become a Teacher.",
    schoolNeed: "Library Books",
    needIcon: "📚",
    cardBg: "bg-amber-50/70",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "c-4",
    name: "Vijay",
    dream: "I want to become a Scientist.",
    schoolNeed: "Smart Classroom",
    needIcon: "🖥️",
    cardBg: "bg-emerald-50/70",
    image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop",
  },
];

const MeetChildren = () => {
  return (
    <section id="children" className="py-20 bg-white">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label mb-2 block">MEET THE CHILDREN</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Their Dreams, Our Responsibility
            </h2>
          </div>
          <a
            href="#projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 px-4 py-2 rounded-full transition-colors shadow-2xs self-start sm:self-auto"
          >
            View More Children →
          </a>
        </div>

        {/* 4 Child Profile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {childrenList.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default MeetChildren;

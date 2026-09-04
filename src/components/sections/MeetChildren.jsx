import React from "react";
import Container from "../layout/Container";
import ChildCard from "../cards/ChildCard";
import { MEET_CHILDREN_DATA as childrenList } from "../../data/children";

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

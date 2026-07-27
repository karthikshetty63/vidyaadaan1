import React from "react";
import Container from "../layout/Container";
import ProjectCard from "../cards/ProjectCard";

const projectsList = [
  {
    id: "fp-1",
    title: "Smart Classroom Setup",
    schoolName: "Zilla Parishad School, Maharashtra",
    location: "Maharashtra",
    category: "Education",
    badgeColor: "bg-blue-600",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
    targetAmount: 250000,
    raisedAmount: 180000,
    daysLeft: 38,
  },
  {
    id: "fp-2",
    title: "Library Development",
    schoolName: "Mysuru, Karnataka",
    location: "Karnataka",
    category: "Infrastructure",
    badgeColor: "bg-teal-600",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    targetAmount: 150000,
    raisedAmount: 95000,
    daysLeft: 25,
  },
  {
    id: "fp-3",
    title: "Clean Drinking Water",
    schoolName: "Hassan, Karnataka",
    location: "Karnataka",
    category: "Water",
    badgeColor: "bg-sky-500",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
    targetAmount: 100000,
    raisedAmount: 60000,
    daysLeft: 20,
  },
  {
    id: "fp-4",
    title: "Toilet Renovation",
    schoolName: "Chikmagalur, Karnataka",
    location: "Karnataka",
    category: "Sanitation",
    badgeColor: "bg-emerald-600",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop",
    targetAmount: 120000,
    raisedAmount: 75000,
    daysLeft: 18,
  },
];

const FeaturedProjects = () => {
  return (
    <section id="projects" className="py-20 bg-white">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label mb-2 block">FEATURED PROJECTS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Schools That Need Your Support
            </h2>
          </div>
          <a
            href="#projects"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 px-4 py-2 rounded-full transition-colors shadow-2xs self-start sm:self-auto"
          >
            View All Projects →
          </a>
        </div>

        {/* 4 Cards Row with Floating Right Arrow */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {projectsList.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Right Floating Arrow Button */}
          <button
            className="hidden xl:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400 items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
            aria-label="Next projects"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedProjects;

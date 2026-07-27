import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const galleryItems = [
  { id: 1, title: "Classroom Roof Repair", type: "Before", image: "https://placehold.co/400x300/1d4ed8/ffffff?text=Before+1", project: "Infrastructure" },
  { id: 2, title: "Classroom Roof Repair", type: "After", image: "https://placehold.co/400x300/059669/ffffff?text=After+1", project: "Infrastructure" },
  { id: 3, title: "Digital Blackboard", type: "Before", image: "https://placehold.co/400x300/1d4ed8/ffffff?text=Before+2", project: "Digital" },
  { id: 4, title: "Digital Blackboard", type: "After", image: "https://placehold.co/400x300/059669/ffffff?text=After+2", project: "Digital" },
  { id: 5, title: "Toilet Block", type: "Before", image: "https://placehold.co/400x300/1d4ed8/ffffff?text=Before+3", project: "Sanitation" },
  { id: 6, title: "Toilet Block", type: "After", image: "https://placehold.co/400x300/059669/ffffff?text=After+3", project: "Sanitation" },
];

const SchoolGallery = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Project Gallery</h1>
        <p className="text-slate-500 text-sm mt-1">Before & after photos of completed projects</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item) => (
          <Card key={item.id} hover className="overflow-hidden">
            <div className="relative">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3">
                <Badge variant={item.type === "After" ? "emerald" : "blue"}>{item.type}</Badge>
              </div>
            </div>
            <div className="p-4">
              <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
              <p className="text-xs text-slate-400 mt-1">{item.project}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchoolGallery;

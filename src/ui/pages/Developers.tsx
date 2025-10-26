import { useState } from "react";
import { DashboardHeader } from "@/ui/components/DashboardHeader";
import { DeveloperCard } from "@/ui/components/DeveloperCard";
import { DeveloperDetails } from "@/ui/components/DeveloperDetails";

const developers = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "Senior Frontend Developer",
    activePRs: 3,
    reviewsPending: 5,
    commitsThisWeek: 47,
    status: "active",
    strengths: ["React", "TypeScript", "UI/UX"],
    weaknesses: ["Backend integration", "Testing coverage"],
    currentWork: "User authentication refactor",
  },
  {
    id: 2,
    name: "Marcus Lee",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: "Backend Developer",
    activePRs: 2,
    reviewsPending: 1,
    commitsThisWeek: 32,
    status: "active",
    strengths: ["Node.js", "Database optimization", "API design"],
    weaknesses: ["Frontend tasks", "Documentation"],
    currentWork: "Payment service optimization",
  },
  {
    id: 3,
    name: "Ana Silva",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "Full Stack Developer",
    activePRs: 1,
    reviewsPending: 8,
    commitsThisWeek: 28,
    status: "reviewing",
    strengths: ["Code review", "Architecture", "Mentoring"],
    weaknesses: ["Time management", "Breaking down tasks"],
    currentWork: "API documentation update",
  },
  {
    id: 4,
    name: "James Park",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: "Frontend Developer",
    activePRs: 4,
    reviewsPending: 2,
    commitsThisWeek: 38,
    status: "active",
    strengths: ["CSS/Tailwind", "Animations", "Performance"],
    weaknesses: ["State management", "Complex logic"],
    currentWork: "Dashboard redesign",
  },
  {
    id: 5,
    name: "Lisa Wang",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "DevOps Engineer",
    activePRs: 1,
    reviewsPending: 0,
    commitsThisWeek: 15,
    status: "idle",
    strengths: ["CI/CD", "Docker", "AWS"],
    weaknesses: ["Application code", "Need more involvement"],
    currentWork: "Infrastructure monitoring",
  },
  {
    id: 6,
    name: "Tom Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=6",
    role: "Junior Developer",
    activePRs: 2,
    reviewsPending: 3,
    commitsThisWeek: 22,
    status: "active",
    strengths: ["Eager to learn", "Good communication", "Testing"],
    weaknesses: ["Needs more experience", "Code complexity", "Performance awareness"],
    currentWork: "Bug fixes and small features",
  },
];

const Developers = () => {
  const [selectedDeveloper, setSelectedDeveloper] = useState<typeof developers[0] | null>(null);
  const [activeTab, setActiveTab] = useState("developers");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto p-4 md:p-6 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Squad Developers</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o desempenho e atividades de cada desenvolvedor do seu squad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map((dev) => (
            <DeveloperCard
              key={dev.id}
              developer={dev}
              onClick={() => setSelectedDeveloper(dev)}
            />
          ))}
        </div>
      </main>

      {selectedDeveloper && (
        <DeveloperDetails
          developer={selectedDeveloper}
          onClose={() => setSelectedDeveloper(null)}
        />
      )}
    </div>
  );
};

export default Developers;

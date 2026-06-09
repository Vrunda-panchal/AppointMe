import { Heart, Scissors, Briefcase, Home, Building2, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Healthcare", icon: Heart, description: "Doctors, dentists, therapists & specialists", color: "text-primary" },
  { name: "Beauty", icon: Scissors, description: "Hair salons, spas, skincare & nail studios", color: "text-accent" },
  { name: "Consulting", icon: GraduationCap, description: "Business, legal, financial advisors", color: "text-primary" },
  { name: "Real Estate", icon: Home, description: "Property tours, agent meetings & appraisals", color: "text-accent" },
  { name: "Business", icon: Building2, description: "Corporate meetings, interviews & onboarding", color: "text-primary" },
  { name: "Professional", icon: Briefcase, description: "Coaching, mentoring & career services", color: "text-accent" },
];

const CategoriesSection = () => (
  <section className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Explore Categories</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Find the right professional for any need. Browse our diverse service categories.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Link
            to="/categories"
            key={cat.name}
            className="group rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary ${cat.color}`}>
              <cat.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1 font-sans">{cat.name}</h3>
            <p className="text-sm text-muted-foreground">{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;

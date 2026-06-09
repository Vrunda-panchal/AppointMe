import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Scissors, Briefcase, Home, Building2, GraduationCap, Star, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const iconMap: Record<string, React.ElementType> = {
  Heart, Scissors, GraduationCap, Home, Building2, Briefcase,
};

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*, categories(name, icon)");
      if (error) throw error;
      return data;
    },
  });

  const filteredServices = selectedCategory
    ? services.filter((s: any) => s.categories?.name === selectedCategory)
    : services;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Browse Categories</h1>
          <p className="text-muted-foreground mb-10 max-w-lg">
            Explore providers across multiple service categories and book your next appointment.
          </p>

          {/* Category filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Badge variant={selectedCategory === null ? "default" : "outline"} className="cursor-pointer px-4 py-2 text-sm" onClick={() => setSelectedCategory(null)}>All</Badge>
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon || ""] || Briefcase;
              return (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.name}
                </Badge>
              );
            })}
          </div>

          {/* Services grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No services available yet. Providers can add services after registering.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((s: any) => (
                <div key={s.id} className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs">{s.categories?.name || "Uncategorized"}</Badge>
                      <h3 className="text-lg font-semibold text-card-foreground font-sans">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">₹{s.price}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {s.duration_minutes} min
                    </div>
                  </div>
              <Button className="w-full" asChild>
                    <Link to={`/booking?service=${s.id}`}>Book Appointment</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Categories;

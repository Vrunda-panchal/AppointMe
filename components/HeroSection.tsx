import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroImage} alt="Professional team" className="h-full w-full object-cover" />
      <div className="absolute inset-0 gradient-hero" />
    </div>
    <div className="container relative z-10 py-24 md:py-36">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
          Book Appointments <br />
          <span className="text-accent">Effortlessly</span>
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-lg">
          Connect with top professionals across healthcare, beauty, consulting, real estate & more. Schedule in seconds, manage with ease.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" className="gradient-accent text-accent-foreground border-0 shadow-brand" asChild>
            <Link to="/register">
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/categories">Browse Categories</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-20">
    <div className="container">
      <div className="rounded-2xl gradient-primary p-10 md:p-16 text-center shadow-brand">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
          Whether you're a client looking to book or a provider ready to grow — AppointMe has you covered.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gradient-accent text-accent-foreground border-0" asChild>
            <Link to="/register">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/register">Join as Provider</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;

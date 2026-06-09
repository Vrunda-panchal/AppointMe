import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-secondary/50 py-12">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-serif text-foreground">AppointMe</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your one-stop platform for scheduling appointments across healthcare, beauty, consulting & more.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Categories</h4>
          <div className="space-y-2">
            {["Healthcare", "Beauty", "Consulting", "Real Estate", "Business"].map((c) => (
              <Link key={c} to="/categories" className="block text-sm text-muted-foreground hover:text-primary transition-colors">{c}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Platform</h4>
          <div className="space-y-2">
            {["How It Works", "For Providers", "Pricing", "Reviews"].map((c) => (
              <span key={c} className="block text-sm text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Support</h4>
          <div className="space-y-2">
            {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map((c) => (
              <span key={c} className="block text-sm text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 AppointMe. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

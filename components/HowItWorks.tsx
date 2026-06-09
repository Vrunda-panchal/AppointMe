import { Search, CalendarCheck, CreditCard, Star } from "lucide-react";

const steps = [
  { icon: Search, title: "Browse & Search", description: "Find the perfect provider in your category" },
  { icon: CalendarCheck, title: "Pick a Time", description: "Choose an available slot that fits your schedule" },
  { icon: CreditCard, title: "Confirm & Pay", description: "Secure your appointment with easy payment" },
  { icon: Star, title: "Rate & Review", description: "Share your experience to help others" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 bg-secondary/50">
    <div className="container">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to your next appointment.</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="relative text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-brand">
              <step.icon className="h-7 w-7" />
            </div>
            <div className="absolute top-8 left-[60%] right-0 hidden lg:block border-t-2 border-dashed border-border" style={{ display: i === steps.length - 1 ? "none" : undefined }} />
            <span className="text-xs font-bold text-primary mb-2 block">STEP {i + 1}</span>
            <h3 className="text-lg font-semibold text-foreground mb-1 font-sans">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

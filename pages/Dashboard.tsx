import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-purple-100 text-purple-800",
  failed: "bg-red-100 text-red-800",
};

const Dashboard = () => {
  const { user, profile, isLoading, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  const { data: appointments = [] } = useQuery({
    queryKey: ["my-appointments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, services(name, price, duration_minutes, categories(name)), payments(*)")
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upcoming = appointments.filter((a: any) => a.status === "confirmed" || a.status === "pending");
  const past = appointments.filter((a: any) => a.status === "completed" || a.status === "cancelled");

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return null;

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name || "User"}</p>
            <div className="flex gap-2 mt-2">
              {roles.map((r) => (
                <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>
              ))}
            </div>
          </div>
          <Button asChild>
            <Link to="/categories">Book New Appointment</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold text-primary">{upcoming.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-foreground">{past.filter((a: any) => a.status === "completed").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-foreground">{past.filter((a: any) => a.status === "cancelled").length}</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Appointments</h2>
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No upcoming appointments</p>
              <Button className="mt-3" size="sm" asChild><Link to="/categories">Browse Services</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((a: any) => (
                <div key={a.id} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{a.services?.name || "Service"}</h3>
                    <p className="text-sm text-muted-foreground">{a.services?.categories?.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {a.appointment_date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTime(a.start_time)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">${a.services?.price}</span>
                    <Badge className={statusColors[a.status] || ""}>
                      {a.status}
                    </Badge>
                    {a.payments?.[0] && (
                      <Badge className={paymentStatusColors[a.payments[0].status] || ""}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        {a.payments[0].status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Appointments */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Past Appointments</h2>
          {past.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No past appointments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {past.map((a: any) => (
                <div key={a.id} className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-80">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{a.services?.name || "Service"}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {a.appointment_date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTime(a.start_time)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">${a.services?.price}</span>
                    <Badge className={statusColors[a.status] || ""}>
                      {a.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

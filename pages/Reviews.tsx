import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Reviews = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointment");
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  // Fetch the appointment to review (if appointmentId is provided)
  const { data: appointment } = useQuery({
    queryKey: ["review-appointment", appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, services(name, price, categories(name))")
        .eq("id", appointmentId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!appointmentId && !!user,
  });

  // Check if already reviewed
  const { data: existingReview } = useQuery({
    queryKey: ["existing-review", appointmentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("appointment_id", appointmentId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!appointmentId && !!user,
  });

  // Fetch all reviews by the current user
  const { data: myReviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, appointments(appointment_date, services(name, categories(name)))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch completed appointments without reviews (for "review pending" list)
  const { data: pendingReviews = [] } = useQuery({
    queryKey: ["pending-reviews", user?.id],
    queryFn: async () => {
      const { data: completed, error } = await supabase
        .from("appointments")
        .select("*, services(name, categories(name))")
        .eq("user_id", user!.id)
        .eq("status", "completed");
      if (error) throw error;

      const { data: reviewed } = await supabase
        .from("reviews")
        .select("appointment_id")
        .eq("user_id", user!.id);

      const reviewedIds = new Set(reviewed?.map((r) => r.appointment_id) || []);
      return (completed || []).filter((a) => !reviewedIds.has(a.id));
    },
    enabled: !!user,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!appointment || !user) throw new Error("Missing data");
      const { error } = await supabase.from("reviews").insert({
        appointment_id: appointment.id,
        user_id: user.id,
        provider_id: appointment.provider_id,
        rating,
        comment: comment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["existing-review", appointmentId] });
      navigate("/reviews");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) { navigate("/login"); return null; }

  const renderStars = (count: number, size = "h-5 w-5") =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${size} ${i < count ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
    ));

  // Review form view
  if (appointmentId && appointment) {
    if (existingReview) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container py-20 text-center max-w-md mx-auto space-y-4">
            <MessageSquare className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Already Reviewed</h1>
            <p className="text-muted-foreground">You've already left a review for this appointment.</p>
            <div className="flex justify-center gap-1">{renderStars(existingReview.rating)}</div>
            {existingReview.comment && <p className="text-sm text-muted-foreground italic">"{existingReview.comment}"</p>}
            <Button onClick={() => navigate("/reviews")}>View All Reviews</Button>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 max-w-lg mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave a Review</h1>
            <p className="text-muted-foreground mt-1">Share your experience</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-foreground">{(appointment as any).services?.name}</h3>
            <Badge variant="secondary">{(appointment as any).services?.categories?.name}</Badge>
            <p className="text-sm text-muted-foreground">Date: {appointment.appointment_date}</p>
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`h-8 w-8 ${i < (hoveredRating || rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/reviews")}>Cancel</Button>
            <Button onClick={() => submitReview.mutate()} disabled={rating === 0 || submitReview.isPending}>
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Reviews listing view
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16 max-w-2xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Reviews</h1>
          <p className="text-muted-foreground mt-1">Your feedback and pending reviews</p>
        </div>

        {/* Pending reviews */}
        {pendingReviews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Pending Reviews</h2>
            {pendingReviews.map((a: any) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{a.services?.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.services?.categories?.name} · {a.appointment_date}</p>
                </div>
                <Button size="sm" onClick={() => navigate(`/reviews?appointment=${a.id}`)}>
                  Leave Review
                </Button>
              </div>
            ))}
          </section>
        )}

        {/* Past reviews */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Your Reviews</h2>
          {myReviews.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No reviews yet. Complete an appointment to leave a review!</p>
            </div>
          ) : (
            myReviews.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{r.appointments?.services?.name || "Service"}</h3>
                  <div className="flex gap-0.5">{renderStars(r.rating, "h-4 w-4")}</div>
                </div>
                <p className="text-sm text-muted-foreground">{r.appointments?.services?.categories?.name} · {r.appointments?.appointment_date}</p>
                {r.comment && <p className="text-sm text-foreground mt-1">"{r.comment}"</p>}
              </div>
            ))
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Reviews;

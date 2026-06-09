import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, CreditCard, CheckCircle2, QrCode, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const Booking = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "online">("card");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [qrCheckoutUrl, setQrCheckoutUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const { data: service } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data, error } = await supabase.from("services").select("*, categories(name)").eq("id", serviceId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["all-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*, categories(name)");
      if (error) throw error;
      return data;
    },
    enabled: !serviceId,
  });

  const activeService = service || services[0];

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to book.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!activeService) return;

    setLoading(true);
    const endMinutes = parseInt(selectedTime.split(":")[0]) * 60 + parseInt(selectedTime.split(":")[1]) + (activeService.duration_minutes || 30);
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    const { data: appointment, error: apptError } = await supabase.from("appointments").insert({
      user_id: user.id,
      provider_id: activeService.provider_id,
      service_id: activeService.id,
      appointment_date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      notes: notes || null,
      status: "confirmed",
    }).select().single();

    if (apptError) {
      toast({ title: "Booking failed", description: apptError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create payment record
    await supabase.from("payments").insert({
      appointment_id: appointment.id,
      user_id: user.id,
      amount: activeService.price,
      method: paymentMethod,
      status: paymentMethod === "cash" ? "pending" : "pending", // Will be updated after Stripe payment
    });

    // For card or QR code, create Stripe Checkout session
    if (paymentMethod === "card" || paymentMethod === "online") {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          serviceName: activeService.name,
          amount: activeService.price,
          appointmentId: appointment.id,
          paymentMethod,
        },
      });

      if (error || !data?.url) {
        toast({ title: "Payment error", description: error?.message || "Could not create checkout session", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (paymentMethod === "online") {
        // Show QR code modal with the checkout URL
        setQrCheckoutUrl(data.url);
        setShowQrModal(true);
        setLoading(false);
        return;
      }

      // Card: redirect directly to Stripe Checkout
      window.location.href = data.url;
      return;
    }

    // Cash payment - show confirmation directly
    setBookedAppointment(appointment);
    setLoading(false);
    setStep(4);
  };

  if (!serviceId && services.length === 0 && !activeService) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">No services available. Browse categories first.</p>
          <Button className="mt-4" onClick={() => navigate("/categories")}>Browse Categories</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Appointment Confirmed!</h1>
            <p className="text-muted-foreground">Your appointment for <strong>{activeService?.name}</strong> has been booked successfully.</p>
            <div className="rounded-xl border border-border bg-card p-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant="secondary" className="text-xs">
                  {paymentMethod === "card" ? "Card - Paid" : paymentMethod === "online" ? "QR Code - Paid" : "Cash - Pay at visit"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-success text-success-foreground text-xs">Confirmed</Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>View History</Button>
              <Button className="flex-1" onClick={() => { setStep(1); setSelectedDate(""); setSelectedTime(""); }}>Book Another</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Service info sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground font-sans">{activeService?.name || "Loading..."}</h3>
              <Badge variant="secondary">{(activeService as any)?.categories?.name || "Service"}</Badge>
              <p className="text-sm text-muted-foreground">{activeService?.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {activeService?.duration_minutes} minutes
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-bold text-primary text-lg">₹{activeService?.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Steps indicator */}
            <div className="flex items-center gap-4">
              {[
                { num: 1, label: "Date & Time", icon: Calendar },
                { num: 2, label: "Details", icon: Clock },
                { num: 3, label: "Payment", icon: CreditCard },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= s.num ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                  {i < 2 && <div className="w-8 border-t border-border" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Select Date & Time</h2>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {timeSlots.map((t) => (
                      <button key={t} onClick={() => setSelectedTime(t)} className={`rounded-lg border py-2 text-sm font-medium transition-all ${selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary/40"}`}>
                        {formatTime(t)}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="lg" onClick={() => setStep(2)} disabled={!selectedTime || !selectedDate}>Continue</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Additional Details</h2>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input placeholder="Any special requirements..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button size="lg" onClick={() => setStep(3)}>Continue to Payment</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Payment</h2>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setPaymentMethod("card")} className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`}>Card</span>
                  </button>
                  <button onClick={() => setPaymentMethod("online")} className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <QrCode className={`h-5 w-5 ${paymentMethod === "online" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${paymentMethod === "online" ? "text-primary" : "text-muted-foreground"}`}>QR Code</span>
                  </button>
                  <button onClick={() => setPaymentMethod("cash")} className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <span className={`text-lg ${paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"}`}>💵</span>
                    <span className={`text-sm font-medium ${paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"}`}>Cash</span>
                  </button>
                </div>

                <div className="rounded-xl border border-border bg-secondary/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-foreground">₹{activeService?.price?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">₹{activeService?.price?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button size="lg" className="gradient-accent text-accent-foreground border-0" onClick={handleConfirmBooking} disabled={loading}>
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Scan to Pay</DialogTitle>
            <DialogDescription className="text-center">
              Scan this QR code with your phone to complete the payment of <strong>₹{activeService?.price?.toFixed(2)}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {qrCheckoutUrl && (
              <div className="rounded-xl border-2 border-border bg-white p-4">
                <QRCodeSVG value={qrCheckoutUrl} size={220} level="H" />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              After scanning, you'll be taken to a secure Stripe checkout page to complete your payment.
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setShowQrModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => { if (qrCheckoutUrl) window.open(qrCheckoutUrl, "_blank"); }}>
                Open Link Instead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Booking;

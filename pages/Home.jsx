import { useEffect, useState } from "react";
import API from "../api/api";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(()=>{
    API.get("/categories").then(res=>setCategories(res.data));
  },[]);

  const loadProviders = async (id) => {
    const res = await API.get(`/providers?category=${id}`);
    setProviders(res.data);
  };

  const book = async () => {
    await API.post("/appointments/book", {
      provider_id: selectedService.provider_id,
      service_id: selectedService.service_id,
      appointment_date: "2026-03-10",
      appointment_time: "10:00:00",
      payment_method: paymentMethod
    });
    alert("Appointment booked & payment processed");
  };

  return (
    <div className="content">
      <h2>Categories</h2>

      {categories.map(c=>(
        <div className="card" key={c.category_id}>
          <h3>{c.category_name}</h3>
          <button className="primary"
            onClick={()=>loadProviders(c.category_id)}>
            Book Now
          </button>
        </div>
      ))}

      {providers.map(p=>(
        <div key={p.provider_id} className="card">
          <h4>{p.full_name}</h4>
          <button className="primary"
            onClick={()=>setSelectedService(p)}>
            Select Service
          </button>
        </div>
      ))}

      {selectedService && (
        <div className="card">
          <h4>Select Payment Method</h4>
          <select onChange={e=>setPaymentMethod(e.target.value)}>
            <option>UPI</option>
            <option>Card</option>
            <option>Net Banking</option>
          </select>
          <button className="primary" onClick={book}>
            Confirm & Pay
          </button>
        </div>
      )}
    </div>
  );
}
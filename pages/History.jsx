import { useEffect, useState } from "react";
import API from "../api/api";

export default function History(){
  const [appointments,setAppointments]=useState([]);

  useEffect(()=>{
    API.get("/appointments/customer")
      .then(res=>setAppointments(res.data));
  },[]);

  return(
    <div className="content">
      <h2>Past Appointments</h2>
      {appointments.map(a=>(
        <div className="card" key={a.appointment_id}>
          <p>{a.service_name}</p>
          <p>Status: {a.status}</p>
          <p>Payment: {a.payment_status}</p>
        </div>
      ))}
    </div>
  );
}
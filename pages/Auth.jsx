import { useState } from "react";
import API from "../api/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({});

  const submit = async () => {
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await API.post(endpoint, { ...form, role });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        window.location.href = "/";
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Error occurred");
    }
  };

  return (
    <div style={{padding:40}}>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {!isLogin && (
        <>
          <input placeholder="Full Name"
            onChange={e=>setForm({...form, full_name:e.target.value})}/>
          <input placeholder="Phone"
            onChange={e=>setForm({...form, phone_number:e.target.value})}/>
        </>
      )}

      <input placeholder="Email"
        onChange={e=>setForm({...form, email:e.target.value})}/>
      <input type="password" placeholder="Password"
        onChange={e=>setForm({...form, password:e.target.value})}/>

      {!isLogin && (
        <select onChange={e=>setRole(e.target.value)}>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
        </select>
      )}

      <button className="primary" onClick={submit}>
        {isLogin ? "Login" : "Register"}
      </button>

      <p onClick={()=>setIsLogin(!isLogin)} style={{cursor:"pointer"}}>
        {isLogin ? "Create account" : "Already have account?"}
      </p>
    </div>
  );
}
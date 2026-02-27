import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>AppointMe</h2>
      <button onClick={()=>navigate("/")}>Home</button>
      <button onClick={()=>navigate("/history")}>Past History</button>
      <button onClick={()=>navigate("/profile")}>Profile</button>
      <button onClick={()=>navigate("/reviews")}>Reviews</button>
      <button onClick={()=>{
        localStorage.clear();
        navigate("/auth");
      }}>Logout</button>
    </div>
  );
}
import { useState } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState("Not Tested");

  const testBackend = async () => {
    setStatus("Testing...");
    try {
      // Calling your backend root route: app.get("/", ...)
      const response = await fetch('http://localhost:5000/'); 
      const data = await response.text();
      setStatus(`Success: ${data}`);
    } catch (err) {
      console.error("DETAILED ERROR:", err);
      setStatus("Failed: Check Browser Console (F12)");
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>AppointMe Connection Test</h1>
      <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <p>Backend Status: <strong>{status}</strong></p>
        <button onClick={testBackend} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Test Connection to Port 5000
        </button>
      </div>
      <p>Ensure <code>server.js</code> is running in your terminal!</p>
    </div>
  );
}

export default App;
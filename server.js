require("dotenv").config();

const verifyToken = require("./middleware/authMiddleware");
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const providerRoutes = require("./routes/providerRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const express = require("express");
const cors = require("cors");
const createTables = require("./models/tables");
require("./config/db");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "You accessed protected route successfully 🔐",
    user: req.user
  });
});

app.get("/", (req, res) => {
  res.send("🚀 AppointMe Backend Running Successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createTables();
});
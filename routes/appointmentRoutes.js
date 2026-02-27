const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const appointmentController = require("../controllers/appointmentController");  // ✅ ADD THIS

// Routes
router.get("/customer", verifyToken, appointmentController.getCustomerAppointments);
router.get("/provider", verifyToken, appointmentController.getProviderAppointments);
router.put("/:id/status", verifyToken, appointmentController.updateAppointmentStatus);

module.exports = router;
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const serviceController = require("../controllers/serviceController");

router.post("/create", verifyToken, serviceController.createService);
router.get("/all", serviceController.getServices);
router.get("/provider/:id", serviceController.getServicesByProvider);

module.exports = router;
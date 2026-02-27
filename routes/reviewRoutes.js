const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

router.post("/", verifyToken, reviewController.addReview);
router.get("/:provider_id", reviewController.getProviderReviews);

module.exports = router;
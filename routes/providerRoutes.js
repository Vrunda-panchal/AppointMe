const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");

router.get("/", providerController.getProviders);

module.exports = router;
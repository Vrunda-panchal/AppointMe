const db = require("../config/db");

// Add new service
exports.createService = (req, res) => {
  const { service_name, description, price } = req.body;
  const userId = req.user.id;

  // First get provider_id from providers table
  db.query(
    "SELECT provider_id FROM providers WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(400).json({ message: "Provider profile not found" });
      }

      const providerId = result[0].provider_id;

      db.query(
        "INSERT INTO services (provider_id, service_name, description, price) VALUES (?, ?, ?, ?)",
        [providerId, service_name, description, price],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.status(201).json({
            message: "Service created successfully"
          });
        }
      );
    }
  );
};

// Get all services
exports.getServices = (req, res) => {
  db.query("SELECT * FROM services", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getServicesByProvider = (req, res) => {
  const providerId = req.params.id;

  db.query(
    "SELECT * FROM services WHERE provider_id = ?",
    [providerId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(200).json(result);
    }
  );
};
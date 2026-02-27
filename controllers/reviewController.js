const db = require("../config/db");

exports.addReview = (req, res) => {
  const { provider_id, rating, comment } = req.body;
  const userId = req.user.id;

  db.query(
    "SELECT customer_id FROM customers WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (result.length === 0) {
        return res.status(400).json({ message: "Customer profile not found" });
      }

      const customerId = result[0].customer_id;

      db.query(
        "INSERT INTO reviews (customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?)",
        [customerId, provider_id, rating, comment],
        (err2) => {
          if (err2) return res.status(500).json(err2);
          res.status(201).json({ message: "Review added successfully" });
        }
      );
    }
  );
};

exports.getProviderReviews = (req, res) => {
  const providerId = req.params.provider_id;

  const query = `
    SELECT r.*, u.full_name
    FROM reviews r
    JOIN customers c ON r.customer_id = c.customer_id
    JOIN users u ON c.user_id = u.user_id
    WHERE r.provider_id = ?
  `;

  db.query(query, [providerId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};
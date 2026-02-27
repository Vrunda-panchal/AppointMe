const db = require("../config/db");

exports.getProviders = (req, res) => {
  const { category, state, city } = req.query;

  let query = `
    SELECT p.*, u.full_name, c.category_name
    FROM providers p
    JOIN users u ON p.user_id = u.user_id
    JOIN categories c ON p.category_id = c.category_id
    WHERE 1=1
  `;

  const values = [];

  if (category) {
    query += " AND p.category_id = ?";
    values.push(category);
  }

  if (state) {
    query += " AND p.state = ?";
    values.push(state);
  }

  if (city) {
    query += " AND p.city = ?";
    values.push(city);
  }

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};
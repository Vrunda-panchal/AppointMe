const db = require("../config/db");

exports.getCategories = (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};
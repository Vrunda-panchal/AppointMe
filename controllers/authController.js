const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { full_name, phone_number, email, password, role } = req.body;

    if (!full_name || !phone_number || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ? OR phone_number = ?",
      [email, phone_number],
      async (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || "customer";

        // Insert into users table
        db.query(
          "INSERT INTO users (full_name, phone_number, email, password, role) VALUES (?, ?, ?, ?, ?)",
          [full_name, phone_number, email, hashedPassword, userRole],
          (err2, result2) => {
            if (err2) return res.status(500).json(err2);

            const userId = result2.insertId;

            // If Customer
            if (userRole === "customer") {
              db.query(
                "INSERT INTO customers (user_id) VALUES (?)",
                [userId],
                (err3) => {
                  if (err3) return res.status(500).json(err3);

                  return res.status(201).json({
                    message: "Customer registered successfully"
                  });
                }
              );
            }

            // If Provider
            else if (userRole === "provider") {
              db.query(
                "INSERT INTO providers (user_id, business_type, address) VALUES (?, ?, ?)",
                [userId, "General Service", "Default Address"],
                (err4) => {
                  if (err4) return res.status(500).json(err4);

                  return res.status(201).json({
                    message: "Provider registered successfully"
                  });
                }
              );
            }
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

// ================= LOGIN =================
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        role: user.role
      });
    }
  );
};
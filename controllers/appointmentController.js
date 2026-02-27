const db = require("../config/db");

// Book appointment
exports.bookAppointment = (req, res) => {
  const {
    provider_id,
    service_id,
    appointment_date,
    appointment_time,
    payment_method
  } = req.body;

  const userId = req.user.id;

  db.query(
    "SELECT customer_id FROM customers WHERE user_id = ?",
    [userId],
    (err, result) => {
      const customerId = result[0].customer_id;

      db.query(
        `INSERT INTO appointments
         (customer_id, provider_id, service_id,
          appointment_date, appointment_time,
          payment_status, status)
         VALUES (?, ?, ?, ?, ?, 'paid', 'pending')`,
        [customerId, provider_id, service_id,
         appointment_date, appointment_time],
        (err2)=>{
          if(err2) return res.status(500).json(err2);
          res.json({message:"Booked successfully"});
        }
      );
    }
  );
};

exports.getCustomerAppointments = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT a.*, s.service_name, u.full_name AS provider_name
    FROM appointments a
    JOIN services s ON a.service_id = s.service_id
    JOIN providers p ON a.provider_id = p.provider_id
    JOIN users u ON p.user_id = u.user_id
    JOIN customers c ON a.customer_id = c.customer_id
    WHERE c.user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};

exports.getProviderAppointments = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT a.*, s.service_name, u.full_name AS customer_name
    FROM appointments a
    JOIN services s ON a.service_id = s.service_id
    JOIN customers c ON a.customer_id = c.customer_id
    JOIN users u ON c.user_id = u.user_id
    JOIN providers p ON a.provider_id = p.provider_id
    WHERE p.user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};

exports.updateAppointmentStatus = (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  db.query(
    "UPDATE appointments SET status = ? WHERE appointment_id = ?",
    [status, appointmentId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status updated successfully" });
    }
  );
};
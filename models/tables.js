const db = require("../config/db");

const createTables = () => {
  // USERS TABLE
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      full_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(15) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','customer','provider') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // PROVIDERS TABLE
  db.query(`
    CREATE TABLE IF NOT EXISTS providers (
      provider_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      business_type VARCHAR(100) NOT NULL,
      address VARCHAR(255),
      rating DECIMAL(2,1) DEFAULT 0.0,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // CUSTOMERS TABLE
  db.query(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      date_of_birth DATE,
      gender ENUM('male','female','other'),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  // SERVICES TABLE
  db.query(`
    CREATE TABLE IF NOT EXISTS services (
      service_id INT PRIMARY KEY AUTO_INCREMENT,
      provider_id INT NOT NULL,
      service_name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (provider_id) REFERENCES providers(provider_id) ON DELETE CASCADE
    )
  `);

  // APPOINTMENTS TABLE
  db.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      appointment_id INT PRIMARY KEY AUTO_INCREMENT,
      customer_id INT NOT NULL,
      provider_id INT NOT NULL,
      service_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (provider_id) REFERENCES providers(provider_id),
      FOREIGN KEY (service_id) REFERENCES services(service_id)
    )
  `);

  console.log("📦 Tables Checked/Created Successfully");
};

module.exports = createTables;
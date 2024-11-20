const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql2"); // MySQL package

const app = express();

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change to your MySQL username
  password: "", // Change to your MySQL password
  database: "de351", // Name of your database
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Could not connect to MySQL:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL");
  }
});

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend URL
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Middleware for parsing JSON
app.use(bodyParser.json());

// Routes
// Handle Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists in the database
  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0]; // Assuming only one user with the same email

    // Compare the password with the stored hash
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      console.log('login success')
      return res.status(200).json({ message: "Login successful!", user });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

// Handle Signup
app.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validate input fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check if the user already exists in the database
  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const query = "INSERT INTO user ( firstname, lastname,email, password) VALUES (?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, hashedPassword], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(201).json({ message: "Signup successful!", user: { firstName, lastName, email } });
    });
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

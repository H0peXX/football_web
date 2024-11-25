const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql2"); // MySQL package
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// setup
app.use(cookieParser());
app.use(bodyParser.json());
  


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure the cookie is only secure in production (HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Use SameSite=None in production (HTTPS), otherwise Lax
  }
}));




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
app.use(cors({
  origin: ["http://localhost:3000"], // React frontend URL
  methods: ["GET", "POST", "PUT"],
  credentials: true,
}));

// Middleware for parsing JSON
app.use(bodyParser.json());

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required!" });
  }

  db.query("SELECT * FROM user WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.email = user.email; // Store the username in the session
        console.log("Session username:", req.session.email);
        
        return res.status(200).json({ message: "Login successful!", user });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("Error during password comparison:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validate input fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check if the user already exists
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
    const query = "INSERT INTO user (firstname, lastname, email, password) VALUES (?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, hashedPassword], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      return res.status(201).json({ message: "Signup successful!" });
    });
  });
});

app.get('/', (req, res) => {
  if (req.session.email) {
    return res.json({ valid: true, email: req.session.email })
  } else {
    return res.json({ valid: false })
  }
})


//logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    return res.status(200).json({ message: "Logout successful!" });
  });
});

//get data for players
app.get('/players', (req, res) => {
  const query = "SELECT * FROM user WHERE role = 'User'";

  db.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching players:", err);
          return res.status(500).json({ message: "Error fetching players" });
      }
      console.log("Database results:", results);
      return res.status(200).json(results);
  });
});

//get data for each player
app.get('/players/:email', (req, res) => {
  const { email } = req.params;
  const query = "SELECT * FROM user WHERE email = ?";

  db.query(query, [email], (err, results) => {
      if (err) {
          console.error("Error fetching player by email:", err);
          return res.status(500).json({ message: "Error fetching player details" });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: "Player not found" });
      }

      return res.status(200).json(results[0]);
  });
});

// Update Player by email
app.put('/players/:email', (req, res) => {
  const { email } = req.params;
  const { firstName, lastName, role, imageUrl } = req.body;

  const query = `UPDATE user SET firstname = ?, lastname = ?, role = ?, image = ? WHERE email = ?`;
  db.query(query, [firstName, lastName, role, imageUrl, email], (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal server error" });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Player not found" });
      }

      res.json({ message: "Player updated successfully!" });
  });
});

// Delete Player by email
app.delete('/players/:email', (req, res) => {
  const { email } = req.params;

  const query = `DELETE FROM user WHERE email = ?`;
  db.query(query, [email], (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal server error" });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Player not found" });
      }

      res.json({ message: "Player deleted successfully!" });
  });
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

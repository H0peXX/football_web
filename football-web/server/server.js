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
  methods: ["GET", "POST", "PUT", "DELETE"],
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
        req.session.role = user.role;
        console.log("Session username:", req.session.email,", role: ",req.session.role);
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
  const { email, password, firstName, lastName , position , profilePicture } = req.body;

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

  // Define the default role
  const defaultRole = 'user'; // Adjust this as needed

  // Insert the new user into the database
  const query = "INSERT INTO user (firstname, lastname, email, password, position, role, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [firstName, lastName, email, hashedPassword, position, defaultRole, profilePicture], (err) => {
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
    return res.json({ valid: true, email: req.session.email ,role: req.session.role})
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
  const { firstName, lastName, position, imageUrl } = req.body;

  const query = `UPDATE user SET firstname = ?, lastname = ?, position = ?, image = ? WHERE email = ?`;
  db.query(query, [firstName, lastName, position, imageUrl, email], (err, results) => {
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

//get comment
app.get('/comments/:playerEmail', (req, res) => {
  const { playerEmail } = req.params;
  db.query(
    'SELECT * FROM comments WHERE player_email = ? ORDER BY created_at DESC',
    [playerEmail],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch comments' });
      }
      res.json(results);
    }
  );
});

//post comment
app.post('/comments', (req, res) => {
  const { email, playerEmail, comment } = req.body;

  if (!email || !playerEmail || !comment) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  db.query(
    'INSERT INTO comments (email, player_email, comment) VALUES (?, ?, ?)',
    [email, playerEmail, comment],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to post comment' });
      }
      res.status(201).json({ message: 'Comment added successfully' });
    }
  );
});

//edit comment
app.put('/comments/:id', (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  // Logic to update comment in database
  db.query(
    'UPDATE comments SET comment = ? WHERE id = ?',
    [comment, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ id, comment });
      }
    }
  );
});

//delete comment
app.delete('/comments/:id', (req, res) => {
  const { id } = req.params;

  // Logic to delete the comment from the database
  db.query('DELETE FROM comments WHERE id = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json({ success: true });
    }
  });
});

//send offer
app.post('/offers', (req, res) => {
  const { senderEmail, receiverEmail, message } = req.body;

  if (!senderEmail || !receiverEmail || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Example of inserting into a database
  db.query(
    'INSERT INTO offers (senderEmail, receiverEmail, message) VALUES (?, ?, ?)',
    [senderEmail, receiverEmail, message],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to send offer' });
      }
      res.status(200).json({ success: true, });
    }
  );
});

//view sent offer
app.get('/offers/sent/:email', (req, res) => {
  const senderEmail = req.params.email;

  db.query(
    'SELECT * FROM offers WHERE senderEmail = ? ORDER BY created_at DESC',
    [senderEmail],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch sent offers' });
      }
      res.status(200).json(results);
    }
  );
});

//edit sent offer
app.put('/offers/:id', (req, res) => {
  const offerId = req.params.id;
  const { message } = req.body;

  db.query(
    'UPDATE offers SET message = ? WHERE id = ?',
    [message, offerId],
    (err, result) => {
      if (err) {
        console.error('Failed to update offer:', err);
        return res.status(500).json({ error: 'Failed to update offer' });
      }

      res.status(200).json({ message: 'Offer updated successfully' });
    }
  );
});

//delete sent offer
app.delete('/offers/:id', (req, res) => {
  const offerId = req.params.id;

  db.query('DELETE FROM offers WHERE id = ?', [offerId], (err, result) => {
    if (err) {
      console.error('Failed to delete offer:', err);
      return res.status(500).json({ error: 'Failed to delete offer' });
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Offer deleted successfully' });
    } else {
      res.status(404).json({ error: 'Offer not found' });
    }
  });
});

//view retrieve offer
app.get('/offers/player/:email', (req, res) => {
  const playerEmail = decodeURIComponent(req.params.email);

  const query = `SELECT * FROM offers WHERE receiverEmail = ? AND status = 'pending'`;
  db.query(query, [playerEmail], (err, results) => {
    if (err) {
      console.error('Error fetching offers:', err);
      res.status(500).json({ error: 'Failed to fetch offers' });
      return;
    }
    res.json(results);
  });
});

// Accept offer
app.put('/offers/:id/accept', (req, res) => {
  const offerId = req.params.id;

  const query = `UPDATE offers SET status = 'accepted' WHERE id = ?`;
  db.query(query, [offerId], (err, result) => {
    if (err) {
      console.error('Error accepting offer:', err);
      return res.status(500).json({ error: 'Failed to accept offer' });
    }
    res.json({ message: 'Offer accepted successfully' });
  });
});

//Reject offer
app.put('/offers/:id/reject', (req, res) => {
  const offerId = req.params.id;

  const query = `UPDATE offers SET status = 'rejected' WHERE id = ?`;
  db.query(query, [offerId], (err, result) => {
    if (err) {
      console.error('Error rejecting offer:', err);
      return res.status(500).json({ error: 'Failed to reject offer' });
    }
    res.json({ message: 'Offer rejected successfully' });
  });
});

//fetch sign
app.get('/offers/signed/:email', (req, res) => {
  const playerEmail = req.params.email;

  const query = `
     SELECT * 
FROM offers
WHERE receiverEmail = ? AND status = 'accepted'
ORDER BY created_at DESC
LIMIT 1;

  `;

  db.query(query, [playerEmail], (err, result) => {
    if (err) {
      console.error('Error fetching signed offer:', err);
      return res.status(500).json({ error: 'Failed to fetch signed offer' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'No signed offer found for this player' });
    }

    res.json(result[0]);
  });
});

//fetch news
app.get('/offers/latest', (req, res) => {
  const query = `
      SELECT o.id, o.senderEmail, o.receiverEmail, o.message, o.status, o.created_at, u.firstname, u.lastname
      FROM offers o
      JOIN user u ON o.receiverEmail = u.email
      WHERE o.status = 'accepted'
      ORDER BY o.created_at DESC
      LIMIT 5
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching latest offers:', err);
      return res.status(500).json({ error: 'Failed to fetch latest offers' });
    }

    res.json(results);
  });
});

//get transfer comment
app.get('/offers/:id/comments', (req, res) => {
  const offerId = req.params.id;

  const query = `SELECT * FROM comments_transfer WHERE offer_id = ? ORDER BY created_at ASC`;
  db.query(query, [offerId], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json(results);
  });
});

//add transfer comment
app.post('/offers/:id/comments', (req, res) => {
  const offerId = req.params.id;
  const { comment, user_email } = req.body;

  const query = `INSERT INTO comments_transfer (offer_id, comment, user_email, created_at) VALUES (?, ?, ?, NOW())`;
  db.query(query, [offerId, comment, user_email], (err, result) => {
    if (err) {
      console.error('Error adding comment:', err);
      return res.status(500).json({ error: 'Failed to add comment' });
    }
    res.json({ message: 'Comment added successfully', commentId: result.insertId });
  });
});

//update transfer comment
app.put('/offers/:offerId/comments/:commentId', (req, res) => {
  const { offerId, commentId } = req.params;
  const { comment } = req.body;

  const query = 'UPDATE comments_transfer SET comment = ? WHERE id = ? AND offer_id = ?';
  db.query(query, [comment, commentId, offerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating comment');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Comment not found');
    }

    res.send('Comment updated successfully');
  });
});

//delete trasfer comment
app.delete('/offers/:offerId/comments/:commentId', (req, res) => {
  const { offerId, commentId } = req.params;

  const query = 'DELETE FROM comments_transfer WHERE id = ? AND offer_id = ?';
  db.query(query, [commentId, offerId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting comment');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Comment not found');
    }

    res.send('Comment deleted successfully');
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/", {
          method: "GET",
          credentials: "include", // Include session cookies
        });
        const data = await response.json();
        setIsLoggedIn(data.valid); // Set login status based on server response
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsLoggedIn(false); // Update login status
        alert("Logout successful!");
        navigate("/login"); // Redirect to login page
      } else {
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred during logout.");
    }
  };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Home
          </NavLink>
        </li>
        {!isLoggedIn && (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Signup
              </NavLink>
            </li>
          </>
        )}
        {isLoggedIn && (
          <li>
            <button onClick={handleLogout} className="nav-link logout-button">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("")
  useEffect(() => {
    fetch("http://localhost:5000", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setName(data.email);
          setRole(data.role);
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, [navigate]);
  // Check if the user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/", {
          method: "GET",
          credentials: "include", // Include session cookies
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.valid || false); // Safely check login status
        } else {
          console.error("Failed to verify login status.");
        }
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
            to="/home"
            end
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/players"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Playerlisting
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/offers/sent"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Sentoffer
          </NavLink>
        </li>
        {!isLoggedIn ? (
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
        ) : (
          <>
            <li>
              <NavLink
                to="/players"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Playerlisting
              </NavLink>
            </li>
            {role === "coach" && (
              <li>
                <NavLink
                  to="/offers/sent"
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  Sentoffer
                </NavLink>
              </li>
            )}

            <li>
              <span
                onClick={handleLogout}
                className="nav-link logout-link"
                role="button"
                tabIndex="0"
              >
                Logout
              </span>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;

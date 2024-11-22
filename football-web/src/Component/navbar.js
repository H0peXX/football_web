import React from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css'; // Optional: For adding some custom styling

function NavBar() {
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
      </ul>
    </nav>
  );
}

export default NavBar;

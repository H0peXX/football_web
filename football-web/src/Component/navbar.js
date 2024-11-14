// Component/Navigation/NavBar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './navbar.css'; // Optional: For adding some custom styling

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink to="/" end className="nav-link" activeClassName="active">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className="nav-link" activeClassName="active">
            Login
          </NavLink>
        </li>
        <li>
          <NavLink to="/signup" className="nav-link" activeClassName="active">
            Signup
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
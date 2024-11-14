// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Component/Home/HomePage';
import LoginSignup from './Component/LoginSignup/LoginSignup';

function App() {
  console.log("App component is rendering");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginSignup action="Login" />} />
        <Route path="/signup" element={<LoginSignup action="Sign Up" />} />
      </Routes>
    </Router>
  );
}

export default App;

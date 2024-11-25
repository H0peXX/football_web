// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Component/Home/HomePage';
import LoginSignup from './Component/LoginSignup/LoginSignup';
import NavBar from './Component/navbar';
import ForumPage from './Component/forumpage';
import ThreadPage from './Component/threadpage';

function App() {
  console.log("App component is rendering");
  const [threads, setThreads] = useState([]); // Manage all threads

  return (
    
    <Router> {/* Wrap your Routes with Router */}
    <NavBar />
      <Routes>
        <Route path="/" element={<ForumPage threads={threads} setThreads={setThreads}/>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginSignup action="Login"/>} />
        <Route path="/signup" element={<LoginSignup action="Sign Up"/>} />
        <Route
          path="/thread/:threadId"
          element={<ThreadPage threads={threads}/>}
        />
      </Routes>
    </Router>
  );
}

export default App;
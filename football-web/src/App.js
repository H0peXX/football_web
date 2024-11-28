// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Component/Home/HomePage';
import LoginSignup from './Component/LoginSignup/LoginSignup';
import NavBar from './Component/navbar';
import ForumPage from './Component/forumpage';
import ThreadPage from './Component/threadpage';
import PlayerListing from "./Component/Playerlisting/Playerlisting";
import PlayerDetail from "./Component/Playerdetail/Playedetail";
import SentOffers from './Component/Sentoffer/SentOffers';

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
        <Route path="/players/:email" element={<PlayerDetail />} />
        <Route path="/offers/sent" element={<SentOffers />} />
        <Route
          path="/thread/:threadId"
          element={<ThreadPage threads={threads}/>}
        />
         <Route path="/players" element={<PlayerListing />} />
      </Routes>
    </Router>
  );
}

export default App;
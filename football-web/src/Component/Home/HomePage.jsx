import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from your server
    fetch("http://localhost:5000", {
      method: 'GET',
      credentials: 'include',  // This ensures cookies are sent along with the request
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setName(data.email);
        } else {
          navigate('/login');
        }
      })
      .catch(err => console.log(err));
    // Catch and log any errors during the fetch
  }, []);

  return (
    <div>
      <header>
        <h1>Home Page</h1>
      </header>
      <main>
        <p>Welcome {name} to the Home Page.</p>
      </main>
    </div>
  );
};

export default HomePage;

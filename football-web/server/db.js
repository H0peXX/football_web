// Login.js
import React, { useState } from "react";
import user_icon from './Asset/person.png';
import password_icon from './Asset/password.png';
import './LoginSignup.css';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:3001/login', { username, password })
            .then((res) => {
                console.log(res.data); // Handle login success
                setError(''); // Clear any previous error
            })
            .catch((err) => {
                console.error(err);
                setError('Invalid username or password.'); // Display error message
            });
    };

    return (
        <div className="container fade-in">
            <div className="header">
                <div className="text">Login</div>
                <div className="underline"></div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="inputs">
                    <div className="input">
                        <img src={user_icon} alt="User icon" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="Password icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="submit-button">
                    Login
                </button>
            </form>

            <div className="forgot-password">
                Forgot your password? <span>Click Here!</span>
            </div>
        </div>
    );
};

export default Login;

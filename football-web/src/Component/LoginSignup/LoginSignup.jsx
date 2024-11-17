// LoginSignup.js
import React, { useState, useEffect } from "react";
import user_icon from './Asset/person.png';
import email_icon from './Asset/email.png';
import password_icon from './Asset/password.png';
import './LoginSignup.css';

const LoginSignup = ({ action }) => {
    const [currentAction, setCurrentAction] = useState(action || "Login");
    const [animationClass, setAnimationClass] = useState("fade-in");

    useEffect(() => {
        setCurrentAction(action); // Update the state if the action prop changes
    }, [action]);

    const toggleAction = (newAction) => {
        setAnimationClass("fade-out");
        setTimeout(() => {
            setCurrentAction(newAction);
            setAnimationClass("fade-in");
        }, 500);
    };

    return (
        <div>
            <div className={`container ${animationClass}`}>
                <div className="header">
                    <div className="text">{currentAction}</div>
                    <div className="underline"></div>
                </div>
                <div className="inputs">
                    {currentAction === "Sign Up" && (
                        <>
                            <div className="input">
                                <img src={user_icon} alt="User icon" />
                                <input type="text" placeholder="First Name" />
                            </div>
                            <div className="input">
                                <img src={user_icon} alt="User icon" />
                                <input type="text" placeholder="Last Name" />
                            </div>
                        </>
                    )}
                    <div className="input">
                        <img src={email_icon} alt="Email icon" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="Password icon" />
                        <input type="password" placeholder="Password" />
                    </div>
                </div>
                {currentAction === "Login" && (
                    <div className="forgot-password">
                        Forget it? <span>Click Here!</span>
                    </div>
                )}
                <div className="submit-container">
                    <div
                        className={currentAction === "Login" ? "submit gray" : "submit"}
                        onClick={() => toggleAction("Sign Up")}
                    >
                        Sign Up
                    </div>
                    <div
                        className={currentAction === "Sign Up" ? "submit gray" : "submit"}
                        onClick={() => toggleAction("Login")}
                    >
                        Login
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;

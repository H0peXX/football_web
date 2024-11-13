import React, { useState, useEffect } from "react";
import user_icon from './Asset/person.png';
import email_icon from './Asset/email.png';
import password_icon from './Asset/password.png';
import './LoginSignup.css';

const LoginSignup = () => {
    const [action, setAction] = useState("Login");
    const [animationClass, setAnimationClass] = useState("fade-in");

    const toggleAction = (newAction) => {
        // Trigger fade-out animation
        setAnimationClass("fade-out");
        setTimeout(() => {
            // Update the action and trigger fade-in animation after fade-out completes
            setAction(newAction);
            setAnimationClass("fade-in");
        }, 500); // Match with animation duration
    };

    return (
        <div>
            <div className={`container ${animationClass}`}>
                <div className="header">
                    <div className="text">{action}</div>
                    <div className="underline"></div>
                </div>
                <div className="inputs">
                    {action === "Login" ? (
                        <div></div>
                    ) : (
                        <>
                            <div className="input">
                                <img src={user_icon} alt="" />
                                <input type="text" placeholder="First Name" />
                            </div>
                            <div className="input">
                                <img src={user_icon} alt="" />
                                <input type="text" placeholder="Last Name" />
                            </div>
                        </>
                    )}

                    <div className="input">
                        <img src={email_icon} alt="" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="" />
                        <input type="password" placeholder="Password" />
                    </div>
                </div>
                {action === "Sign Up" ? (
                    <div></div>
                ) : (
                    <div className="forgot-password">Forget it?<span>Click Here!</span></div>
                )}

                <div className="submit-container">
                    <div
                        className={action === "Login" ? "submit gray" : "submit"}
                        onClick={() => toggleAction("Sign Up")}
                    >
                        Sign Up
                    </div>
                    <div
                        className={action === "Sign Up" ? "submit gray" : "submit"}
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

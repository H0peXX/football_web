import React, { useState, useEffect } from "react";
import user_icon from './Asset/person.png';
import email_icon from './Asset/email.png';
import password_icon from './Asset/password.png';
import './LoginSignup.css';
import { useNavigate } from "react-router-dom";



const LoginSignup = ({ action }) => {
    const [currentAction, setCurrentAction] = useState(action || "Login");
    const [animationClass, setAnimationClass] = useState("fade-in");
    const navigate = useNavigate();

    // Define formData state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    // Update the state if the action prop changes
    useEffect(() => {
        setCurrentAction(action); 
    }, [action]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    // Handle form submission (Login or Signup)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        const endpoint = currentAction === "Login" ? "/login" : "/signup";
        const url = `http://localhost:5000${endpoint}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                alert(`${currentAction} successful!`);
                // Optionally reset form data after successful submit
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    position: ""
                });
                navigate("/home");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(`Error during ${currentAction}:`, error);
            alert("An error occurred. Please try again.");
        }
    };

    // Toggle between Login and Sign Up actions
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
                                <input 
                                    type="text" 
                                    placeholder="First Name" 
                                    name="firstName" 
                                    value={formData.firstName} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="input">
                                <img src={user_icon} alt="User icon" />
                                <input 
                                    type="text" 
                                    placeholder="Last Name" 
                                    name="lastName" 
                                    value={formData.lastName} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="input">
                                <img src={user_icon} alt="User icon" />
                                <input 
                                    type="text" 
                                    placeholder="Position" 
                                    name="position" 
                                    value={formData.position} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            
                        </>
                    )}
                    <div className="input">
                        <img src={email_icon} alt="Email icon" />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="Password icon" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                        />
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
                {/* Add the submit button */}
                <div className="submit-container">
                    <button 
                        className="submit" 
                        onClick={handleSubmit}
                    >
                        {currentAction === "Login" ? "Login" : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;

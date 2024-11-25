import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ronaldo from "./Asset_home/ronaldo.png"


const LinkedInHomePage = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    fetch("http://localhost:5000", {
      method: "GET",
      credentials: "include", // Send cookies with request
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setName(data.email); // Set user's email as name
        } else {
          navigate("/login"); // Redirect if not authenticated
        }
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, [navigate]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f3f6fa", padding: "20px" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", padding: "15px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#0073b1" }}>Football Web</h1>
      </header>

      {/* Main Content */}
      <div style={{ display: "flex", marginTop: "20px" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: "25%",
            backgroundColor: "#ffffff",
            padding: "15px",
            marginRight: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", margin: "0 0 10px" }}>{name || "Your Name"}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>user info</p>
          </div>
          <div>
            <p>
              <strong>8</strong> more info
            </p>
            <p>
              <strong>15</strong> Views of your post
            </p>
          </div>
        </aside>

        {/* Feed */}
        <main style={{ width: "75%" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <textarea
              placeholder="Share an article, photo, or update"
              style={{ width: "100%", height: "60px", padding: "10px", fontSize: "14px", borderRadius: "5px" }}
            ></textarea>
            <button
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#0073b1",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Post
            </button>
          </div>

          {/* Post Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 10px" }}>Lasted Transfer</h4>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={ronaldo} // Placeholder image
                style={{ width: "150px", height: "100px", marginRight: "15px", borderRadius: "5px" }}
              />
              <div>
                <p>
                  <strong>CR7</strong> is launching his own venture-capital firm.
                </p>
                <p style={{ fontSize: "14px", color: "#555" }}>1,134 Likes - 46 Comments</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LinkedInHomePage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LinkedInHomePage = () => {
  const [name, setName] = useState("");
  const [latestTransfers, setLatestTransfers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    fetch("http://localhost:5000", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setName(data.email);
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, [navigate]);

  useEffect(() => {
    // Fetch latest transfers
    const fetchLatestTransfers = async () => {
      try {
        const response = await fetch("http://localhost:5000/offers/latest");
        if (response.ok) {
          const data = await response.json();
          setLatestTransfers(data);
        }
      } catch (error) {
        console.error("Error fetching latest transfers:", error);
      }
    };

    fetchLatestTransfers();
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f3f6fa", padding: "20px" }}>
      <header style={{ backgroundColor: "#ffffff", padding: "15px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#0073b1" }}>Football Web</h1>
      </header>

      <div style={{ display: "flex", marginTop: "20px" }}>
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
          <button>View detail profile</button>
        </aside>

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

          {/* Latest Transfers Section */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 10px" }}>Latest Transfers</h4>
            {latestTransfers.map((transfer) => (
              <div key={transfer.id} style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <div>
                  <p>
                    <strong>{transfer.firstname} {transfer.lastname}</strong> was signed by{" "}
                    <strong>{transfer.senderEmail}</strong>.
                  </p>
                  <p style={{ fontSize: "14px", color: "#555" }}>{new Date(transfer.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LinkedInHomePage;

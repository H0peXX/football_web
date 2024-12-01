import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LinkedInHomePage = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("")
  const [latestTransfers, setLatestTransfers] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState(null); // State to track the comment being edited
  const navigate = useNavigate();

  useEffect(() => {
    latestTransfers.forEach((transfer) => {
      fetchComments(transfer.id); // Fetch comments for each transfer when the page loads
    });
  }, [latestTransfers]);

  // Fetch user data
  useEffect(() => {
    fetch("http://localhost:5000", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setName(data.email);
          setRole(data.role);
        } else {
          navigate("/login");
        }
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, [navigate]);

  // Fetch latest transfers
  useEffect(() => {
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

  const handleProfileNavigation = () => {
    navigate(`/players/${encodeURIComponent(name)}`); // Assuming profile route is based on name or user ID
};

  // Fetch comments for a specific transfer
  const fetchComments = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:5000/offers/${offerId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments((prev) => ({ ...prev, [offerId]: data }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Post a new comment
  const postComment = async (offerId) => {
    try {
      const response = await fetch(`http://localhost:5000/offers/${offerId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment[offerId], user_email: name }),
      });
      if (response.ok) {
        fetchComments(offerId); // Refresh comments after posting
        setNewComment((prev) => ({ ...prev, [offerId]: "" })); // Clear input field
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // Edit a comment
  const editComment = (comment) => {
    setEditingComment(comment); // Set the comment to edit
  };

  // Save the edited comment
  const saveEditedComment = async (offerId, commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/offers/${offerId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: editingComment.comment }),
      });
      if (response.ok) {
        fetchComments(offerId); // Refresh comments after saving
        setEditingComment(null); // Clear the editing state
      }
    } catch (error) {
      console.error("Error saving edited comment:", error);
    }
  };

  // Delete a comment
  const deleteComment = async (offerId, commentId) => {
    try {
      const response = await fetch(`http://localhost:5000/offers/${offerId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchComments(offerId); // Refresh comments after deleting
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

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
            <p style={{ fontSize: "14px", color: "#555" }}>user info : {role} </p>
            <button 
                style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    color: "#fff",
                    backgroundColor: "#007bff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }} 
                onClick={handleProfileNavigation}
            >
                View Profile
            </button>
          </div>
        </aside>

        <main style={{ width: "75%" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "15px", marginBottom: "20px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}></div>

          {/* Latest Transfers Section */}
          <div style={{ backgroundColor: "#ffffff", padding: "15px", marginBottom: "20px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
            <h4 style={{ margin: "0 0 10px" }}>Latest Transfers</h4>
            {latestTransfers.map((transfer) => (
              <div key={transfer.id} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <p>
                      <strong>{transfer.firstname} {transfer.lastname}</strong> was signed by{" "}
                      <strong>{transfer.senderEmail}</strong>.
                    </p>
                    <p style={{ fontSize: "14px", color: "#555" }}>{new Date(transfer.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Comments Section */}
                <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
                  <h5>Comments</h5>
                  <div>
                    {comments[transfer.id]?.map((comment) => (
                      <div key={comment.id} style={{ marginBottom: "10px" }}>
                        {editingComment && editingComment.id === comment.id ? (
                          <div>
                            <textarea
                              value={editingComment.comment}
                              onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
                              style={{ width: "100%", marginBottom: "10px" }}
                            />
                            <button
                              onClick={() => saveEditedComment(transfer.id, comment.id)}
                              style={{ padding: "5px 10px", backgroundColor: "#0073b1", color: "#fff", border: "none", borderRadius: "3px" }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div>
                            <strong>{comment.user_email}</strong>: {comment.comment}
                            <p style={{ fontSize: "12px", color: "#aaa" }}>
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                            {role === "admin"  || name === comment.user_email && (
                              <>
                                <button
                                  onClick={() => editComment(comment)}
                                  style={{ padding: "5px 10px", backgroundColor: "#ffa500", color: "#fff", border: "none", borderRadius: "3px" }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteComment(transfer.id, comment.id)}
                                  style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "3px", marginLeft: "5px" }}
                                >
                                  Delete
                                </button>
                              </>
                            )}

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={newComment[transfer.id] || ""}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [transfer.id]: e.target.value }))}
                    placeholder="Add a comment"
                    style={{ width: "100%", marginTop: "10px", padding: "5px" }}
                  />
                  <button
                    onClick={() => postComment(transfer.id)}
                    style={{ marginTop: "5px", padding: "5px 10px", backgroundColor: "#0073b1", color: "#fff", border: "none", borderRadius: "3px" }}
                  >
                    Post
                  </button>
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

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Playerdetail.css";

const PlayerDetail = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [name, setName] = useState("");
    const [newComment, setNewComment] = useState('');
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        role: "",
        imageUrl: "",
    });

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
              alert("Not logged in"); // Redirect if not authenticated
            }
          })
          .catch((err) => console.error("Error fetching user data:", err));
      }, [navigate]);

    useEffect(() => {
        fetch(`http://localhost:5000/players/${encodeURIComponent(email)}`)
            .then((response) => response.json())
            .then((data) => {
                setPlayer(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    role: data.role || "",
                    imageUrl: data.imageUrl || "",
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching player details:", error);
                setLoading(false);
            });
    }, [email]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`http://localhost:5000/comments/${encodeURIComponent(email)}`);
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            }
        };

        fetchComments();
    }, [email]);

    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: name, // Replace with actual logged-in user email
                    playerEmail: email,
                    comment: newComment,
                }),
            });

            if (response.ok) {
                const addedComment = await response.json();
                setComments((prev) => [addedComment, ...prev]); // Prepend new comment
                setNewComment(''); // Reset input
            } else {
                alert('Failed to post comment');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/players/${encodeURIComponent(email)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedPlayer = await response.json();
                alert("Player updated successfully!");
                setPlayer((prev) => ({ ...prev, ...formData }));
                setEditing(false);
            } else {
                alert("Failed to update player");
            }
        } catch (error) {
            console.error("Error updating player:", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this player?")) return;

        try {
            const response = await fetch(`http://localhost:5000/players/${encodeURIComponent(email)}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Player deleted successfully!");
                navigate("/players"); // Navigate back to player listing
            } else {
                alert("Failed to delete player");
            }
        } catch (error) {
            console.error("Error deleting player:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!player) return <p>Player not found!</p>;

    return (
        <div className="player-detail">
            <img
                src={player.image || 'https://via.placeholder.com/150'}
                alt={`${player.firstname} ${player.lastname}`}
                className="player-avatar"
            />
            {editing ? (
                <div className="player-edit-form">
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                    />
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        placeholder="Role"
                    />
                    <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="Image URL"
                    />
                    <button onClick={handleUpdate}>Save Changes</button>
                    <button onClick={() => setEditing(false)}>Cancel</button>
                </div>
            ) : (
                <>
                    <h1>{`${player.firstname} ${player.lastname}`}</h1>
                    <p>Email: {player.email}</p>
                    <p>Role: {player.role}</p>
                    <button onClick={() => setEditing(true)}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </>
            )}

            {/* Comments Section */}
            <div className="comments-section">
                <h2>Comments</h2>

                {/* Comments List */}
                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="comment">
                                <p>
                                    <strong>{comment.email}</strong>:
                                </p>
                                <p>{comment.comment}</p>
                                <small>{new Date(comment.created_at).toLocaleString()}</small>
                            </div>
                        ))
                    ) : (
                        <p>No comments yet. Be the first to comment!</p>
                    )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your comment..."
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PlayerDetail;
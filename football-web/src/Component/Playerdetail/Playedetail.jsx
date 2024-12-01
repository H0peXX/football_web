import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Playerdetail.css";

const PlayerDetail = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerMessage, setOfferMessage] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [newComment, setNewComment] = useState('');
    const [editing, setEditing] = useState(false);
    const [signedOffer, setSignedOffer] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        position: "",
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
                    setRole(data.role);
                } else {
                    alert("Not logged in"); // Redirect if not authenticated
                }
            })
            .catch((err) => console.error("Error fetching user data:", err));
    }, [navigate]);

    {useEffect(() => {
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
    }, [email]);}

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

    //comment edit
    const handleEditComment = (commentId, currentComment) => {
        setEditingCommentId(commentId);
        setEditedComment(currentComment);
    };

    const handleSaveEditedComment = async (commentId) => {
        if (!editedComment.trim()) {
            alert('Edited comment cannot be empty.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: editedComment }),
            });

            if (response.ok) {
                const updatedComment = await response.json();
                setComments((prev) =>
                    prev.map((comment) =>
                        comment.id === commentId ? { ...comment, comment: updatedComment.comment } : comment
                    )
                );
                setEditingCommentId(null); // Exit edit mode
                setEditedComment(''); // Reset edited comment input
            } else {
                alert('Failed to save comment');
            }
        } catch (error) {
            console.error('Failed to save comment:', error);
        }
    };

    //comment delete
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setComments((prev) => prev.filter((comment) => comment.id !== commentId));
                alert('Comment deleted successfully!');
            } else {
                alert('Failed to delete comment');
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const handleSendOffer = async () => {
        if (!offerMessage.trim()) {
            alert('Offer message cannot be empty.');
            return;
        }

        try {
            console.log('Sending offer:', {
                senderEmail: name,
                receiverEmail: email,
                message: offerMessage,
            });

            const response = await fetch('http://localhost:5000/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail: name, // Current user's email
                    receiverEmail: email, // Player being viewed
                    message: offerMessage,
                }),
            });

            const result = await response.json();
            console.log('Response:', result);

            if (response.ok) {
                alert('Offer sent successfully!');
                setShowOfferModal(false);
                setOfferMessage('');
            } else {
                alert(result.error || 'Failed to send offer');
            }
        } catch (error) {
            console.error('Error sending offer:', error);
            alert('Failed to send offer: Network or server issue.');
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

    //fetch Sign
    useEffect(() => {
        const fetchSignedOffer = async () => {
            try {
                const response = await fetch(`http://localhost:5000/offers/signed/${encodeURIComponent(email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSignedOffer(data);
                } else {
                    setSignedOffer(null);
                }
            } catch (error) {
                console.error('Error fetching signed offer:', error);
            }
        };

        fetchSignedOffer();
    }, [email]);

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

        // Handle the image input change and convert to Base64
        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Image = reader.result.split(',')[1]; // Strip out the data URL prefix
                    setFormData((prevState) => ({
                        ...prevState,
                        imageUrl: base64Image
                    }));
                };
                reader.readAsDataURL(file); // Convert image to Base64
            }
        };

    if (loading) return <p>Loading...</p>;
    if (!player) return <p>Player not found!</p>;

    return (
        <div className="player-detail">
            <img
                src={`data:image/jpeg;base64,${player.image}`|| 'https://via.placeholder.com/150'}
                alt={`${player.firstname} ${player.lastname}`}
                className="player-avatar"
            />
            {editing ? (
    <div className="player-edit-form">
        <input
            type="text"
            name="firstName"
            value={formData.firstName}  // Use formData here
            onChange={handleInputChange}
            placeholder="First Name"
        />
        <input
            type="text"
            name="lastName"
            value={formData.lastName}  // Use formData here
            onChange={handleInputChange}
            placeholder="Last Name"
        />
        <input
            type="text"
            name="position"
            value={formData.position}  // Use formData here
            onChange={handleInputChange}
            placeholder="Position"
        />
        <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
        />

        {formData.imageUrl && (  // Ensure to use formData for the image preview
            <div>
                <img
                    src={`data:image/jpeg;base64,${formData.imageUrl}`}
                    alt="Image preview"
                    style={{ width: '150px', height: 'auto', marginTop: '10px' }}
                />
            </div>
        )}

        <button onClick={handleUpdate}>Save Changes</button>
        <button onClick={() => setEditing(false)}>Cancel</button>
    </div>
) : (
                <>
                    <h1>{`${player.firstname} ${player.lastname}`}</h1>
                    <p>Email: {player.email}</p>
                    <p>Role: {player.role}</p>
                    <p>Position: {player.position}</p>
                    <div className="offer-status">
                        {signedOffer ? (
                            <p>
                                <strong>Offer Signed!</strong> Signed by: {signedOffer.senderEmail}
                                <br />
                                Message: {signedOffer.message}
                            </p>
                        ) : (
                            <p>No offer signed yet.</p>
                        )}
                    </div>
                    {(name === player.email || role === "Admin") && (
                        <>
                            <button onClick={() => navigate(`/players/${encodeURIComponent(email)}/view-offers`)}>View Offers</button>
                            <button onClick={() => setEditing(true)}>Edit</button>
                            <button onClick={handleDelete}>Delete</button>
                        </>)}
                    {role === "coach" && (
                        <button onClick={() => setShowOfferModal(true)}>Send Offer</button>
                    )}
                </>
            )}
            {/* Offer Modal */}
            {showOfferModal && (
                <div className="offer-modal">
                    <div className="modal-content">
                        <h2>Send Offer to {player.firstname} {player.lastname}</h2>
                        <textarea
                            value={offerMessage}
                            onChange={(e) => setOfferMessage(e.target.value)}
                            placeholder="Write your offer message here..."
                        />
                        <div className="modal-actions">
                            <button onClick={handleSendOffer}>Send</button>
                            <button onClick={() => setShowOfferModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Section */}
            <div className="comments-section">
                <h2>Comments</h2>

                {/* Comments List */}
                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="comment">
                                {editingCommentId === comment.id ? (
                                    <div>
                                        <textarea
                                            value={editedComment}
                                            onChange={(e) => setEditedComment(e.target.value)}
                                        />
                                        {role === "admin" || name === comment.email && (
                                            <>
                                                <button onClick={() => handleSaveEditedComment(comment.id)}>Save</button>
                                                <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <p>
                                            <strong>{comment.email}</strong>:
                                        </p>
                                        <p>{comment.comment}</p>
                                        <small>{new Date(comment.created_at).toLocaleString()}</small>
                                        {role === "admin" || name === comment.email && (
                                            <>
                                                <button onClick={() => handleEditComment(comment.id, comment.comment)}>Edit</button>
                                                <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                            </>
                                        )}

                                    </>
                                )}
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
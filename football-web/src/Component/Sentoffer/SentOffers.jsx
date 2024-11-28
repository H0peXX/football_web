import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SentOffers.css";

const SentOffers = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [editedMessage, setEditedMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.valid) {
                    setUserEmail(data.email);
                    fetchSentOffers(data.email);
                } else {
                    alert("Not logged in");
                    navigate("/login");
                }
            })
            .catch((err) => console.error("Error fetching user data:", err));
    }, [navigate]);

    const fetchSentOffers = (email) => {
        fetch(`http://localhost:5000/offers/sent/${encodeURIComponent(email)}`)
            .then((response) => response.json())
            .then((data) => {
                setOffers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching sent offers:", error);
                setLoading(false);
            });
    };

    const handleEditClick = (offerId, currentMessage) => {
        setEditingOfferId(offerId);
        setEditedMessage(currentMessage);
    };

    const handleSaveClick = async (offerId) => {
        if (!editedMessage.trim()) {
            alert("Message cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/offers/${offerId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: editedMessage }),
            });

            if (response.ok) {
                setOffers((prev) =>
                    prev.map((offer) =>
                        offer.id === offerId ? { ...offer, message: editedMessage } : offer
                    )
                );
                alert("Offer updated successfully!");
                setEditingOfferId(null); // Exit edit mode
            } else {
                alert("Failed to update offer");
            }
        } catch (error) {
            console.error("Failed to update offer:", error);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="sent-offers-page">
            <h1>Sent Offers</h1>
            {offers.length > 0 ? (
                <ul className="offer-list">
                    {offers.map((offer) => (
                        <li key={offer.id} className="offer-item">
                            <p>
                                <strong>To:</strong> {offer.receiverEmail}
                            </p>
                            {editingOfferId === offer.id ? (
                                <>
                                    <textarea
                                        value={editedMessage}
                                        onChange={(e) => setEditedMessage(e.target.value)}
                                    />
                                    <button onClick={() => handleSaveClick(offer.id)}>Save</button>
                                    <button onClick={() => setEditingOfferId(null)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p>
                                        <strong>Message:</strong> {offer.message}
                                    </p>
                                    <small>Sent on: {new Date(offer.created_at).toLocaleString()}</small>
                                    <button onClick={() => handleEditClick(offer.id, offer.message)}>
                                        Edit
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No offers sent yet.</p>
            )}
        </div>
    );
};

export default SentOffers;
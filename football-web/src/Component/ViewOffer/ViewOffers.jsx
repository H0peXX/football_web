import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewOffers.css';

const ViewOffers = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch(`http://localhost:5000/offers/player/${encodeURIComponent(email)}`);
                const data = await response.json();
                setOffers(data);
            } catch (error) {
                console.error('Failed to fetch offers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [email]);

    if (loading) return <p>Loading...</p>;
    if (offers.length === 0) return <p>No offers available for this player.</p>;

    return (
        <div className="view-offers-page">
            <h1>Offers for {email}</h1>
            <ul className="offers-list">
                {offers.map((offer) => (
                    <li key={offer.id} className="offer-item">
                        <p>
                            <strong>From:</strong> {offer.senderEmail}
                        </p>
                        <p>
                            <strong>Message:</strong> {offer.message}
                        </p>
                        <small>Sent on: {new Date(offer.created_at).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};

export default ViewOffers;
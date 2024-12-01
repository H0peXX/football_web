import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './Playerlisting.css';

const PlayerListing = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/players")
            .then((response) => response.json())
            .then((data) => {
                setPlayers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching players:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (players.length === 0) return <p>No players found!</p>;

    return (
        <div className="player-list">
            {players.map((player) => (
                <Link to={`/players/${encodeURIComponent(player.email)}`} key={player.email} className="player-card-link">
                    <div className="player-card">
                        <img
                            className="player-avatar"
                            src={`data:image/jpeg;base64,${player.image}` || "https://via.placeholder.com/150"}
                            alt={`${player.firstname} ${player.lastname}`}
                        />
                        <div className="player-info">
                            <h2>{`${player.firstname} ${player.lastname}`}</h2>
                            <p>{player.email}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default PlayerListing;
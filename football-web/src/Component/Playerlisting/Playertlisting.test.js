import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import PlayerListing from "./Playerlisting";

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("PlayerListing Component", () => {
  const mockPlayers = [
    {
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      image: "", // Base64 encoded image or empty for placeholder
    },
    {
      firstname: "Jane",
      lastname: "Smith",
      email: "jane.smith@example.com",
      image: "", // Base64 encoded image or empty for placeholder
    },
  ];

  it("displays loading state initially", () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPlayers),
    });

    render(
      <Router>
        <PlayerListing />
      </Router>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders player cards after loading", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPlayers),
    });

    render(
      <Router>
        <PlayerListing />
      </Router>
    );

    await waitFor(() => screen.getByText("John Doe"));

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
    expect(screen.getAllByAltText(/John Doe|Jane Smith/)).toHaveLength(2);
  });

  it("shows a message when no players are found", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <Router>
        <PlayerListing />
      </Router>
    );

    await waitFor(() => screen.getByText(/No players found!/i));

    expect(screen.getByText(/No players found!/i)).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <Router>
        <PlayerListing />
      </Router>
    );

    await waitFor(() => screen.getByText(/No players found!/i));

    expect(screen.getByText(/No players found!/i)).toBeInTheDocument();
  });
});

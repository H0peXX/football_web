import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import SentOffers from "./SentOffers";

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("SentOffers Component", () => {
  const mockUserDetails = {
    valid: true,
    email: "coach@example.com",
    role: "coach",
  };

  const mockOffers = [
    {
      id: 1,
      receiverEmail: "player1@example.com",
      message: "Offer 1",
      created_at: "2023-12-01T10:00:00Z",
    },
    {
      id: 2,
      receiverEmail: "player2@example.com",
      message: "Offer 2",
      created_at: "2023-12-02T12:00:00Z",
    },
  ];

  it("displays loading state initially", () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDetails),
    });

    render(
      <Router>
        <SentOffers />
      </Router>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders sent offers after loading", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserDetails),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOffers),
      });

    render(
      <Router>
        <SentOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/Sent Offers/i));

    expect(screen.getByText("Offer 1")).toBeInTheDocument();
    expect(screen.getByText("Offer 2")).toBeInTheDocument();
    expect(screen.getByText("player1@example.com")).toBeInTheDocument();
    expect(screen.getByText("player2@example.com")).toBeInTheDocument();
  });

  it("displays a message when no offers are sent", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserDetails),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

    render(
      <Router>
        <SentOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/No offers sent yet/i));

    expect(screen.getByText(/No offers sent yet/i)).toBeInTheDocument();
  });

  it("handles editing an offer", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserDetails),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOffers),
      });

    render(
      <Router>
        <SentOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/Sent Offers/i));

    const editButton = screen.getAllByText(/Edit/i)[0];
    fireEvent.click(editButton);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated Offer Message" } });

    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Updated Offer Message/i)).toBeInTheDocument();
    });
  });

  it("handles deleting an offer", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserDetails),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOffers),
      });

    render(
      <Router>
        <SentOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/Sent Offers/i));

    const deleteButton = screen.getAllByText(/Delete/i)[0];
    fireEvent.click(deleteButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/offers/1"),
      expect.objectContaining({ method: "DELETE" })
    );

    await waitFor(() => {
      expect(screen.queryByText("Offer 1")).not.toBeInTheDocument();
    });
  });

  it("redirects unauthorized users", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true, email: "player@example.com", role: "player" }),
    });

    const navigate = jest.fn();

    render(
      <Router>
        <SentOffers navigate={navigate} />
      </Router>
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/home"));
  });
});

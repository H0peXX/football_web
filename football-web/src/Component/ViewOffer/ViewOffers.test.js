import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import ViewOffers from "./ViewOffers";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

global.fetch = jest.fn();

describe("ViewOffers Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useParams.mockReturnValue({ email: "player@example.com" });
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  const mockUserData = {
    valid: true,
    email: "player@example.com",
  };

  const mockOffers = [
    {
      id: 1,
      senderEmail: "coach1@example.com",
      message: "Offer 1 message",
      created_at: "2023-12-01T10:00:00Z",
    },
    {
      id: 2,
      senderEmail: "coach2@example.com",
      message: "Offer 2 message",
      created_at: "2023-12-02T12:00:00Z",
    },
  ];

  it("displays loading initially", () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUserData),
    });

    render(
      <Router>
        <ViewOffers />
      </Router>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders offers after loading", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOffers),
      });

    render(
      <Router>
        <ViewOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/Offers for player@example.com/i));

    expect(screen.getByText("Offer 1 message")).toBeInTheDocument();
    expect(screen.getByText("Offer 2 message")).toBeInTheDocument();
    expect(screen.getByText("coach1@example.com")).toBeInTheDocument();
    expect(screen.getByText("coach2@example.com")).toBeInTheDocument();
  });

  it("shows no offers message if no offers are available", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

    render(
      <Router>
        <ViewOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/No offers available for this player/i));

    expect(screen.getByText(/No offers available for this player/i)).toBeInTheDocument();
  });

  it("handles offer acceptance", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOffers),
      });

    render(
      <Router>
        <ViewOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/Offers for player@example.com/i));

    const acceptButton = screen.getAllByText("Accept")[0];
    fireEvent.click(acceptButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/offers/1/accept"),
      expect.objectContaining({ method: "PUT" })
    );

    await waitFor(() => {
      expect(screen.queryByText("Offer 1 message")).not.toBeInTheDocument();
    });
  });

  it("handles offer rejection", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOffers),
      });

    render(
      <Router>
        <ViewOffers />
      </Router>
    );

    await waitFor(() => screen.getByText(/Offers for player@example.com/i));

    const rejectButton = screen.getAllByText("Reject")[0];
    fireEvent.click(rejectButton);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/offers/1/reject"),
      expect.objectContaining({ method: "PUT" })
    );

    await waitFor(() => {
      expect(screen.queryByText("Offer 1 message")).not.toBeInTheDocument();
    });
  });

  it("redirects unauthorized user", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ valid: false }),
    });

    render(
      <Router>
        <ViewOffers />
      </Router>
    );

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });
});

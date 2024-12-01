import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import PlayerDetail from "./Playedetail";

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("PlayerDetail Component", () => {
  const mockPlayer = {
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    role: "Player",
    position: "Forward",
    image: "",
  };

  const mockComments = [
    { id: 1, email: "user1@example.com", comment: "Great player!", created_at: "2023-12-01T10:00:00Z" },
  ];

  it("renders player details and comments", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/players/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlayer),
        });
      }
      if (url.includes("/comments/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockComments),
        });
      }
      return Promise.reject("Invalid URL");
    });

    render(
      <Router>
        <PlayerDetail />
      </Router>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => screen.getByText("John Doe"));

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Email: john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("Position: Forward")).toBeInTheDocument();
    expect(screen.getByText("Great player!")).toBeInTheDocument();
  });

  it("allows adding a comment", async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes("/comments") && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 2, email: "user2@example.com", comment: "New comment!" }),
        });
      }
      return Promise.reject("Invalid URL");
    });

    render(
      <Router>
        <PlayerDetail />
      </Router>
    );

    const textarea = await screen.findByPlaceholderText("Add your comment...");
    fireEvent.change(textarea, { target: { value: "New comment!" } });

    const button = screen.getByText(/Post Comment/i);
    fireEvent.click(button);

    await waitFor(() => screen.getByText("New comment!"));

    expect(screen.getByText("New comment!")).toBeInTheDocument();
  });

  it("handles edit and delete comment actions", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/comments/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockComments),
        });
      }
      return Promise.reject("Invalid URL");
    });

    render(
      <Router>
        <PlayerDetail />
      </Router>
    );

    await waitFor(() => screen.getByText("Great player!"));

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    const textarea = screen.getByDisplayValue("Great player!");
    fireEvent.change(textarea, { target: { value: "Updated comment" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/comments/"), expect.any(Object));

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/comments/"), { method: "DELETE" });
  });

  it("shows an error when the player is not found", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Player not found" }),
    });

    render(
      <Router>
        <PlayerDetail />
      </Router>
    );

    await waitFor(() => screen.getByText(/Player not found!/i));

    expect(screen.getByText(/Player not found!/i)).toBeInTheDocument();
  });
});
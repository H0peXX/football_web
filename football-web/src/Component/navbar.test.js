import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./navbar.js";

// Mock fetch for login state and API responses
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === "http://localhost:5000") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true, email: "user@example.com", role: "user" }),
      });
    }
    if (url === "http://localhost:5000/logout") {
      return Promise.resolve({ ok: true });
    }
    return Promise.resolve({ ok: false });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("displays login/signup link when user is not logged in", async () => {
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  // Wait for the component to update with user data
  await waitFor(() => expect(screen.getByText("Login/Signup")).toBeInTheDocument());
  expect(screen.queryByText("Logout")).toBeNull();
});

test("displays home and playerlisting links", async () => {
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  // Ensure common links are visible for all users
  await waitFor(() => {
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Playerlisting")).toBeInTheDocument();
  });
});

test("displays logout link when user is logged in", async () => {
  // Mock logged in user response
  global.fetch = jest.fn((url) => {
    if (url === "http://localhost:5000") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true, email: "user@example.com", role: "user" }),
      });
    }
    if (url === "http://localhost:5000/logout") {
      return Promise.resolve({ ok: true });
    }
    return Promise.resolve({ ok: false });
  });

  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  // Wait for the component to update with the user data and logout button
  await waitFor(() => expect(screen.getByText("Logout")).toBeInTheDocument());
  expect(screen.queryByText("Login/Signup")).toBeNull();
});

test("calls logout API and redirects when logout link is clicked", async () => {
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  // Mock the fetch for logout
  const logoutButton = screen.getByText("Logout");
  fireEvent.click(logoutButton);

  // Ensure fetch is called with the correct parameters for logout
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("http://localhost:5000/logout", {
    method: "POST",
    credentials: "include",
  }));

  // Check if the user is redirected or the login/signup link reappears
  await waitFor(() => expect(screen.getByText("Login/Signup")).toBeInTheDocument());
});

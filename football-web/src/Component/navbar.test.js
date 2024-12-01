import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NavBar from "./navbar";

// Mock fetch globally
global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("NavBar Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test("renders NavBar with guest links", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false }),
    });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Signup")).toBeInTheDocument();
    });
  });

  test("renders NavBar with user links after login", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, email: "user@example.com", role: "user" }),
    });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
      expect(screen.queryByText("Signup")).not.toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });

  test("renders coach-specific links", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true, email: "coach@example.com", role: "coach" }),
    });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Sentoffer")).toBeInTheDocument();
    });
  });

  test("handles logout correctly", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, email: "user@example.com", role: "user" }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("handles failed logout", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, email: "user@example.com", role: "user" }),
      })
      .mockResolvedValueOnce({ ok: false });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });
});

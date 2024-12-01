import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import LoginSignup from "./LoginSignup";

global.fetch = jest.fn();

describe("LoginSignup Component", () => {
  const mockNavigate = jest.fn();

  jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  it("renders Login form initially", () => {
    render(
      <Router>
        <LoginSignup action="Login" />
      </Router>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("First Name")).not.toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders Sign Up form when toggled", () => {
    render(
      <Router>
        <LoginSignup action="Login" />
      </Router>
    );

    fireEvent.click(screen.getByText("Sign Up"));
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("handles form input changes", () => {
    render(
      <Router>
        <LoginSignup action="Login" />
      </Router>
    );

    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");

    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput.value).toBe("password123");
  });

  it("submits Login form successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: "Login successful!" }),
    });

    render(
      <Router>
        <LoginSignup action="Login" />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("handles image upload", async () => {
    render(
      <Router>
        <LoginSignup action="Sign Up" />
      </Router>
    );

    const file = new File(["dummy-content"], "profile.jpg", { type: "image/jpeg" });

    const fileInput = screen.getByLabelText(/less than 50kb/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("displays an error for failed Login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Invalid credentials" }),
    });

    render(
      <Router>
        <LoginSignup action="Login" />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "wronguser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => screen.getByText(/Invalid credentials/i));
  });
});

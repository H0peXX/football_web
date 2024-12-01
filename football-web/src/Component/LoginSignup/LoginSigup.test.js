import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginSignup from "./LoginSignup";

beforeEach(() => {
  // Mock global fetch to simulate API responses
  global.fetch = jest.fn((url, options) => {
    if (url.includes("/login")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Login successful!" }),
      });
    }
    if (url.includes("/signup")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Signup successful!" }),
      });
    }
    return Promise.reject(new Error("Unknown endpoint"));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders Login form initially and toggles to Sign Up", () => {
  render(
    <MemoryRouter>
      <LoginSignup action="Login" />
    </MemoryRouter>
  );

  // Check Login form fields are present
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByText("Login")).toBeInTheDocument();

  // Toggle to Sign-Up form
  const signUpButton = screen.getByText("Sign Up");
  fireEvent.click(signUpButton);

  // Check Sign-Up form fields are present
  expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Position")).toBeInTheDocument();
  expect(screen.getByText("Sign Up")).toBeInTheDocument();
});

test("handles image upload and updates form data", async () => {
  render(
    <MemoryRouter>
      <LoginSignup action="Sign Up" />
    </MemoryRouter>
  );

  // Mock FileReader for Base64 conversion
  const mockReader = {
    readAsDataURL: jest.fn(),
    onloadend: null,
    result: "data:image/png;base64,FAKE_BASE64_IMAGE",
  };
  jest.spyOn(window, "FileReader").mockImplementation(() => mockReader);

  const fileInput = screen.getByLabelText(/upload/i);
  const file = new File(["dummy-content"], "example.png", { type: "image/png" });

  fireEvent.change(fileInput, { target: { files: [file] } });

  // Simulate the file reading process
  mockReader.onloadend();

  await waitFor(() =>
    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file)
  );

  expect(screen.queryByDisplayValue("FAKE_BASE64_IMAGE")).toBeInTheDocument();
});

test("submits Login form data", async () => {
  render(
    <MemoryRouter>
      <LoginSignup action="Login" />
    </MemoryRouter>
  );

  // Fill in form fields
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "password123" },
  });

  // Submit form
  fireEvent.click(screen.getByText("Login"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          firstName: "",
          lastName: "",
          email: "test@example.com",
          password: "password123",
          position: "",
          profilePicture: "",
        }),
      })
    );
  });
});

test("submits Sign-Up form data", async () => {
  render(
    <MemoryRouter>
      <LoginSignup action="Sign Up" />
    </MemoryRouter>
  );

  // Fill in form fields
  fireEvent.change(screen.getByPlaceholderText("First Name"), {
    target: { value: "John" },
  });
  fireEvent.change(screen.getByPlaceholderText("Last Name"), {
    target: { value: "Doe" },
  });
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "john.doe@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "securePassword" },
  });
  fireEvent.change(screen.getByPlaceholderText("Position"), {
    target: { value: "Developer" },
  });

  // Submit form
  fireEvent.click(screen.getByText("Sign Up"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/signup",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: "securePassword",
          position: "Developer",
          profilePicture: "",
        }),
      })
    );
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LinkedInHomePage from "./HomePage";

beforeEach(() => {
  // Mock the global fetch API
  global.fetch = (url) => {
    if (url.includes("/offers/latest")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              firstname: "John",
              lastname: "Doe",
              senderEmail: "team@example.com",
              created_at: new Date().toISOString(),
            },
          ]),
      });
    }
    if (url.includes("/offers/1/comments")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: 101,
              comment: "Exciting transfer!",
              user_email: "user@example.com",
              created_at: new Date().toISOString(),
            },
          ]),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          valid: true,
          email: "user@example.com",
          role: "User",
        }),
    });
  };
});

afterEach(() => {
  // Clean up mocks
  delete global.fetch;
});

test("displays user profile details and latest transfers", async () => {
  render(
    <MemoryRouter>
      <LinkedInHomePage />
    </MemoryRouter>
  );

  // Check user details are rendered correctly
  await waitFor(() => expect(screen.getByText("user@example.com")).toBeInTheDocument());
  expect(screen.getByText("user info : User")).toBeInTheDocument();

  // Verify the latest transfers
  await waitFor(() =>
    expect(screen.getByText("John Doe was signed by team@example.com.")).toBeInTheDocument()
  );
});

test("renders comments and allows adding a new comment", async () => {
  render(
    <MemoryRouter>
      <LinkedInHomePage />
    </MemoryRouter>
  );

  // Wait for comments to appear
  await waitFor(() => expect(screen.getByText("Exciting transfer!")).toBeInTheDocument());
  expect(screen.getByText("user@example.com: Exciting transfer!")).toBeInTheDocument();

  // Simulate adding a new comment
  const commentBox = screen.getByPlaceholderText("Add a comment");
  fireEvent.change(commentBox, { target: { value: "Great signing!" } });

  const postButton = screen.getByText("Post");
  fireEvent.click(postButton);

  // Ensure fetch is called with the correct parameters
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/offers/1/comments",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: "Great signing!", user_email: "user@example.com" }),
      })
    )
  );
});

test("allows editing and deleting comments", async () => {
  render(
    <MemoryRouter>
      <LinkedInHomePage />
    </MemoryRouter>
  );

  // Wait for existing comments to render
  await waitFor(() => expect(screen.getByText("Exciting transfer!")).toBeInTheDocument());

  // Simulate editing a comment
  const editButton = screen.getByText("Edit");
  fireEvent.click(editButton);

  const editBox = screen.getByDisplayValue("Exciting transfer!");
  fireEvent.change(editBox, { target: { value: "Updated comment" } });

  const saveButton = screen.getByText("Save");
  fireEvent.click(saveButton);

  // Ensure fetch is called with correct parameters for updating a comment
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/offers/1/comments/101",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: "Updated comment" }),
      })
    )
  );

  // Simulate deleting a comment
  const deleteButton = screen.getByText("Delete");
  fireEvent.click(deleteButton);

  // Ensure fetch is called with correct parameters for deleting a comment
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/offers/1/comments/101",
      expect.objectContaining({ method: "DELETE" })
    )
  );
});

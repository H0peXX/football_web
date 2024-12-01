import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Component', () => {
  test('renders the NavBar component', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Ensure NavBar renders (assuming it uses a <nav>)
  });

  test('renders HomePage by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/welcome to homepage/i)).toBeInTheDocument(); // Replace with actual HomePage text
  });

  test('navigates to Login page when /login route is accessed', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/login/i)).toBeInTheDocument(); // Replace with LoginSignup-specific text
  });

  test('navigates to Signup page when /signup route is accessed', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/sign up/i)).toBeInTheDocument(); // Replace with LoginSignup-specific text
  });

  test('navigates to PlayerListing page when /players route is accessed', () => {
    render(
      <MemoryRouter initialEntries={['/players']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/player listing/i)).toBeInTheDocument(); // Replace with PlayerListing-specific text
  });

  test('renders PlayerDetail page for /players/:email', () => {
    render(
      <MemoryRouter initialEntries={['/players/test@example.com']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/player details/i)).toBeInTheDocument(); // Replace with PlayerDetail-specific text
  });

  test('renders SentOffers page for /offers/sent', () => {
    render(
      <MemoryRouter initialEntries={['/offers/sent']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/sent offers/i)).toBeInTheDocument(); // Replace with SentOffers-specific text
  });

  test('renders ViewOffers page for /players/:email/view-offers', () => {
    render(
      <MemoryRouter initialEntries={['/players/test@example.com/view-offers']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/view offers/i)).toBeInTheDocument(); // Replace with ViewOffers-specific text
  });
});

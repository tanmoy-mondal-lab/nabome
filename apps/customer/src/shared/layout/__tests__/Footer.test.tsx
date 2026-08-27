import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders company information', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );
    expect(screen.getByText('নবME')).toBeInTheDocument();
    expect(screen.getByText(/premium destination/i)).toBeInTheDocument();
  });

  it('renders customer service links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Shipping & Delivery')).toBeInTheDocument();
    expect(screen.getByText('Returns & Exchanges')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
    expect(screen.getByText('Refund Policy')).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });
});

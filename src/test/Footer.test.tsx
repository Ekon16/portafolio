import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import { AdminProvider } from '@/context/AdminContext';
import React from 'react';

describe('Footer', () => {
  it('renders the site name', () => {
    render(
      <AdminProvider>
        <Footer />
      </AdminProvider>
    );
    expect(screen.getByText('JoseIgnacio.dev')).toBeInTheDocument();
  });

  it('renders the LinkedIn link', () => {
    render(
      <AdminProvider>
        <Footer />
      </AdminProvider>
    );
    const linkedinLink = screen.getByRole('link');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/joseignaciogodino');
  });
});

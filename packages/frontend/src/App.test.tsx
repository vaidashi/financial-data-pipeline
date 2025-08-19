// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Define type for mocked fetch
type MockResponse = {
  ok: boolean;
  json: () => Promise<any>;
};

// Mock fetch with proper typing
global.fetch = vi.fn() as unknown as typeof global.fetch;

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders login page', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: new Date().toISOString() }),
    } as MockResponse);

    render(<App />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('displays demo credentials', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as MockResponse);

    render(<App />);

    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText(/Email: demo@financial-pipeline.com/)).toBeInTheDocument();
  });
});

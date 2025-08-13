import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import App from './App';

// Mock fetch
global.fetch = vi.fn();

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders main heading', () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: new Date().toISOString() }),
    });

    render(<App />);

    expect(screen.getByText('Financial Data Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Real-time financial data monitoring system')).toBeInTheDocument();
  });

  it('shows checking status initially', () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: new Date().toISOString() }),
    });

    render(<App />);

    expect(screen.getByText(/API Status: Checking.../)).toBeInTheDocument();
  });

  it('handles API connection error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Wait for the effect to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText(/API Status: Disconnected/)).toBeInTheDocument();
  });
});

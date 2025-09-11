import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InstrumentSearch from './InstrumentSearch';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-query');

describe('InstrumentSearch', async () => {
  const { useQuery: useQueryMock } = vi.mocked(await import('react-query'));

  it('renders the search input', () => {
    useQueryMock.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
      typeof useQueryMock
    >);
    render(<InstrumentSearch onSelect={() => {}} />);
    expect(screen.getByPlaceholderText('Search for an instrument...')).toBeInTheDocument();
  });

  it('fetches and displays search results', async () => {
    const searchResults = [
      { id: '1', symbol: 'AAPL', name: 'Apple Inc.' },
      { id: '2', symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    ];
    useQueryMock.mockReturnValue({ data: searchResults, isLoading: false } as unknown as ReturnType<
      typeof useQueryMock
    >);

    render(<InstrumentSearch onSelect={() => {}} />);
    const input = screen.getByPlaceholderText('Search for an instrument...');
    fireEvent.change(input, { target: { value: 'A' } });

    await waitFor(() => {
      expect(screen.getByText('AAPL - Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('AMZN - Amazon.com, Inc.')).toBeInTheDocument();
    });
  });

  it('calls onSelect when an instrument is clicked', async () => {
    const onSelect = vi.fn();
    const searchResults = [{ id: '1', symbol: 'AAPL', name: 'Apple Inc.' }];
    useQueryMock.mockReturnValue({ data: searchResults, isLoading: false } as unknown as ReturnType<
      typeof useQueryMock
    >);

    render(<InstrumentSearch onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search for an instrument...');
    fireEvent.change(input, { target: { value: 'AAPL' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('AAPL - Apple Inc.'));
      expect(onSelect).toHaveBeenCalledWith(searchResults[0]);
    });
  });
});

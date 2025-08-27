import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SocketProvider, useSocket } from './SocketContext';
import * as AuthContext from './AuthContext';

// Mock socket.io-client
const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    close: vi.fn(),
};
vi.mock('socket.io-client', () => ({
    io: () => mockSocket,
}));

function mockAuthContext(overrides = {}) {
    return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: vi.fn().mockResolvedValue(undefined),
        register: vi.fn().mockResolvedValue(undefined),
        logout: vi.fn(),
        refreshUser: vi.fn().mockResolvedValue(undefined),
        ...overrides
    };
}


const TestComponent = () => {
    const { socket, isConnected, subscribe, unsubscribe } = useSocket();
    return (
        <div>
            <p>Connected: {isConnected.toString()}</p>
            <button onClick={() => subscribe('test-room')}>Subscribe</button>
            <button onClick={() => unsubscribe('test-room')}>Unsubscribe</button>
        </div>
    );
};

describe('SocketProvider', () => {
    const queryClient = new QueryClient();

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should connect when the user is authenticated', async () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuthContext({ isAuthenticated: true }));
        render(
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    <TestComponent />
                </SocketProvider>
            </QueryClientProvider>
        );

        // Simulate connect event
        const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
        connectCallback();

        await waitFor(() => {
            expect(screen.getByText('Connected: true')).toBeInTheDocument();
        });
    });

    it('should disconnect when the user logs out', async () => {
        const useAuthSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuthContext({ isAuthenticated: true }));
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    <TestComponent />
                </SocketProvider>
            </QueryClientProvider>
        );

        // Simulate disconnect event
        const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
        disconnectCallback();

        await waitFor(() => {
            expect(screen.getByText('Connected: false')).toBeInTheDocument();
        });

        useAuthSpy.mockReturnValue(mockAuthContext({ isAuthenticated: false }));

        rerender(
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    <TestComponent />
                </SocketProvider>
            </QueryClientProvider>
        );

        expect(mockSocket.close).toHaveBeenCalled();
    });

    it('should subscribe and unsubscribe to a room', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuthContext({ isAuthenticated: true }));
        render(
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    <TestComponent />
                </SocketProvider>
            </QueryClientProvider>
        );

        screen.getByText('Subscribe').click();
        expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', { room: 'test-room' });

        screen.getByText('Unsubscribe').click();
        expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe', { room: 'test-room' });
    });
});

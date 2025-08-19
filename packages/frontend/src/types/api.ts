export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'USER' | 'PREMIUM' | 'ADMIN' | 'SUPER_ADMIN';
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface FinancialInstrument {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  type:
    | 'STOCK'
    | 'ETF'
    | 'MUTUAL_FUND'
    | 'BOND'
    | 'CRYPTO'
    | 'COMMODITY'
    | 'FOREX'
    | 'INDEX'
    | 'OPTION'
    | 'FUTURE';
  exchange: string;
  currency: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  realTimeQuote?: RealTimeQuote;
}

export interface RealTimeQuote {
  id: string;
  instrumentId: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh?: number;
  dayLow?: number;
  timestamp: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errors?: any;
}

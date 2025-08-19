import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import api, { endpoints } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/utils';
import type { FinancialInstrument, PaginatedResponse } from '../types/api';

const InstrumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Fetch instruments
  const { data: instrumentsData, isLoading } = useQuery(
    ['instruments', searchQuery, selectedType],
    async () => {
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (selectedType) params.append('type', selectedType);
      params.append('limit', '20');

      const response = await api.get<PaginatedResponse<FinancialInstrument>>(
        `${endpoints.instruments}?${params.toString()}`
      );
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const instrumentTypes = [
    { value: '', label: 'All Types' },
    { value: 'STOCK', label: 'Stocks' },
    { value: 'ETF', label: 'ETFs' },
    { value: 'CRYPTO', label: 'Cryptocurrency' },
    { value: 'BOND', label: 'Bonds' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
          <p className="text-gray-600 mt-2">
            Explore financial instruments and track real-time market data.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by symbol or name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {instrumentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruments list */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Instruments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded"></div>
                        <div className="space-y-2">
                          <div className="w-20 h-4 bg-gray-300 rounded"></div>
                          <div className="w-32 h-3 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="w-16 h-4 bg-gray-300 rounded"></div>
                        <div className="w-12 h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : instrumentsData?.data.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No instruments found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-1">
                {instrumentsData?.data.map((instrument: FinancialInstrument) => (
                  <div
                    key={instrument.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-bold text-sm">
                          {instrument.symbol.slice(0, 3)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{instrument.symbol}</p>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {instrument.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{instrument.name}</p>
                        <p className="text-xs text-gray-400">{instrument.exchange}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-lg">
                        {instrument.realTimeQuote
                          ? formatCurrency(Number(instrument.realTimeQuote.price))
                          : 'N/A'}
                      </p>
                      {instrument.realTimeQuote && (
                        <div className="flex items-center justify-end space-x-1">
                          {Number(instrument.realTimeQuote.changePercent) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-error-600" />
                          )}
                          <p
                            className={`text-sm font-medium ${
                              Number(instrument.realTimeQuote.changePercent) >= 0
                                ? 'text-success-600'
                                : 'text-error-600'
                            }`}
                          >
                            {formatPercent(Number(instrument.realTimeQuote.changePercent))}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Vol:{' '}
                        {instrument.realTimeQuote
                          ? Number(instrument.realTimeQuote.volume).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InstrumentsPage;

import React from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import api, { endpoints } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/utils';
import type { FinancialInstrument, PaginatedResponse } from '../types/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch trending instruments
  const { data: instrumentsData, isLoading: instrumentsLoading } = useQuery(
    'trendingInstruments',
    async () => {
      const response = await api.get<PaginatedResponse<FinancialInstrument>>(
        `${endpoints.instruments}?limit=8`
      );
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const mockStats = [
    {
      title: 'Portfolio Value',
      value: '$24,580.00',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Total Return',
      value: '$2,580.00',
      change: '+8.2%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'Today\'s Change',
      value: '-$180.50',
      change: '-0.7%',
      isPositive: false,
      icon: TrendingDown,
    },
    {
      title: 'Active Positions',
      value: '12',
      change: '+2',
      isPositive: true,
      icon: Activity,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="mt-2 text-primary-100">
            Here's what's happening with your investments today.
          </p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.isPositive ? 'text-success-600' : 'text-error-600'}`}>
                        {stat.change} from last week
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.isPositive ? 'bg-success-100' : 'bg-error-100'}`}>
                      <IconComponent className={`h-6 w-6 ${stat.isPositive ? 'text-success-600' : 'text-error-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Market overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending stocks */}
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {instrumentsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded"></div>
                          <div className="space-y-1">
                            <div className="w-20 h-4 bg-gray-300 rounded"></div>
                            <div className="w-32 h-3 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="w-16 h-4 bg-gray-300 rounded"></div>
                          <div className="w-12 h-3 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {instrumentsData?.data.slice(0, 5).map((instrument: FinancialInstrument) => (
                    <div key={instrument.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {instrument.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{instrument.symbol}</p>
                          <p className="text-sm text-gray-500">{instrument.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {instrument.realTimeQuote 
                            ? formatCurrency(Number(instrument.realTimeQuote.price))
                            : 'N/A'
                          }
                        </p>
                        {instrument.realTimeQuote && (
                          <p className={`text-sm ${
                            Number(instrument.realTimeQuote.changePercent) >= 0 
                              ? 'text-success-600' 
                              : 'text-error-600'
                          }`}>
                            {formatPercent(Number(instrument.realTimeQuote.changePercent))}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your trading activity will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
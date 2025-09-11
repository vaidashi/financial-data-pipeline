import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Card, CardContent} from '../components/ui/Card';
import RealTimeChart from '../components/charts/RealTimeChart';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  // Mock data for stats - will be removed when backend is integrated for this component
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
      title: "Today's Change",
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
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || user?.username}!</h1>
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
                      <p
                        className={`text-sm ${stat.isPositive ? 'text-success-600' : 'text-error-600'}`}
                      >
                        {stat.change} from last week
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${stat.isPositive ? 'bg-success-100' : 'bg-error-100'}`}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${stat.isPositive ? 'text-success-600' : 'text-error-600'}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Market Chart */}
        <RealTimeChart />
      </div>
    </Layout>
  );
};

export default DashboardPage;

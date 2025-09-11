import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { useSocket } from '../../contexts/SocketContext';
import CustomLineChart from './LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import api, { endpoints } from '../../lib/api';
import InstrumentSearch from '../instruments/InstrumentSearch';
import { FinancialInstrument } from '../../types/api';

const lines = [{ dataKey: 'price', stroke: '#8884d8' }];

type TimeRange = 'live' | '1D' | '1W' | '1M';

interface PriceUpdatePayload {
  instrumentId: string;
  symbol: string;
  price: number;
  timestamp: string;
}

const RealTimeChart: React.FC = () => {
  const { socket, subscribe, unsubscribe } = useSocket();
  const [instrument, setInstrument] = useState('AAPL');
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [data, setData] = useState<any[]>([]);

  const {
    data: historicalData,
    isLoading,
    isError,
  } = useQuery(
    ['historicalData', instrument, timeRange],
    async () => {
      const range = timeRange === 'live' ? '1D' : timeRange;
      const limit = timeRange === 'live' ? 20 : 100;
      const response = await api.get(
        `${endpoints.instruments}/symbol/${instrument}/market-data?range=${range}&limit=${limit}`
      );
      return response.data.map((d: any) => {
        const date = new Date(d.timestamp);
        const time = (timeRange === 'live' || timeRange === '1D')
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return {
          price: parseFloat(d.close),
          time,
        };
      }).reverse(); // Reverse to have oldest data first
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (historicalData) {
      setData(historicalData);
    }
  }, [historicalData]);

  const handlePriceUpdate = useCallback((payload: PriceUpdatePayload) => {
    if (payload.symbol === instrument) {
      setData(prevData => {
        const newPoint = {
          time: new Date(payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: payload.price,
        };
        const newData = [...prevData, newPoint];
        return newData.slice(-20); // Keep a sliding window
      });
    }
  }, [instrument]);

  // Handle WebSocket subscriptions
  useEffect(() => {
    const room = `instrument-price:${instrument}`;
    if (socket && timeRange === 'live') {
      subscribe(room);
      socket.on('price:update', handlePriceUpdate);

      return () => {
        unsubscribe(room);
        socket.off('price:update', handlePriceUpdate);
      };
    }
    return () => {};
  }, [socket, instrument, timeRange, subscribe, unsubscribe, handlePriceUpdate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="mb-4 sm:mb-0">{instrument} Price Chart</CardTitle>
          <div className="w-64">
            <InstrumentSearch
              onSelect={(instrument: FinancialInstrument) => setInstrument(instrument.symbol)}
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={timeRange === 'live' ? 'primary' : 'outline'}
              onClick={() => setTimeRange('live')}
            >
              Live
            </Button>
            <Button
              size="sm"
              variant={timeRange === '1D' ? 'primary' : 'outline'}
              onClick={() => setTimeRange('1D')}
            >
              1D
            </Button>
            <Button
              size="sm"
              variant={timeRange === '1W' ? 'primary' : 'outline'}
              onClick={() => setTimeRange('1W')}
            >
              1W
            </Button>
            <Button
              size="sm"
              variant={timeRange === '1M' ? 'primary' : 'outline'}
              onClick={() => setTimeRange('1M')}
            >
              1M
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p>Loading chart data...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-red-500">Error loading chart data.</p>
          </div>
        ) : (
          <CustomLineChart data={data} lines={lines} xAxisDataKey="time" />
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeChart;

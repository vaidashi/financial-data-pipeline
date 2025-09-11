import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: any[];
  lines: { dataKey: string; stroke: string }[];
  xAxisDataKey: string;
}

const CustomLineChart: React.FC<LineChartProps> = ({ data, lines, xAxisDataKey }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisDataKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map(line => (
          <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.stroke} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;

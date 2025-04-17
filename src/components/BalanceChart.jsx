// src/components/BalanceChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

export default function BalanceChart({ transactions }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const dailyBalanceMap = {};

    let runningBalance = 0;

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    sortedTransactions.forEach((t) => {
      const date = new Date(t.dateTime).toISOString().split('T')[0]; // YYYY-MM-DD
      runningBalance += t.type === "expense" ? -t.price : t.price;

      dailyBalanceMap[date] = runningBalance;
    });

    const data = Object.entries(dailyBalanceMap).map(([date, balance]) => ({
      date,
      balance
    }));

    setChartData(data);
  }, [transactions]);

  return (
    <div className="chart-container">
      <h2>Daily Balance Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

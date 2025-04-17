// src/components/CategoryPieChart.jsx
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a29bfe", "#fd79a8", "#e17055"];

const CategoryPieChart = ({ transactions }) => {
  // Filter only expenses
  const expenses = transactions.filter(t => t.type === "expense");

  // Group and sum by category
  const categoryData = expenses.reduce((acc, transaction) => {
    const { category, price } = transaction;
    acc[category] = (acc[category] || 0) + Math.abs(price);
    return acc;
  }, {});

  const data = Object.entries(categoryData).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="chart-container">
      <h2>Category-wise Expenses</h2>
      {data.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center" }}>No expenses added yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              isAnimationActive={true}
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryPieChart;

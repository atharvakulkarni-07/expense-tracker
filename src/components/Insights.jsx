// src/components/Insights.jsx
import { useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react"; 

const Insights = ({ transactions }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    try {
      setLoading(true);
      const url = import.meta.env.VITE_REACT_APP_API_URL + "/api/insights";
      const res = await axios.post(url , {
        transactions,
      });

      const text = res.data.insights || "";
      // Split insights into individual tips
      const tips = text
        .split(/\n|•|-|\u2022/)
        .map((tip) => tip.trim())
        .filter((tip) => tip.length > 0);

      setInsights(tips);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setInsights(["⚠️ Something went wrong. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl mt-6 max-w-3xl mx-auto border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🔍 AI-Powered Financial Insights (Comming Soon...)
      </h2>

      <div className="flex justify-center">
        <button
          onClick={generateInsights}
          className={`${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-full transition-all duration-200 font-medium`}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate AI Insights"}
        </button>
      </div>

      {insights.length > 0 && (
        <div className="mt-6 bg-white border border-blue-100 rounded-xl p-5 shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Suggestions:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
            {insights.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Insights;

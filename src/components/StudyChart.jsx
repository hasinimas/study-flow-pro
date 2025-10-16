import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const initialData = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 4 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 5 },
  { day: "Sat", hours: 1 },
  { day: "Sun", hours: 3 },
];

const StudyChart = () => {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const saved = localStorage.getItem("chart_data");
    if (saved) setData(JSON.parse(saved));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📈 Weekly Study Trend</h2>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="day" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="url(#lineGradient)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyChart;

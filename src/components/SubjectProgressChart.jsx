// src/components/SubjectProgressChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#7c3aed","#06b6d4","#f59e0b","#ef4444","#10b981","#f97316","#3b82f6","#8b5cf6"];

export default function SubjectProgressChart({ data = [] }) {
  // data: [{ name, target, studied }]
  const chartData = data.map(d => ({ name: d.name, target: d.target, studied: d.studied }));

  // We'll render studied as the main bar, but draw a thin outline representing target using background bars approach
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip formatter={(val, name, props) => {
            if (name === 'studied') return [`${val.toFixed(2)}h`, 'Studied'];
            return [`${val}h`, 'Target'];
          }}/>
          {/* background bars as target (lighter) */}
          <Bar dataKey="target" fill="#ffffff22" barSize={40} />
          <Bar dataKey="studied" barSize={40}>
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

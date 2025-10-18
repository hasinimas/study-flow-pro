// src/pages/Tasks.jsx
import React from "react";
import TaskList from "../components/TaskList";
import StudyLogForm from "../components/StudyLogForm";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";

export default function TasksPage() {
  const [user] = useAuthState(auth);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Task List Section */}
      <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
        <h2 className="text-xl font-semibold mb-3 text-white">📋 Task List</h2>
        <TaskList />
      </div>

      {/* Quick Log Section */}
      <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
        <h3 className="text-lg font-semibold mb-2 text-white">✍️ Quick Log (Manual Entry)</h3>
        <p className="text-sm text-white/70 mb-3">
          Log extra study hours or unplanned sessions manually here.
        </p>
        <StudyLogForm user={user} />
      </div>
    </div>
  );
}

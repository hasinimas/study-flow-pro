// src/pages/Tasks.jsx
import React from "react";
import TaskList from "../components/TaskList";

export default function TasksPage() {
  return (
    <div className="container mx-auto">
      <div className="card">
        <TaskList />
      </div>
    </div>
  );
}

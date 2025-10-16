import React, { useState } from "react";

const TaskList = () => {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("study_tasks")) || []);
  const [newTask, setNewTask] = useState("");

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const updated = [...tasks, { text: newTask, done: false }];
    setTasks(updated);
    localStorage.setItem("study_tasks", JSON.stringify(updated));
    setNewTask("");
  };

  const toggleTask = (i) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;
    setTasks(updated);
    localStorage.setItem("study_tasks", JSON.stringify(updated));
  };

  const removeTask = (i) => {
    const updated = tasks.filter((_, index) => index !== i);
    setTasks(updated);
    localStorage.setItem("study_tasks", JSON.stringify(updated));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📝 Study Tasks</h2>
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 p-2 rounded-md text-black"
        />
        <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 rounded-md font-semibold">Add</button>
      </form>

      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li
            key={i}
            className={`flex justify-between items-center p-2 rounded-md ${
              t.done ? "bg-green-500/20 line-through" : "bg-white/10"
            }`}
          >
            <span>{t.text}</span>
            <div className="flex gap-2">
              <button onClick={() => toggleTask(i)} className="text-sm bg-blue-400 px-2 py-1 rounded">
                {t.done ? "Undo" : "Done"}
              </button>
              <button onClick={() => removeTask(i)} className="text-sm bg-red-400 px-2 py-1 rounded">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;

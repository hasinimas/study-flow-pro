import React, { useEffect, useState } from "react";
import { realtimeDB, ref, push, onValue, set } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function TaskList() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Listen for user auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  // Load tasks from Firebase when user logs in
  useEffect(() => {
    if (!user) return;
    const taskRef = ref(realtimeDB, `tasks/${user.uid}`);
    onValue(taskRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, task]) => ({
          id,
          ...task,
        }));
        setTasks(loaded);
      } else {
        setTasks([]);
      }
    });
  }, [user]);

  // Add a new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    const taskRef = ref(realtimeDB, `tasks/${user.uid}`);
    await push(taskRef, { text: newTask, done: false, createdAt: Date.now() });
    setNewTask("");
  };

  // Toggle done state
  const toggleTask = async (task) => {
    if (!user) return;
    const taskRef = ref(realtimeDB, `tasks/${user.uid}/${task.id}`);
    await set(taskRef, { ...task, done: !task.done });
  };

  // Delete a task
  const removeTask = async (taskId) => {
    if (!user) return;
    const taskRef = ref(realtimeDB, `tasks/${user.uid}/${taskId}`);
    await set(taskRef, null);
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow text-white">
      <h2 className="text-xl font-semibold mb-4">📝 Study Tasks</h2>

      {!user && (
        <p className="text-sm text-red-300 mb-4">
          Please sign in to add and view your study tasks.
        </p>
      )}

      {user && (
        <>
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="New task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 p-2 rounded-md text-black"
            />
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:opacity-90 text-black px-4 rounded-md font-semibold">
              Add
            </button>
          </form>

          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className={`flex justify-between items-center p-2 rounded-md ${
                  t.done ? "bg-green-500/20 line-through" : "bg-white/10"
                }`}
              >
                <span>{t.text}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTask(t)}
                    className="text-sm bg-blue-400 px-2 py-1 rounded"
                  >
                    {t.done ? "Undo" : "Done"}
                  </button>
                  <button
                    onClick={() => removeTask(t.id)}
                    className="text-sm bg-red-400 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

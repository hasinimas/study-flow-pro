import React from "react";
import StudyForm from "../components/StudyForm";
import StudyChart from "../components/StudyChart";
import TaskList from "../components/TaskList";

const Dashboard = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg">
        <StudyForm />
      </div>
      <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg">
        <StudyChart />
      </div>
      <div className="md:col-span-2 bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg">
        <TaskList />
      </div>
    </div>
  );
};

export default Dashboard;

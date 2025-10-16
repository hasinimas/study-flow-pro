import React, { useState } from "react";

const StudyForm = () => {
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Added ${hours} hour(s) for ${subject}`);
    setSubject("");
    setHours("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">📚 Log Study Hours</h2>
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="p-2 rounded-md text-black"
      />
      <input
        type="number"
        placeholder="Hours"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="p-2 rounded-md text-black"
      />
      <button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-md py-2 font-semibold">
        Add Entry
      </button>
    </form>
  );
};

export default StudyForm;

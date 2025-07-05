import React, { useState } from "react";

const Modules = () => {
  const modules = ["Fees", "Employee", "Admission", "Hostel"];

  const [selectedModule, setSelectedModule] = useState("Fees");

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    // You can add additional logic here when a module is selected
  };

  return (
    <div className="mb-2">
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        {modules.map((module) => (
          <button
            key={module}
            className={`btn rounded px-3 ${
              module === selectedModule
                ? "btn-primary" // Active module
                : "btn-outline-primary" // Inactive modules
            }`}
            onClick={() => handleModuleClick(module)}
          >
            {module}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Modules;

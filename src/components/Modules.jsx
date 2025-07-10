import React from "react";

const Modules = ({ selectedModules, setSelectedModules }) => {
  const modules = ["student", "library", "employee", "fee"];

  const toggleModule = (module) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  return (
    <div className="mb-2">
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        {modules.map((module) => (
          <button
            key={module}
            className={`btn rounded px-3 text-capitalize ${
              selectedModules.includes(module)
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => toggleModule(module)}
          >
            {module}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Modules;

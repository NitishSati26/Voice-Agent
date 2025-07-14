import React from "react";
import PropTypes from "prop-types";

const Modules = ({ selectedModules, setSelectedModules }) => {
  const modules = ["student", "library", "employee", "fee"];

  const toggleModule = (module) => {
    try {
      setSelectedModules((prev) =>
        prev.includes(module)
          ? prev.filter((m) => m !== module)
          : [...prev, module]
      );
    } catch (err) {
      console.error("Module toggle error:", err);
    }
  };

  return (
    <div className="mb-2">
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        {modules &&
          modules.map((module) => (
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

Modules.propTypes = {
  selectedModules: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedModules: PropTypes.func.isRequired,
};

export default Modules;

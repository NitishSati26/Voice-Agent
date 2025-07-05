import React from "react";

const HistoryButton = ({ onClick }) => {
  return (
    <button className="btn btn-outline-secondary" onClick={onClick}>
      <i className="bi bi-clock-history me-2"></i>
      History
    </button>
  );
};

export default HistoryButton;

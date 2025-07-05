import React from "react";

const HistoryPanel = ({ onClose }) => {
  // This would be populated with actual history data
  const historyItems = [
    { query: "Show sales report", date: "2023-05-15" },
    { query: "Inventory levels", date: "2023-05-14" },
    { query: "Create purchase order", date: "2023-05-13" },
  ];

  return (
    <div className="col-12 p-4 mb-3 rounded-3 shadow bg-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Query History</h5>
        <button className="btn btn-outline-danger" onClick={onClose}>
          Close
        </button>
      </div>

      <ul className="list-group">
        {historyItems.map((item, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between"
          >
            <span>{item.query}</span>
            <span className="text-muted">{item.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPanel;

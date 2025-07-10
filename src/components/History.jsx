import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function History({ history = [], onClose, onSelect }) {
  const [localQueries, setLocalQueries] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("queryHistory") || "[]");
    const now = Date.now();

    // Filter out expired queries
    const valid = stored.filter((item) => now < item.expiry);

    // Update state
    setLocalQueries(valid.map((item) => item.query));

    // Remove expired from localStorage
    localStorage.setItem("queryHistory", JSON.stringify(valid));
  }, []);

  const combinedHistory = [
    ...localQueries.map((query) => ({ message: query })),
    // ...history,
  ];

  return (
    <div
      className="bg-white p-3 rounded shadow-sm"
      style={{
        marginBottom: "20px",
        border: "1px solid #e0e0e0",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Query History</h5>
        <Button variant="light" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </Button>
      </div>

      {combinedHistory.length === 0 ? (
        <div className="text-center my-4">
          <i
            className="bi bi-clock text-secondary"
            style={{ fontSize: "3rem" }}
          ></i>
          <p className=" fw-bold mb-0">No query history yet</p>
          <p className="text-muted">Your recent queries will appear here</p>
        </div>
      ) : (
        <ul
          className="list-group overflow-y-auto"
          style={{ maxHeight: "200px" }}
        >
          {combinedHistory.map((item, idx) => (
            <li
              key={idx}
              className="list-group-item"
              style={{ cursor: "pointer" }}
              onClick={() => onSelect && onSelect(item.message)}
            >
              {item.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

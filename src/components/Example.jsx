import React, { useEffect } from "react";

export default function Example({ suggestedQueries, onSelect }) {
  // if (!suggestedQueries || suggestedQueries.length === 0) {
  //   return <p>No suggestions yet. Submit a query to see examples.</p>;
  // }

  return (
    <div className="example-container mt-1">
      <h5>Example Queries Here</h5>
      <div
        className="overflow-y-auto"
        style={{
          display: "flex",
          // display: "grid",
          flexWrap: "wrap",
          gap: "5px",
          maxHeight: "60px",
        }}
      >
        {suggestedQueries.map((query, idx) => (
          <button
            key={idx}
            className="btn btn-outline-secondary btn-sm"
            onClick={() => onSelect(query)}
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}

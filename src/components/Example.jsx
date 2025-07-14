import React from "react";

export default function Example({ suggestedQueries, onSelect }) {
  // if (!suggestedQueries || suggestedQueries.length === 0) {
  //   return <p>No suggestions yet. Submit a query to see examples.</p>;
  // }

  if (!Array.isArray(suggestedQueries) || suggestedQueries.length === 0) {
    return (
      <div className="example-container mt-1 text-muted">
        <p className="mb-0 small">
          No suggestions available. Submit a query to get examples.
        </p>
      </div>
    );
  }

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
        {suggestedQueries &&
          suggestedQueries.map((query, idx) => (
            <button
              key={idx}
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                try {
                  onSelect && onSelect(query);
                } catch (err) {
                  console.error("Failed to select suggested query:", err);
                }
              }}
            >
              {query}
            </button>
          ))}
      </div>
    </div>
  );
}

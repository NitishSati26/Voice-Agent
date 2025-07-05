import React from "react";

const ExampleQueries = () => {
  const queries = [
    "Show me last month's sales",
    "What's my current inventory level?",
    "Generate purchase order for supplier X",
    "Show pending invoices",
    "What's the employee attendance for this week?",
  ];

  return (
    <div>
      <h5 className="mb-2">Example Queries</h5>
      <ul className="list-group">
        {queries.map((query, index) => (
          <li key={index} className="list-group-item">
            {query}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleQueries;

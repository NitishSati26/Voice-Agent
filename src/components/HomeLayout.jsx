import React, { useState } from "react";
import Home from "./Home";
import History from "./History";
import { Button } from "react-bootstrap";

export default function HomeLayout() {
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [pendingText, setPendingText] = useState("");

  // const toggleHistory = () => setShowHistory(!showHistory);

  const toggleHistory = () => {
    try {
      setShowHistory((prev) => !prev);
    } catch (err) {
      console.error("Failed to toggle history:", err);
    }
  };

  const handleSelectQuery = (query) => {
    try {
      setPendingText(query);
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to select query from history:", err);
    }
  };

  return (
    <div className="d-flex">
      <div className="flex-grow-1 mx-auto" style={{ maxWidth: "800px" }}>
        <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
          <Button
            variant={showHistory ? "secondary" : "outline-primary"}
            onClick={toggleHistory}
          >
            <i className="bi bi-clock-history me-1"></i> History
          </Button>
        </div>

        {showHistory && (
          <History
            history={chatHistory.filter((h) => h.type === "user")}
            onClose={toggleHistory}
            onSelect={handleSelectQuery}
          />
        )}

        <Home
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          pendingText={pendingText}
          setPendingText={setPendingText}
        />
      </div>
    </div>
  );
}

import React, { useState } from "react";
import Home from "./Home";
import HistoryButton from "./HistoryButton";
import HistoryPanel from "./HistoryPanel";

const HomeLayout = () => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="container-fluid  d-flex flex-column w-50 ">
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center p-3">
          <HistoryButton onClick={() => setShowHistory(!showHistory)} />
          {/* <h1 className="m-0">G6 Voice Assistant</h1> */}
        </div>
      </div>

      <div className="row flex-grow-1">
        {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
        {<Home />}
      </div>
    </div>
  );
};

export default HomeLayout;

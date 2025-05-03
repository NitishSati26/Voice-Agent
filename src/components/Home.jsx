import React, { useState } from "react";
import Recorder from "./Recorder";
import Transcription from "./Transcription";
import Response from "./Response";

export default function Home() {
  let autoSubmit = true;
  const [transcribedText, setTranscribedText] = useState("");
  const [response, setResponse] = useState(null);
  const [previousQuery, setPreviousQuery] = useState(null);

  const handleResetBeforeRecording = () => {
    setTranscribedText("");
    setResponse(null);
    setPreviousQuery(null);
  };

  return (
    <div className="home-container">
      <h1>G6 Voice Assistant</h1>

      <Recorder onTranscription={setTranscribedText}
        onReset={handleResetBeforeRecording}
      />

      {transcribedText && (
        <Transcription
          autoSubmit={autoSubmit}
          transcribedText={transcribedText}
          previousQuery={previousQuery}
          setResponse={setResponse}
        // setResponseTime={setResponseTime}
        />
      )}

      {response && (
        <Response
          autoSubmit={autoSubmit}
          response={response}
          setResponse={setResponse}
          transcribedText={transcribedText}
          setTranscribedText={setTranscribedText}
          setPreviousQuery={setPreviousQuery}
        />
      )}
      {response?.database_query_execution_time && <div className="response-box">
        {response?.database_query_execution_time && <div className="response-time">⏰ Database query execution time: {response.database_query_execution_time} </div>}
        {response?.processing_time_except_database_query_execution && <div className="response-time">⏰ LLM query execution time: {response.processing_time_except_database_query_execution} </div>}
      </div>}

    </div>
  );
}

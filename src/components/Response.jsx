import React, { useEffect, useState } from "react";
import ClarificationComponent from "./ClarificationComponent";
import VoiceWaveform from "./WaveProcessing";
import "../styles/Response.css";

const isJsonString = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const renderTableFromJson = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      const headers = Object.keys(data[0]);
      return (
        <div className="table-responsive">
          <table className="response-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={`${index}-${header}`}>
                      {row[header] !== undefined ? String(row[header]) : "N/A"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (typeof data === "object" && !Array.isArray(data)) {
      return (
        <table className="response-table">
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td className="table-key">{key}</td>
                <td className="table-value">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return <p>{jsonString}</p>;
  } catch (e) {
    return <p>{jsonString}</p>;
  }
};

export default function Response({
  response,
  autoSubmit,
  setPreviousQuery,
  setResponse,
  transcribedText,
  setTranscribedText,
}) {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (response?.summarized_response) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const newAudio = new Audio(
        `data:audio/mp3;base64,${response.summarized_response}`
      );
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [response]);

  const handleToggleAudio = () => {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const renderResponseContent = () => {
    if (!response?.raw_response) return <VoiceWaveform active={true} />;
    if (isJsonString(response.raw_response)) {
      return renderTableFromJson(response.raw_response);
    }
    return <p>{response.raw_response}</p>;
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Main response content with scroll */}
      <div
        className="flex-grow-1 overflow-auto mb-3"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <div className="chat-message assistant-message">
          <div className="assistant-message-content">
            {renderResponseContent()}

            <div className="response-actions">
              {audio && (
                <button
                  onClick={handleToggleAudio}
                  className="audio-btn btn btn-sm btn-outline-primary"
                >
                  {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* {response?.payload && (
          <div className="payload-box mt-3 p-3 bg-light rounded">
            <h5>Payload Details</h5>
            <pre className="p-2 bg-white rounded">
              {JSON.stringify(response.payload, null, 2)}
            </pre>
          </div>
        )} */}
      </div>

      {/* Fixed bottom section */}
      <div className="flex-shrink-0">
        {(response?.ambiguity || response?.fallback) && (
          <ClarificationComponent
            ambiguityText={response.ambiguity || response.fallback}
            responseType={response.ambiguity ? "ambiguity" : "fallback"}
            transcribedText={transcribedText}
            setPreviousQuery={() => setPreviousQuery(response.raw_response)}
            response={response}
            setResponse={setResponse}
            autoSubmit={autoSubmit}
          />
        )}

        {response?.database_query_execution_time && (
          <div className="response-time text-muted small mt-2">
            ⏰ Query: {response.database_query_execution_time}s | Payload:{" "}
            {response.payload_generation_time}s | Total:{" "}
            {response.end_to_end_time}s
          </div>
        )}
      </div>
    </div>
  );
}

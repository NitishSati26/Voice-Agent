import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal, Pause, Play } from "lucide-react";
// import Modules from "./Modules";
import Recorder from "./Recorder";
import Response from "./Response";
import Example from "./Example";

export default function Home({
  chatHistory,
  setChatHistory,
  pendingText,
  setPendingText,
}) {
  // const [selectedModules, setSelectedModules] = useState(["student"]);
  const [transcribedText, setTranscribedText] = useState("");
  // const [pendingText, setPendingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [response, setResponse] = useState(null);
  // const [chatHistory, setChatHistory] = useState([]);
  const [ambiguityMode, setAmbiguityMode] = useState(false); // NEW
  const [lastQuery, setLastQuery] = useState("");
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // const recorderRef = useRef(null);

  // const handleTranscription = (text) => {
  //   setTranscribedText(text);
  // };

  useEffect(() => {
    if (!response?.summarized_response) return;

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // Create new audio
    const audio = new Audio(
      `data:audio/mp3;base64,${response.summarized_response}`
    );
    audioRef.current = audio;

    audio.play();
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
  }, [response?.summarized_response]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTranscription = (text) => {
    setPendingText(text);
    setHasEdited(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (!hasEdited) {
        setTranscribedText(text);
        setPendingText("");
      }
    }, 10000);
  };

  const handleSubmit = () => {
    if (!pendingText.trim()) return;

    // ✅ RESET chat if previous response was final
    if (response?.raw_response) {
      setResponse(null);
      setChatHistory([]);
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    setTranscribedText(pendingText.trim());
    setPendingText("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  const handleStartNewQuery = () => {
    if (response?.raw_response) {
      setResponse(null);
      setChatHistory([]);
    }
  };

  // const handleInputChange = (e) => {
  //   setPendingText(e.target.value);
  // };

  // const handleInputKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     if (timerRef.current) clearTimeout(timerRef.current);
  //     setTranscribedText(pendingText.trim());
  //     setPendingText("");
  //   }
  // };

  return (
    <div
      className="home-container container mt-3 p-4 bg-white rounded shadow-lg"
      style={{ display: "flex", flexDirection: "column", height: "610px" }}
    >
      <h2
        className="d-flex justify-content-center"
        style={{ padding: "10px", margin: "0" }}
      >
        G6 Voice Assistant
      </h2>
      {/* <Modules
        selectedModules={selectedModules}
        setSelectedModules={setSelectedModules}
      /> */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Response
          transcribedText={transcribedText}
          setTranscribedText={setTranscribedText}
          response={response}
          setResponse={setResponse}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          ambiguityMode={ambiguityMode}
          setAmbiguityMode={setAmbiguityMode}
          lastQuery={lastQuery}
          setLastQuery={setLastQuery}
          setSuggestedQueries={setSuggestedQueries}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          // selectedModules={selectedModules}
        />
      </div>

      {/* Input and Mic Container */}
      <div
        className="chatgpt-input-container"
        style={{ display: "flex", padding: "10px" }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            className="chatgpt-input"
            placeholder={isRecording ? "" : "Type a message or use the mic…"}
            value={isRecording ? "" : pendingText}
            onChange={(e) => {
              setPendingText(e.target.value);
              setHasEdited(true); // user started editing
              // clear the timer when editing
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
            }}
            onKeyDown={handleInputKeyDown}
            style={{ width: "100%", paddingRight: "80px" }}
          />

          {isRecording && (
            <div className="wave-animation">
              {Array.from({ length: 100 }).map((_, i) => (
                <span key={i}></span>
              ))}
            </div>
          )}
          <div
            style={{
              position: "absolute",
              right: "5px",
              top: "40%",
              transform: "translateY(-15%)",
              display: "flex",
              gap: "10px",
            }}
          >
            {audioRef.current && (
              <button
                onClick={toggleAudio}
                disabled={!audioRef.current}
                className="p-0 border-0 bg-transparent"
              >
                {isPlaying ? (
                  <Pause
                    className="icon text-danger"
                    // style={{ color: "red" }}
                    size={20}
                  />
                ) : (
                  <Play
                    className="icon text-primary"
                    // style={{ color: "#2563eb" }}
                    size={20}
                  />
                )}
              </button>
            )}

            <Recorder
              onTranscription={handleTranscription}
              onRecordingChange={setIsRecording}
              onStartNewQuery={handleStartNewQuery}
              onFallbackChange={setIsFallback}
              disabled={isLoading}
            />

            {isFallback && isRecording && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setIsRecording(false)}
              >
                Stop
              </button>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <SendHorizontal
                className="icon text-primary"
                // style={{ color: "#2563eb" }}
                size={20}
              />
            </button>
          </div>
        </div>
      </div>

      <Example
        suggestedQueries={suggestedQueries}
        onSelect={(query) => setPendingText(query)}
      />
      {/* <Recorder onTranscription={handleTranscription} /> */}
    </div>
  );
}

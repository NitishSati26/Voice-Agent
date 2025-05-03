import React, { useState, useRef, useEffect, useCallback } from "react";
import { apiRequest } from "../utils/apiRequest";
import "../styles/Recorder.css";

export default function VoiceQueryHandler({ setResponse, setTranscribedText, setPreviousQuery }) {
  const [isRecording, setIsRecording] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const submitTimeoutRef = useRef(null);

  const startRecording = useCallback(async () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    setIsRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      stopRecording();
      setEditedText(transcript);
      setTranscribedText(transcript);
      triggerAutoSubmit(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please allow microphone access.");
      setIsRecording(false);
    }
  }, [setTranscribedText]);

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const triggerAutoSubmit = (text) => {
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    submitTimeoutRef.current = setTimeout(() => {
      handleSubmit(text);
    }, 3000);
  };

  const handleSubmit = async (text) => {
    if (!text.trim()) {
      alert("Cannot submit an empty response.");
      return;
    }

    const payload = {
      institute_id: "SUA",
      user_name: "string",
      authenticated_module: ["student", "library", "employee", "fee"],
      query: text,
      previous_query: null,
    };

    setLoading(true);
    setError(null);
    setPreviousQuery(null);
    setResponse(null);

    try {
      const data = await apiRequest("process_query", "POST", payload);
      setResponse(data);
    } catch (error) {
      console.error("Submission failed:", error);
      setError("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voice-query-container">
      <button
        className={`record-btn ${isRecording ? "recording" : ""}`}
        onClick={startRecording}
        disabled={isRecording}
      >
        {isRecording ? "Recording..." : "Start Recording"}
      </button>

      {editedText && (
  <>
    <input
      className="transcription-input"
      value={editedText}
      onChange={(e) => {
        const newText = e.target.value;
        setEditedText(newText);

        if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = setTimeout(() => {
          handleSubmit(newText);
        }, 500);
      }}
    />  
    <button
      className="submit-btn"
      onClick={() => handleSubmit(editedText)}
      disabled={loading}
    >
      {loading ? "Submitting..." : "Submit"}
    </button>
  </>
)}

      {loading && <p className="loading-text">Processing your request...</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
    
    
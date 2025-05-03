import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "../utils/apiRequest";
import "../styles/Transcription.css";

export default function Transcription({ transcribedText, previousQuery, setResponse, autoSubmit = true }) {
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const submitTimeoutRef = useRef(null);
  const lastSubmittedTextRef = useRef(""); // 🧠 Track last submitted query

  useEffect(() => {
    if (transcribedText && transcribedText.trim() !== "") {
      setEditedText(transcribedText);

      if (autoSubmit) {
        if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);

        // 🕒 Debounce submit
        submitTimeoutRef.current = setTimeout(() => {
          if (transcribedText !== lastSubmittedTextRef.current) {
            handleSubmit(transcribedText);
          }
        }, 1000); // Delay of 1s
      }
    }

    return () => clearTimeout(submitTimeoutRef.current);
  }, [transcribedText, autoSubmit]);

  const handleTextChange = (text) => {
    setEditedText(text);

    if (!autoSubmit) {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);

      submitTimeoutRef.current = setTimeout(() => {
        if (text !== lastSubmittedTextRef.current) {
          handleSubmit(text);
        }
      }, 3000); // Manual edit debounce
    }
  };

  const handleSubmit = async (textToSubmit = editedText) => {
    const trimmedText = textToSubmit.trim();

    if (!trimmedText) {
      alert("Cannot submit an empty response.");
      return;
    }

    // ✅ Check if it's already submitted
    if (trimmedText === lastSubmittedTextRef.current) return;

    lastSubmittedTextRef.current = trimmedText;

    const payload = {
      institute_id: "SUA",
      user_name: "string",
      authenticated_module: ["student", "library", "employee", "fee"],
      query: trimmedText,
      previous_query: previousQuery || null,
    };

    setLoading(true);
    setError(null);

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
    <div className="transcription-container">
      <input
        className="transcription-input"
        value={editedText}
        onChange={(e) => handleTextChange(e.target.value)}
        disabled={autoSubmit}
      />
      <button className="submit-btn" onClick={() => handleSubmit()} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {loading && <p className="loading-text">Processing your request...</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

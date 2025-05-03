import React, { useState, useRef, useEffect } from "react";
import Recorder from "./Recorder";
import { apiRequest } from "../utils/apiRequest";

const ClarificationComponent = ({
  ambiguityText,
  responseType,
  setPreviousQuery,
  transcribedText,
  response,
  setResponse,
  autoSubmit, // ✅ default is true
}) => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ambiguityCount, setAmbiguityCount] = useState(0);
  const submitTimeoutRef = useRef(null);

  // ✅ Auto-submit logic (conditional based on the flag)
  useEffect(() => {
    if (!autoSubmit || !inputText.trim() || loading) return;

    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    submitTimeoutRef.current = setTimeout(() => {
      handleSubmit();
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(submitTimeoutRef.current);
  }, [inputText, autoSubmit, loading]);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      alert("Cannot submit an empty clarification.");
      return;
    }

    const isAmbiguity = responseType === "ambiguity";
    let endpoint = "";
    let payload = {};

    if (isAmbiguity && ambiguityCount >= 3) {
      setAmbiguityCount(0);
      endpoint = "one_shot_processing";
      payload = {
        institute_id: "SUA",
        user_name: "string",
        authenticated_module: ["student", "library", "employee", "fee"],
        query: response.query,
        module: response.module,
      };
    } else {
      endpoint = isAmbiguity ? "process_ambiguity" : "specified_module";
      payload = isAmbiguity
        ? {
            input: inputText,
            chat_history: response.chat_history,
            query: response.query,
            module: response.module,
            user_name: "string",
            institute_id: "SUA",
            authenticated_module: ["student", "library", "employee", "fee"],
          }
        : {
            prev_input: transcribedText,
            input_text: inputText,
            user_name: "string",
            institute_id: "SUA",
            authenticated_module: ["student", "library", "employee", "fee"],
          };
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest(endpoint, "POST", payload);
      setResponse(data);
      setPreviousQuery(null);
      setInputText("");
      if (isAmbiguity) setAmbiguityCount((count) => count + 1);
    } catch (error) {
      console.error("Error resolving clarification:", error);
      setError("Failed to resolve. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clarification-container">
      <h3>🤔 Clarification Needed</h3>
      <p>{ambiguityText}</p>

      <Recorder onTranscription={setInputText} />

      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type clarification here"
        disabled={loading || autoSubmit}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Resolving..." : "Submit"}
      </button>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default ClarificationComponent;

import React, { useCallback, useEffect, useRef } from "react";
import { apiRequest } from "../utils/apiRequest";

export default function Response({
  transcribedText,
  setTranscribedText,
  response,
  setResponse,
  chatHistory,
  setChatHistory,
  ambiguityMode,
  setAmbiguityMode,
  lastQuery,
  setLastQuery,
  setSuggestedQueries,
  isLoading,
  setIsLoading,
  selectedModules,
}) {
  const chatEndRef = useRef(null);

  // scroll to bottom on chatHistory change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleQuery = useCallback(
    async (query) => {
      const payload = {
        institute_id: "SUA",
        user_name: "string",
        authenticated_module: ["student", "library", "employee", "fee"],
        // authenticated_module: selectedModules,
        query,
        suggested_query: [],
      };

      setIsLoading(true);

      try {
        const data = await apiRequest("process_query", "POST", payload);
        setResponse(data);
        setLastQuery(query); // Save latest query
        setLastQuery(query);

        const expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day later
        const stored = JSON.parse(localStorage.getItem("queryHistory") || "[]");

        // add new query
        stored.push({ query, expiry });

        // save back
        localStorage.setItem("queryHistory", JSON.stringify(stored));

        setSuggestedQueries(
          data.suggested_query || [
            "Give me the Employee details of Mohit",
            "Give me the Aadhar Number of Harsh",
            "What is the total marks of student Rohit",
            "List the student having maximum marks",
            "List the student who has maximum percentage in MCA",
            "What is the total count of students in ABESIT",
          ]
        );

        setChatHistory((prev) => [
          ...prev,
          {
            type: "response",
            message: data.raw_response || data.ambiguity || data.fallback,
          },
        ]);

        // If response is ambiguity or fallback, go into clarification mode
        if (data.ambiguity || data.fallback) {
          setAmbiguityMode(true);
        } else {
          setAmbiguityMode(false);
        }

        setTranscribedText("");
      } catch (err) {
        console.error("Query Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      setResponse,
      setLastQuery,
      setSuggestedQueries,
      setChatHistory,
      setAmbiguityMode,
      setTranscribedText,
      setIsLoading,
    ]
  );

  const handleClarification = useCallback(
    async (input) => {
      const isAmbiguity = response?.ambiguity != null;

      const endpoint = isAmbiguity ? "process_ambiguity" : "specified_module";
      const payload = isAmbiguity
        ? {
            input,
            chat_history: response.chat_history,
            query: response.query,
            module: response.module,
            user_name: "string",
            institute_id: "SUA",
            authenticated_module: ["student", "library", "employee", "fee"],
            // authenticated_module: selectedModules,
          }
        : {
            // prev_input: response?.query,
            prev_input: lastQuery,
            input_text: input,
            user_name: "string",
            institute_id: "SUA",
            authenticated_module: ["student", "library", "employee", "fee"],
            // authenticated_module: selectedModules,
          };

      setIsLoading(true);

      try {
        const data = await apiRequest(endpoint, "POST", payload);
        setResponse(data);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "response",
            message: data.raw_response || data.ambiguity || data.fallback,
          },
        ]);

        if (data.ambiguity || data.fallback) {
          setAmbiguityMode(true);
        } else {
          setAmbiguityMode(false);
        }

        setTranscribedText("");
      } catch (err) {
        console.error("Clarification Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      response,
      lastQuery,
      setResponse,
      setChatHistory,
      setAmbiguityMode,
      setTranscribedText,
      setIsLoading,
    ]
  );

  useEffect(() => {
    if (!transcribedText.trim()) return;
    const trimmed = transcribedText.trim();
    setChatHistory((prev) => [...prev, { type: "user", message: trimmed }]);
    if (ambiguityMode) {
      handleClarification(trimmed);
    } else {
      handleQuery(trimmed);
    }
  }, [
    transcribedText,
    ambiguityMode,
    handleClarification,
    handleQuery,
    setChatHistory,
  ]);

  return (
    <div className="response-container">
      <div className="chat-container">
        {chatHistory.map((item, idx) => {
          if (isJsonString(item.message)) {
            return (
              <div key={idx} style={{ margin: "10px 0" }}>
                <JsonTable json={item.message} />
              </div>
            );
          }

          return (
            <div key={idx} className={`chat-bubble ${item.type}`}>
              {item.message}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

function isJsonString(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function JsonTable({ json }) {
  let data;

  try {
    data = JSON.parse(json);
  } catch {
    return <pre>{json}</pre>; // fallback if not JSON
  }

  // Handle if data is empty object or empty array
  if (
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === "object" &&
      !Array.isArray(data) &&
      Object.keys(data).length === 0)
  ) {
    return <div className="text-center text-muted py-2">No record found.</div>;
  }

  // always work with an array
  if (!Array.isArray(data)) {
    data = [data];
  }

  // collect all unique keys across all rows
  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));

  return (
    <table className="table table-hover align-middle">
      <thead className="table-light">
        <tr>
          <th>#</th>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <th scope="row">{idx + 1}</th>
            {headers.map((header) => (
              <td key={header}>{String(row[header] ?? "")}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

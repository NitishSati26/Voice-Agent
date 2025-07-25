import React, { useState, useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import Feedback from "./Feedback";
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
  const [ambiguityCount, setAmbiguityCount] = useState(0);
  const chatEndRef = useRef(null);

  // scroll to bottom on chatHistory change
  // useEffect(() => {
  //   if (chatEndRef.current) {
  //     chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [chatHistory]);

  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];

    // Don't scroll if it's a JSON string (likely a raw_response)
    const shouldScroll =
      !isJsonString(lastMessage?.message) || !response?.raw_response;

    if (chatEndRef.current && shouldScroll) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, response]);

  const handleQuery = useCallback(
    async (query, isUserQuery = false) => {
      if (isUserQuery) {
        setChatHistory((prev) => [...prev, { type: "user", message: query }]);
      }

      const payload = {
        institute_id: "SUA",
        user_name: "string",
        authenticated_module: ["student", "library", "employee", "fee"],
        // authenticated_module: selectedModules,
        query,
        // suggested_query: [],
      };

      setIsLoading(true);

      try {
        const data = await apiRequest("process_query", "POST", payload);
        if (!data) throw new Error("Empty response received");
        setResponse(data);
        setLastQuery(query); // Save latest query

        const expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day later
        const stored = JSON.parse(localStorage.getItem("queryHistory") || "[]");

        // add new query
        stored.push({ query, expiry });

        // save back
        localStorage.setItem("queryHistory", JSON.stringify(stored));

        if (data.suggested_query) {
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
        }

        setChatHistory((prev) => [
          ...prev,
          {
            type: "response",
            message: data.raw_response || data.ambiguity || data.fallback,
          },
        ]);

        // If response is ambiguity or fallback, go into clarification mode
        // if (data.ambiguity || data.fallback) {
        //   setAmbiguityMode(true);
        // } else {
        //   setAmbiguityMode(false);
        // }

        setAmbiguityMode(!!(data.ambiguity || data.fallback));

        setAmbiguityCount(0);
        setTranscribedText("");
      } catch (err) {
        console.error("Query Error:", err);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "response",
            message: "An error occurred while processing the query.",
          },
        ]);
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
      setChatHistory((prev) => [...prev, { type: "user", message: input }]);

      const isAmbiguity = response?.ambiguity != null;
      // const endpoint = isAmbiguity ? "process_ambiguity" : "specified_module";
      const endpoint =
        ambiguityCount >= 3
          ? "one_shot_processing"
          : isAmbiguity
          ? "process_ambiguity"
          : "specified_module";

      const payload =
        endpoint === "one_shot_processing"
          ? {
              query: input,
              module: response?.module,
              user_name: "string",
              institute_id: "SUA",
              authenticated_module: ["student", "library", "employee", "fee"],
              // authenticated_module: selectedModules,
            }
          : isAmbiguity
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

        // Reset counter on success
        if (!data.ambiguity && !data.fallback) {
          setAmbiguityCount(0);
          setAmbiguityMode(false);
        } else if (endpoint === "process_ambiguity") {
          setAmbiguityCount((prev) => prev + 1);
          setAmbiguityMode(true);
        } else {
          setAmbiguityMode(false);
        }

        setResponse(data);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "response",
            message: data.raw_response || data.ambiguity || data.fallback,
          },
        ]);

        // if (data.ambiguity || data.fallback) {
        //   setAmbiguityMode(true);
        // } else {
        //   setAmbiguityMode(false);
        // }

        setTranscribedText("");
      } catch (err) {
        console.error("Clarification Error:", err);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "response",
            message: "An error occurred during clarification.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      response,
      lastQuery,
      ambiguityCount,
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
    // setChatHistory((prev) => [...prev, { type: "user", message: trimmed }]);
    if (ambiguityMode) {
      handleClarification(trimmed);
    } else {
      handleQuery(trimmed, true); // <-- Pass true so user message is only logged once
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
                {/* <JsonTable json={item.message} /> */}
                <>
                  <JsonTable json={item.message} />
                  {response?.raw_response && idx === chatHistory.length - 1 && (
                    <Feedback requestId={response?.request_id} />
                  )}
                </>
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
        {/* {isLoading && (
          <div className="loading-spinner text-center my-2">
            <span className="spinner-border spinner-border-sm"></span> Loading…
          </div>
        )} */}
        {isLoading && (
          <div className="text-center py-2">
            <Loader2 className="text-primary animate-spin" size={20} />
            <span className="ms-2">Loading…</span>
          </div>
        )}
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

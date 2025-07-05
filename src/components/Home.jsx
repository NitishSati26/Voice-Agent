// import React, { useState } from "react";
// import Header from "./Header";
// import Modules from "./Modules";
// import InputArea from "./InputArea";
// import ExampleQueries from "./ExampleQueries";
// import Transcription from "./Transcription";
// import Response from "./Response";

// const Home = () => {
//   const [transcribedText, setTranscribedText] = useState("");
//   const [response, setResponse] = useState(null);
//   const [previousQuery, setPreviousQuery] = useState(null);

//   const handleResetBeforeRecording = () => {
//     setTranscribedText("");
//     setResponse(null);
//     setPreviousQuery(null);
//   };

//   return (
//     <div className="col-12 d-flex flex-column h-100 p-4 rounded-3 shadow bg-white">
//       <Header />
//       <Modules />

//       <InputArea
//         onTranscription={setTranscribedText}
//         onReset={handleResetBeforeRecording}
//         transcribedText={transcribedText}
//         setTranscribedText={setTranscribedText}
//       />

//       {transcribedText && (
//         <Transcription
//           autoSubmit={true}
//           transcribedText={transcribedText}
//           previousQuery={previousQuery}
//           setResponse={setResponse}
//         />
//       )}

//       {response && (
//         <Response
//           autoSubmit={true}
//           response={response}
//           setResponse={setResponse}
//           transcribedText={transcribedText}
//           setTranscribedText={setTranscribedText}
//           setPreviousQuery={setPreviousQuery}
//         />
//       )}

//       <ExampleQueries />
//     </div>
//   );
// };

// export default Home;

// ---------------------------------------------------------------------------------------

// import React, { useState, useRef, useEffect } from "react";
// import Header from "./Header";
// import Modules from "./Modules";
// import InputArea from "./InputArea";
// import ExampleQueries from "./ExampleQueries";
// import Response from "./Response";
// import "../styles/Home.css";

// const Home = () => {
//   const [messages, setMessages] = useState([]);
//   const [transcribedText, setTranscribedText] = useState("");
//   const [response, setResponse] = useState(null);
//   const [previousQuery, setPreviousQuery] = useState(null);
//   const messagesEndRef = useRef(null);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleResetBeforeRecording = () => {
//     setTranscribedText("");
//     setResponse(null);
//     setPreviousQuery(null);
//   };

//   // Add new messages to the chat
//   useEffect(() => {
//     if (transcribedText) {
//       setMessages((prev) => [
//         ...prev,
//         { text: transcribedText, sender: "user" },
//       ]);
//     }
//   }, [transcribedText]);

//   useEffect(() => {
//     if (response) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           text: response.raw_response,
//           sender: "assistant",
//           responseData: response,
//         },
//       ]);
//     }
//   }, [response]);

//   return (
//     <div className="chat-home-container">
//       <Header />
//       <Modules />

//       <div className="chat-messages">
//         {messages.map((message, index) => (
//           <div key={index} className={`message ${message.sender}`}>
//             {message.sender === "assistant" ? (
//               <Response
//                 autoSubmit={true}
//                 response={message.responseData}
//                 setResponse={setResponse}
//                 transcribedText={message.text}
//                 setTranscribedText={setTranscribedText}
//                 setPreviousQuery={setPreviousQuery}
//               />
//             ) : (
//               <div className="message-content">{message.text}</div>
//             )}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <InputArea
//         onTranscription={setTranscribedText}
//         onReset={handleResetBeforeRecording}
//         transcribedText={transcribedText}
//         setTranscribedText={setTranscribedText}
//       />

//       <ExampleQueries />
//     </div>
//   );
// };

// export default Home;

// -------------------------------------------------------------------------

import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import Modules from "./Modules";
import InputArea from "./InputArea";
import ExampleQueries from "./ExampleQueries";
import Transcription from "./Transcription";
import Response from "./Response";
import "../styles/Home.css";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [transcribedText, setTranscribedText] = useState("");
  const [response, setResponse] = useState(null);
  const [previousQuery, setPreviousQuery] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleResetBeforeRecording = () => {
    setTranscribedText("");
    setResponse(null);
    setPreviousQuery(null);
  };

  // Handle voice/text input
  const handleInput = (text) => {
    setTranscribedText(text);
    setMessages((prev) => [
      ...prev,
      {
        text,
        sender: "user",
        type: "query",
      },
    ]);
  };

  return (
    <div className="chat-home-container">
      <Header />
      <Modules />

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.sender === "assistant" ? (
              <Response
                autoSubmit={true}
                response={message.responseData}
                setResponse={setResponse}
                transcribedText={message.text}
                setTranscribedText={setTranscribedText}
                setPreviousQuery={setPreviousQuery}
              />
            ) : (
              <div className="message-content">{message.text}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <InputArea
        onTranscription={handleInput}
        onReset={handleResetBeforeRecording}
        transcribedText={transcribedText}
        setTranscribedText={setTranscribedText}
      />

      {transcribedText && (
        <Transcription
          autoSubmit={true}
          transcribedText={transcribedText}
          previousQuery={previousQuery}
          setResponse={(data) => {
            setResponse(data);
            setMessages((prev) => [
              ...prev,
              {
                text: data.raw_response,
                sender: "assistant",
                type: "response",
                responseData: data,
              },
            ]);
          }}
        />
      )}

      {response && (
        <Response
          autoSubmit={true}
          response={response}
          setResponse={setResponse}
          transcribedText={transcribedText}
          setTranscribedText={setTranscribedText}
          setPreviousQuery={setPreviousQuery}
        />
      )}

      <ExampleQueries />
    </div>
  );
};

export default Home;

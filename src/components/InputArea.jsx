// // import React from "react";
// // import Recorder from "./Recorder";

// // const InputArea = ({
// //   onTranscription,
// //   onReset,
// //   transcribedText,
// //   setTranscribedText,
// // }) => {
// //   return (
// //     <div className="mb-2">
// //       {/* Remove input-group and use simple column structure */}
// //       <div className="d-flex flex-column ">
// //         <input
// //           type="text"
// //           className="form-control w-full min-h-16 sm:min-h-24 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 flex items-center justify-center relative"
// //           placeholder="Press 'Start Recording' or spacebar to ask a question"
// //           aria-label="Question input"
// //           value={transcribedText}
// //           onChange={(e) => setTranscribedText(e.target.value)}
// //         />
// //         <div className="d-flex justify-content-center">
// //           <Recorder onTranscription={onTranscription} onReset={onReset} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InputArea;

// import React, { useState, useEffect, useRef } from "react";
// import PropTypes from "prop-types";
// import Recorder from "./Recorder";

// const InputArea = ({
//   onTranscription,
//   onReset,
//   transcribedText,
//   setTranscribedText,
//   onSubmit,
// }) => {
//   const [typingTimeout, setTypingTimeout] = useState(null);
//   const lastSubmittedTextRef = useRef("");
//   const isMountedRef = useRef(true);

//   const handleSubmit = (text) => {
//     if (!isMountedRef.current) return;

//     const trimmedText = text.trim();
//     if (!trimmedText || trimmedText === lastSubmittedTextRef.current) return;

//     lastSubmittedTextRef.current = trimmedText;

//     try {
//       if (typeof onSubmit === "function") {
//         onSubmit(trimmedText);
//       } else {
//         console.warn("onSubmit is not a function");
//       }
//     } catch (error) {
//       console.error("Error in onSubmit handler:", error);
//     }
//   };

//   const handleChange = (e) => {
//     const text = e.target.value;
//     setTranscribedText(text);

//     // Clear any existing timeout
//     if (typingTimeout) {
//       clearTimeout(typingTimeout);
//     }

//     // Set a new timeout for 5 seconds after typing stops
//     if (text.trim()) {
//       setTypingTimeout(
//         setTimeout(() => {
//           handleSubmit(text);
//         }, 5000) // 5 seconds delay
//       );
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && transcribedText.trim()) {
//       e.preventDefault();
//       // Clear the typing timeout when user manually submits
//       if (typingTimeout) {
//         clearTimeout(typingTimeout);
//       }
//       handleSubmit(transcribedText);
//     }
//   };

//   useEffect(() => {
//     isMountedRef.current = true;

//     return () => {
//       isMountedRef.current = false;
//       // Clean up timeout on unmount
//       if (typingTimeout) {
//         clearTimeout(typingTimeout);
//       }
//     };
//   }, [typingTimeout]);

//   return (
//     <div className="mb-2">
//       <div className="d-flex flex-column">
//         <input
//           type="text"
//           className="form-control w-full min-h-16 sm:min-h-24 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 flex items-center justify-center relative"
//           placeholder="Press 'Start Recording' or spacebar to ask a question"
//           aria-label="Question input"
//           value={transcribedText}
//           onChange={handleChange}
//           onKeyDown={handleKeyDown}
//         />
//         <div className="d-flex justify-content-center">
//           <Recorder
//             onTranscription={(text) => {
//               if (typeof onTranscription === "function") {
//                 onTranscription(text);
//               }
//               // Clear any existing timeout for voice input
//               if (typingTimeout) {
//                 clearTimeout(typingTimeout);
//               }
//               handleSubmit(text);
//             }}
//             onReset={() => {
//               if (typeof onReset === "function") {
//                 onReset();
//               }
//               lastSubmittedTextRef.current = "";
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// InputArea.propTypes = {
//   onTranscription: PropTypes.func,
//   onReset: PropTypes.func,
//   transcribedText: PropTypes.string.isRequired,
//   setTranscribedText: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
// };

// InputArea.defaultProps = {
//   onTranscription: () => {},
//   onReset: () => {},
// };

// export default InputArea;

// InputArea.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../styles/InputArea.css";

import Recorder from "./Recorder";

const InputArea = ({
  onTranscription,
  onReset,
  transcribedText,
  setTranscribedText,
  onSubmit,
}) => {
  const [typingTimeout, setTypingTimeout] = useState(null);
  const lastSubmittedTextRef = useRef("");
  const isMountedRef = useRef(true);

  const handleSubmit = (text) => {
    if (!isMountedRef.current) return;

    const trimmedText = text.trim();
    if (!trimmedText || trimmedText === lastSubmittedTextRef.current) return;

    lastSubmittedTextRef.current = trimmedText;

    try {
      if (typeof onSubmit === "function") {
        onSubmit(trimmedText);
      } else {
        console.warn("onSubmit is not a function");
      }
    } catch (error) {
      console.error("Error in onSubmit handler:", error);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setTranscribedText(text);

    if (typingTimeout) clearTimeout(typingTimeout);

    if (text.trim()) {
      setTypingTimeout(setTimeout(() => handleSubmit(text), 5000));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && transcribedText.trim()) {
      e.preventDefault();
      if (typingTimeout) clearTimeout(typingTimeout);
      handleSubmit(transcribedText);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  return (
    <div className="input-area-container mb-5">
      <div className="input-with-recorder">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask anything..."
          value={transcribedText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div className="recorder-wrapper">
          <Recorder
            onTranscription={(text) => {
              if (typeof onTranscription === "function") onTranscription(text);
              if (typingTimeout) clearTimeout(typingTimeout);
              handleSubmit(text);
            }}
            onReset={() => {
              if (typeof onReset === "function") onReset();
              lastSubmittedTextRef.current = "";
            }}
          />
        </div>
      </div>
    </div>
  );
};

InputArea.propTypes = {
  onTranscription: PropTypes.func,
  onReset: PropTypes.func,
  transcribedText: PropTypes.string.isRequired,
  setTranscribedText: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

InputArea.defaultProps = {
  onTranscription: () => {},
  onReset: () => {},
};

export default InputArea;

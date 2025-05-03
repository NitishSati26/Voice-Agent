import React, { useState, useRef, useEffect } from "react";
import "../styles/Recorder.css";

export default function Recorder({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
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
      stopRecording(); // Stop recording BEFORE updating the input box
      if (onTranscription && typeof onTranscription === "function") {
        onTranscription(transcript);
      }
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
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="recorder-container">
      <button
        className={`record-btn ${isRecording ? "recording" : ""}`}
        onClick={() => setIsRecording(true)}
        disabled={isRecording} // Prevents multiple clicks during recording
      >
        {isRecording ? "Recording..." : "Start Recording"}
      </button>
    </div>
  );
}

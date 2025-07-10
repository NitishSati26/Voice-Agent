import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { apiRequest } from "../utils/apiRequest";
import "../styles/Recorder.css";

export default function Recorder({
  onTranscription,
  onRecordingChange,
  onStartNewQuery,
  disabled,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (onRecordingChange) onRecordingChange(isRecording);
    // if (isRecording) startRecording();
  }, [isRecording]);

  const startRecording = async () => {
    // if (
    //   !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    // ) {
    //   alert("Your browser does not support speech recognition."); // Hit APi
    //   return;
    // }

    if (onStartNewQuery) onStartNewQuery();

    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.warn(
        "SpeechRecognition not supported, falling back to /transcribe API"
      );
      try {
        const data = await apiRequest("transcribe", "POST", {
          user_name: "string",
          institute_id: "SUA",
        });
        console.log("Transcribe response:", data);
        if (onTranscription) onTranscription(data.transcription || "");
      } catch (err) {
        console.error("Transcribe API error:", err);
      }
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      stopRecording();
      if (onTranscription) onTranscription(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => setIsRecording(false);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone permission is needed.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  return (
    <>
      {/* <div className="recorder-container"> */}
      <button
        className={`record-btn ${
          isRecording ? "recording" : ""
        } bg-transparent`}
        // onClick={() => setIsRecording(true)}
        onClick={startRecording}
        disabled={isRecording || disabled}
      >
        {/* {isRecording ? "🎙️" : "🎤"} */}
        {isRecording ? (
          <MicOff
            className="icon text-danger"
            // style={{ color: "red" }}
            size={20}
          />
        ) : (
          <Mic
            className="icon text-primary"
            // style={{ color: "#2563eb" }}
            size={20}
          />
        )}
      </button>
      {/* </div> */}
    </>
  );
}

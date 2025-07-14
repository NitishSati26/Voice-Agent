import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { apiRequest } from "../utils/apiRequest";
import "../styles/Recorder.css";

export default function Recorder({
  onTranscription,
  onRecordingChange,
  onStartNewQuery,
  onFallbackChange,
  disabled,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (onRecordingChange) onRecordingChange(isRecording);
    if (onFallbackChange) onFallbackChange(isFallback);
    // if (isRecording) startRecording();
  }, [isRecording, isFallback]);

  const fallbackToMediaRecorder = async () => {
    console.log("Using MediaRecorder fallback…");
    setIsFallback(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsFallback(false);

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("user_name", "string");
        formData.append("institute_id", "SUA");

        try {
          const data = await apiRequest("transcribe", "POST", formData);
          console.log("Transcribe response:", data);
          if (onTranscription) onTranscription(data.text || "");
        } catch (err) {
          console.error("Transcribe API error:", err);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      // Auto-stop after 7 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          console.log("Auto-stopping fallback recorder");
          mediaRecorderRef.current.stop();
        }
      }, 7000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone permission is needed.");
      setIsRecording(false);
      setIsFallback(false);
    }
  };

  const startRecording = async () => {
    if (onStartNewQuery) onStartNewQuery();

    // Check if browser supports SpeechRecognition
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.warn("SpeechRecognition not supported, falling back");
      fallbackToMediaRecorder();
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

      if (event.error === "network") {
        console.warn("SpeechRecognition network error, falling back");
        fallbackToMediaRecorder();
      }
    };

    recognitionRef.current.onend = () => setIsRecording(false);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      setIsRecording(true);
      setIsFallback(false);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone permission is needed.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsFallback(false);
  };

  return (
    <>
      {/* <div className="recorder-container"> */}
      <button
        className={`record-btn ${
          isRecording ? "recording" : ""
        } bg-transparent`}
        // onClick={() => setIsRecording(true)}
        // onClick={startRecording}
        onClick={isRecording ? stopRecording : startRecording}
        // disabled={isRecording || disabled}
        disabled={disabled}
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

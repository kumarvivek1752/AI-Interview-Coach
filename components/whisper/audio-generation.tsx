"use client";

import { useState, useEffect } from "react";

export default function AudioGeneration() {
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchAudio() {
      try {
        const response = await fetch("/api/whisper");
        if (!response.ok) {
          throw new Error("Failed to fetch audio");
        }
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioSrc(audioUrl);
      } catch (err) {
        console.error("Error fetching audio:", err);
        setError("Error fetching audio");
      }
    }

    fetchAudio();
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}
      {audioSrc ? (
        <audio controls src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      ) : (
        <p>Loading audio...</p>
      )}
    </div>
  );
}

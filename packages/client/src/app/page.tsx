  "use client";
  import { useState, useEffect, useRef } from "react";

  interface TranscriptionData {
    device: string;
    isFinal: boolean;
    text: string;
  }

  const LiveTranscription = () => {
    const [finalText, setFinalText] = useState<string>("");
    const [partialText, setPartialText] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    
    const connectToSSE = () => {
      
      // Close any existing connections
      disconnectFromSSE();

      // Create a new EventSource
      const eventSource = new EventSource("http://localhost:4000/api/screenpipe/transcription");
      eventSourceRef.current = eventSource;

      // Listen for connection open
      eventSource.addEventListener("connected", () => {
        console.log("SSE connection established");
        setIsConnected(true);
        setError(null);
      });

      // Listen for transcription events
      eventSource.addEventListener("transcription", (event: MessageEvent<string>) => {
        try {
          const data: TranscriptionData = JSON.parse(event.data);
          console.log(data);
          // If it's a final transcription, append it to final text and clear partial
          if (data.isFinal) {
            console.log(partialText, finalText)
            setFinalText(prev => prev + data.text + " ");
            setPartialText("");
          } 
          // If it's partial, just update the partial text
          else {
            setPartialText(data.text);
          }
        } catch (err) {
          console.error("Error parsing event data:", err);
        }
      });

      // Listen for error events
      eventSource.addEventListener("error", (event: MessageEvent<string>) => {
        try {
          if (event.data) {
            const errorData = JSON.parse(event.data);
            setError(errorData.error || "Unknown error");
          } else {
            setError("Connection error");
          }
        } catch (err) {
          setError("Connection error");
        }
      });
    }

    const disconnectFromSSE = () => {
      console.log("Inside of disconnectFromSSE");
      if(eventSourceRef.current) {
        setIsConnected(false);
        console.log(setIsConnected);
        eventSourceRef.current.close();
      }
    }

    // Combine final and partial text for display
    const displayText = finalText + partialText;

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Live Transcription</h1>

        {/* Connection status */}
        <div className="mb-4">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
          {error && <p className="text-red-500 mt-1">{error}</p>}
        </div>

        {/* Start Audio Transcription */}
        {
          isConnected ?
          <button className="bg-amber-600" onClick={() => disconnectFromSSE()}>End Audio</button>
          :
          <button className="bg-amber-600" onClick={() => connectToSSE()}>Start Audio</button>
        }
        
        {/* Transcription text */}
        <div className="p-4 bg-gray-50 rounded-lg min-h-40 whitespace-pre-wrap">
          {displayText || "Waiting for transcription..."}
        </div>
      </div>
    );
  };

  export default LiveTranscription;
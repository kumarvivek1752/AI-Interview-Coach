import { pipe } from "@screenpipe/browser";
import { Router } from "express";

const router = Router();

router.get("/api/screenpipe/transcription", async (req, res) => {
  console.log("SSE connection established for transcription");
  
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  // Send an initial connection message
  res.write("event: connected\ndata: {\"status\":\"connected\"}\n\n");
  
  try {
    // Keep connection open
    req.on("close", () => {
      console.log("Client disconnected from SSE");
      res.end();
    });
    
    // Stream transcriptions
    for await (const chunk of pipe.streamTranscriptions()) {
      const text = chunk.choices[0].text;
      const isFinal = chunk.choices[0].finish_reason === "stop";
      const device = chunk.metadata?.device || "unknown";
      
      console.log(`[${device}] ${isFinal ? "final:" : "partial:"} ${text}`);
      
      // Format the data for SSE
      const eventData = {
        device,
        isFinal,
        text
      };
      
      // Send properly formatted SSE event
      res.write(`event: transcription\ndata: ${JSON.stringify(eventData)}\n\n`);
      
      // Flush the data immediately
      if (res.flush) {
        res.flush();
      }
    }
  } catch (err) {
    console.error("Error in transcription stream:", err);
    
    // Send error event
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    
    // End the connection
    res.end();
  }
});

export default router;
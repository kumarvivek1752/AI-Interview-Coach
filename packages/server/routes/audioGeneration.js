import { Router } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = Router();

router.get("/api/whisper/audio-generation", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "wav" },
      messages: [
        {
          role: "user",
          content: "Is a golden retriever a good family dog?",
        },
      ],
      store: true,
    });
    console.log(response.choices[0]);

    // Convert base64 audio data to a buffer
    const audioDataBase64 = response.choices[0].message.audio.data;
    const audioBuffer = Buffer.from(audioDataBase64, "base64");

    // Set proper headers for wav audio
    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": audioBuffer.length,
    });

    // Send the audio buffer directly
    res.send(audioBuffer);
  } catch(err) {
    console.error("Error generating audio:", err);
    res.status(500).send("Error generating audio");
  }
});

export default router;

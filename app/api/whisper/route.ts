import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
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

    const audioDataBase64 = response.choices[0]?.message?.audio?.data;
    if (!audioDataBase64) {
      return NextResponse.json(
        { error: "Audio data not available" },
        { status: 500 }
      );
    }
    const audioBuffer = Buffer.from(audioDataBase64, "base64");

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Error generating audio:", err);
    return NextResponse.json(
      { error: "Error generating audio" },
      { status: 500 }
    );
  }
}

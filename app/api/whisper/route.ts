import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  console.log("Inside of whisper endpoint")
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "wav" },
      messages: [
        { role: "system", content: "You are a professional technical recruiter that is giving a mock interview. Your goal is to help the person improve their interviewing skills by analyzing their speech. A good method to enforce into them is the STAR method or any other popular response methods you can think of. If they use filler words such as uh and um too much, point it out and tell them. If their response is bad, tell them how they shouldve have responded." },
        { role: "user", content: content },
      ],
      store: true,
    });

    const audioTranscription = response.choices[0].message.audio?.transcript;
    const audioDataBase64 = response.choices[0]?.message?.audio?.data;

    return NextResponse.json({
      audio: audioDataBase64,
      transcription: audioTranscription,
    });
  } catch (err) {
    console.error("Error generating audio:", err);
    return NextResponse.json(
      { error: "Error generating audio" },
      { status: 500 }
    );
  }
}

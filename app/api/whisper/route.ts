import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if(!content) {
      return NextResponse.json({error: "Content is required"}, {status: 400});
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "wav" },
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      store: true,
    });

    const audioTranscription = response.choices[0].message.audio?.transcript
    const audioDataBase64 = response.choices[0]?.message?.audio?.data;
    // if (!audioDataBase64) {
    //   return NextResponse.json(
    //     { error: "Audio data not available" },
    //     { status: 500 }
    //   );
    // }
    // const audioBuffer = Buffer.from(audioDataBase64, "base64");

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

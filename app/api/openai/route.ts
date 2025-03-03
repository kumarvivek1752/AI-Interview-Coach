import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { content, history } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional technical recruiter reviewing an online mock interview session. Your goal is to help the person improve their interviewing skills by analyzing their speech and body posture. Based off of the interview questoin, did the interviewee answer the questions well with a structured format, if not how should they have answered instead. Did the person use their hands too much, have bad posture, or not have eye contact, If so remind them that body language is important and which are they can improve in. ",
        },
        { role: "user", content: `Conversation History: ${history}` },
        {
          role: "user",
          content: `Interview Body Language Results: ${content}`,
        },
      ],
      store: true,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
      status: 200,
    });
  } catch (err) {
    console.error("Error generating openai response:", err);
    return NextResponse.json(
      { error: "Error generating openai response" },
      { status: 500 }
    );
  }
}

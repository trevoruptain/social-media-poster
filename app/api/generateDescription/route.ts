import { HfInference } from "@huggingface/inference";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json(
      { error: "No image URL provided" },
      { status: 400 }
    );
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;

  if (!openaiApiKey || !huggingfaceApiKey) {
    return NextResponse.json(
      { error: "API keys are not set" },
      { status: 500 }
    );
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image." },
        { status: 400 }
      );
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    // Use Hugging Face API to generate the caption
    const hf = new HfInference(huggingfaceApiKey);
    const result = await hf.imageToText({
      data: new Uint8Array(imageBuffer),
      model: "nlpconnect/vit-gpt2-image-captioning",
    });

    const initialDescription = result.generated_text;

    // Use OpenAI API to refine the description and generate hashtags
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const messages = [
      {
        role: "system",
        content:
          "You are an assistant that improves image descriptions and generates relevant hashtags.",
      },
      {
        role: "user",
        content: `Based on the following description, write a more engaging description and suggest relevant hashtags.

Description: ${initialDescription}

Return the result in the following format:

Description: [Your enhanced description here]

Hashtags: [A comma-separated list of hashtags]`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or 'gpt-4' if you have access
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message?.content || "";

    // Parse the AI response
    let description = initialDescription;
    let hashtags: string[] = [];

    const descriptionMatch = aiResponse.match(/Description:\s*(.*)/i);
    if (descriptionMatch && descriptionMatch[1]) {
      description = descriptionMatch[1].trim();
    }

    const hashtagsMatch = aiResponse.match(/Hashtags:\s*(.*)/i);
    if (hashtagsMatch && hashtagsMatch[1]) {
      hashtags = hashtagsMatch[1]
        .split(/[\s,]+/)
        .map((tag: string) => tag.replace("#", "").trim())
        .filter((tag: string) => tag.length > 0);
    }

    return NextResponse.json({ description, hashtags });
  } catch (error: any) {
    console.error("Error generating description and hashtags:", error);
    return NextResponse.json(
      { error: "Failed to generate description and hashtags." },
      { status: 500 }
    );
  }
}

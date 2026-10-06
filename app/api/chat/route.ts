import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateFallbackResponse,
  normalizeAIResponse,
} from "@/lib/restaurant-spec";

const SYSTEM_PROMPT = `You are an AI assistant that helps users explore Busan restaurant data using Meridian specifications.

Meridian is a design framework for creating overview-detail interfaces. When users ask about restaurants, you should:

1. Respond conversationally about their restaurant query
2. Generate a Meridian specification (ODI) that would best visualize the restaurant data based on their request
3. The specification should be returned as a JSON object

Available restaurant data includes:
- Restaurant names, addresses, descriptions
- Ratings, review counts, ranking strings, price levels
- Photos, cuisine tags, features, hours, phone numbers
- Location coordinates (latitude/longitude)

Available view types:
- 'grid': Card-based layout showing restaurant thumbnails, names, ratings
- 'map': Interactive map showing restaurant locations
- 'list': Simple list layout
- 'table': Spreadsheet-style comparison
- 'canvas': Geographic canvas with proximity clusters
- 'card': Compact card grid

IMPORTANT: Return only JSON. The Meridian specification must follow this structure:
{
  "overviews": [
    {
      "type": "grid|map|list|table|canvas|card",
      "hiddenAttributes": ["description", "hours-description", "phone"]
    }
  ]
}

Do not invent data-binding paths. The app already binds restaurant fields. You may optionally include shownAttributes from this list only:
title, thumbnail, badge, star-badge, num_reviews-subtitle, price-level, localized_name-subtitle, city-description, country-description, description, hours-description, subtitle, phone, link, review-link, cuisine-tag, features-tag

Example responses:
- For "luxury restaurants": Use map type and keep price-level visible
- For "waterfront" or "Haeundae": Use grid type emphasizing location
- For "budget": Use list type highlighting price levels
- For "map view": Use map type
- For "top rated": Use grid type emphasizing ratings and review counts

Return your response as JSON with this structure:
{
  "message": "Your conversational response",
  "meridianSpec": {
    "overviews": [
      {
        "type": "grid",
        "hiddenAttributes": ["description", "hours-description", "phone"]
      }
    ]
  }
}`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? trimmed;
  return JSON.parse(candidate);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(message);
    const response = result.response.text();

    if (!response) {
      return NextResponse.json({ error: "No response from Gemini" }, { status: 500 });
    }

    try {
      const parsedResponse = extractJson(response);
      return NextResponse.json(normalizeAIResponse(parsedResponse));
    } catch {
      return NextResponse.json({
        message: response,
        meridianSpec: generateFallbackResponse(message).meridianSpec,
      });
    }
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

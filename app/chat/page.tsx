"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiSend } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { MdOutlineRestaurant } from "react-icons/md";
import { IoAlertCircleOutline } from "react-icons/io5";
import { MeridianOverview, MeridianWrapper } from "@meridian-ui/meridian";
import "@meridian-ui/meridian/dist/meridian.css";
import restaurantsData from "@/data/restaurant-details.json";
import { restaurantODI } from "@/views/restaurantsODI";
import { restaurantConfig } from "@/views/restuarantsConfig";
import {
  generateFallbackResponse,
  validateSpec,
} from "@/lib/restaurant-spec";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  meridianSpec?: typeof restaurantODI;
}

const SUGGESTIONS = [
  "Show luxury restaurants",
  "Create a map view",
  "Waterfront restaurants",
  "Budget options",
];

async function callGemini(userMessage: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userMessage }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from Gemini");
  }

  return response.json();
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I can help you explore Busan restaurants and generate custom Meridian views. Try asking for luxury spots, a map view, waterfront restaurants, or budget options.",
      timestamp: new Date(),
      meridianSpec: restaurantODI,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentSpec = useMemo(() => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.meridianSpec);

    const spec = lastAssistantMessage?.meridianSpec ?? restaurantODI;
    if (!validateSpec(spec)) {
      console.warn("Invalid Meridian specification, falling back to default");
      return restaurantODI;
    }
    return spec;
  }, [messages]);

  const sendMessage = async (rawMessage: string) => {
    const text = rawMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;

      if (useFallback) {
        response = generateFallbackResponse(text);
      } else {
        try {
          response = await callGemini(text);
        } catch (error) {
          console.log("Falling back to demo mode due to Gemini error", error);
          setUseFallback(true);
          response = generateFallbackResponse(text);
        }
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        meridianSpec: validateSpec(response.meridianSpec)
          ? response.meridianSpec
          : generateFallbackResponse(text).meridianSpec,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
        <Link href="/" className="inline-flex items-center gap-2 text-xl text-amber-950">
          Dishcovery <LuMapPin />
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-amber-950">
          Back to restaurants
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-20 flex w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white p-4">
            <div className="rounded-lg bg-[#D7F2E1] p-2">
              <MdOutlineRestaurant className="h-6 w-6 text-[#314D3B]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Restaurant Assistant
              </h1>
              <p className="text-sm text-gray-500">Meridian views from your prompt</p>
              {useFallback && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-1">
                  <IoAlertCircleOutline className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs text-yellow-700">Demo Mode (JSON fallback)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-[#6BB789] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="rounded-lg bg-[#F5FDD6] p-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Busan restaurants... (e.g., 'Show luxury restaurants')"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6BB789]"
                disabled={isLoading}
              />
              <button
                onClick={() => void sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-[#6BB789] px-4 py-2 text-white transition-colors hover:bg-[#5AA678] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => void sendMessage(suggestion)}
                  disabled={isLoading}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-[#314D3B] transition-colors hover:bg-[#E8F5C8] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Generated Meridian View
            </h2>
            <p className="text-sm text-gray-500">
              Interactive visualization based on your chat request
            </p>
          </div>

          <div className="relative min-h-0 flex-1 overflow-auto p-3">
            <MeridianWrapper
              key={`${currentSpec.overviews[0]?.id}-${currentSpec.overviews[0]?.type}`}
              data={restaurantsData}
              odi={currentSpec}
              {...restaurantConfig}
              onOpenDetailNewPage={() => undefined}
              onOpenOverviewNewPage={() => undefined}
            >
              <MeridianOverview />
            </MeridianWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}

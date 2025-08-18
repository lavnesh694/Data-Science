import React, { useEffect, useRef, useState } from "react";

// Replace with your actual API key
const apiKey = "AIzaSyA0pXfYIQezSyOhiqkZ5Lbh0Py74oVbwNM";

export default function App() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function handleSend() {
    if (!query.trim()) return;

    const userMessage = { sender: "user", text: query };
    setChat((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      // Build conversation history for Gemini API
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `You have to imagine you are TCS interviewer you have to take my tcs prime interview so you are a very strict interviewer and I think you already know what things in the tcs prime interview may be asked: DSA, project-related questions, OS, DBMS, CN, Software Engineering topics, ML, Data Science, current AI trends, market trends, MR questions, and HR questions. After getting the candidate response, you have to tell them whether you are satisfied or not, what type of answer you are expecting, and give the marks to the candidate out of 10 for each question. Keep in mind to ask like a real interviewer: first, ask the question, wait for the candidate's response, then move to another question. This is a TCS Prime interview so the level of difficulty of questions should match TCS Prime standards.`
            }
          ]
        }
      ];

      // Add previous chat history
      chat.forEach((msg) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });

      // Add current user input
      contents.push({
        role: "user",
        parts: [{ text: query }]
      });

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents
      });

      const botMessage = { sender: "bot", text: result.text };
      setChat((prev) => [...prev, botMessage]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error: " + err.message }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen m-0 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-mono">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center lg:py-9 py-6 bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold text-purple-300">⚔️ DSA Instructor Pro</h1>
          <p className="text-purple-100 text-md">
            Ask DSA questions like a topper. But ask something dumb, and get roasted by a savage AI 💀🔥
          </p>
          <img
            src="https://media.tenor.com/gIrKe_CZo4cAAAAi/robo.gif"
            alt="Bot face"
            className="w-40 h-40 mx-auto rounded-full border-4 border-purple-500"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-4 overflow-y-auto h-screen">
        <div className="flex-1 overflow-y-auto bg-black border border-gray-800 p-3 rounded space-y-3">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : ""}`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-purple-500 text-center pt-[6px] rounded-full">🤖</div>
              )}
              <div
                className={`p-3 rounded-lg max-w-sm text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-purple-100 border border-purple-400"
                }`}
                {...(msg.sender === "bot"
                  ? { dangerouslySetInnerHTML: { __html: msg.text } }
                  : {})}
              >
                {msg.sender === "user" ? msg.text : null}
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-blue-400 text-center pt-[6px] rounded-full">👨‍💻</div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-sm italic text-gray-400 animate-pulse">
              🤖 Typing a savage reply...
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your DSA doubt or try your luck 😈"
            className="flex-1 bg-gray-800 p-3 rounded text-white focus:outline-none border border-gray-600"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

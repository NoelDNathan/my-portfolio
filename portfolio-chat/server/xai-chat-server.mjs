import http from "node:http";
import { URL } from "node:url";
import OpenAI from "openai";
import "dotenv/config";

const apiKey =
  process.env.GROQ_API_KEY ?? process.env.GROQ ?? process.env.MODEL_API_KEY;

if (!apiKey) {
  console.warn(
    "[chat-server] GROQ_API_KEY (or GROQ / MODEL_API_KEY) is not set. Please add it to your environment or .env file."
  );
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 360000,
});

const SYSTEM_PROMPT = `
You are an AI assistant embedded in a personal portfolio website.

Your job is to:
- Help visitors understand the portfolio, experience, projects and skills.
- Answer in clear, concise English.
- Be honest if you do not know something from the available context.

If the question is not related to the portfolio, you can still answer briefly but keep a professional tone.
`;

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.socket.destroy();
        reject(new Error("Request body too large"));
      }
    });

    request.on("end", () => {
      resolve(body);
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(body);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (url.pathname === "/api/chat" && request.method === "POST") {
    try {
      const rawBody = await readRequestBody(request);
      const parsed = rawBody ? JSON.parse(rawBody) : {};
      const incomingMessages = Array.isArray(parsed.messages) ? parsed.messages : [];

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...incomingMessages.map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: String(message.content ?? ""),
        })),
      ];

      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
      });

      const reply = completion.choices?.[0]?.message?.content ?? "";

      sendJson(response, 200, { reply });
    } catch (error) {
      console.error("[chat-server] Error handling /api/chat request:", error);
      sendJson(response, 500, {
        error: "Failed to contact Groq chat service.",
      });
    }
    return;
  }

  response.statusCode = 404;
  response.end("Not found");
});

const port = Number(process.env.PORT) || 8787;

server.listen(port, () => {
  console.log(`[chat-server] Listening on http://localhost:${port}/api/chat`);
});

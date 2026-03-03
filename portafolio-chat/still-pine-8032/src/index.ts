/**
 * Portfolio chat Worker: handles POST /api/chat and proxies to Groq.
 * CORS is enabled for browser requests (e.g. from localhost or GitHub Pages).
 */

const SYSTEM_PROMPT = `
You are an AI assistant embedded in a personal portfolio website.

Your job is to:
- Help visitors understand the portfolio, experience, projects and skills.
- Answer in clear, concise English.
- Be honest if you do not know something from the available context.

If the question is not related to the portfolio, you can still answer briefly but keep a professional tone.
`;

const CORS_HEADERS: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: object, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json", ...CORS_HEADERS },
	});
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		if (url.pathname !== "/api/chat" || request.method !== "POST") {
			return jsonResponse({ error: "Not found" }, 404);
		}

		const apiKey =
			(env as { GROQ_API_KEY?: string; GROQ?: string; MODEL_API_KEY?: string })
				.GROQ_API_KEY ??
			(env as { GROQ?: string; MODEL_API_KEY?: string }).GROQ ??
			(env as { MODEL_API_KEY?: string }).MODEL_API_KEY;

		if (!apiKey) {
			return jsonResponse({ error: "Server misconfiguration" }, 500);
		}

		try {
			const body = (await request.json()) as {
				messages?: Array<{ role?: string; content?: string }>;
			};
			const rawMessages = body?.messages ?? [];
			const incomingMessages = Array.isArray(rawMessages) ? rawMessages : [];
			const messages = [
				{ role: "system" as const, content: SYSTEM_PROMPT },
				...incomingMessages.map((m) => ({
					role: (m?.role === "assistant" ? "assistant" : "user") as
						| "assistant"
						| "user",
					content: String(m?.content ?? ""),
				})),
			];

			const res = await fetch(
				"https://api.groq.com/openai/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model: "llama-3.3-70b-versatile",
						messages,
					}),
				},
			);

			if (!res.ok) {
				const errText = await res.text();
				console.error("Groq API error:", res.status, errText);
				return jsonResponse(
					{ error: "Failed to contact Groq chat service." },
					500,
				);
			}

			const data = (await res.json()) as {
				choices?: Array<{ message?: { content?: string } }>;
			};
			const reply = data.choices?.[0]?.message?.content ?? "";
			return jsonResponse({ reply });
		} catch (e) {
			console.error("Worker error:", e);
			return jsonResponse(
				{ error: "Failed to contact Groq chat service." },
				500,
			);
		}
	},
} satisfies ExportedHandler<Env>;

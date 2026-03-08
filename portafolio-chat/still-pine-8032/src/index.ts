/**
 * Portfolio chat Worker: handles POST /api/chat and proxies to Groq.
 * CORS is enabled for browser requests (e.g. from localhost or GitHub Pages).
 */

const SYSTEM_PROMPT = `
You are Noel Nathan's AI assistant, embedded in his personal portfolio website. 
Your goal is to provide accurate, professional, and exhaustive information about Noel Nathan Planell Bosch using the complete context provided below.

### 1. CORE PROFILE
- Name: Noel Nathan Planell Bosch
- Headline: AI Engineer | Computer Vision · Machine Learning
- Value Proposition: I design and implement AI solutions across various industries, with experience in logistics, robotics, and geospatial data.
- Location: Castelldefels, Barcelona, Spain
- Contact: noeldnathan@gmail.com | +34 611 475 405 | linkedin.com/in/noel-nathan
- Languages: Spanish (Native), Catalan (Native), English (Fluent), French (B1)
- Specialization: Artificial Intelligence, Computer Vision, Logistics Optimization, Reinforcement Learning, Geospatial Data.
- Professional Focus: Applied research, Production systems, End-to-end delivery.
- Narrative: Combines research and engineering to build AI systems that solve real-world problems. Passionate about ML, CV, LLMs, and data analysis. Values continuous development and teamwork.

### 2. ACADEMIC EXCELLENCE
- Bachelor's in Artificial Intelligence (UPC, 2021-2025): Final Grade: 8.62 / 10 | Class Rank: 7th in cohort. Honors: Highest Distinction in Parallelism and Distributed Systems.
- Erasmus+ Exchange (University of Tartu, Estonia, 2024-2025): Focused on ZK Proofs, Cryptography, and Information Retrieval.
- Secondary Education (Institut Josep Lluís Sert, 2019-2021): Final Grade: 9.57 / 10 | Honors: Highest Distinction.

### 3. TECHNICAL SKILLS REPOSITORY
- AI: Machine Learning, Deep Learning, Reinforcement Learning (DQN, PPO), CV (YOLOv8), Transformers, LangChain.
- SWE: FastAPI, SQLAlchemy, React, Next.js, AWS, Docker, CI/CD.
- Languages: Python (Advanced), Solidity (Advanced), Rust, JavaScript, C#, C++, R, MATLAB, SQL.
- Data Science: Pandas, NumPy, PyTorch, TensorFlow, Scikit-learn, Seaborn, Plotly.
- Blockchain: Smart Contracts, ZK Proofs (Circom), ERC-20, ERC-721, P2P Networking.
- Robotics: Universal Robots (Advanced), ROS, pick-and-place, Motion planning.
- Optimization: OR-Tools, Probabilistic planning (RDDL).

### 4. PROFESSIONAL EXPERIENCE & PROJECTS
- Packengers (Logistics AI, 2025-Present): Route optimizer 'CargafullIA' (OR-Tools). Led a team of interns.
- Healthi Bot (Voice AI, Jan 2026): Voice agent for medical appointments via Pipecat and Playwright.
- sancho-mini (Compact LLM, Dec 2025): LLM trained on Cervantes' works for browser inference.
- Vision-Guided Robotics (TFG, 2025): System combining RL and YOLO for manipulation.
- Decentralized Poker (Blockchain, 2024-2025): Solidity, ZK, and Rust P2P. 80% gas reduction.
- Space4Earth (2023-2024): ML for geospatial/satellite data. Azure/ArcGIS.

### 5. EXTRACURRICULAR & CERTIFICATIONS
- Rugby: Senior player at CRUC. Youth coach. World Rugby L1 Coach.
- Certifications: Universal Robots Core/Advanced, Privacy and GDPR (Feb 2026).

### INSTRUCTIONS FOR RESPONSE
- PLAIN TEXT ONLY: Never use markdown like **bold**, *italics*, # headers, or backticks.
- BE CONCISE: Give short, human responses. Don't over-explain. Let the user ask for more.
- TONE: Professional, friendly, and natural. Like a chat message.
- LANGUAGES: Use Spanish or Catalan if the user does.
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


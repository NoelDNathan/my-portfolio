import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ONNX_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js";
const MODEL_URL = "sancho-demo/sancho-mini.onnx";
const VOCAB_URL = "sancho-demo/vocab.json";
const BLOCK_SIZE = 256;
const TEMPERATURE = 0.4;
const TOP_K = 50;

declare global {
  interface Window {
    ort?: {
      InferenceSession: {
        create: (url: string, options?: object) => Promise<OrtInferenceSession>;
      };
      Tensor: new (
        type: string,
        data: BigInt64Array | Int32Array,
        dims: number[]
      ) => OrtTensor;
    };
  }
}

interface OrtInferenceSession {
  run: (feeds: Record<string, OrtTensor>) => Promise<Record<string, OrtTensor>>;
}

interface OrtTensor {
  dims: number[];
  data: Float32Array;
}

interface Vocab {
  itos: Record<string, string>;
  stoi: Record<string, number>;
  startToken: string;
  vocabSize: number;
}

function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.ort) return Promise.resolve();
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve) => {
      if (window.ort) resolve();
      else existing.addEventListener("load", () => resolve());
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load ONNX Runtime"));
    document.head.appendChild(script);
  });
}

async function loadVocab(): Promise<Vocab> {
  const res = await fetch(VOCAB_URL);
  if (!res.ok) throw new Error("vocab.json not found. Export it from your Colab notebook.");
  const data = await res.json();
  const itos = typeof data.itos === "object" && data.itos !== null ? data.itos : {};
  const stoi = typeof data.stoi === "object" && data.stoi !== null ? data.stoi : {};
  const startToken = data.startToken ?? "<|startofpoem|>";
  return { itos, stoi, startToken, vocabSize: Object.keys(itos).length };
}

function sampleFromLogits(
  logitsArray: ArrayLike<number>,
  vocabSize: number,
  temperature: number,
  topK: number
): number {
  const size = Math.min(logitsArray.length, vocabSize);
  const scaled = Array.from(logitsArray)
    .slice(0, size)
    .map((v) => v / temperature);
  const indexed = scaled.map((v, i) => [v, i] as const);
  indexed.sort((a, b) => b[0] - a[0]);
  const top = indexed.slice(0, Math.min(topK, indexed.length));
  const maxV = top[0][0];
  const expVals = top.map(([v]) => Math.exp(v - maxV));
  const sumExp = expVals.reduce((a, b) => a + b, 0);
  const probs = expVals.map((v) => v / sumExp);
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r < acc) return top[i][1];
  }
  return top[0][1];
}

export function SanchoDemo() {
  const [status, setStatus] = useState("Loading ONNX Runtime…");
  const [statusError, setStatusError] = useState(false);
  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const sessionRef = useRef<OrtInferenceSession | null>(null);
  const vocabRef = useRef<Vocab | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadScript(ONNX_SCRIPT_URL);
        if (cancelled) return;
        const ort = window.ort;
        if (!ort) throw new Error("ONNX Runtime not available.");
        setStatus("Loading model and vocab…");
        const [session, vocab] = await Promise.all([
          ort.InferenceSession.create(MODEL_URL, {
            executionProviders: ["webgl", "wasm"],
            graphOptimizationLevel: "all",
          }),
          loadVocab(),
        ]);
        if (cancelled) return;
        sessionRef.current = session;
        vocabRef.current = vocab;
        setIsReady(true);
        setStatus("Ready. Click “Generate poem” to run.");
      } catch (e) {
        if (!cancelled) {
          setStatus("Load failed: " + (e instanceof Error ? e.message : String(e)));
          setStatusError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runStep = async (tokens: number[]): Promise<number> => {
    const session = sessionRef.current;
    const vocab = vocabRef.current;
    if (!session || !vocab) return 0;
    const ort = window.ort!;
    const slice = tokens.length > BLOCK_SIZE ? tokens.slice(-BLOCK_SIZE) : tokens;
    const useInt64 = typeof BigInt64Array !== "undefined";
    const inputTensor = useInt64
      ? new ort.Tensor(
          "int64",
          BigInt64Array.from(slice.map((t) => BigInt(t))),
          [1, slice.length]
        )
      : new ort.Tensor("int32", Int32Array.from(slice), [1, slice.length]);
    const results = await session.run({ input_ids: inputTensor });
    const logits = results.logits;
    const dims = logits.dims;
    const lastIdx = (dims[0] * dims[1] - 1) * dims[2];
    const logitsLast = Array.from(logits.data.slice(lastIdx, lastIdx + dims[2]));
    return sampleFromLogits(logitsLast, vocab.vocabSize, TEMPERATURE, TOP_K);
  };

  const decodeToken = (id: number): string => {
    const v = vocabRef.current;
    if (!v) return "";
    return v.itos[String(id)] ?? "";
  };

  const encodePrompt = (text: string): number[] => {
    const v = vocabRef.current;
    if (!v) return [];
    const tokens: number[] = [];
    for (const ch of text) {
      const id = v.stoi[ch];
      if (id !== undefined) tokens.push(id);
    }
    return tokens;
  };

  const handleGenerate = async () => {
    const vocab = vocabRef.current;
    if (!sessionRef.current || !vocab) return;
    const promptTrimmed = prompt.trim();
    let tokens: number[];
    if (promptTrimmed.length > 0) {
      tokens = encodePrompt(promptTrimmed);
      if (tokens.length === 0) {
        setStatus("No characters in the prompt are in the vocabulary. Try the default or different text.");
        setStatusError(true);
        return;
      }
      setOutput(promptTrimmed);
    } else {
      const startId = vocab.stoi[vocab.startToken];
      if (startId === undefined) {
        setStatus("vocab.json must contain startToken and stoi[startToken].");
        setStatusError(true);
        return;
      }
      tokens = [startId];
      setOutput(decodeToken(startId));
    }
    abortRef.current = false;
    setIsGenerating(true);
    setStatus("Generating…");
    setStatusError(false);
    try {
      while (!abortRef.current) {
        const nextId = await runStep(tokens);
        tokens.push(nextId);
        setOutput((prev) => prev + decodeToken(nextId));
        await new Promise((r) => setTimeout(r, 0));
      }
      setStatus("Stopped.");
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
      setStatusError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    abortRef.current = true;
  };

  return (
    <section id="sancho-demo" className="section sancho-demo" aria-labelledby="sancho-demo-title">
      <motion.h2
        id="sancho-demo-title"
        className="section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Sancho-mini
      </motion.h2>
      <motion.p
        className="sancho-demo__subtitle"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        A 3.26M-parameter, character-level nanoGPT model trained in PyTorch to write Spanish sonnets in the spirit of Cervantes, running directly in your browser (no API calls).
      </motion.p>
      <motion.div
        className="sancho-demo__panel"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <label htmlFor="sancho-prompt" className="sancho-demo__label">
          Starting text  write <code>&lt;|startofpoem|&gt;</code> or your own beginning (in Spanish)…
        </label>
        <input
          id="sancho-prompt"
          type="text"
          className="sancho-demo__input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. &lt;|startofpoem|&gt; or your own beginning…"
          disabled={!isReady || isGenerating}
          aria-label="Optional starting text for generation"
        />
        <div className="sancho-demo__controls">
          <button
            type="button"
            className="sancho-demo__btn sancho-demo__btn--primary"
            onClick={handleGenerate}
            disabled={!isReady || isGenerating}
            aria-label="Generate poem"
          >
            Generate poem
          </button>
          <button
            type="button"
            className="sancho-demo__btn sancho-demo__btn--secondary"
            onClick={handleStop}
            disabled={!isGenerating}
            aria-label="Stop generation"
          >
            Stop
          </button>
          <span
            className={`sancho-demo__status ${statusError ? "sancho-demo__status--error" : ""}`}
            aria-live="polite"
          >
            {status}
          </span>
        </div>
        <textarea
          className="sancho-demo__output"
          readOnly
          value={output}
          placeholder="Generated text will appear here…"
          aria-label="Generated poem output"
          rows={12}
        />
      </motion.div>

      <style>{`
        #sancho-demo {
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .sancho-demo__subtitle {
          color: var(--color-text-muted);
          font-size: var(--text-sm);
          margin: 0 0 var(--space-6);
          max-width: 42rem;
        }
        .sancho-demo__subtitle code {
          background: var(--color-surface-elevated);
          padding: 0.1em 0.4em;
          border-radius: var(--radius-sm);
          font-size: 0.9em;
        }
        .sancho-demo__label {
          display: block;
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }
        .sancho-demo__input {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          margin-bottom: var(--space-4);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: var(--text-sm);
        }
        .sancho-demo__input:focus {
          outline: none;
          border-color: var(--color-accent);
        }
        .sancho-demo__input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .sancho-demo__panel {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }
        .sancho-demo__controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }
        .sancho-demo__btn {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: opacity var(--transition-fast), filter var(--transition-fast);
        }
        .sancho-demo__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .sancho-demo__btn:not(:disabled):hover {
          filter: brightness(1.1);
        }
        .sancho-demo__btn--primary {
          background: var(--color-accent);
          color: var(--color-bg);
          border: none;
        }
        .sancho-demo__btn--secondary {
          background: var(--color-surface-elevated);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }
        .sancho-demo__status {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }
        .sancho-demo__status--error {
          color: #e55;
        }
        .sancho-demo__output {
          width: 100%;
          min-height: 200px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text);
          padding: var(--space-4);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          resize: vertical;
        }
        .sancho-demo__output:focus {
          outline: none;
          border-color: var(--color-accent);
        }
      `}</style>
    </section>
  );
}

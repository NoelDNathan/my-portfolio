/**
 * Sancho-mini: minimal browser inference using ONNX Runtime Web (CDN).
 * Expects: sancho-mini.onnx and vocab.json in the same directory.
 * Vocab format: { "itos": { "0": "c", "1": "\n", ... }, "stoi": { "c": 0, ... }, "startToken": "<|startofpoem|>" }
 */

const BLOCK_SIZE = 256;
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_TOP_K = 50;
const MODEL_URL = "./sancho-mini.onnx";
const VOCAB_URL = "./vocab.json";

let session = null;
let vocab = null;
let abortGeneration = false;

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (isError ? " error" : "");
}

function appendOutput(text) {
  const el = document.getElementById("output");
  el.value += text;
  el.scrollTop = el.scrollHeight;
}

function clearOutput() {
  document.getElementById("output").value = "";
}

async function loadVocab() {
  const res = await fetch(VOCAB_URL);
  if (!res.ok) throw new Error("vocab.json not found. Export it from your Colab notebook.");
  const data = await res.json();
  const itos = typeof data.itos === "object" && data.itos !== null
    ? data.itos
    : {};
  const stoi = typeof data.stoi === "object" && data.stoi !== null
    ? data.stoi
    : {};
  const startToken = data.startToken ?? "<|startofpoem|>";
  return { itos, stoi, startToken, vocabSize: Object.keys(itos).length };
}

async function loadModel() {
  const ort = window.ort;
  if (!ort) throw new Error("ONNX Runtime Web not loaded.");
  return ort.InferenceSession.create(MODEL_URL, {
    executionProviders: ["webgl", "wasm"],
    graphOptimizationLevel: "all",
  });
}

function sampleFromLogits(logitsArray, vocabSize, temperature, topK) {
  const size = Math.min(logitsArray.length, vocabSize);
  const scaled = Array.from(logitsArray).slice(0, size).map((v) => v / temperature);

  const indexed = scaled.map((v, i) => [v, i]);
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

async function runStep(tokens) {
  const slice = tokens.length > BLOCK_SIZE ? tokens.slice(-BLOCK_SIZE) : tokens;
  const ort = window.ort;
  const useInt64 = typeof BigInt64Array !== "undefined";
  const inputTensor = useInt64
    ? new ort.Tensor("int64", BigInt64Array.from(slice.map((t) => BigInt(t))), [1, slice.length])
    : new ort.Tensor("int32", Int32Array.from(slice), [1, slice.length]);
  const feeds = { input_ids: inputTensor };
  const results = await session.run(feeds);
  const logits = results.logits;

  const dims = logits.dims;
  const lastIdx = (dims[0] * dims[1] - 1) * dims[2];
  const logitsLast = logits.data.slice(lastIdx, lastIdx + dims[2]);
  return sampleFromLogits(logitsLast, vocab.vocabSize, DEFAULT_TEMPERATURE, DEFAULT_TOP_K);
}

function decodeToken(id) {
  const key = String(id);
  return vocab.itos[key] ?? "";
}

function encodePrompt(text) {
  const tokens = [];
  for (const ch of text) {
    const id = vocab.stoi[ch];
    if (id !== undefined) tokens.push(id);
  }
  return tokens;
}

async function generate() {
  if (!session || !vocab) return;
  const runBtn = document.getElementById("btn-run");
  const stopBtn = document.getElementById("btn-stop");
  const promptEl = document.getElementById("prompt");
  const promptText = promptEl && promptEl.value ? String(promptEl.value).trim() : "";
  runBtn.disabled = true;
  stopBtn.disabled = false;
  abortGeneration = false;
  clearOutput();

  let tokens;
  if (promptText.length > 0) {
    tokens = encodePrompt(promptText);
    if (tokens.length === 0) {
      setStatus("No characters in the prompt are in the vocabulary. Try the default or different text.", true);
      runBtn.disabled = false;
      stopBtn.disabled = true;
      return;
    }
    appendOutput(promptText);
  } else {
    const startId = vocab.stoi[vocab.startToken];
    if (startId === undefined) {
      setStatus("vocab.json must contain startToken and stoi[startToken].", true);
      runBtn.disabled = false;
      stopBtn.disabled = true;
      return;
    }
    tokens = [startId];
    appendOutput(decodeToken(startId));
  }
  setStatus("Generating…");

  try {
    while (!abortGeneration) {
      const nextId = await runStep(tokens);
      tokens.push(nextId);
      const char = decodeToken(nextId);
      appendOutput(char);
      await new Promise((r) => setTimeout(r, 0));
    }
    setStatus("Stopped.");
  } catch (e) {
    setStatus("Error: " + (e && e.message ? e.message : String(e)), true);
  } finally {
    runBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function stopGenerate() {
  abortGeneration = true;
}

async function init() {
  setStatus("Loading model and vocab…");
  try {
    [session, vocab] = await Promise.all([loadModel(), loadVocab()]);
    setStatus("Ready. Click “Generate poem” to run.");
  } catch (e) {
    setStatus("Load failed: " + (e && e.message ? e.message : String(e)), true);
    return;
  }

  document.getElementById("btn-run").addEventListener("click", generate);
  document.getElementById("btn-stop").addEventListener("click", stopGenerate);
}

init();

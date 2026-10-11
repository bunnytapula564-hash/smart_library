// Ollama Cloud client - runs entirely in the browser, no backend.
//
// CORS: browsers block cross-origin calls unless the server allows them. So by
// default every request goes to "/ollama-api/*" on the SAME origin as the app:
//   - npm run dev  -> Vite proxy (vite.config.js)
//   - Netlify      -> rewrite + CORS headers (netlify.toml)
// Both forward to https://ollama.com/api/*. "Direct" mode (Settings) skips the
// proxy and calls https://ollama.com/api straight from the browser; use it only
// if Ollama allows your origin.

const SETTINGS_KEY = "smart-library:ollama";
export const DIRECT_URL = "https://ollama.com/api";
export const PROXY_URL = "/ollama-api";
export const DEFAULT_MODELS = ["gpt-oss:120b", "gpt-oss:20b", "deepseek-v3.1:671b", "qwen3-coder:480b"];

export function loadSettings() {
  const defaults = {
    apiKey: "",
    model: import.meta.env.VITE_OLLAMA_MODEL || DEFAULT_MODELS[0],
    mode: "proxy"
  };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

const baseUrl = (s) => (s.mode === "direct" ? DIRECT_URL : PROXY_URL);

function headers(s) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${s.apiKey}` };
}

async function failure(res) {
  let detail = "";
  try {
    const body = await res.json();
    detail = body.error || body.message || "";
  } catch {
    /* no JSON body */
  }
  if (res.status === 401 || res.status === 403) return "Ollama rejected the API key. Check it in Settings.";
  if (res.status === 404) {
    return detail || "Got a 404 with no message from Ollama. The /ollama-api proxy is probably not deployed (see README: deploy via Git or include _redirects). If the proxy works, pick another model in Settings.";
  }
  if (res.status === 429) return "Ollama rate limit reached. Wait a moment and try again.";
  return detail || `Ollama request failed (HTTP ${res.status}).`;
}

function networkError(s) {
  return s.mode === "direct"
    ? "The browser could not reach ollama.com (likely CORS). Switch Connection to “Via site proxy” in Settings."
    : "Could not reach Ollama. If you opened the built files without a server, run `npm run dev` or deploy to Netlify so the proxy works.";
}

export function requireKey(s) {
  if (!s.apiKey.trim()) throw new Error("Add your Ollama API key in Settings first.");
}

/** Lists models available to the key (also used as the "Test connection" button). */
export async function listModels(s) {
  requireKey(s);
  let res;
  try {
    res = await fetch(`${baseUrl(s)}/tags`, { headers: headers(s) });
  } catch {
    throw new Error(networkError(s));
  }
  if (!res.ok) throw new Error(await failure(res));
  const data = await res.json();
  return (data.models || []).map((m) => m.name || m.model).filter(Boolean);
}

/**
 * Streams a chat reply. Calls onToken(text) for every piece of the answer and
 * resolves with the full text. Pass an AbortSignal to stop it.
 */
export async function streamChat(s, messages, { onToken, signal, format } = {}) {
  requireKey(s);
  let res;
  try {
    res = await fetch(`${baseUrl(s)}/chat`, {
      method: "POST",
      headers: headers(s),
      signal,
      body: JSON.stringify({ model: s.model, messages, stream: true, ...(format ? { format } : {}) })
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error(networkError(s));
  }
  if (!res.ok) throw new Error(await failure(res));

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  const handle = (line) => {
    if (!line.trim()) return;
    const chunk = JSON.parse(line); // Ollama streams one JSON object per line
    if (chunk.error) throw new Error(chunk.error);
    const piece = chunk.message?.content || "";
    if (piece) {
      full += piece;
      onToken?.(piece, full);
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    lines.forEach(handle);
  }
  handle(buffer);
  return full;
}

/** Non-streaming helper that returns the full reply text. */
export const chatOnce = (s, messages, opts = {}) => streamChat(s, messages, opts);

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal.jsx";
import { streamChat } from "../lib/ollama";

const SUGGESTIONS = [
  "Recommend something for a beginner programmer",
  "Which books are available right now?",
  "I liked Sapiens. What should I read next?"
];

function systemPrompt(books) {
  const list = books
    .map((b) => `- "${b.title}" by ${b.author} [${b.category}] - ${b.availableCopies} of ${b.copies} copies available`)
    .join("\n");
  return (
    "You are the friendly AI librarian of Smart Library. Answer questions and recommend books using ONLY the catalog below; " +
    "if nothing fits, say so honestly instead of inventing titles that are not listed. Mention availability when it matters. " +
    "Keep answers short and in plain text (no markdown tables).\n\nCATALOG:\n" +
    (list || "(the catalog is empty)")
  );
}

export default function Librarian({ books, settings, seed, onNeedKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const logRef = useRef(null);
  const lastSeed = useRef(0);

  // Keep the newest text in view inside the chat box only (never scrolls the page).
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;
    if (!settings.apiKey.trim()) {
      onNeedKey();
      return;
    }
    setError("");
    setInput("");
    const history = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat(
        settings,
        [{ role: "system", content: systemPrompt(books) }, ...history],
        {
          signal: controller.signal,
          onToken: (_piece, full) =>
            setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: full }])
        }
      );
    } catch (err) {
      if (err?.name !== "AbortError") setError(err.message || "The librarian could not answer.");
    } finally {
      // Drop an empty assistant bubble if nothing arrived.
      setMessages((m) => (m.at(-1)?.role === "assistant" && !m.at(-1).content ? m.slice(0, -1) : m));
      setBusy(false);
      abortRef.current = null;
    }
  }

  // "Ask the librarian" on a book card sends a question here.
  useEffect(() => {
    if (seed && seed.n !== lastSeed.current) {
      lastSeed.current = seed.n;
      send(seed.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <section className="section" id="librarian">
      <Reveal className="section-head">
        <h2>Ask the librarian</h2>
        <p>
          The AI librarian reads your live catalog, so recommendations only include books you actually own.
          Powered by Ollama Cloud ({settings.model}).
        </p>
      </Reveal>

      <Reveal className="chat" delay={80}>
        <div className="chat-log" ref={logRef} aria-live="polite">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>Try one of these, or type your own question.</p>
              <div className="chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              {m.content || <span className="typing" aria-label="Thinking"><i /><i /><i /></span>}
            </div>
          ))}
        </div>

        {error && <p className="inline-error" role="alert">{error}</p>}
        {!settings.apiKey.trim() && (
          <p className="hint">
            You need an Ollama API key to chat. <button className="link" onClick={onNeedKey}>Add it in Settings</button>
          </p>
        )}

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            className="field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about books, authors or what is available"
            aria-label="Message the librarian"
          />
          {busy ? (
            <button type="button" className="btn outline dark" onClick={() => abortRef.current?.abort()}>Stop</button>
          ) : (
            <button type="submit" className="btn primary" disabled={!input.trim()}>Send</button>
          )}
          {messages.length > 0 && !busy && (
            <button type="button" className="btn ghost dark" onClick={() => { setMessages([]); setError(""); }}>
              New chat
            </button>
          )}
        </form>
      </Reveal>
    </section>
  );
}

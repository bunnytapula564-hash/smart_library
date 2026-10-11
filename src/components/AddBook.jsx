import { useState } from "react";
import Reveal from "./Reveal.jsx";
import { CATEGORIES } from "../lib/format";
import { chatOnce } from "../lib/ollama";

const EMPTY = { title: "", author: "", category: "General", isbn: "", copies: 1, description: "" };

function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The AI reply was not in the expected format. Try again.");
  return JSON.parse(text.slice(start, end + 1));
}

export default function AddBook({ settings, onAdd, onNeedKey, notify }) {
  const [form, setForm] = useState(EMPTY);
  const [filling, setFilling] = useState(false);
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function autofill() {
    if (!form.title.trim()) {
      notify("error", "Enter a title first so the AI knows which book to describe.");
      return;
    }
    if (!settings.apiKey.trim()) {
      onNeedKey();
      return;
    }
    setFilling(true);
    try {
      const reply = await chatOnce(
        settings,
        [
          {
            role: "system",
            content:
              "You are a cataloguing assistant. Reply with ONLY a JSON object: " +
              `{"category": one of ${JSON.stringify(CATEGORIES)}, "description": "one or two factual sentences, max 40 words"}. ` +
              "If you do not recognise the book, base the category on the title and keep the description cautious."
          },
          { role: "user", content: `Title: ${form.title}\nAuthor: ${form.author || "unknown"}\nISBN: ${form.isbn || "n/a"}` }
        ],
        { format: "json" }
      );
      const data = parseJson(reply);
      setForm((f) => ({
        ...f,
        category: CATEGORIES.includes(data.category) ? data.category : f.category,
        description: typeof data.description === "string" ? data.description.trim() : f.description
      }));
      notify("success", "Category and description filled in. Review them before adding.");
    } catch (err) {
      notify("error", err.message || "AI fill failed.");
    } finally {
      setFilling(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    const copies = Math.floor(Number(form.copies));
    if (!Number.isFinite(copies) || copies < 1 || copies > 100) {
      notify("error", "Number of copies must be between 1 and 100.");
      return;
    }
    onAdd({
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category,
      isbn: form.isbn.trim(),
      description: form.description.trim(),
      copies
    });
    notify("success", `"${form.title.trim()}" added with ${copies} ${copies === 1 ? "copy" : "copies"}.`);
    setForm(EMPTY);
  }

  return (
    <section className="section" id="add">
      <Reveal className="section-head">
        <h2>Add a book</h2>
        <p>Enter the title and author, then let the AI suggest a category and a short description.</p>
      </Reveal>

      <Reveal className="panel" delay={80}>
        <form className="form-grid" onSubmit={submit}>
          <label>Title<input className="field" value={form.title} onChange={set("title")} required placeholder="Book title" /></label>
          <label>Author<input className="field" value={form.author} onChange={set("author")} required placeholder="Author name" /></label>
          <label>ISBN (optional)<input className="field" value={form.isbn} onChange={set("isbn")} placeholder="9780132350884" /></label>
          <label>Copies<input className="field" type="number" min="1" max="100" value={form.copies} onChange={set("copies")} required /></label>
          <label>Category
            <select className="field" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="wide">Description
            <textarea className="field" rows="3" value={form.description} onChange={set("description")} placeholder="A short summary shown on the book card" />
          </label>
          <div className="form-actions wide">
            <button type="button" className="btn outline dark" onClick={autofill} disabled={filling}>
              {filling ? "Asking the AI…" : "Fill with AI"}
            </button>
            <button type="submit" className="btn primary">Add to catalog</button>
          </div>
        </form>
      </Reveal>
    </section>
  );
}

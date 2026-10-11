import { useMemo, useState } from "react";
import Reveal from "./Reveal.jsx";
import { CATEGORIES, spineColor } from "../lib/format";

export default function Catalog({ books, onAsk, onDelete }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter(
      (b) =>
        (category === "All" || b.category === category) &&
        (!q || `${b.title} ${b.author} ${b.category} ${b.isbn || ""}`.toLowerCase().includes(q))
    );
  }, [books, search, category]);

  return (
    <section className="section" id="catalog">
      <Reveal className="section-head">
        <h2>The catalog</h2>
        <p>Search by title, author, category or ISBN. Availability updates the moment a copy is lent or returned.</p>
      </Reveal>

      <Reveal className="filters" delay={80}>
        <input
          className="field search"
          type="search"
          placeholder="Search the catalog"
          aria-label="Search the catalog"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by category">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} className={`chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <Reveal as="p" className="empty">
          {books.length === 0 ? "The shelves are empty. Add the first book below." : "No books match your search. Try a different word or category."}
        </Reveal>
      ) : (
        <div className="grid">
          {filtered.map((book, i) => (
            <Reveal as="article" className="card" key={book.id} delay={(i % 3) * 90} style={{ "--c": spineColor(book.category) }}>
              <span className="card-category">{book.category}</span>
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>
              {book.description && <p className="desc">{book.description}</p>}
              <div className="card-foot">
                <span className={`pill ${book.availableCopies ? "ok" : "none"}`}>
                  {book.availableCopies ? `${book.availableCopies} of ${book.copies} available` : "All copies on loan"}
                </span>
                <div className="card-actions">
                  <button className="link" onClick={() => onAsk(book)}>Ask the librarian</button>
                  <button className="link danger" onClick={() => onDelete(book)}>Delete</button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

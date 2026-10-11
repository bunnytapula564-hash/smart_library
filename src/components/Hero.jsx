import Reveal from "./Reveal.jsx";
import { spineColor } from "../lib/format";

// Stable pseudo-random height/width from the title so the shelf never jitters.
function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export default function Hero({ books, stats }) {
  const shelf = books.slice(0, 16);
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <Reveal className="hero-copy">
          <h1>A library that can talk about its own shelves.</h1>
          <p>
            Browse the collection, lend and take back copies, and ask an AI librarian what to read next.
            Everything runs in your browser.
          </p>
          <div className="hero-actions">
            <a className="btn primary light" href="#catalog">Browse the catalog</a>
            <a className="btn outline" href="#librarian">Ask the librarian</a>
          </div>
        </Reveal>

        <Reveal className="shelf-wrap" delay={150}>
          <div className="shelf" role="img" aria-label="A shelf with the library's books">
            {shelf.map((book, i) => {
              const h = hash(book.title);
              return (
                <span
                  key={book.id}
                  className="spine"
                  title={book.title}
                  style={{
                    "--i": i,
                    "--c": spineColor(book.category),
                    height: `${150 + (h % 90)}px`,
                    width: `${26 + ((h >> 3) % 20)}px`
                  }}
                >
                  <b>{book.title}</b>
                </span>
              );
            })}
          </div>
          <div className="ledge" />
        </Reveal>
      </div>

      <Reveal className="stats" delay={100}>
        <div><strong>{stats.titles}</strong><span>titles</span></div>
        <div><strong>{stats.copies}</strong><span>copies</span></div>
        <div><strong>{stats.out}</strong><span>on loan</span></div>
        <div><strong>{stats.overdue}</strong><span>overdue</span></div>
      </Reveal>
    </section>
  );
}

export default function Nav({ hasKey, onSettings }) {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <span className="brand-mark" aria-hidden="true">
          <i /><i /><i />
        </span>
        Smart Library
      </a>
      <nav aria-label="Sections">
        <a href="#catalog">Catalog</a>
        <a href="#librarian">Librarian</a>
        <a href="#desk">Lending desk</a>
        <a href="#add">Add a book</a>
      </nav>
      <button className="btn ghost" onClick={onSettings}>
        <span className={`dot ${hasKey ? "ok" : "off"}`} aria-hidden="true" />
        {hasKey ? "AI connected" : "Connect AI"}
      </button>
    </header>
  );
}

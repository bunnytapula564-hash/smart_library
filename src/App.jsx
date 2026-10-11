import { useCallback, useMemo, useState } from "react";
import { useLibrary } from "./hooks/useLibrary";
import { isOverdue } from "./lib/format";
import { loadSettings, saveSettings } from "./lib/ollama";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Catalog from "./components/Catalog.jsx";
import Librarian from "./components/Librarian.jsx";
import LendingDesk from "./components/LendingDesk.jsx";
import AddBook from "./components/AddBook.jsx";
import Settings from "./components/Settings.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const lib = useLibrary();
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [seed, setSeed] = useState(null);

  const notify = useCallback((type, text) => setToast({ type, text, id: Date.now() }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const stats = useMemo(() => {
    const active = lib.loans.filter((l) => !l.returnedAt);
    return {
      titles: lib.books.length,
      copies: lib.books.reduce((n, b) => n + b.copies, 0),
      out: active.length,
      overdue: active.filter(isOverdue).length
    };
  }, [lib.books, lib.loans]);

  function askAbout(book) {
    setSeed({ n: Date.now(), text: `Tell me about "${book.title}" by ${book.author} and suggest similar books from our catalog.` });
    document.getElementById("librarian")?.scrollIntoView({ behavior: "smooth" });
  }

  function deleteBook(book) {
    if (!window.confirm(`Delete "${book.title}" and its loan history?`)) return;
    lib.deleteBook(book.id);
    notify("success", "Book deleted.");
  }

  function saveAndClose(next) {
    const clean = { ...next, apiKey: next.apiKey.trim(), model: next.model.trim() || settings.model };
    setSettings(clean);
    saveSettings(clean);
    setShowSettings(false);
    notify("success", "AI settings saved.");
  }

  const openSettings = useCallback(() => setShowSettings(true), []);

  return (
    <>
      <Nav hasKey={Boolean(settings.apiKey.trim())} onSettings={openSettings} />
      <main>
        <Hero books={lib.books} stats={stats} />
        <Catalog books={lib.books} onAsk={askAbout} onDelete={deleteBook} />
        <Librarian books={lib.books} settings={settings} seed={seed} onNeedKey={openSettings} />
        <LendingDesk books={lib.books} loans={lib.loans} onIssue={lib.issueBook} onReturn={lib.returnBook} notify={notify} />
        <AddBook settings={settings} onAdd={lib.addBook} onNeedKey={openSettings} notify={notify} />
      </main>
      <footer className="footer">
        <p>Smart Library keeps its data in this browser. The AI librarian runs on Ollama Cloud.</p>
      </footer>
      {showSettings && (
        <Settings
          settings={settings}
          onSave={saveAndClose}
          onClose={() => setShowSettings(false)}
          onReset={() => { lib.reset(); setShowSettings(false); notify("success", "Library reset to sample data."); }}
        />
      )}
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}

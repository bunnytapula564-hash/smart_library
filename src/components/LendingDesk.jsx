import { useMemo, useState } from "react";
import Reveal from "./Reveal.jsx";
import { isOverdue, LOAN_DAYS } from "../lib/format";

export default function LendingDesk({ books, loans, onIssue, onReturn, notify }) {
  const [bookId, setBookId] = useState("");
  const [borrower, setBorrower] = useState("");
  const [showReturned, setShowReturned] = useState(false);

  const titleOf = useMemo(() => new Map(books.map((b) => [b.id, b.title])), [books]);
  const lendable = books.filter((b) => b.availableCopies > 0);
  const names = useMemo(() => [...new Set(loans.map((l) => l.borrower))], [loans]);
  const rows = loans.filter((l) => showReturned || !l.returnedAt);

  function submit(e) {
    e.preventDefault();
    const name = borrower.trim();
    if (!bookId || !name) {
      notify("error", "Choose a book and enter the borrower's name.");
      return;
    }
    onIssue(bookId, name);
    notify("success", `Lent "${titleOf.get(bookId)}" to ${name}. Due in ${LOAN_DAYS} days.`);
    setBookId("");
    setBorrower("");
  }

  return (
    <section className="section" id="desk">
      <Reveal className="section-head">
        <h2>Lending desk</h2>
        <p>Lend a copy for {LOAN_DAYS} days and take it back when it returns. Overdue loans are flagged automatically.</p>
      </Reveal>

      <Reveal className="panel" delay={80}>
        <form className="form-row" onSubmit={submit}>
          <label>
            Book
            <select className="field" value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">{lendable.length ? "Choose a book" : "No copies available"}</option>
              {lendable.map((b) => (
                <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} left)</option>
              ))}
            </select>
          </label>
          <label>
            Borrower
            <input className="field" list="borrowers" value={borrower} onChange={(e) => setBorrower(e.target.value)} placeholder="Full name" />
            <datalist id="borrowers">{names.map((n) => <option key={n} value={n} />)}</datalist>
          </label>
          <button className="btn primary" type="submit">Lend book</button>
        </form>
      </Reveal>

      <Reveal className="panel table-panel" delay={120}>
        <div className="panel-head">
          <h3>{showReturned ? "All loans" : "Books currently out"}</h3>
          <label className="check">
            <input type="checkbox" checked={showReturned} onChange={(e) => setShowReturned(e.target.checked)} />
            Include returned
          </label>
        </div>
        {rows.length === 0 ? (
          <p className="empty">Nothing is out right now. Lent books will appear here.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Borrower</th><th>Book</th><th>Lent</th><th>Due</th><th>Status</th><th><span className="sr">Action</span></th></tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const overdue = isOverdue(l);
                  const status = l.returnedAt ? "returned" : overdue ? "overdue" : "out";
                  return (
                    <tr key={l.id}>
                      <td>{l.borrower}</td>
                      <td>{titleOf.get(l.bookId) || "Deleted book"}</td>
                      <td>{new Date(l.issuedAt).toLocaleDateString()}</td>
                      <td>{l.dueDate}</td>
                      <td><span className={`status ${status}`}>{{ returned: "Returned", overdue: "Overdue", out: "On loan" }[status]}</span></td>
                      <td>
                        {!l.returnedAt && (
                          <button className="btn small" onClick={() => { onReturn(l.id); notify("success", "Book returned."); }}>
                            Take back
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Reveal>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { SEED_BOOKS, SEED_LOANS } from "../lib/seed";
import { addDaysISO, LOAN_DAYS, uid } from "../lib/format";

const KEY = "smart-library:v2";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.books) && Array.isArray(parsed.loans)) return parsed;
    }
  } catch {
    /* corrupted or blocked storage: fall back to the sample data */
  }
  return { books: SEED_BOOKS, loans: SEED_LOANS };
}

/**
 * The whole library lives in the browser (localStorage). There is no server or
 * database, so deploying the app is just deploying static files.
 */
export function useLibrary() {
  const [data, setData] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or disabled: the app still works for this session */
    }
  }, [data]);

  const books = useMemo(
    () =>
      data.books.map((book) => {
        const out = data.loans.filter((l) => l.bookId === book.id && !l.returnedAt).length;
        return { ...book, availableCopies: Math.max(0, book.copies - out) };
      }),
    [data]
  );

  const addBook = useCallback((book) => {
    const created = { ...book, id: uid() };
    setData((d) => ({ ...d, books: [created, ...d.books] }));
    return created;
  }, []);

  const deleteBook = useCallback((id) => {
    setData((d) => ({
      books: d.books.filter((b) => b.id !== id),
      loans: d.loans.filter((l) => l.bookId !== id)
    }));
  }, []);

  const issueBook = useCallback((bookId, borrower) => {
    setData((d) => ({
      ...d,
      loans: [
        { id: uid(), bookId, borrower, issuedAt: new Date().toISOString(), dueDate: addDaysISO(LOAN_DAYS), returnedAt: null },
        ...d.loans
      ]
    }));
  }, []);

  const returnBook = useCallback((loanId) => {
    setData((d) => ({
      ...d,
      loans: d.loans.map((l) => (l.id === loanId ? { ...l, returnedAt: new Date().toISOString() } : l))
    }));
  }, []);

  const reset = useCallback(() => setData({ books: SEED_BOOKS, loans: SEED_LOANS }), []);

  return { books, loans: data.loans, addBook, deleteBook, issueBook, returnBook, reset };
}

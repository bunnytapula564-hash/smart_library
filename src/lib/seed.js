import { addDaysISO } from "./format";

// Sample data shown on first launch. Everything is stored in this browser only.
export const SEED_BOOKS = [
  { id: "b1", title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", isbn: "9780132350884", copies: 3,
    description: "A handbook of agile software craftsmanship with practical rules for writing readable, maintainable code." },
  { id: "b2", title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", isbn: "9780553380163", copies: 2,
    description: "A popular tour of black holes, the Big Bang and the nature of time, written for non-specialists." },
  { id: "b3", title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", category: "Technology", isbn: "9780135957059", copies: 2,
    description: "Timeless advice on becoming a more effective, adaptable and thoughtful programmer." },
  { id: "b4", title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "9780061120084", copies: 4,
    description: "A young girl in the American South watches her father defend a Black man falsely accused of a crime." },
  { id: "b5", title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "9780062316097", copies: 3,
    description: "A sweeping history of humankind, from the Stone Age to the age of artificial intelligence." },
  { id: "b6", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", isbn: "9780262046305", copies: 2,
    description: "The standard university reference on algorithm design and analysis." },
  { id: "b7", title: "Calculus Made Easy", author: "Silvanus P. Thompson", category: "Mathematics", isbn: "9781250065308", copies: 2,
    description: "A friendly, jargon-light introduction to calculus that has stayed in print for over a century." }
];

export const SEED_LOANS = [
  { id: "l1", bookId: "b1", borrower: "Aarav Sharma", issuedAt: new Date(Date.now() - 20 * 864e5).toISOString(), dueDate: addDaysISO(-6), returnedAt: null },
  { id: "l2", bookId: "b4", borrower: "Meera Iyer", issuedAt: new Date(Date.now() - 3 * 864e5).toISOString(), dueDate: addDaysISO(11), returnedAt: null },
  { id: "l3", bookId: "b5", borrower: "Rohan Gupta", issuedAt: new Date(Date.now() - 30 * 864e5).toISOString(), dueDate: addDaysISO(-16), returnedAt: new Date(Date.now() - 18 * 864e5).toISOString() }
];

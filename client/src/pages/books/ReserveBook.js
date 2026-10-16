import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { Icon, StatusBadge, errorMessage } from "./BooksUi";
import "./books.css";

export default function ReserveBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null); // null = loading, false = not found
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    api
      .get("/books")
      .then((res) => setBook(res.data.data.find((b) => String(b.id) === id) || false))
      .catch((err) => setError(errorMessage(err, "Could not load the book.")));
  }, [id]);

  const submit = () => {
    if (!date) return setError("Please choose a pickup date.");
    setSubmitting(true);
    setError("");
    // The server knows who you are from your login token, so no user id is sent.
    api
      .post("/books/reserve", { book_id: Number(id), pickup_date: date })
      .then(() => navigate("/books/my-reservations"))
      .catch((err) => setError(errorMessage(err, "Reservation failed.")))
      .finally(() => setSubmitting(false));
  };

  const back = (
    <button type="button" className="bk-link" onClick={() => navigate("/books")}>
      <Icon name="arrow_back" size={16} /> Back to catalog
    </button>
  );

  if (book === null && !error) {
    return <div className="bk-page"><p className="bk-muted">Loading...</p></div>;
  }

  if (book === false) {
    return (
      <div className="bk-page">
        {back}
        <div className="bk-card bk-empty" style={{ marginTop: 16 }}>
          <Icon name="search_off" />
          <h3>Book not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bk-page">
      <div className="bk-header">
        {back}
        <div className="bk-eyebrow" style={{ marginTop: 16 }}>Library Hub</div>
        <h1>Reserve a Book</h1>
        <p className="bk-muted">Choose a pickup date to hold this book for you.</p>
      </div>

      {error && (
        <div className="bk-alert bk-alert--error" role="alert">
          <Icon name="error" /> {error}
        </div>
      )}

      {book && (
        <div className="bk-split">
          <div className="bk-card">
            <div className="bk-row__main" style={{ marginBottom: 16 }}>
              <div className="bk-tile">
                <Icon name="menu_book" size={26} />
              </div>
              <div>
                <div className="bk-code">ISBN {book.isbn}</div>
                <h2>{book.title}</h2>
                <p className="bk-muted">{book.author}</p>
              </div>
            </div>
            <dl className="bk-details">
              <div><dt>Author</dt><dd>{book.author}</dd></div>
              <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>
              <div><dt>Availability</dt><dd><StatusBadge status={book.status} /></dd></div>
            </dl>
          </div>

          <div className="bk-card">
            <div className="bk-card__head">
              <Icon name="event_available" />
              <h2>Pickup</h2>
            </div>
            <label className="bk-label" htmlFor="pickup">Pickup date</label>
            <input
              id="pickup"
              type="date"
              className="bk-input"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="bk-hint">Choose the day you'll collect this book.</p>

            <div className="bk-stack" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="bk-btn bk-btn--primary bk-btn--block"
                onClick={submit}
                disabled={submitting || book.status !== "available"}
              >
                <Icon name="check_circle" /> {submitting ? "Reserving..." : "Confirm reservation"}
              </button>
              <button
                type="button"
                className="bk-btn bk-btn--outline bk-btn--block"
                onClick={() => navigate("/books")}
              >
                Cancel
              </button>
            </div>
            {book.status !== "available" && (
              <p className="bk-hint">This book is currently reserved by someone else.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Icon from "../../components/Icon";

const TEMP_USER_ID = 1; // TODO: replace with the logged-in user's id (Person 1)

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
      .then((res) => setBook(res.data.find((b) => String(b.id) === id) || false))
      .catch(() => setError("Could not load book. Is the server running?"));
  }, [id]);

  const submit = () => {
    if (!date) return setError("Please choose a pickup date.");
    setSubmitting(true);
    setError("");
    api
      .post("/books/reserve", { user_id: TEMP_USER_ID, book_id: Number(id), pickup_date: date })
      .then(() => navigate("/my-reservations"))
      .catch((err) => setError(err.response?.data?.error || "Reservation failed."))
      .finally(() => setSubmitting(false));
  };

  const back = (
    <button type="button" className="link" onClick={() => navigate("/books")}>
      <Icon name="arrow_back" size={16} /> Back to catalog
    </button>
  );

  if (book === null && !error) return <p className="muted">Loading...</p>;
  if (book === false)
    return (
      <div>
        {back}
        <Card className="empty-state" style={{ marginTop: 16 }}>
          <Icon name="search_off" />
          <h3>Book not found</h3>
        </Card>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        {back}
        <div className="eyebrow" style={{ marginTop: 16 }}>Library Hub</div>
        <h1>Reserve a Book</h1>
        <p className="muted">Choose a pickup date to hold this book for you.</p>
      </div>

      {error && (
        <div className="alert alert--error">
          <Icon name="error" /> {error}
        </div>
      )}

      {book && (
        <div className="split">
          <Card>
            <div className="row-card__main" style={{ marginBottom: 16 }}>
              <div className="icon-tile">
                <Icon name="menu_book" size={26} />
              </div>
              <div>
                <div className="code-tag">ISBN {book.isbn}</div>
                <h2>{book.title}</h2>
                <p className="muted">{book.author}</p>
              </div>
            </div>
            <dl className="detail-list">
              <div><dt>Author</dt><dd>{book.author}</dd></div>
              <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>
              <div><dt>Availability</dt><dd><Badge status={book.status} /></dd></div>
            </dl>
          </Card>

          <Card>
            <div className="card__head">
              <div className="card__head-title">
                <Icon name="event_available" />
                <h2>Pickup</h2>
              </div>
            </div>
            <label className="field-label" htmlFor="pickup">Pickup date</label>
            <Input
              id="pickup"
              type="date"
              icon="calendar_month"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="field-hint">Choose the day you'll collect this book.</p>

            <div className="stack" style={{ marginTop: 24 }}>
              <Button block icon="check_circle" onClick={submit} disabled={submitting || book.status !== "available"}>
                {submitting ? "Reserving..." : "Confirm reservation"}
              </Button>
              <Button block variant="outline" onClick={() => navigate("/books")}>
                Cancel
              </Button>
            </div>
            {book.status !== "available" && (
              <p className="field-hint">This book is currently reserved by someone else.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

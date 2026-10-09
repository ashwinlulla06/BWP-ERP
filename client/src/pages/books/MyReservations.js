import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Icon, StatusBadge, errorMessage } from "./BooksUi";
import "./books.css";

const prettyDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function MyReservations() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/books/reservations")
      .then((res) => {
        setRows(res.data.data);
        setError("");
      })
      .catch((err) => setError(errorMessage(err, "Could not load reservations.")))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const cancel = (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    api
      .delete(`/books/reservation/${id}`)
      .then(load)
      .catch((err) => setError(errorMessage(err, "Could not cancel the reservation.")));
  };

  return (
    <div className="bk-page">
      <div className="bk-header">
        <div className="bk-eyebrow">
          Library Hub <span className="bk-eyebrow__sub">• Your reservations</span>
        </div>
        <h1>My Reservations</h1>
        <p className="bk-muted">Books you've reserved for pickup.</p>
      </div>

      {error && (
        <div className="bk-alert bk-alert--error" role="alert">
          <Icon name="error" /> {error}
        </div>
      )}

      <div className="bk-card">
        <div className="bk-card__head bk-card__head--between">
          <div className="bk-card__title">
            <Icon name="event_available" />
            <h2>Reservations ({rows.length})</h2>
          </div>
          <button type="button" className="bk-link" onClick={() => navigate("/books")}>
            Browse catalog <Icon name="arrow_forward" size={16} />
          </button>
        </div>

        {loading && <p className="bk-muted">Loading...</p>}

        {!loading && rows.length === 0 && (
          <div className="bk-empty">
            <Icon name="bookmark" />
            <h3>No reservations yet</h3>
            <p>Find a book in the catalog and reserve it.</p>
            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                className="bk-btn bk-btn--primary"
                onClick={() => navigate("/books")}
              >
                <Icon name="auto_stories" /> Browse books
              </button>
            </div>
          </div>
        )}

        <div className="bk-stack">
          {rows.map((r) => (
            <div key={r.id} className="bk-row">
              <div className="bk-row__main">
                <div className="bk-thumb">
                  <Icon name="menu_book" size={28} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="bk-row__tags">
                    <span className="bk-code">#RES-{r.id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <h3 style={{ marginTop: 2 }}>{r.title}</h3>
                  <p className="bk-muted bk-small">{r.author}</p>
                  <div className="bk-meta" style={{ marginTop: 4 }}>
                    <Icon name="calendar_month" size={16} /> Pickup · {prettyDate(r.pickup_date)}
                  </div>
                </div>
              </div>
              {["pending", "approved"].includes(r.status) && (
                <button
                  type="button"
                  className="bk-btn bk-btn--danger bk-btn--sm"
                  onClick={() => cancel(r.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

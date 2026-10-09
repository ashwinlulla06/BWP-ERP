import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

const TEMP_USER_ID = 1; // TODO: replace with the logged-in user's id (Person 1)

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
      .get("/books/reservations", { params: { user_id: TEMP_USER_ID } })
      .then((res) => {
        setRows(res.data);
        setError("");
      })
      .catch(() => setError("Could not load reservations. Is the server running?"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const cancel = (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    api
      .delete(`/books/reservation/${id}`, { params: { user_id: TEMP_USER_ID } })
      .then(load)
      .catch((err) => setError(err.response?.data?.error || "Could not cancel."));
  };

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">
          Library Hub <span className="eyebrow__sub">• Your reservations</span>
        </div>
        <h1>My Reservations</h1>
        <p className="muted">Books you've reserved for pickup.</p>
      </div>

      {error && (
        <div className="alert alert--error">
          <Icon name="error" /> {error}
        </div>
      )}

      <Card>
        <div className="card__head">
          <div className="card__head-title">
            <Icon name="event_available" />
            <h2>Reservations ({rows.length})</h2>
          </div>
          <button type="button" className="link" onClick={() => navigate("/books")}>
            Browse catalog <Icon name="arrow_forward" size={16} />
          </button>
        </div>

        {loading && <p className="muted">Loading...</p>}

        {!loading && rows.length === 0 && (
          <div className="empty-state">
            <Icon name="bookmark" />
            <h3>No reservations yet</h3>
            <p>Find a book in the catalog and reserve it.</p>
            <div style={{ marginTop: 16 }}>
              <Button icon="auto_stories" onClick={() => navigate("/books")}>Browse books</Button>
            </div>
          </div>
        )}

        <div className="stack">
          {rows.map((r) => (
            <div key={r.id} className="row-card">
              <div className="row-card__main">
                <div className="thumb">
                  <Icon name="menu_book" size={28} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="row-card__tags">
                    <span className="code-tag">#RES-{r.id}</span>
                    <Badge status={r.status} />
                  </div>
                  <h3 style={{ marginTop: 2 }}>{r.title}</h3>
                  <p className="muted small">{r.author}</p>
                  <div className="meta" style={{ marginTop: 4 }}>
                    <Icon name="calendar_month" size={16} /> Pickup · {prettyDate(r.pickup_date)}
                  </div>
                </div>
              </div>
              {["pending", "approved"].includes(r.status) && (
                <Button variant="danger" size="sm" onClick={() => cancel(r.id)}>
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

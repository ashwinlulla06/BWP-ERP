import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { Icon, StatusBadge, errorMessage } from "./BooksUi";
import "./books.css";

export default function BookCatalog() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || ""; // kept in the URL so a search can be linked to

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search-as-you-type: wait 300ms after the last keystroke, then call the API.
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get("/books", { params: { search } })
        .then((res) => {
          setBooks(res.data.data);
          setError("");
        })
        .catch((err) => setError(errorMessage(err, "Could not load books.")))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer); // typing again cancels the pending call
  }, [search]);

  const onType = (e) => {
    const v = e.target.value;
    setParams(v ? { search: v } : {}, { replace: true });
  };

  const availableCount = books.filter((b) => b.status === "available").length;

  return (
    <div className="bk-page">
      <div className="bk-header">
        <div className="bk-eyebrow">
          Library Hub <span className="bk-eyebrow__sub">• Reference books</span>
        </div>
        <h1>Library Catalog</h1>
        <p className="bk-muted">Search reference books and reserve a pickup date.</p>
        <button type="button" className="bk-link" onClick={() => navigate("/books/my-reservations")}>
          <Icon name="bookmark" size={16} /> My reservations
        </button>
      </div>

      <div className="bk-search">
        <Icon name="search" />
        <input
          className="bk-input bk-input--lg"
          placeholder="Search by title or author..."
          value={search}
          onChange={onType}
          aria-label="Search books"
          autoFocus
        />
      </div>

      <div className="bk-toolbar">
        <span className="bk-muted">
          {loading
            ? "Searching..."
            : `${books.length} book${books.length === 1 ? "" : "s"} · ${availableCount} available`}
        </span>
      </div>

      {error && (
        <div className="bk-alert bk-alert--error" role="alert">
          <Icon name="error" /> {error}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="bk-card bk-empty">
          <Icon name="search_off" />
          <h3>No books found</h3>
          <p>Try a different title or author.</p>
        </div>
      )}

      <div className="bk-grid">
        {books.map((b) => (
          <div key={b.id} className="bk-card bk-card--interactive bk-resource">
            <div className="bk-resource__top">
              <div className="bk-tile">
                <Icon name="menu_book" size={26} />
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div>
              <div className="bk-code">ISBN {b.isbn}</div>
              <h3 className="bk-resource__title">{b.title}</h3>
              <p className="bk-muted">{b.author}</p>
            </div>
            <div className="bk-resource__footer">
              <span className="bk-meta">
                {b.status === "available" ? "Ready to reserve" : "Currently reserved"}
              </span>
              <button
                type="button"
                className="bk-btn bk-btn--primary bk-btn--sm"
                disabled={b.status !== "available"}
                onClick={() => navigate(`/books/${b.id}/reserve`)}
              >
                <Icon name="bookmark_add" /> Reserve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

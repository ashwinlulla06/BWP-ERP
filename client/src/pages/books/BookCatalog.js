import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Icon from "../../components/Icon";

export default function BookCatalog() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || ""; // URL is the single source of truth (topbar search uses it too)

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
          setBooks(res.data);
          setError("");
        })
        .catch(() => setError("Could not load books. Is the server running?"))
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
    <div>
      <div className="page-header">
        <div className="eyebrow">
          Library Hub <span className="eyebrow__sub">• Reference books</span>
        </div>
        <h1>Library Catalog</h1>
        <p className="muted">Search reference books and reserve a pickup date.</p>
      </div>

      <Input
        size="lg"
        icon="search"
        placeholder="Search by title or author..."
        value={search}
        onChange={onType}
        autoFocus
      />

      <div className="toolbar">
        <span className="muted">
          {loading ? "Searching..." : `${books.length} book${books.length === 1 ? "" : "s"} · ${availableCount} available`}
        </span>
      </div>

      {error && (
        <div className="alert alert--error">
          <Icon name="error" /> {error}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <Card className="empty-state">
          <Icon name="search_off" />
          <h3>No books found</h3>
          <p>Try a different title or author.</p>
        </Card>
      )}

      <div className="card-grid">
        {books.map((b) => (
          <Card key={b.id} interactive className="resource-card">
            <div className="resource-card__top">
              <div className="icon-tile">
                <Icon name="menu_book" size={26} />
              </div>
              <Badge status={b.status} />
            </div>
            <div>
              <div className="code-tag">ISBN {b.isbn}</div>
              <h3 className="resource-card__title">{b.title}</h3>
              <p className="muted">{b.author}</p>
            </div>
            <div className="resource-card__footer">
              <span className="meta">
                {b.status === "available" ? "Ready to reserve" : "Currently reserved"}
              </span>
              <Button
                size="sm"
                icon="bookmark_add"
                disabled={b.status !== "available"}
                onClick={() => navigate(`/reserve/${b.id}`)}
              >
                Reserve
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

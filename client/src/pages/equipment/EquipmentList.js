import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './equipment.css';
import Icon from './ui/Icon';
import { Badge } from './ui/StatusBadge';
import MockBanner from './ui/MockBanner';
import { getEquipment } from './lib/equipmentApi';
 
const CATEGORY_ICONS = {
  Electronics: 'memory',
  'Bio-Optics': 'biotech',
  Robotics: 'precision_manufacturing',
  Photonics: 'light_mode',
};
 
function EquipmentCard({ item }) {
  const total = Number(item.total_qty) || 0;
  const inService = total > 0;
  const category = item.category || 'General';
  const unitsText =
    item.available_qty !== undefined
      ? `${item.available_qty} of ${total} units free now`
      : `${total} ${total === 1 ? 'unit' : 'units'} in this lab`;
 
  return (
    <article className="eq-card">
      <div className="eq-card__visual">
        {item.image_url ? (
          <img src={item.image_url} alt="" loading="lazy" />
        ) : (
          <Icon name={CATEGORY_ICONS[category] || 'science'} size={56} className="eq-card__glyph" />
        )}
        <span className="eq-card__category">{category}</span>
      </div>
 
      <div className="eq-card__body">
        {item.asset_tag && <span className="eq-code">#{item.asset_tag}</span>}
        <h3 className="eq-card__title">{item.name}</h3>
        {item.description && <p className="eq-card__desc">{item.description}</p>}
        {item.location && (
          <p className="eq-card__meta">
            <Icon name="location_on" size={16} /> {item.location}
          </p>
        )}
      </div>
 
      <div className="eq-card__footer">
        <div className="eq-card__status">
          <Badge tone={inService ? 'available' : 'booked'}>{inService ? 'Available' : 'Out of service'}</Badge>
          <span className="eq-card__units">{unitsText}</span>
        </div>
        {inService ? (
          <Link to={`/equipment/${item.id}/book`} className="eq-btn eq-btn--primary eq-btn--block">
            Book a slot
          </Link>
        ) : (
          <button type="button" className="eq-btn eq-btn--secondary eq-btn--block" disabled>
            Not bookable
          </button>
        )}
      </div>
    </article>
  );
}
 
function CardSkeleton() {
  return (
    <div className="eq-card" aria-hidden="true">
      <div className="eq-card__visual eq-skeleton" />
      <div className="eq-card__body">
        <div className="eq-skeleton" style={{ height: 12, width: '40%' }} />
        <div className="eq-skeleton" style={{ height: 20, width: '80%' }} />
        <div className="eq-skeleton" style={{ height: 14, width: '95%' }} />
      </div>
      <div className="eq-card__footer">
        <div className="eq-skeleton" style={{ height: 40 }} />
      </div>
    </div>
  );
}
 
export default function EquipmentList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
 
  // AJAX call: the list is fetched from the server, never hard-coded in the page.
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getEquipment()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Could not load equipment.'))
      .finally(() => setLoading(false));
  }, []);
 
  useEffect(() => {
    load();
  }, [load]);
 
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [items]);
 
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== 'All' && (i.category || 'General') !== category) return false;
      if (!q) return true;
      return [i.name, i.description, i.location, i.asset_tag].some((f) => f && String(f).toLowerCase().includes(q));
    });
  }, [items, query, category]);
 
  const clearFilters = () => {
    setQuery('');
    setCategory('All');
  };
 
  return (
    <div className="eq-scope eq-page">
      <MockBanner />
 
      <header className="eq-header">
        <div>
          <h1 className="eq-title">Lab equipment</h1>
          <p className="eq-subtitle">Pick an instrument, then choose a date and time slot.</p>
        </div>
        <Link to="/equipment/my-bookings" className="eq-btn eq-btn--secondary">
          <Icon name="event_available" size={18} /> My bookings
        </Link>
      </header>
 
      <div className="eq-toolbar">
        <label className="eq-search">
          <Icon name="search" size={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, lab or asset tag"
            aria-label="Search equipment"
          />
        </label>
        <div className="eq-chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`eq-chip${category === c ? ' is-active' : ''}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
 
      {error && (
        <div className="eq-state eq-state--error" role="alert">
          <Icon name="cloud_off" size={36} />
          <h2>Equipment could not be loaded</h2>
          <p>{error}</p>
          <button type="button" className="eq-btn eq-btn--primary" onClick={load}>Try again</button>
        </div>
      )}
 
      {!error && loading && (
        <div className="eq-grid" aria-busy="true" aria-label="Loading equipment">
          {[0, 1, 2, 3, 4, 5].map((n) => <CardSkeleton key={n} />)}
        </div>
      )}
 
      {!error && !loading && filtered.length > 0 && (
        <>
          <p className="eq-count">
            Showing {filtered.length} of {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          <div className="eq-grid">
            {filtered.map((item) => <EquipmentCard key={item.id} item={item} />)}
          </div>
        </>
      )}
 
      {!error && !loading && filtered.length === 0 && (
        <div className="eq-state">
          <Icon name="search_off" size={36} />
          <h2>{items.length === 0 ? 'No equipment has been added yet' : 'No equipment matches your search'}</h2>
          <p>
            {items.length === 0
              ? 'An admin needs to add lab equipment before it can be booked.'
              : 'Try a different word or clear the filters.'}
          </p>
          {items.length > 0 && (
            <button type="button" className="eq-btn eq-btn--secondary" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './equipment.css';
import Icon from './ui/Icon';
import StatusBadge from './ui/StatusBadge';
import MockBanner from './ui/MockBanner';
import ConfirmModal from './ui/ConfirmModal';
import { ToastStack, useToasts } from './ui/Toast';
import { cancelBooking, getMyBookings } from './lib/equipmentApi';
import { formatDateLong, formatShortDate, formatSlotLabel, isSlotInPast } from './lib/timeSlots';
 
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];
 
const sortKey = (b) => `${b.date} ${b.time_slot}`;
 
function BookingRow({ booking, onCancel }) {
  const past = isSlotInPast(booking.date, booking.time_slot);
  const cancellable = !past && (booking.status === 'pending' || booking.status === 'approved');
 
  return (
    <li className={`eq-booking${booking.status === 'cancelled' || booking.status === 'rejected' ? ' is-inactive' : ''}`}>
      <span className="eq-booking__icon"><Icon name="science" /></span>
 
      <div className="eq-booking__main">
        <h3 className="eq-booking__name">{booking.equipment_name || `Equipment #${booking.equipment_id}`}</h3>
        <p className="eq-booking__when">
          <Icon name="calendar_today" size={16} /> {formatDateLong(booking.date)}
          <span className="eq-booking__sep" aria-hidden="true" />
          <Icon name="schedule" size={16} /> {formatSlotLabel(booking.time_slot)}
        </p>
        <p className="eq-booking__meta">
          Booking #{booking.id}
          {booking.created_at ? `, requested ${formatShortDate(booking.created_at)}` : ''}
        </p>
        {booking.signature && (
          <p className="eq-sig" title={booking.signature}>
            <Icon name="verified" size={16} filled /> Signed <code>{booking.signature.slice(0, 12)}…</code>
          </p>
        )}
      </div>
 
      <div className="eq-booking__status"><StatusBadge status={booking.status} /></div>
 
      <div className="eq-booking__action">
        {cancellable ? (
          <button type="button" className="eq-btn eq-btn--outline-danger" onClick={() => onCancel(booking)}>
            Cancel booking
          </button>
        ) : (
          <span className="eq-muted">{past ? 'Slot has passed' : ''}</span>
        )}
      </div>
    </li>
  );
}
 
function RowSkeleton() {
  return (
    <li className="eq-booking" aria-hidden="true">
      <span className="eq-booking__icon eq-skeleton" />
      <div className="eq-booking__main">
        <div className="eq-skeleton" style={{ height: 18, width: '55%' }} />
        <div className="eq-skeleton" style={{ height: 14, width: '70%', marginTop: 8 }} />
      </div>
    </li>
  );
}
 
export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [target, setTarget] = useState(null); // booking waiting for cancel confirmation
  const [cancelling, setCancelling] = useState(false);
  const { toasts, push, dismiss } = useToasts();
 
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Could not load your bookings.'))
      .finally(() => setLoading(false));
  }, []);
 
  useEffect(() => {
    load();
  }, [load]);
 
  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (c[b.status] !== undefined) c[b.status] += 1;
    });
    return c;
  }, [bookings]);
 
  const { upcoming, past } = useMemo(() => {
    const list = bookings.filter((b) => filter === 'all' || b.status === filter);
    const isPast = (b) => isSlotInPast(b.date, b.time_slot);
    return {
      upcoming: list.filter((b) => !isPast(b)).sort((a, b) => sortKey(a).localeCompare(sortKey(b))),
      past: list.filter(isPast).sort((a, b) => sortKey(b).localeCompare(sortKey(a))),
    };
  }, [bookings, filter]);
 
  // Cancel via AJAX; the row updates in place, the page never reloads.
  const confirmCancel = async () => {
    if (!target) return;
    setCancelling(true);
    try {
      await cancelBooking(target.id);
      setBookings((list) => list.map((b) => (b.id === target.id ? { ...b, status: 'cancelled' } : b)));
      push('Booking cancelled. The slot is free again.', 'success');
      setTarget(null);
    } catch (err) {
      push(err.message || 'Could not cancel this booking.', 'error');
      if (err.status === 404 || err.status === 409) {
        setTarget(null);
        load(); // our copy is out of date
      }
    } finally {
      setCancelling(false);
    }
  };
 
  const visibleCount = upcoming.length + past.length;
 
  return (
    <div className="eq-scope eq-page">
      <MockBanner />
 
      <header className="eq-header">
        <div>
          <h1 className="eq-title">My equipment bookings</h1>
          <p className="eq-subtitle">Track your requests, see approval status, and cancel what you no longer need.</p>
        </div>
        <Link to="/equipment" className="eq-btn eq-btn--primary">
          <Icon name="add" size={18} /> Book equipment
        </Link>
      </header>
 
      <div className="eq-chips eq-chips--spaced" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`eq-chip${filter === f.key ? ' is-active' : ''}`}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className="eq-chip__count">{counts[f.key]}</span>
          </button>
        ))}
      </div>
 
      {error && (
        <div className="eq-state eq-state--error" role="alert">
          <Icon name="cloud_off" size={36} />
          <h2>Your bookings could not be loaded</h2>
          <p>{error}</p>
          <button type="button" className="eq-btn eq-btn--primary" onClick={load}>Try again</button>
        </div>
      )}
 
      {!error && loading && (
        <ul className="eq-bookings" aria-busy="true" aria-label="Loading bookings">
          {[0, 1, 2].map((n) => <RowSkeleton key={n} />)}
        </ul>
      )}
 
      {!error && !loading && visibleCount === 0 && (
        <div className="eq-state">
          <Icon name="event_busy" size={36} />
          <h2>{bookings.length === 0 ? 'You have no equipment bookings yet' : `No ${filter} bookings`}</h2>
          <p>
            {bookings.length === 0
              ? 'Choose an instrument and a time slot to make your first booking.'
              : 'Pick another status above to see the rest.'}
          </p>
          {bookings.length === 0 ? (
            <Link to="/equipment" className="eq-btn eq-btn--primary">Browse equipment</Link>
          ) : (
            <button type="button" className="eq-btn eq-btn--secondary" onClick={() => setFilter('all')}>Show all</button>
          )}
        </div>
      )}
 
      {!error && !loading && upcoming.length > 0 && (
        <section aria-labelledby="eq-upcoming">
          <h2 id="eq-upcoming" className="eq-section-title">Upcoming</h2>
          <ul className="eq-bookings">
            {upcoming.map((b) => <BookingRow key={b.id} booking={b} onCancel={setTarget} />)}
          </ul>
        </section>
      )}
 
      {!error && !loading && past.length > 0 && (
        <section aria-labelledby="eq-past">
          <h2 id="eq-past" className="eq-section-title">Past</h2>
          <ul className="eq-bookings">
            {past.map((b) => <BookingRow key={b.id} booking={b} onCancel={setTarget} />)}
          </ul>
        </section>
      )}
 
      <ConfirmModal
        open={Boolean(target)}
        title="Cancel this booking?"
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        danger
        busy={cancelling}
        onConfirm={confirmCancel}
        onClose={() => setTarget(null)}
      >
        {target && (
          <p>
            <strong>{target.equipment_name}</strong> on {formatDateLong(target.date)}, {formatSlotLabel(target.time_slot)}.
            The slot will be released for other students.
          </p>
        )}
      </ConfirmModal>
 
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
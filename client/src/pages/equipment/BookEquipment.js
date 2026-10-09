import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './equipment.css';
import Icon from './ui/Icon';
import StatusBadge from './ui/StatusBadge';
import MockBanner from './ui/MockBanner';
import SlotPicker, { SlotLegend } from './ui/SlotPicker';
import { ToastStack, useToasts } from './ui/Toast';
import { bookEquipment, getEquipmentById, getSlots } from './lib/equipmentApi';
import {
  BOOKING_WINDOW_DAYS,
  addDays,
  formatDateLong,
  formatSlotLabel,
  isSlotInPast,
  parseISODate,
  toLocalISO,
  todayISO,
} from './lib/timeSlots';
 
const REFRESH_MS = 15000;
 
export default function BookEquipment() {
  const { id } = useParams();
 
  const [equipment, setEquipment] = useState(null);
  const [equipmentError, setEquipmentError] = useState(null);
 
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
 
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | checking | saving
  const [confirmation, setConfirmation] = useState(null);
 
  const { toasts, push, dismiss } = useToasts();
 
  const latestRequest = useRef(0);
  const selectedRef = useRef(null);
  selectedRef.current = selected;
 
  const days = useMemo(() => {
    const start = parseISODate(todayISO());
    return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(start, i));
  }, []);
  const minDate = toLocalISO(days[0]);
  const maxDate = toLocalISO(days[days.length - 1]);
 
  // ---- Real-time availability check (AJAX) --------------------------------
  const loadSlots = useCallback(
    async (forDate, { silent = false } = {}) => {
      latestRequest.current += 1;
      const mine = latestRequest.current;
      if (!silent) {
        setSlotsLoading(true);
        setSlotsError(null);
      }
      try {
        const data = await getSlots(id, forDate);
        if (mine !== latestRequest.current) return null; // a newer request replaced this one
        setSlots(data.slots);
        setUpdatedAt(new Date());
        setSlotsError(null);
 
        // If the slot the user picked was taken meanwhile, un-pick it.
        const picked = selectedRef.current;
        if (picked) {
          const now = data.slots.find((s) => s.time_slot === picked);
          if (now && !now.is_available) {
            setSelected(null);
            push('That slot was just taken. Pick another time.', 'error');
          }
        }
        return data.slots;
      } catch (err) {
        if (mine === latestRequest.current) {
          setSlotsError(err.message || 'Could not check availability.');
        }
        return null;
      } finally {
        if (mine === latestRequest.current) setSlotsLoading(false);
      }
    },
    [id, push]
  );
 
  // Equipment details.
  useEffect(() => {
    let cancelled = false;
    setEquipment(null);
    setEquipmentError(null);
    getEquipmentById(id)
      .then((e) => !cancelled && setEquipment(e))
      .catch((err) => !cancelled && setEquipmentError(err.message || 'Could not load this equipment.'));
    return () => {
      cancelled = true;
    };
  }, [id]);
 
  // Re-check slots whenever the date (or equipment) changes: no page reload.
  useEffect(() => {
    setSelected(null);
    setSlots(null);
    loadSlots(date);
  }, [date, loadSlots]);
 
  // Keep the grid live while the page is open.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible' && phase === 'idle') {
        loadSlots(date, { silent: true });
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [date, loadSlots, phase]);
 
  const changeDate = (next) => {
    if (!next || next < minDate || next > maxDate) return;
    setConfirmation(null);
    setDate(next);
  };
 
  const selectedInfo = slots && selected ? slots.find((s) => s.time_slot === selected) : null;
  const busy = phase !== 'idle';
 
  // ---- Confirm: check again, then book -------------------------------------
  const handleConfirm = async () => {
    if (!selected || busy) return;
    const slotName = selected;
 
    // 1) Fresh availability check right before booking.
    setPhase('checking');
    const fresh = await loadSlots(date, { silent: true });
    if (!fresh) {
      push('Could not check availability. Please try again.', 'error');
      setPhase('idle');
      return;
    }
    const current = fresh.find((s) => s.time_slot === slotName);
    if (!current || !current.is_available) {
      setSelected(null);
      setPhase('idle');
      return; // loadSlots already told the user the slot was taken
    }
    if (isSlotInPast(date, slotName)) {
      setSelected(null);
      push('That time has already passed.', 'error');
      setPhase('idle');
      return;
    }
 
    // 2) Save the booking (the server checks again: the frontend is never trusted alone).
    setPhase('saving');
    try {
      const booking = await bookEquipment({ equipment_id: Number(id) || id, date, time_slot: slotName });
      setConfirmation(booking);
      setSelected(null);
      push('Booking request sent for approval.', 'success');
      loadSlots(date, { silent: true });
    } catch (err) {
      if (err.status === 409) {
        setSelected(null);
        loadSlots(date, { silent: true });
      }
      push(err.message || 'Could not complete the booking.', 'error');
    } finally {
      setPhase('idle');
    }
  };
 
  // ---- Render ---------------------------------------------------------------
  if (equipmentError) {
    return (
      <div className="eq-scope eq-page">
        <div className="eq-state eq-state--error" role="alert">
          <Icon name="error" size={36} />
          <h2>This equipment could not be opened</h2>
          <p>{equipmentError}</p>
          <Link to="/equipment" className="eq-btn eq-btn--primary">Back to equipment</Link>
        </div>
      </div>
    );
  }
 
  const buttonLabel =
    phase === 'checking' ? 'Checking availability…' : phase === 'saving' ? 'Booking…' : 'Confirm booking';
 
  return (
    <div className="eq-scope eq-page">
      <MockBanner />
 
      <nav className="eq-breadcrumb" aria-label="Breadcrumb">
        <Link to="/equipment"><Icon name="arrow_back" size={18} /> Lab equipment</Link>
      </nav>
 
      <header className="eq-header">
        <div>
          {equipment ? (
            <>
              {equipment.asset_tag && <span className="eq-code">#{equipment.asset_tag}</span>}
              <h1 className="eq-title">{equipment.name}</h1>
              <p className="eq-subtitle">
                {equipment.location ? `${equipment.location}. ` : ''}
                {equipment.total_qty} {Number(equipment.total_qty) === 1 ? 'unit' : 'units'} can be booked per slot.
              </p>
            </>
          ) : (
            <>
              <div className="eq-skeleton" style={{ height: 14, width: 120, marginBottom: 10 }} />
              <div className="eq-skeleton" style={{ height: 32, width: 320 }} />
            </>
          )}
        </div>
      </header>
 
      <div className="eq-book-layout">
        <section className="eq-panel" aria-labelledby="eq-pick-date">
          <h2 id="eq-pick-date" className="eq-panel__title">1. Choose a date</h2>
 
          <div className="eq-dates" role="group" aria-label="Choose a date">
            {days.map((d) => {
              const value = toLocalISO(d);
              const active = value === date;
              return (
                <button
                  key={value}
                  type="button"
                  className={`eq-date${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => changeDate(value)}
                >
                  <span className="eq-date__dow">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                  <span className="eq-date__day">{d.getDate()}</span>
                  <span className="eq-date__mon">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
                </button>
              );
            })}
          </div>
 
          <label className="eq-datefield">
            <span>Or pick any date</span>
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => changeDate(e.target.value)}
            />
          </label>
 
          <div className="eq-panel__row">
            <h2 className="eq-panel__title">2. Choose a time slot</h2>
            <div className="eq-live">
              <span className="eq-live__dot" aria-hidden="true" />
              <span>
                {updatedAt
                  ? `Live, updated ${updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                  : 'Checking availability…'}
              </span>
              <button
                type="button"
                className="eq-iconbtn"
                aria-label="Refresh availability"
                onClick={() => loadSlots(date, { silent: true })}
                disabled={busy}
              >
                <Icon name="refresh" size={18} />
              </button>
            </div>
          </div>
 
          <p className="eq-panel__hint">{formatDateLong(date)}</p>
 
          {slotsError && (
            <div className="eq-inline-error" role="alert">
              <Icon name="error" size={18} />
              <span>{slotsError}</span>
              <button type="button" className="eq-linkbtn" onClick={() => loadSlots(date)}>Retry</button>
            </div>
          )}
 
          <SlotPicker date={date} slots={slots} loading={slotsLoading} selected={selected} onSelect={setSelected} />
          <SlotLegend />
        </section>
 
        <aside className="eq-panel eq-summary" aria-live="polite">
          {confirmation ? (
            <div className="eq-confirm">
              <span className="eq-confirm__icon"><Icon name="check_circle" filled size={40} /></span>
              <h2 className="eq-confirm__title">Request sent</h2>
              <p className="eq-confirm__text">
                An admin will review your booking. You can follow its status in My bookings.
              </p>
 
              <dl className="eq-kv">
                <div><dt>Reference</dt><dd>#{confirmation.id}</dd></div>
                <div><dt>Equipment</dt><dd>{confirmation.equipment_name || (equipment && equipment.name)}</dd></div>
                <div><dt>Date</dt><dd>{formatDateLong(confirmation.date)}</dd></div>
                <div><dt>Time</dt><dd>{formatSlotLabel(confirmation.time_slot)}</dd></div>
                <div><dt>Status</dt><dd><StatusBadge status={confirmation.status} /></dd></div>
              </dl>
 
              <details className="eq-json">
                <summary>Server response (JSON)</summary>
                <pre>{JSON.stringify({ success: true, data: confirmation }, null, 2)}</pre>
              </details>
 
              <div className="eq-confirm__actions">
                <Link to="/equipment/my-bookings" className="eq-btn eq-btn--primary eq-btn--block">View my bookings</Link>
                <button type="button" className="eq-btn eq-btn--secondary eq-btn--block" onClick={() => setConfirmation(null)}>
                  Book another slot
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="eq-panel__title">Your booking</h2>
              <dl className="eq-kv">
                <div><dt>Equipment</dt><dd>{equipment ? equipment.name : '…'}</dd></div>
                <div><dt>Date</dt><dd>{formatDateLong(date)}</dd></div>
                <div>
                  <dt>Time</dt>
                  <dd>{selected ? formatSlotLabel(selected) : <span className="eq-muted">Not chosen yet</span>}</dd>
                </div>
                {selectedInfo && (
                  <div><dt>Free in slot</dt><dd>{selectedInfo.available_qty} of {selectedInfo.total_qty}</dd></div>
                )}
              </dl>
 
              <button
                type="button"
                className="eq-btn eq-btn--primary eq-btn--block eq-btn--lg"
                disabled={!selected || busy}
                onClick={handleConfirm}
              >
                {buttonLabel}
              </button>
              <p className="eq-fineprint">
                Availability is checked again when you confirm. New requests start as pending until an admin approves them.
              </p>
            </>
          )}
        </aside>
      </div>
 
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
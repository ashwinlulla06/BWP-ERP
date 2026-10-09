import React from 'react';
import { SLOT_DEFINITIONS, formatSlotLabel, isSlotInPast } from '../lib/timeSlots';
 
// Hour-by-hour slot matrix.
//   free      -> dashed outline
//   booked    -> striped, not clickable
//   selected  -> solid cobalt
//   passed    -> striped, labelled "Passed" (today only)
export default function SlotPicker({ date, slots, loading, selected, onSelect }) {
  if (loading && !slots) {
    return (
      <div className="eq-slot-grid" aria-busy="true" aria-label="Loading time slots">
        {SLOT_DEFINITIONS.map((s) => (
          <div key={s} className="eq-slot eq-skeleton" style={{ height: 68 }} />
        ))}
      </div>
    );
  }
 
  const byName = {};
  (slots || []).forEach((s) => {
    byName[s.time_slot] = s;
  });
 
  return (
    <div className="eq-slot-grid" role="group" aria-label="Available time slots">
      {SLOT_DEFINITIONS.map((name) => {
        const info = byName[name];
        const passed = isSlotInPast(date, name);
        const free = Boolean(info && info.is_available) && !passed;
        const isSelected = selected === name && free;
 
        let state = 'free';
        let hint = info ? `${info.available_qty} of ${info.total_qty} free` : 'Unavailable';
        if (passed) {
          state = 'passed';
          hint = 'Passed';
        } else if (!info || !info.is_available) {
          state = 'booked';
          hint = 'Fully booked';
        }
        if (isSelected) state = 'selected';
 
        return (
          <button
            key={name}
            type="button"
            className={`eq-slot eq-slot--${state}`}
            disabled={!free}
            aria-pressed={isSelected}
            onClick={() => onSelect(name)}
          >
            <span className="eq-slot__time">{formatSlotLabel(name)}</span>
            <span className="eq-slot__hint">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}
 
export function SlotLegend() {
  return (
    <div className="eq-legend" aria-hidden="true">
      <span><i className="eq-legend__swatch eq-legend__swatch--free" /> Free</span>
      <span><i className="eq-legend__swatch eq-legend__swatch--booked" /> Booked</span>
      <span><i className="eq-legend__swatch eq-legend__swatch--selected" /> Your pick</span>
    </div>
  );
}
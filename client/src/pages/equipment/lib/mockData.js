import { SLOT_DEFINITIONS, addDays, toLocalISO, isSlotInPast } from './timeSlots';
 
const today = new Date();
const iso = (offset) => toLocalISO(addDays(today, offset));
 
const EQUIPMENT = [
  { id: 1, name: 'Digital Oscilloscope 100MHz', description: 'Keysight DSOX1204G with 4 analogue channels and built-in function generator.', total_qty: 4, category: 'Electronics', location: 'Electronics Lab 204', asset_tag: 'EQ-KEYSIGHT-100M' },
  { id: 2, name: 'Arduino & Sensor Kit', description: 'Mega 2560 boards with temperature, ultrasonic and IMU sensor modules.', total_qty: 10, category: 'Electronics', location: 'Electronics Lab 204', asset_tag: 'EQ-ARD-MEGA' },
  { id: 3, name: 'Trinocular Microscope', description: 'Olympus CX23 with 4x to 100x objectives and camera port.', total_qty: 3, category: 'Bio-Optics', location: 'Bio Lab 112', asset_tag: 'EQ-OLY-CX23' },
  { id: 4, name: 'UV-Vis Spectrophotometer', description: 'Wavelength range 190 to 1100 nm for absorbance and kinetics studies.', total_qty: 2, category: 'Bio-Optics', location: 'Bio Lab 115', asset_tag: 'EQ-UVVIS-02' },
  { id: 5, name: '6-Axis Robotic Arm', description: 'Desktop arm with 500 g payload, programmable in Python and ROS.', total_qty: 2, category: 'Robotics', location: 'Robotics Arena, Bay 3', asset_tag: 'EQ-ARM-6X' },
  { id: 6, name: 'FPGA Development Board', description: 'Xilinx Artix-7 board with VGA, HDMI and 100 MHz clock.', total_qty: 6, category: 'Electronics', location: 'VLSI Lab 301', asset_tag: 'EQ-FPGA-A7' },
  { id: 7, name: 'Laser Alignment Station', description: 'Class 3B optical bench with mounts, mirrors and power meter.', total_qty: 1, category: 'Photonics', location: 'Cleanroom 02', asset_tag: 'EQ-LASER-3B' },
  { id: 8, name: '3D Printer (FDM)', description: 'Prusa i3 MK3S+ with PLA and PETG filament, 25 x 21 x 21 cm bed.', total_qty: 3, category: 'Robotics', location: 'Maker Space', asset_tag: 'EQ-3DP-MK3' },
];
 
let bookings = [
  { id: 1, equipment_id: 1, date: iso(1), time_slot: '10:00-11:00', status: 'approved', signature: '3fa9c1d27be04a5c9e1f6b8d2a47c05e91b3d6f08a2c4e7195bd30fa6c8e1d72', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, equipment_id: 3, date: iso(3), time_slot: '14:00-15:00', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, equipment_id: 2, date: iso(-2), time_slot: '09:00-10:00', status: 'approved', signature: 'b71e08c4a92d5f3e6071c8ad9b24f5e03d8a1c67e4b92f0a35d7c1e8906ab4f3', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 4, equipment_id: 5, date: iso(5), time_slot: '11:00-12:00', status: 'rejected', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 5, equipment_id: 4, date: iso(2), time_slot: '15:00-16:00', status: 'cancelled', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
];
let nextId = 100;
 
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
 
function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}
 
// Deterministic "other people's" bookings so slots look varied but stable.
function otherBookedQty(equipmentId, date, slot, total) {
  const s = `${equipmentId}|${date}|${slot}`;
  let h = 7;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 9973;
  const r = h % 10;
  if (r < 4) return 0;
  if (r < 7) return Math.min(1, total);
  if (r < 9) return Math.floor(total / 2);
  return total;
}
 
function activeCount(equipmentId, date, slot) {
  return bookings.filter(
    (b) => b.equipment_id === equipmentId && b.date === date && b.time_slot === slot &&
      (b.status === 'pending' || b.status === 'approved')
  ).length;
}
 
function slotInfo(equipment, date, slot) {
  const booked = Math.min(
    equipment.total_qty,
    otherBookedQty(equipment.id, date, slot, equipment.total_qty) + activeCount(equipment.id, date, slot)
  );
  return { time_slot: slot, total_qty: equipment.total_qty, booked_qty: booked, available_qty: equipment.total_qty - booked };
}
 
const withName = (b) => ({ ...b, equipment_name: EQUIPMENT.find((e) => e.id === b.equipment_id)?.name || 'Equipment' });
 
export async function getEquipment() {
  await delay();
  return EQUIPMENT.map((e) => ({ ...e }));
}
 
export async function getSlots(equipmentId, date) {
  await delay(300);
  const equipment = EQUIPMENT.find((e) => e.id === Number(equipmentId));
  if (!equipment) throw fail('Equipment not found.', 404);
  return { equipment_id: equipment.id, date, slots: SLOT_DEFINITIONS.map((s) => slotInfo(equipment, date, s)) };
}
 
export async function bookEquipment({ equipment_id, date, time_slot }) {
  await delay(500);
  const equipment = EQUIPMENT.find((e) => e.id === Number(equipment_id));
  if (!equipment) throw fail('Equipment not found.', 404);
  if (isSlotInPast(date, time_slot)) throw fail('That time has already passed.', 400);
  const mine = bookings.some(
    (b) => b.equipment_id === equipment.id && b.date === date && b.time_slot === time_slot &&
      (b.status === 'pending' || b.status === 'approved')
  );
  if (mine) throw fail('You already have a booking for this slot.', 409);
  if (slotInfo(equipment, date, time_slot).available_qty <= 0) {
    throw fail('This slot was just booked by someone else.', 409);
  }
  const booking = { id: nextId++, equipment_id: equipment.id, date, time_slot, status: 'pending', created_at: new Date().toISOString() };
  bookings = [booking, ...bookings];
  return withName(booking);
}
 
export async function cancelBooking(id) {
  await delay(400);
  const booking = bookings.find((b) => b.id === Number(id));
  if (!booking) throw fail('Booking not found.', 404);
  if (booking.status === 'cancelled') throw fail('This booking is already cancelled.', 409);
  booking.status = 'cancelled';
  return { id: booking.id, status: 'cancelled' };
}
 
export async function getMyBookings() {
  await delay();
  return bookings.map(withName);
}
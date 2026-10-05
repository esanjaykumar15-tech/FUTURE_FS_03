// Client-side validation. Mirrors server rules for fast feedback; the server remains the authority.
const PHONE = /^[0-9+()\-\s]{7,20}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
};
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + n);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
};

export function validateReservation(v) {
  const e = {};
  if (!v.customer_name?.trim() || v.customer_name.trim().length < 2) e.customer_name = 'Enter your name (at least 2 characters).';
  if (!PHONE.test(v.phone?.trim() || '')) e.phone = 'Enter a valid phone number, e.g. +1 555 123 4567.';
  if (!v.booking_date) e.booking_date = 'Choose a date.';
  else if (v.booking_date < todayISO()) e.booking_date = 'Choose today or a future date.';
  else if (v.booking_date > addDays(todayISO(), 90)) e.booking_date = 'Requests open up to 90 days ahead.';
  if (!v.booking_time) e.booking_time = 'Choose a time.';
  const n = Number(v.party_size);
  if (!Number.isInteger(n) || n < 1) e.party_size = 'Party size must be at least 1.';
  else if (n > 20) e.party_size = 'For parties over 20, please call us.';
  return e;
}

export function validateEnquiry(v) {
  const e = {};
  if (!v.name?.trim() || v.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters).';
  if (!EMAIL.test(v.email?.trim() || '')) e.email = 'Enter a valid email address.';
  if (v.phone?.trim() && !PHONE.test(v.phone.trim())) e.phone = 'Enter a valid phone number or leave it blank.';
  if (!v.message?.trim() || v.message.trim().length < 5) e.message = 'Write a message of at least 5 characters.';
  return e;
}

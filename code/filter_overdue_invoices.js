// n8n "Code in JavaScript" node (Run Once for All Items)
// Input: rows from the "invoices" sheet. Output: only invoices that need a reminder today.

// ---- Settings ----
const TODAY = '2026-10-11';   // set to null to use the real current date
const SOFT_MAX = 7;           // 1-7 days overdue   -> soft
const FIRM_MAX = 30;          // 8-30 days overdue  -> firm, 30+ -> final
const MIN_GAP = 7;            // do not remind more often than every 7 days

const toDay = (s) => Math.floor(new Date(String(s).slice(0, 10) + 'T00:00:00Z').getTime() / 86400000);
const today = TODAY ? toDay(TODAY) : Math.floor(Date.now() / 86400000);

const out = [];
for (const item of $input.all()) {
  const r = item.json;
  if (r.status === 'Paid') continue;

  const daysLate = today - toDay(r.due_date);
  if (daysLate <= 0) continue;                       // not due yet

  if (r.last_reminder_date) {
    const since = today - toDay(r.last_reminder_date);
    if (since < MIN_GAP) continue;                   // reminded too recently
  }

  const tone = daysLate <= SOFT_MAX ? 'soft' : daysLate <= FIRM_MAX ? 'firm' : 'final';

  out.push({ json: {
    invoice_id: r.invoice_id,
    client: r.client,
    client_email: r.client_email,
    amount: r.amount,
    due_date: r.due_date,
    days_late: daysLate,
    tone,
    reminder_number: Number(r.reminder_count || 0) + 1,
  }});
}
return out;

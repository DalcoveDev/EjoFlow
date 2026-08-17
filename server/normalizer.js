function senderName(from) {
  if (!from) return '';
  const match = String(from).match(/^(.*?)\s*<[^>]+>$/);
  return (match ? match[1] : from).trim();
}

function cleanSummary(snippet) {
  if (!snippet) return '';
  return String(snippet).replace(/[\u200b\u200c\u200d\u2060\ufeff\u036f\u00ad]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function normalizeEmailList(raw) {
  const items = (Array.isArray(raw?.emails) ? raw.emails : []).map((e) => ({
    sender: senderName(e?.from),
    subject: e?.subject ?? '',
    summary: cleanSummary(e?.snippet),
    date: e?.date ? String(e.date).slice(0, 10) : '',
  }));
  return { type: 'email_list', title: 'Imeli zawe', count: items.length, items };
}

export function normalizeServiceResult({ provider, action, raw }) {
  if (raw?.status === 'unknown_action') return { ok: false, code: 'unsupported_action' };
  if (provider === 'gmail' && action === 'read_inbox') return { ok: true, data: normalizeEmailList(raw) };
  return { ok: false, code: 'unsupported_action' };
}

export function describeForEjoChat({ data }) {
  return JSON.stringify(data);
}

export function errorCodeToHint(code) {
  switch (code) {
    case 'unsupported_action':
      return 'Icyo gikorwa nticyategurwa ubu kuri iyi serivisi.';
    case 'service_unavailable':
      return 'Serivisi ntishoboye kugerwaho ubu, gerageza nyuma.';
    default:
      return 'Serivisi ntishoboye kugerwaho ubu, gerageza nyuma.';
  }
}
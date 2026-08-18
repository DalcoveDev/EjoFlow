import { Calendar, Mail, User } from 'lucide-react';
import type { EjoEmailList } from '../../types';

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function formatDate(date: string) {
  if (!date) return '';
  const d = new Date(date.length === 10 ? `${date}T00:00:00` : date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function EmailListCard({ data }: { data: EjoEmailList }) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-sm border border-ejo-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ejo-border bg-[#f1f7f4] px-4 py-3">
        <strong className="flex items-center gap-2 font-display text-sm text-ejo-blue">
          <Mail size={15} className="text-ejo-green" />
          {data.title}
        </strong>
        <span className="rounded-sm bg-[#dcece5] px-2 py-0.5 text-[10px] font-bold text-[#355a50]">
          {data.count}
        </span>
      </div>
      <ul className="divide-y divide-ejo-border">
        {data.items.length === 0 && (
          <li className="px-4 py-4 text-xs text-ejo-muted">Nta makiro aboneka.</li>
        )}
        {data.items.map((mail, i) => (
          <li key={i} className="space-y-1 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#dcece5] text-[10px] font-bold text-ejo-green">
                {initialOf(mail.sender)}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ejo-ink">{mail.sender || 'Umutumye utazwi'}</span>
              {mail.date && (
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-ejo-muted">
                  <Calendar size={11} />
                  {formatDate(mail.date)}
                </span>
              )}
            </div>
            <p className="break-words text-xs font-semibold leading-5 text-ejo-blue">{mail.subject}</p>
            {mail.summary && <p className="line-clamp-2 break-words text-[11px] leading-4 text-ejo-muted">{mail.summary}</p>}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-1.5 border-t border-ejo-border bg-ejo-canvas px-4 py-2 text-[10px] text-ejo-muted">
        <User size={11} />
        Amakuru avuye muri serivisi zawe
      </div>
    </div>
  );
}

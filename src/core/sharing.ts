import type {Session} from './quiz';

/** A dated, spoiler-free result. Never claim a rank without real comparison data. */
export function scoreMessage(session: Session, appUrl?: string): string {
  const label = session.daily ? `Daily Five · ${session.seed.slice(6)}`
    : session.edition ? `${session.edition.title} · ${session.edition.publishedAt.slice(0, 10)}`
    : session.family ? 'Family round' : 'Football quiz';
  const correct = session.answers.filter(a => a.correct).length;
  const tiles = session.answers.map(a => a.correct ? a.hinted ? '🟨' : '🟩' : '⬜').join('');
  let link = '';
  try {
    const url = new URL(appUrl ?? '');
    if (url.protocol === 'https:' && !url.username && !url.password) link = `\n${url.href}`;
  } catch { /* No public app address has been configured. */ }
  return `Leoqo · ${label}\n${correct}/${session.questionIds.length}\n${tiles}\n🟩 Correct · 🟨 With a hint · ⬜ Missed\nYour turn!${link}`;
}

/** Íconos de marca: Activity Bar (monocromo, VS Code lo usa como máscara). */
import { sparklePath } from './svg';

export const ACTIVITY_ICON = 'media/activity/scrapbook.svg';

/** Nota adhesiva con chincheta y un destello, en trazo para 24×24. */
export function activityIcon(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="M4 6.5h13.5v9.5l-4.5 4.5H4z"/>` +
    `<path d="M17.5 16H13v4.5"/>` +
    `<circle cx="10.75" cy="6.5" r="1.9" fill="currentColor"/>` +
    `<path d="M7 12h6.5M7 15h4"/>` +
    `<path d="${sparklePath(19.5, 4.5, 3.2)}" fill="currentColor" stroke="none"/>` +
    `</svg>\n`
  );
}

import { courseChapter } from './data/courseLibrary';

/** Preserve the entire opening narration, including dialogue speakers and variants. */
export function courseNarration(id: string): string | null {
 const source = courseChapter(id);
 if (!source || source.doc.subject !== 'hadith') return null;
 const text = source.pages.map(page => page.text).join('\n');
 const start = text.indexOf('Texte du Hadîth');
 const end = text.indexOf('\nRapporteur', start);
 return start >= 0 && end > start ? text.slice(start + 'Texte du Hadîth'.length, end).trim() : null;
}

export interface ReadingBlock { type: 'paragraph' | 'speaker'; text: string }
/** PDF line wraps become paragraphs; speaker labels remain distinct from the quotation. */
export function narrationBlocks(text: string): ReadingBlock[] {
 const blocks: ReadingBlock[] = [];
 let paragraph: string[] = [];
 const flush = () => { if (paragraph.length) blocks.push({type:'paragraph',text:paragraph.join(' ')}); paragraph=[]; };
 for (const raw of text.split('\n')) {
  const line = raw.trim();
  if (!line) { flush(); continue; }
  if (/^(PAROLE |VERSET (?:CITÉ|RÉCITÉ))/.test(line)) { flush(); blocks.push({type:'speaker',text:line}); continue; }
  if (/^(?:«|Rapporté par |Dans une autre version)/.test(line)) flush();
  paragraph.push(line);
  if (/[»:.!?]$/.test(line)) flush();
 }
 flush();
 return blocks;
}

import { assertFrenchScript, type AudioCategory, type AudioScript } from './audioProduction';

interface SourceDetails {
  id: string;
  description: string;
  checkedAt: string;
}
export interface QuranNarrativeSource extends SourceDetails {
  type: 'quran';
  surah: number;
  first: number;
  last: number;
}
export interface HadithNarrativeSource extends SourceDetails {
  type: 'hadith';
  collection: string;
  number: string;
  url: string;
  grade: string;
}
export interface HistoricalNarrativeSource extends SourceDetails {
  type: 'history';
  author: string;
  work: string;
  location: string;
  url: string;
  assessment: string;
  rights: string;
}
export type NarrativeSource = QuranNarrativeSource | HadithNarrativeSource | HistoricalNarrativeSource;
export interface NarrativeParagraph { id?: string; text: string; sources: string[] }
export interface NarrativeScene {
  id: string;
  title: string;
  paragraphs: NarrativeParagraph[];
  studyNote: string;
  treatment?: {decor: 'dawn'|'desert'|'water'|'garden'|'night'|'cave'; ambience: 'silence'|'wind'|'water'|'rain'};
}
export interface NarrativeChapter {
  audioVersion?: string;
  audioTitle?: string;
  id: string;
  title: string;
  recap: string;
  scenes: NarrativeScene[];
}
export interface NarrativeBook {
  id: string;
  version: string;
  status: 'draft';
  title: string;
  subtitle: string;
  category: AudioCategory;
  collection?: 'companions';
  companionIds?: string[];
  scope?: { kind: 'biography' | 'quranic-life' | 'episode' | 'anthology'; description: string };
  voice: string;
  editorialNote: string;
  sources: NarrativeSource[];
  chapters: NarrativeChapter[];
  epilogue: { text: string; lessons: string[]; question: string; sources: string[] };
}
export interface NarrationPart { index: number; start: number; end: number; text: string }

export function sourceReference(source: NarrativeSource) {
  if (source.type === 'hadith') return `${source.collection} ${source.number}`;
  if (source.type === 'history') return `${source.author}, ${source.work}, ${source.location}`;
  return `${source.surah}:${source.first}${source.last === source.first ? '' : `-${source.last}`}`;
}
export function sourceLabel(source: NarrativeSource) {
  return `${source.type === 'quran' ? 'Coran ' : ''}${sourceReference(source)}`;
}
export function sourceUrl(source: NarrativeSource) {
  if (source.type !== 'quran') return source.url;
  return `https://quran.com/${source.surah}/${source.first}${source.last === source.first ? '' : `-${source.last}`}`;
}
export function chapterNarrative(chapter: NarrativeChapter, includeRecap = false) {
  return [includeRecap ? chapter.recap : '', ...chapter.scenes.flatMap(scene => scene.paragraphs.map(p => p.text))].filter(Boolean).join('\n\n');
}
export function bookNarrative(book: NarrativeBook, includeEpilogue = false) {
  return [...book.chapters.map(chapter => chapterNarrative(chapter)), includeEpilogue ? book.epilogue.text : ''].filter(Boolean).join('\n\n');
}
export function narrationLength(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  return { words, minMinutes: Math.max(1, Math.ceil(words / 165)), maxMinutes: Math.max(1, Math.ceil(words / 135)) };
}

/** Exact contiguous slices: no sentence rewording, dropped text or word cut. No paid call. */
export function narrationParts(text: string, limit = 4000): NarrationPart[] {
  if (!Number.isSafeInteger(limit) || limit < 50 || limit > 4000) throw new Error('Limite de segment invalide.');
  if (!text.trim()) throw new Error('Le chapitre est vide.');
  const parts: NarrationPart[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + limit, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const remaining = text.length - start, count = Math.ceil(remaining / limit);
      const target = Math.ceil(remaining / count), minimum = remaining - (count - 1) * limit;
      const choose = (pattern: RegExp) => [...slice.matchAll(pattern)].map(match => match.index + match[0].length)
        .filter(position => position >= minimum && position >= target / 2)
        .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
      // Balance a chapter just above the provider limit instead of leaving a tiny final clip.
      const boundary = choose(/\n\n/gu) ?? choose(/[.!?…][”»"']?\s+/gu) ?? choose(/\s+/gu);
      if (!boundary) throw new Error('Un mot dépasse la limite de production. Relisez le texte.');
      end = start + boundary;
    }
    const part = text.slice(start, end);
    // Whitespace belongs to the preceding segment so concatenation remains exact.
    if (!part.trim()) {
      const previous = parts.at(-1);
      if (!previous || previous.text.length + part.length > limit) throw new Error('Espacement final trop long.');
      previous.text += part;
      previous.end = end;
    } else {
      assertFrenchScript(part);
      parts.push({ index: parts.length, start, end, text: part });
    }
    start = end;
  }
  return parts;
}
export function chapterSources(book: NarrativeBook, chapter: NarrativeChapter) {
  const ids = new Set(chapter.scenes.flatMap(scene => scene.paragraphs.flatMap(p => p.sources)));
  return book.sources.filter(source => ids.has(source.id));
}

/** Drafts only. Existing studio review, quote and spending gates remain mandatory. */
export function chapterDrafts(book: NarrativeBook, chapter: NarrativeChapter, includeRecap = false, includeEpilogue = false): AudioScript[] {
  const chapterNumber = book.chapters.findIndex(item => item.id === chapter.id) + 1;
  if (!chapterNumber) throw new Error('Chapitre absent de ce livre.');
  const sources = chapterSources(book, chapter);
  if (!sources.length) throw new Error('Les sources du chapitre sont absentes.');
  if (includeEpilogue && chapterNumber !== book.chapters.length) throw new Error('L’épilogue suit uniquement le dernier chapitre.');
  const text = [chapterNarrative(chapter, includeRecap), includeEpilogue ? book.epilogue.text : ''].filter(Boolean).join('\n\n');
  const parts = narrationParts(text);
  return parts.map((part, index) => ({
    id: '',
    title: `${book.title} · ${chapterNumber}. ${chapter.title}${parts.length > 1 ? ` · ${index + 1}/${parts.length}` : ''}`,
    category: book.category,
    text: part.text,
    original_text: part.text,
    source_url: sourceUrl(sources[0]),
    reference: `${sources.map(sourceReference).join(' ; ')} · Manuscrit ${chapter.audioVersion||book.version}, chapitre ${chapter.id}, segment ${index + 1}/${parts.length}`,
    rights: 'Texte pédagogique original préparé pour Quran Coach à partir des références coraniques indiquées. Manuscrit à relire : validation du texte et des droits de narration et redistribution requise avant production.',
    approved_by: null,
  }));
}

export function bookMarkdown(book: NarrativeBook, onlyChapter?: NarrativeChapter) {
  const chapters = onlyChapter ? [onlyChapter] : book.chapters;
  const sourceIds = new Set(chapters.flatMap(chapter => chapterSources(book, chapter).map(source => source.id)));
  const sources = book.sources.filter(source => !onlyChapter || sourceIds.has(source.id));
  const body = chapters.map(chapter => `## ${book.chapters.indexOf(chapter) + 1}. ${chapter.title}\n\n${chapterNarrative(chapter)}\n\n### Repères de lecture\n\n${chapter.scenes.map(scene => `- **${scene.title}** — ${scene.studyNote}`).join('\n')}`).join('\n\n');
  return `# ${book.title} — ${book.subtitle}\n\nVersion ${book.version} · Manuscrit à relire avant publication audio.\n\n${book.editorialNote}\n\n${body}${onlyChapter ? '' : `\n\n## Épilogue\n\n${book.epilogue.text}\n\n${book.epilogue.lessons.map(lesson => `- ${lesson}`).join('\n')}\n\n${book.epilogue.question}`}\n\n## Sources et périmètre\n\n${sources.map(source => `- [${sourceLabel(source)}](${sourceUrl(source)}) — ${source.description}${source.type === 'hadith' ? ` (${source.grade})` : source.type === 'history' ? ` (${source.assessment}). Droits : ${source.rights}` : ''}. Consultation : ${source.checkedAt}.`).join('\n')}\n\nLa narration française est une adaptation pédagogique originale, pas une traduction littérale. Les notes, références et questions ne font pas partie du texte à prononcer. L’état de production et de publication des enregistrements se consulte dans le studio.\n`;
}

import { describe, expect, it } from 'vitest';
import { narrativeBooks } from '../data/narrativeBooks';
import chapters from './interactiveMushaf/chapters.json';
import { assertFrenchScript } from './audioProduction';
import { bookMarkdown, bookNarrative, chapterDrafts, chapterNarrative, narrationLength, narrationParts, sourceLabel, sourceUrl } from './narrativeBooks';

describe('livres racontés : texte et sources', () => {
  it('keeps an authored long manuscript and complete source trails, without inferring verse ranges', () => {
    for (const book of narrativeBooks) {
      expect(book.status).toBe('draft');
      expect(new Set(book.sources.map(source => source.id)).size).toBe(book.sources.length);
      expect(new Set(book.chapters.map(chapter => chapter.id)).size).toBe(book.chapters.length);
      expect(narrationLength(bookNarrative(book)).words).toBeGreaterThan(1500);
      const sourceIds = new Set(book.sources.map(source => source.id));
      for (const source of book.sources) {
        expect(sourceUrl(source)).toMatch(/^https:\/\/(quran\.com|sunnah\.com)\//);
        if (source.type === 'quran') {
          expect(source.first).toBeGreaterThan(0);
          expect(source.last).toBeGreaterThanOrEqual(source.first);
          expect(source.last).toBeLessThanOrEqual(chapters[source.surah - 1].count);
        } else {
          expect(source.grade).toContain('Sahih');
          expect(sourceUrl(source)).toContain(source.number);
        }
      }
      for (const chapter of book.chapters) {
        expect(narrationLength(chapterNarrative(chapter)).words).toBeGreaterThan(450);
        for (const scene of chapter.scenes) {
          expect(scene.studyNote).not.toBe('');
          for (const paragraph of scene.paragraphs) {
            expect(paragraph.sources.length).toBeGreaterThan(0);
            for (const source of paragraph.sources) expect(sourceIds.has(source)).toBe(true);
            expect(paragraph.text).not.toMatch(/[\u0600-\u06FF]/u);
          }
        }
      }
      for (const id of book.epilogue.sources) expect(sourceIds.has(id)).toBe(true);
    }
  });

  it('keeps notes, questions and standalone recaps outside the continuous narration', () => {
    const book = narrativeBooks[0], text = bookNarrative(book);
    for (const chapter of book.chapters) {
      if (chapter.recap) {
        expect(chapterNarrative(chapter)).not.toContain(chapter.recap);
        expect(chapterNarrative(chapter, true).startsWith(chapter.recap)).toBe(true);
      }
      for (const scene of chapter.scenes) expect(text).not.toContain(scene.studyNote);
    }
    expect(text).not.toContain(book.epilogue.question);
    expect(text).not.toContain(book.epilogue.text);
    expect(bookNarrative(book, true).endsWith(book.epilogue.text)).toBe(true);
  });

  it('exports all narration and source links with an explicit unpublished manuscript status', () => {
    const book = narrativeBooks[0], full = bookMarkdown(book), first = bookMarkdown(book, book.chapters[0]);
    for (const chapter of book.chapters) expect(full).toContain(chapterNarrative(chapter));
    expect(first).not.toContain(book.chapters[1].title);
    expect(full).toContain('Manuscrit à relire avant publication audio');
    expect(full).not.toContain('Aucun audio n’a été produit');
    expect(full).toContain('https://sunnah.com/bukhari:3326');
    expect(sourceLabel(book.sources.find(source => source.type === 'hadith')!)).not.toContain('Coran');
  });
});

describe('préparation des chapitres sans dépense', () => {
  it('splits long prose into exact contiguous slices at natural boundaries and preserves every character', () => {
    const text = Array.from({ length: 90 }, (_, index) => `Paragraphe ${index}. Cette phrase se termine ici, avec son accent et sa ponctuation.`).join('\n\n');
    const parts = narrationParts(text, 500);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.map(part => part.text).join('')).toBe(text);
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      expect(part.text.length).toBeLessThanOrEqual(500);
      expect(part.start).toBe(index === 0 ? 0 : parts[index - 1].end);
      expect(text.slice(part.start, part.end)).toBe(part.text);
      if (index < parts.length - 1) expect(part.text).toMatch(/\s$/);
    }
  });

  it('handles a long paragraph without cutting a word or silently omitting a suffix', () => {
    const text = 'Une phrase très longue '.repeat(300) + 'se termine ici.';
    const parts = narrationParts(text, 300);
    expect(parts.map(part => part.text).join('')).toBe(text);
    for (const part of parts.slice(0, -1)) expect(part.text).toMatch(/\s$/);
    expect(() => narrationParts('x'.repeat(4100))).toThrow('Un mot dépasse');
    expect(() => narrationParts('')).toThrow();
    expect(() => narrationParts('Bonjour.', 10000)).toThrow();
  });

  it('balances a chapter slightly above the provider limit instead of creating a tiny last clip', () => {
    const text = 'Une scène suit la précédente.\n\n'.repeat(135);
    const parts = narrationParts(text);
    expect(text.length).toBeGreaterThan(4000);
    expect(parts).toHaveLength(2);
    expect(Math.min(...parts.map(part => part.text.length))).toBeGreaterThan(1500);
    expect(parts.map(part => part.text).join('')).toBe(text);
  });

  it('creates reproducible unapproved drafts only, within the existing 4000-character server boundary', () => {
    for (const book of narrativeBooks) for (const chapter of book.chapters) {
      const drafts = chapterDrafts(book, chapter);
      expect(drafts.map(draft => draft.text).join('')).toBe(chapterNarrative(chapter));
      expect(chapterDrafts(book, chapter)).toEqual(drafts);
      for (const draft of drafts) {
        expect(() => assertFrenchScript(draft.text)).not.toThrow();
        expect(draft.approved_by).toBeNull();
        expect(draft.id).toBe('');
        expect(draft.original_text).toBe(draft.text);
        expect(draft.reference).toContain(book.version);
        expect(draft.rights).toContain('requise avant production');
      }
    }
  });
});

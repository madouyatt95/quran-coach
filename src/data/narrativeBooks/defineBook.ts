import type { NarrativeBook, QuranNarrativeSource } from '../../lib/narrativeBooks';

export type Passage = readonly [surah: number, first: number, last: number];
interface SectionInput { title: string; refs: Passage[]; text: string; note?: string }
interface ChapterInput { id: string; title: string; sections: SectionInput[] }
interface BookInput {
  id: string; title: string; subtitle: string; category?: NarrativeBook['category'];
  note: string; chapters: ChapterInput[]; epilogue: string; lessons: string[]; question: string;
}
const sourceId = ([surah, first, last]: Passage) => `q-${surah}-${first}-${last}`;

/** Original French narration; the Quranic source text is never sent to TTS. */
export function defineBook(input: BookInput): NarrativeBook {
  const sources = new Map<string, QuranNarrativeSource>();
  for (const chapter of input.chapters) for (const section of chapter.sections) for (const passage of section.refs) {
    const [surah, first, last] = passage, id = sourceId(passage);
    if (!sources.has(id)) sources.set(id, {id, type:'quran', surah, first, last, checkedAt:'2026-10-23', description:section.title});
  }
  return {
    id:input.id, version:`${input.id}-conte-2026-10-23-v1`, status:'draft', title:input.title, subtitle:input.subtitle,
    category:input.category || 'prophet', voice:'George',
    editorialNote:`Narration française originale, au discours indirect, fondée sur les passages indiqués. Les titres, notes et références restent hors du texte à prononcer. Aucune parole ou scène historique n’est ajoutée pour allonger le récit. ${input.note} La vérification éditoriale des sources ne remplace pas la relecture religieuse ni l’écoute humaine avant publication.`,
    sources:[...sources.values()],
    chapters:input.chapters.map(chapter => ({id:chapter.id, title:chapter.title, recap:'', scenes:chapter.sections.map((section,i) => ({
      id:`${chapter.id}-${i+1}`, title:section.title,
      paragraphs:section.text.trim().split(/\n\s*\n/u).map(text => ({text, sources:section.refs.map(sourceId)})),
      studyNote:section.note || 'Les faits rapportés suivent ces passages ; les rapprochements et transitions relèvent de la narration pédagogique.',
    }))})),
    epilogue:{text:input.epilogue, lessons:input.lessons, question:input.question, sources:[...sources.keys()]},
  };
}

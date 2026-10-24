import type { NarrativeBook, HadithNarrativeSource, HistoricalNarrativeSource, NarrativeSource } from '../../lib/narrativeBooks';

export type Passage = readonly [surah: number, first: number, last: number];
type SourceInput = Passage | HadithNarrativeSource | HistoricalNarrativeSource;
interface SectionInput { title: string; refs: SourceInput[]; text: string; note?: string }
interface ChapterInput { id: string; title: string; sections: SectionInput[] }
interface BookInput {
  id: string; title: string; subtitle: string; category?: NarrativeBook['category'];
  collection?: NarrativeBook['collection']; companionIds?: string[];
  scope?: NarrativeBook['scope']; version?: string;
  note: string; chapters: ChapterInput[]; epilogue: string; lessons: string[]; question: string;
  checkedAt?: string;
}
const isPassage = (source: SourceInput): source is Passage => Array.isArray(source);
const sourceId = (source: SourceInput) => isPassage(source) ? `q-${source[0]}-${source[1]}-${source[2]}` : source.id;

/** Original French narration; the Quranic source text is never sent to TTS. */
export function defineBook(input: BookInput): NarrativeBook {
  const sources = new Map<string, NarrativeSource>();
  for (const chapter of input.chapters) for (const section of chapter.sections) for (const passage of section.refs) {
    const id = sourceId(passage);
    if (!sources.has(id)) {
      if (isPassage(passage)) {
        const [surah,first,last] = passage;
        sources.set(id, {id,type:'quran',surah,first,last,checkedAt:input.checkedAt || '2026-10-23',description:section.title});
      } else sources.set(id,passage);
    }
  }
  return {
    id:input.id, version:input.version || `${input.id}-conte-${input.checkedAt || '2026-10-23'}-v1`, status:'draft', title:input.title, subtitle:input.subtitle,
    category:input.category || 'prophet', voice:'George',
    ...(input.collection?{collection:input.collection,companionIds:input.companionIds||[]}:{}),
    ...(input.scope?{scope:input.scope}:{}),
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

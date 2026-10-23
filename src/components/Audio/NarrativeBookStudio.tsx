import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { narrativeBooks } from '../../data/narrativeBooks';
import { useOpenReader } from '../../hooks/useOpenReader';
import type { AudioScript } from '../../lib/audioProduction';
import { bookMarkdown, bookNarrative, chapterDrafts, chapterNarrative, chapterSources, narrationLength, sourceLabel, sourceUrl, type NarrativeChapter } from '../../lib/narrativeBooks';
import './NarrativeBookStudio.css';

interface Props {
  busy: boolean;
  onOpenScript: (script: AudioScript) => void;
  onSaveDrafts: (scripts: AudioScript[]) => Promise<unknown>;
}

export function NarrativeBookStudio({ busy, onOpenScript, onSaveDrafts }: Props) {
  const [params, setParams] = useSearchParams();
  const book = narrativeBooks.find(item => item.id === params.get('book')) || narrativeBooks[0];
  const chapter = book.chapters.find(item => item.id === params.get('chapter')) || book.chapters[0];
  const [mode, setMode] = useState<'story' | 'study'>('story');
  const [wholeBook, setWholeBook] = useState(false);
  const [includeRecap, setIncludeRecap] = useState(false);
  const [includeEpilogue, setIncludeEpilogue] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const openReader = useOpenReader(`${book.title} · Manuscrit`);
  const chapterIndex = book.chapters.indexOf(chapter);
  const manuscriptRef = useRef<HTMLDivElement>(null);
  const view = `${book.id}:${chapter.id}:${wholeBook}`;
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current !== view) manuscriptRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    lastView.current = view;
  }, [view]);
  const length = narrationLength(wholeBook ? bookNarrative(book) : chapterNarrative(chapter));
  const drafts = chapterDrafts(book, chapter, includeRecap, includeEpilogue && chapterIndex === book.chapters.length - 1);
  const characters = drafts.reduce((sum, draft) => sum + draft.text.length, 0);
  const sources = chapterSources(book, chapter);
  const selectChapter = (next: NarrativeChapter) => {
    setWholeBook(false);
    setIncludeRecap(false);
    setParams(previous => { const updated = new URLSearchParams(previous); updated.set('book', book.id); updated.set('chapter', next.id); return updated; }, { replace: true });
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([bookMarkdown(book, wholeBook ? undefined : chapter)], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.version}${wholeBook ? '' : `-${chapter.id}`}.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const saveDrafts = async (entireBook = false) => {
    setSaving(true);
    setError('');
    try { await onSaveDrafts(entireBook ? book.chapters.flatMap((item,index) => chapterDrafts(book,item,false,index === book.chapters.length-1)) : drafts); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Enregistrement interrompu. Les segments déjà enregistrés sont conservés.'); }
    finally { setSaving(false); }
  };

  return <section className="narrative-workshop" aria-label="Atelier des livres audio">
    {narrativeBooks.length > 1 && <label className="audio-card">Choisir un livre<select value={book.id} onChange={event => {
      const next = narrativeBooks.find(item => item.id === event.target.value)!;
      setWholeBook(false); setIncludeRecap(false);
      setParams(previous => { const updated = new URLSearchParams(previous); updated.set('book',next.id); updated.set('chapter',next.chapters[0].id); return updated; }, {replace:true});
    }}>{narrativeBooks.map(item => <option key={item.id} value={item.id}>{item.title} — {item.subtitle}</option>)}</select></label>}
    <header className="audio-card narrative-book-cover">
      <span className="audio-kicker">LES LIVRES RACONTÉS · MANUSCRIT</span>
      <h2>{book.title}</h2>
      <p className="narrative-subtitle">{book.subtitle}</p>
      <p>{book.chapters.length} chapitres · voix retenue : {book.voice}</p>
      <p className="narrative-status">Manuscrit de narration · références consultables dans le dossier</p>
      <details><summary>Note éditoriale et sources</summary><p>{book.editorialNote}</p></details>
    </header>

    <nav className="narrative-chapters" aria-label="Chapitres du manuscrit">
      {book.chapters.map((item, index) => <button key={item.id} aria-current={!wholeBook && item.id === chapter.id ? 'step' : undefined} onClick={() => selectChapter(item)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong></button>)}
    </nav>
    <div className="narrative-reading-tools">
      <div className="audio-tabs" aria-label="Présentation du manuscrit">
        <button aria-pressed={mode === 'story'} onClick={() => setMode('story')}><BookOpen size={16} aria-hidden/>Lire le conte</button>
        <button aria-pressed={mode === 'study'} onClick={() => setMode('study')}><FileText size={16} aria-hidden/>Étudier les sources</button>
      </div>
      <button aria-pressed={wholeBook} onClick={() => setWholeBook(value => !value)}>{wholeBook ? 'Revenir au chapitre' : 'Lire le livre en continu'}</button>
      <button onClick={download}><Download size={16} aria-hidden/>Télécharger le manuscrit</button>
    </div>

    <p className="narrative-length">{length.words.toLocaleString('fr')} mots · lecture estimée {length.minMinutes === length.maxMinutes ? length.minMinutes : `${length.minMinutes}–${length.maxMinutes}`} min. La durée audio sera mesurée après enregistrement.</p>
    <div ref={manuscriptRef} className="audio-card narrative-manuscript" lang="fr">
      {(wholeBook ? book.chapters : [chapter]).map(item => <article key={item.id} aria-label={`Chapitre ${book.chapters.indexOf(item) + 1} : ${item.title}`}>
        <header><span className="audio-kicker">CHAPITRE {book.chapters.indexOf(item) + 1}</span><h2>{item.title}</h2></header>
        {item.scenes.map(scene => <section key={scene.id}>
          {mode === 'study' && <h3>{scene.title}</h3>}
          {scene.paragraphs.map((paragraph, index) => <div key={index}>
            <p className="narrative-prose">{paragraph.text}</p>
            {mode === 'study' && <div className="narrative-source-links" aria-label="Sources du paragraphe">{paragraph.sources.map(id => { const source = book.sources.find(s => s.id === id)!; return <a key={id} href={sourceUrl(source)} target="_blank" rel="noopener noreferrer">{sourceLabel(source)} ↗</a>; })}</div>}
          </div>)}
          {mode === 'study' && <aside className="narrative-study-note"><strong>Repère éditorial</strong><p>{scene.studyNote}</p></aside>}
        </section>)}
      </article>)}
      {wholeBook && <details className="narrative-epilogue"><summary>Après le récit · enseignements et réflexion</summary><p>{book.epilogue.text}</p><ul>{book.epilogue.lessons.map(lesson => <li key={lesson}>{lesson}</li>)}</ul><p><strong>{book.epilogue.question}</strong></p></details>}
    </div>

    {!wholeBook && <nav className="narrative-next" aria-label="Parcourir les chapitres"><button disabled={!chapterIndex} onClick={() => selectChapter(book.chapters[chapterIndex - 1])}><ChevronLeft size={17} aria-hidden/>Chapitre précédent</button><button disabled={chapterIndex === book.chapters.length - 1} onClick={() => selectChapter(book.chapters[chapterIndex + 1])}>Chapitre suivant<ChevronRight size={17} aria-hidden/></button></nav>}

    <details className="audio-card narrative-dossier"><summary>Dossier du chapitre · {sources.length} références</summary>
      {sources.map(source => <article key={source.id}><h3>{sourceLabel(source)}</h3><p>{source.description}</p>{source.type === 'hadith' && <small>{source.grade}</small>}<div className="audio-card-actions"><a href={sourceUrl(source)} target="_blank" rel="noopener noreferrer">Consulter le passage ↗</a>{source.type === 'quran' && <button onClick={() => openReader({ surah: source.surah, ayah: source.first })}>Ouvrir dans le Mushaf</button>}</div><small>Consultation : {new Date(`${source.checkedAt}T12:00:00`).toLocaleDateString('fr')}</small></article>)}
    </details>

    <section className="audio-card narrative-preparation" aria-label="Préparer le chapitre sans génération">
      <h2>Préparer « {chapter.title} »</h2>
      <p>Le chapitre reste complet à la lecture. Pour la production, {drafts.length > 1 ? `ses ${drafts.length} segments suivent les limites de paragraphes ou de phrases` : 'un seul segment suffit'}. Chaque segment respecte la limite de 4 000 caractères.</p>
      {!!chapter.recap && <label className="audio-check"><input type="checkbox" checked={includeRecap} onChange={event => setIncludeRecap(event.target.checked)}/>Inclure le rappel bref pour une écoute séparée de ce chapitre</label>}
      {chapterIndex === book.chapters.length - 1 && <label className="audio-check"><input type="checkbox" checked={includeEpilogue} onChange={event => setIncludeEpilogue(event.target.checked)}/>Ajouter le court épilogue après le récit</label>}
      <p>{characters.toLocaleString('fr')} caractères à prononcer. Le devis du studio utilisera le tarif du profil vocal sélectionné.</p>
      <div className="audio-card-actions"><button className="audio-primary" disabled={busy || saving} onClick={() => void saveDrafts()}>{saving ? 'Enregistrement…' : 'Enregistrer ce chapitre en brouillons'}</button><button disabled={busy || saving} onClick={() => void saveDrafts(true)}>Enregistrer tout le livre en brouillons</button></div>
      <div className="narrative-segments">{drafts.map((draft, index) => <button key={index} disabled={busy || saving} onClick={() => onOpenScript(draft)}>Relire le segment {index + 1}/{drafts.length} · {draft.text.length.toLocaleString('fr')} caractères</button>)}</div>
      <small>Ces actions enregistrent ou ouvrent des textes. La validation éditoriale et l’approbation du devis restent nécessaires avant toute synthèse.</small>
      {error && <p role="alert">{error}</p>}
    </section>
  </section>;
}

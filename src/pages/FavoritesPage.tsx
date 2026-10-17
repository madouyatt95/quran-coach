import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFavoritesStore, verseFavoriteKey, hadithFavoriteKey, duaFavoriteKey } from '../stores/favoritesStore';
import { useQuranStore } from '../stores/quranStore';
import { useOpenReader, type ReaderTarget } from '../hooks/useOpenReader';
import { ReligiousReference } from '../components/ReligiousReference';
import './FavoritesPage.css';

type Kind = 'verses' | 'hadiths' | 'duas';
interface LibraryItem { key: string; kind: Kind; title: string; arabic: string; french?: string; source?: string; addedAt: number; target?: ReaderTarget; remove: () => void }
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').toLocaleLowerCase();
const kinds: { id: 'all' | Kind; label: string }[] = [{ id: 'all', label: 'Tout' }, { id: 'verses', label: '📖 Versets' }, { id: 'hadiths', label: '📜 Hadiths' }, { id: 'duas', label: '🤲 Invocations' }];

function LibraryCard({ item }: { item: LibraryItem }) {
    const store = useFavoritesStore();
    const annotation = store.annotations[item.key];
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(annotation?.note ?? '');
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [saved, setSaved] = useState(false);
    const openReader = useOpenReader('Ma bibliothèque');
    const navigate = useNavigate();
    const selected = annotation?.collectionIds ?? [];
    return <article className="library-card">
        <div className="library-card__heading"><span>{item.title}</span><time dateTime={new Date(item.addedAt).toISOString()}>{new Date(item.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</time></div>
        <div className="library-card__text" lang="ar" dir="rtl">{item.arabic}</div>
        {item.french && <p className="library-card__translation">{item.french}</p>}
        {item.source && <ReligiousReference kind={item.kind === 'hadiths' ? 'Hadith' : 'Invocation'} source={item.source} />}
        {!!selected.length && <div className="library-card__tags">{store.collections.filter(c => selected.includes(c.id)).map(c => <span key={c.id}>📁 {c.name}</span>)}</div>}
        {!editing && annotation?.note && <div className="library-note"><small>Ma note personnelle</small><p>{annotation.note}</p></div>}
        <div className="library-card__actions">
            {item.target && <><button className="library-primary" onClick={() => openReader(item.target!)}>📖 Lire le verset</button><button onClick={() => navigate(`/passage?surah=${item.target!.surah}&ayah=${item.target!.ayah}&from=favorites`)}>Comprendre</button></>}
            <button aria-expanded={editing} onClick={() => { setDraft(annotation?.note ?? ''); setEditing(!editing); setSaved(false); }}>✍️ {editing ? 'Fermer' : 'Classer / annoter'}</button>
            <button aria-label={`Retirer ${item.title} des favoris`} onClick={() => setConfirmRemove(true)}>Retirer</button>
        </div>
        {editing && <section className="library-editor" aria-label={`Organiser ${item.title}`}>
            <fieldset><legend>Collections</legend>
                {store.collections.length ? store.collections.map(c => <label className="library-check" key={c.id}><input type="checkbox" checked={selected.includes(c.id)} onChange={event => store.setCollections(item.key, event.target.checked ? [...selected, c.id] : selected.filter(id => id !== c.id))} />{c.name}</label>) : <p>Créez une collection avec « Nouvelle collection » en haut de la page.</p>}
            </fieldset>
            <label className="library-note-label">Ma note personnelle<textarea value={draft} maxLength={4000} rows={4} placeholder="Ce que je souhaite retenir…" onChange={event => { setDraft(event.target.value); setSaved(false); }} /></label>
            <div className="library-editor__footer"><small>{draft.length} / 4 000</small><button className="library-primary" onClick={() => { store.setNote(item.key, draft.trim()); setSaved(true); }}>Enregistrer la note</button>{saved && <span role="status">Note enregistrée</span>}</div>
        </section>}
        {confirmRemove && <div className="library-remove" role="group" aria-label="Confirmer le retrait"><p>Retirer ce contenu de vos favoris ?</p><button onClick={() => setConfirmRemove(false)}>Garder</button><button onClick={item.remove}>Retirer des favoris</button></div>}
    </article>;
}

export function FavoritesPage() {
    const store = useFavoritesStore();
    const surahs = useQuranStore(state => state.surahs);
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const query = params.get('q') ?? '';
    const kind = params.get('type') ?? 'all';
    const collection = params.get('collection') ?? 'all';
    const [composer, setComposer] = useState<'new' | 'rename' | null>(null);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (!value || value === 'all') next.delete(key); else next.set(key, value); setParams(next, { replace: true }); };
    const activeCollection = store.collections.find(c => c.id === collection);
    const items: LibraryItem[] = [
        ...store.favorites.map(v => ({ key: verseFavoriteKey(v.number), kind: 'verses' as const, title: `${surahs.find(s => s.number === v.surah)?.englishName ?? `Sourate ${v.surah}`} · ${v.surah}:${v.numberInSurah}`, arabic: v.text, addedAt: v.addedAt, target: { surah: v.surah, ayah: v.numberInSurah, page: v.page }, remove: () => store.removeFavorite(v.number) })),
        ...store.favoriteHadiths.map(h => ({ key: hadithFavoriteKey(h.id), kind: 'hadiths' as const, title: `📜 Hadith · ${h.nar}`, arabic: h.ar, french: h.fr, source: h.src, addedAt: h.addedAt, remove: () => store.removeFavoriteHadith(h.id) })),
        ...store.favoriteDuas.map(d => ({ key: duaFavoriteKey(d.chapterId, d.duaId), kind: 'duas' as const, title: `🤲 ${d.chapterTitle}`, arabic: d.arabic, french: d.translation, source: d.source, addedAt: d.addedAt, remove: () => store.removeFavoriteDua(d.chapterId, d.duaId) })),
    ].sort((a, b) => b.addedAt - a.addedAt);
    const count = (id: string) => items.filter(item => (store.annotations[item.key]?.collectionIds ?? []).includes(id)).length;
    const filtered = items.filter(item => {
        const annotation = store.annotations[item.key];
        const groups = annotation?.collectionIds ?? [];
        return (kind === 'all' || item.kind === kind) && (collection === 'all' || (collection === 'unfiled' ? groups.length === 0 : groups.includes(collection))) && normalize([item.title, item.arabic, item.french, item.source, annotation?.note].join(' ')).includes(normalize(query.trim()));
    });
    const saveCollection = (event: React.FormEvent) => {
        event.preventDefault();
        if (composer === 'rename' && activeCollection) {
            if (!store.renameCollection(activeCollection.id, name)) { setMessage('Choisissez un nom différent et non vide.'); return; }
        } else {
            const id = store.createCollection(name);
            if (!id) { setMessage('Donnez un nom à votre collection.'); return; }
            // Stay in All so the user can immediately classify existing favorites.
        }
        setComposer(null); setName(''); setMessage('Collection enregistrée. Vous pouvez maintenant y classer vos favoris.');
    };
    return <div className="favorites-page">
        <header className="library-header"><button aria-label="Retour" onClick={() => navigate(-1)}>←</button><div><span className="library-eyebrow">VOTRE ESPACE PERSONNEL</span><h1>Ma bibliothèque</h1><p>{items.length} favori{items.length !== 1 ? 's' : ''} · Vos collections et vos notes</p></div><span className="library-emblem" aria-hidden="true">📚</span></header>
        <div className="library-tools"><label className="library-search"><span aria-hidden="true">🔎</span><input type="search" aria-label="Rechercher dans ma bibliothèque" placeholder="Un mot, une référence, une note…" value={query} onChange={event => update('q', event.target.value)} /></label><button className="library-new" onClick={() => { setComposer('new'); setName(''); setMessage(''); }}>＋ Nouvelle collection</button></div>
        {composer && <form className="library-composer" onSubmit={saveCollection}><label>{composer === 'new' ? 'Nom de la collection' : 'Renommer la collection'}<input autoFocus maxLength={60} value={name} onChange={event => setName(event.target.value)} placeholder="Ex. À mémoriser" /></label><div><button type="submit" className="library-primary" disabled={!name.trim()}>Enregistrer</button><button type="button" onClick={() => setComposer(null)}>Annuler</button></div></form>}
        {message && <p className="library-message" role="status">{message}</p>}
        <nav className="library-collections" aria-label="Collections"><button aria-pressed={collection === 'all'} onClick={() => update('collection', 'all')}>Tous mes favoris <span>{items.length}</span></button><button aria-pressed={collection === 'unfiled'} onClick={() => update('collection', 'unfiled')}>À classer</button>{store.collections.map(c => <button key={c.id} aria-pressed={collection === c.id} onClick={() => update('collection', c.id)}>📁 {c.name} <span>{count(c.id)}</span></button>)}</nav>
        {activeCollection && <div className="library-collection-heading"><strong>📁 {activeCollection.name}</strong><button onClick={() => { setComposer('rename'); setName(activeCollection.name); setMessage(''); }}>Renommer</button><button onClick={() => { store.removeCollection(activeCollection.id); update('collection', 'all'); setMessage('Collection supprimée. Vos favoris et vos notes sont conservés.'); }}>Dissoudre la collection</button></div>}
        <div className="library-types" role="group" aria-label="Type de contenu">{kinds.map(t => <button key={t.id} aria-pressed={kind === t.id} onClick={() => update('type', t.id)}>{t.label}</button>)}</div>
        <div className="library-results" aria-live="polite">{filtered.length} contenu{filtered.length !== 1 ? 's' : ''}</div>
        {!filtered.length ? <div className="library-empty"><span aria-hidden="true">{items.length ? '🔎' : '🤍'}</span><h2>{items.length ? 'Aucun contenu dans cette sélection' : 'Gardez ce qui compte pour vous'}</h2><p>{items.length ? 'Changez les filtres ou utilisez « Classer / annoter » sur un favori pour l’ajouter à cette collection.' : 'Ajoutez des versets, hadiths ou invocations avec le cœur, puis rassemblez-les ici selon vos envies.'}</p>{!items.length && <button className="library-primary" onClick={() => navigate('/read')}>Ouvrir le Coran</button>}</div> : <div className="library-list">{filtered.map(item => <LibraryCard key={item.key} item={item} />)}</div>}
    </div>;
}

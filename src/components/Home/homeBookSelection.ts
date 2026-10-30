import {books, isCompanionBook, type BookSummary} from '../../lib/bookLibrary';

export function homeBookCategory(book: BookSummary) {
    return isCompanionBook(book) ? 'Compagnons' : book.category === 'prophet' ? 'Prophètes' : 'Histoires et moralités';
}

/** Stable for a local calendar day; two titles from each collection, interleaved. */
export function selectHomeBooks(date: Date, catalog = books): BookSummary[] {
    const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
    const groups = ['Prophètes', 'Compagnons', 'Histoires et moralités'].map(category => catalog.filter(book => homeBookCategory(book) === category));
    const selected = [0, 1].flatMap(offset => groups.flatMap(group => group.length ? [group[((day + offset) % group.length + group.length) % group.length]] : []));
    return [...new Map(selected.map(book => [book.id, book])).values()];
}

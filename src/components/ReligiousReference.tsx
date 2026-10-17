import { religiousReference, type ReligiousKind } from '../lib/religiousReference';
import './ReligiousReference.css';

export function ReligiousReference({ kind, source, sourceUrl, className = '' }: { kind: ReligiousKind; source?: string; sourceUrl?: string; className?: string }) {
    const ref = religiousReference(kind, source, sourceUrl);
    return <div className={`religious-reference ${className}`}>
        <span className="religious-reference__kind">{kind}</span>
        {ref.url ? <a href={ref.url} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()} aria-label={`Consulter la référence ${ref.label}`}>{ref.label} ↗</a> : <span>{ref.label}</span>}
        {ref.pending && <span className="religious-reference__pending">Référence précise à confirmer</span>}
    </div>;
}

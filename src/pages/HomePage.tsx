import { Link } from 'react-router-dom';
import { BookOpen, Mic, GraduationCap, ArrowRight, Compass } from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSRSStore } from '../stores/srsStore';
import { localDay } from '../lib/learning';
import './StartPage.css';

export function HomePage() {
  const progress = useQuranStore(s => s.progress);
  const surahs = useQuranStore(s => s.surahs);
  const cards = useSRSStore(s => s.cards);
  const due = Object.values(cards).filter(c => c.nextReviewDate <= localDay()).length;
  const resume = progress ? `/read?surah=${progress.lastSurah}&ayah=${progress.lastAyah}` : '/read';
  const name = surahs.find(s => s.number === progress?.lastSurah)?.englishName;
  return <div className="start-page">
    <header><span className="start-eyebrow">QURAN COACH</span><h1>Un moment avec le Coran.</h1><p>Lire, apprendre, retrouver. À votre rythme.</p></header>
    <nav className="start-actions" aria-label="Actions principales">
      <Link to={resume}><BookOpen aria-hidden="true"/><strong>Lire</strong><span>Ouvrir le Mushaf</span></Link>
      <Link to="/hifdh"><GraduationCap aria-hidden="true"/><strong>Mémoriser</strong><span>Apprendre et réciter</span></Link>
      <Link to="/voice-search" state={{startVoiceSearch:true,returnTo:'/'}}><Mic aria-hidden="true"/><strong>Identifier</strong><span>Retrouver un verset</span></Link>
    </nav>
    <Link className="start-resume" to={resume}><span><small>VOTRE LECTURE</small><strong>{progress ? 'Reprendre là où j’en étais' : 'Commencer ma lecture'}</strong><span>{progress ? `${name || `Sourate ${progress.lastSurah}`} · verset ${progress.lastAyah}` : 'Le Mushaf, à votre rythme'}</span></span><ArrowRight aria-hidden="true"/></Link>
    <section className="start-practice" aria-label="Entraînement">
      <Link to="/learning"><strong>Ma séance du jour</strong><span>{due ? `${due} verset${due > 1 ? 's' : ''} à réviser` : '5, 10 ou 20 minutes pour progresser'}</span><ArrowRight size={18}/></Link>
      <Link to="/test-memorization"><strong>Teste-moi</strong><span>Des départs au hasard, de mémoire</span><ArrowRight size={18}/></Link>
      <Link to="/read" state={{startLiveFollow:true}}><strong>Suivre une récitation</strong><span>Le Mushaf avance avec la voix</span><ArrowRight size={18}/></Link>
    </section>
    <Link className="start-explore" to="/explore"><Compass size={20}/> Explorer <span>Prières, invocations, compréhension et autres outils</span></Link>
  </div>;
}

import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuizStore } from '../stores/quizStore';
import { PseudoSetup } from '../components/Quiz/PseudoSetup';
import { HomeView } from '../components/Quiz/HomeView';
import { SoloThemeSelect } from '../components/Quiz/SoloThemeSelect';
import { StatsView } from '../components/Quiz/StatsView';
import { BadgeView } from '../components/Quiz/BadgeView';
import { LeaderboardView } from '../components/Quiz/LeaderboardView';
import { DuelLobby } from '../components/Quiz/DuelLobby';
import { JoinDuel } from '../components/Quiz/JoinDuel';
import { PlayingView } from '../components/Quiz/PlayingView';
import { FeedbackView } from '../components/Quiz/FeedbackView';
import { ResultView } from '../components/Quiz/ResultView';
import { CustomDuel } from '../components/Quiz/CustomDuel';
import { ProfileView } from '../components/Quiz/ProfileView';
import { DailyChallengeView } from '../components/Quiz/DailyChallengeView';
import { RoundEndView } from '../components/Quiz/RoundEndView';
import { HistoryView } from '../components/Quiz/HistoryView';
import { SiraMapView } from '../components/Quiz/SiraMapView';
import { ErrorReviewView } from '../components/Quiz/ErrorReviewView';
import './QuizPage.css';
import '../components/Quiz/QuizExperience.css';
import {QuizLaunch} from '../components/Quiz/QuizLaunch';
import {QuizStudy} from '../components/Quiz/QuizStudy';
import {QuizInvestigations} from '../components/Quiz/QuizInvestigations';
import {DuelChoice,LocalDuelSetup} from '../components/Quiz/DuelChoice';
import {QuizStudio} from '../components/Quiz/QuizStudio';

// ─── Main Quiz Page ──────────────────────────────────────
export function QuizPage() {
    const { view, player, matchId, channel, syncMatch } = useQuizStore();
    const [params,setParams]=useSearchParams();
    useEffect(()=>{if(player && params.get('companion')==='revision'){useQuizStore.getState().setView('error-review');const next=new URLSearchParams(params);next.delete('companion');setParams(next,{replace:true});}},[player,params,setParams]);
    const [showSetup, setShowSetup] = useState(!player);

    useEffect(()=>{window.scrollTo({top:0});},[view]);

    // Auto-sync duel on mount or recovery
    useEffect(() => {
        if (player && matchId && !channel) {
            console.log('[QuizPage] Duel detected without channel, syncing...');
            syncMatch();
        }
    }, [player, matchId, channel, syncMatch]);

    if(params.has('source')||params.has('exercise'))return <QuizLaunch/>;
    if(params.has('challenge'))return <QuizStudio/>;
    if(view==='study')return <QuizStudy/>;
    if (showSetup || !player) {
        return <PseudoSetup onDone={() => setShowSetup(false)} />;
    }

    switch (view) {
        case 'investigations': return <QuizInvestigations/>;
        case 'studio': return <QuizStudio/>;
        case 'duel-choice': return <DuelChoice/>;
        case 'local-duel': return <LocalDuelSetup/>;
        case 'home':
            return <HomeView />;
        case 'daily':
            return <DailyChallengeView />;
        case 'profile':
            return <ProfileView />;
        case 'solo-themes':
            return <SoloThemeSelect />;
        case 'stats':
            return <StatsView />;
        case 'badges':
            return <BadgeView />;
        case 'leaderboard':
            return <LeaderboardView />;
        case 'history':
            return <HistoryView />;
        case 'lobby':
            return <DuelLobby />;
        case 'join':
            return <JoinDuel />;
        case 'playing':
            return <PlayingView />;
        case 'feedback':
            return <FeedbackView />;
        case 'roundEnd':
            return <RoundEndView />;
        case 'result':
            return <ResultView />;
        case 'custom-duel':
            return <CustomDuel />;
        case 'sira-map':
            return <SiraMapView />;
        case 'error-review':
            return <ErrorReviewView />;
        default:
            return <HomeView />;
    }
}

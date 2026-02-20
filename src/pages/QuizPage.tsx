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
import './QuizPage.css';

// ─── Main Quiz Page ──────────────────────────────────────
export function QuizPage() {
    const { view, player, matchId, channel, syncMatch } = useQuizStore();
    const [showSetup, setShowSetup] = useState(!player);

    // Auto-sync duel on mount or recovery
    useEffect(() => {
        if (player && matchId && !channel) {
            console.log('[QuizPage] Duel detected without channel, syncing...');
            syncMatch();
        }
    }, [player, matchId, channel, syncMatch]);

    if (showSetup || !player) {
        return <PseudoSetup onDone={() => setShowSetup(false)} />;
    }

    switch (view) {
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
        default:
            return <HomeView />;
    }
}

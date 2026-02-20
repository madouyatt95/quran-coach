import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function FeedbackView() {
    const { questions, currentIndex, answers, nextQuestion } = useQuizStore();
    const question = questions[currentIndex];
    const answer = answers[answers.length - 1];

    useEffect(() => {
        const delay = question?.explanation && !answer?.correct ? 4000 : 2000;
        const timer = setTimeout(nextQuestion, delay);
        return () => clearTimeout(timer);
    }, [nextQuestion, question, answer]);

    if (!question || !answer) return null;

    return (
        <div className={`quiz-container quiz-feedback ${answer.correct ? 'correct' : 'wrong'}`}>
            <div className="quiz-feedback-icon">
                {answer.correct ? (
                    <CheckCircle size={80} className="quiz-icon-correct" />
                ) : (
                    <XCircle size={80} className="quiz-icon-wrong" />
                )}
            </div>
            <h2 className="quiz-feedback-title">
                {answer.correct ? 'Correct !' : 'Faux !'}
            </h2>
            {!answer.correct && (
                <p className="quiz-feedback-answer">
                    Réponse : <strong>{question.choices[question.correctIndex]}</strong>
                </p>
            )}
            {question.explanation && (
                <p className="quiz-feedback-explanation">{question.explanation}</p>
            )}
            <p className="quiz-feedback-next">Question suivante...</p>
        </div>
    );
}

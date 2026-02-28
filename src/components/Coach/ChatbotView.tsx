import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, ExternalLink, RotateCcw } from 'lucide-react';
import { chatbotAnswer, CHATBOT_QUICK_QUESTIONS, type ChatMessage } from '../../lib/chatbotEngine';
import './ChatbotView.css';

export function ChatbotView() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    const handleSend = useCallback((text?: string) => {
        const query = text || input.trim();
        if (!query) return;

        // Add user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(36),
            role: 'user',
            content: query,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        scrollToBottom();

        // Simulate typing delay for natural feel
        setTimeout(() => {
            const response = chatbotAnswer(query);
            setMessages(prev => [...prev, response]);
            setIsTyping(false);
            scrollToBottom();
        }, 400 + Math.random() * 300);
    }, [input, scrollToBottom]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleQuickQuestion = useCallback((query: string) => {
        handleSend(query);
    }, [handleSend]);

    const handleSourceClick = useCallback((link?: string) => {
        if (link) navigate(link);
    }, [navigate]);

    const handleReset = useCallback(() => {
        setMessages([]);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="chatbot-view">
            {/* Messages area */}
            <div className="chatbot-messages">
                {messages.length === 0 && (
                    <div className="chatbot-welcome">
                        <div className="chatbot-welcome__icon">
                            <Sparkles size={32} />
                        </div>
                        <h3>Assistant Islamique</h3>
                        <p>Posez-moi vos questions sur la prière, les ablutions, le jeûne, le Hajj, l'Aqidah, le Fiqh...</p>

                        <div className="chatbot-quick-grid">
                            {CHATBOT_QUICK_QUESTIONS.map(q => (
                                <button
                                    key={q.query}
                                    className="chatbot-quick-btn"
                                    onClick={() => handleQuickQuestion(q.query)}
                                >
                                    <span>{q.emoji}</span>
                                    <span>{q.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                        <div className="chatbot-msg__bubble">
                            {msg.role === 'assistant' ? (
                                <div className="chatbot-msg__content" dangerouslySetInnerHTML={{
                                    __html: formatMarkdown(msg.content)
                                }} />
                            ) : (
                                <div className="chatbot-msg__content">{msg.content}</div>
                            )}

                            {msg.sources && msg.sources.length > 0 && (
                                <div className="chatbot-msg__sources">
                                    {msg.sources.map((src, i) => (
                                        <button
                                            key={i}
                                            className="chatbot-source-tag"
                                            onClick={() => handleSourceClick(src.link)}
                                        >
                                            {src.label}
                                            {src.link && <ExternalLink size={10} />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="chatbot-msg__suggestions">
                                    {msg.suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            className="chatbot-suggestion"
                                            onClick={() => handleQuickQuestion(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="chatbot-msg chatbot-msg--assistant">
                        <div className="chatbot-msg__bubble chatbot-typing">
                            <span className="chatbot-dot" />
                            <span className="chatbot-dot" />
                            <span className="chatbot-dot" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="chatbot-input-area">
                {messages.length > 0 && (
                    <button className="chatbot-reset-btn" onClick={handleReset} title="Nouvelle conversation">
                        <RotateCcw size={16} />
                    </button>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    className="chatbot-input"
                    placeholder="Posez votre question..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="chatbot-send-btn"
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}

// Simple markdown → HTML converter
function formatMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^---$/gm, '<hr/>')
        .replace(/^• (.+)$/gm, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
}

import React, { useRef, useEffect, useState } from 'react';
import './ChatWindow.css';

const Message = ({ m }) => {
  const [reaction, setReaction] = useState('none'); // 'none' | 'like' | 'dislike'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(m.text || '');
    } catch {
      // ignore
    }
  };

  const handleLike = () => {
    setReaction(prev => (prev === 'like' ? 'none' : 'like'));
  };

  const handleDislike = () => {
    setReaction(prev => (prev === 'dislike' ? 'none' : 'dislike'));
  };

  const isLoading = m.text === '...';

  return (
    <div className={`message ${m.role === 'user' ? 'out' : 'in'}`}>
      <div className={`bubble ${isLoading ? 'loading-bubble' : ''}`}>
        {isLoading ? (
          <span className="loading-indicator" aria-hidden>
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        ) : (
          m.text
        )}

        {!isLoading && (
          <div className="message-actions ">
            <button className="action-btn copy" onClick={handleCopy} aria-label="Copy message" title="Copy">
              {/* simple monochrome clipboard SVG */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="9" y="3" width="8" height="2" rx="0.5" fill="currentColor" />
                <rect x="6" y="6" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            <button className={`action-btn like ${reaction === 'like' ? 'active' : ''}`} onClick={handleLike} aria-label="Like message" title="Like">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M14 9V5a2 2 0 0 0-2-2l-1 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className={`action-btn dislike ${reaction === 'dislike' ? 'active' : ''}`} onClick={handleDislike} aria-label="Dislike message" title="Dislike">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M10 15v4a2 2 0 0 0 2 2l1 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 13v-7a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({ title = 'New Chat', messages = [], onShowSidebar }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="chat-window">
      <div className="chat-header">
        <button className="show-sidebar" onClick={onShowSidebar} aria-label="Show chats">
          ☰
        </button>
        <div className="chat-title">{title}</div>
      </div>

      <div className={`chat-body ${messages.length === 0 ? 'hero-mode' : ''}`} ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-hero">
            <h1 className="hero-title">Welcome to Weirwood</h1>
            <p className="hero-sub">Ask anything — craft ideas, plan, learn, or just chat. I'm here to help.</p>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} m={m} />)
        )}
      </div>
    </main>
  );
};

export default ChatWindow;
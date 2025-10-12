import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
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

  const handleCodeCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
  };

  const CodeBlock = ({ children, ...props }) => {
    const codeString = String(children).replace(/\n$/, '');
    
    return (
      <div className="code-block-container">
        <div className="code-block-header">
          <button 
            className="code-copy-btn" 
            onClick={() => handleCodeCopy(codeString)}
            aria-label="Copy code"
            title="Copy code"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="3" width="8" height="2" rx="0.5" fill="currentColor" />
              <rect x="6" y="6" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            Copy
          </button>
        </div>
        <pre className="markdown-code-block">
          <code {...props}>{children}</code>
        </pre>
      </div>
    );
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
          <div className="message-content">
            {m.role === 'model' ? (
              <ReactMarkdown
                components={{
                  // Customize rendering for better styling
                  p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
                  h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
                  h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
                  h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
                  code: ({ inline, children, ...props }) => 
                    inline ? (
                      <code className="markdown-inline-code">{children}</code>
                    ) : (
                      <CodeBlock {...props}>{children}</CodeBlock>
                    ),
                  ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
                  ol: ({ children }) => <ol className="markdown-ordered-list">{children}</ol>,
                  li: ({ children }) => <li className="markdown-list-item">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
                  strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
                  em: ({ children }) => <em className="markdown-italic">{children}</em>,
                }}
              >
                {m.text}
              </ReactMarkdown>
            ) : (
              m.text
            )}
          </div>
        )}

        {!isLoading && (
          <div className="message-actions ">
            <button className="action-btn copy" onClick={handleCopy} aria-label="Copy message" title="Copy">
              {/* Beautiful copy icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.83 2.57A2 2 0 0015.398 2H10a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button className={`action-btn like ${reaction === 'like' ? 'active' : ''}`} onClick={handleLike} aria-label="Like message" title="Like">
              {/* Beautiful heart icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill={reaction === 'like' ? 'currentColor' : 'none'}/>
              </svg>
            </button>
            <button className={`action-btn dislike ${reaction === 'dislike' ? 'active' : ''}`} onClick={handleDislike} aria-label="Dislike message" title="Dislike">
              {/* Clean broken heart icon for dislike */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M8 12L16 12M8 9L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({ title = 'New Chat', messages = [], onShowSidebar, onQuestionTypeSelect }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFeatureClick = (type) => {
    if (onQuestionTypeSelect) {
      onQuestionTypeSelect(type);
    }
  };

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
            <div className="hero-content">
              <div className="hero-decoration">
                <span className="sparkle">✨</span>
                <span className="sparkle">🌟</span>
                <span className="sparkle">💫</span>
              </div>
              <h1 className="hero-title">Welcome to Weirwood</h1>
              <p className="hero-sub">Ask anything — craft ideas, plan, learn, or just chat. I'm here to help make your ideas come to life!</p>
              <div className="hero-features">
                <div className="feature-item" onClick={() => handleFeatureClick('mcq')}>
                  <span className="feature-icon">🎯</span>
                  <span>Multiple Choice Questions</span>
                </div>
                <div className="feature-item" onClick={() => handleFeatureClick('short')}>
                  <span className="feature-icon">📝</span>
                  <span>Short Answer Format</span>
                </div>
                <div className="feature-item" onClick={() => handleFeatureClick(null)}>
                  <span className="feature-icon">💭</span>
                  <span>Creative Brainstorming</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} m={m} />)
        )}
      </div>
    </main>
  );
};

export default ChatWindow;
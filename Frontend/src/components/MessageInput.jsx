import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend && onSend(text.trim());
    setText('');
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <form className="msg-input" onSubmit={submit} aria-label="Send message">
      <div className="msg-pill">
        <textarea
          ref={textareaRef}
          className="msg-field"
          placeholder="Ask Weirwood"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          aria-label="Message"
        />
        <div className="msg-actions">
          {text.trim() && (
            <button className="msg-btn" type="submit" aria-label="Send">
              ➤
            </button>
          )}
          <button 
            className="msg-btn" 
            type="button" 
            aria-label="Microphone"
            onClick={() => alert('Voice input not yet implemented')}
          >
            🎤
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
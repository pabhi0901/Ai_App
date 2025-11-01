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

  const autoResize = () => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height with limits
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 56; // Minimum height
      const maxHeight = 200; // Maximum height before scrolling
      
      // Set height within limits
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textareaRef.current.style.height = newHeight + 'px';
      
      // Enable/disable scrolling based on content
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  };

  useEffect(() => {
    autoResize();
  }, [text]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    // Trigger resize immediately on text change
    setTimeout(autoResize, 0);
  };

  const handlePaste = () => {
    // Trigger resize after paste
    setTimeout(autoResize, 0);
  };

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
          onChange={handleTextChange}
          onPaste={handlePaste}
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
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageInput from './MessageInput';
import speechManager from '../utils/speechManager';
import './ChatWindow.css'; // Reuse existing styles

const SecretMessage = ({ m }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Listen for speech state changes from global manager
  useEffect(() => {
    const unregister = speechManager.registerListener((messageId, isPlaying) => {
      if (messageId === m._id) {
        // This message's state changed
        setIsSpeaking(isPlaying);
      } else if (isSpeaking && !isPlaying) {
        // Another message started playing, turn off this one
        setIsSpeaking(false);
      } else if (messageId !== m._id && isPlaying) {
        // Another message started playing, turn off this one
        setIsSpeaking(false);
      }
    });

    // Also check initial state when component mounts
    setIsSpeaking(speechManager.isPlaying(m._id));

    return unregister;
  }, [m._id, isSpeaking]);

  const handleSpeak = () => {
    if (isSpeaking) {
      // Stop current speech
      speechManager.stopSpeech();
    } else {
      // Start speaking this message
      speechManager.speak(m._id, m.text);
    }
  };

  const isLoading = m.text === '...';

  return (
    <div className={`message ${m.role === 'user' ? 'out' : 'in'}`}>
      <div className={`bubble ${m.isLimit ? 'limit-message' : ''} ${isLoading ? 'loading-bubble' : ''}`}>
        {isLoading ? (
          <span className="loading-indicator" aria-hidden>
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        ) : (
          <div className="message-content">
            {m.text}
            {m.isTyping && <span className="typing-cursor">|</span>}
          </div>
        )}
        
        {!isLoading && !m.isLimit && (
          <div className="message-actions">
            <button 
              className={`action-btn speak ${isSpeaking ? 'active speaking' : ''}`} 
              onClick={handleSpeak} 
              aria-label={isSpeaking ? "Stop speaking" : "Read message aloud"} 
              title={isSpeaking ? "Stop" : "Listen"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" fill={isSpeaking ? 'currentColor' : 'none'}/>
                {isSpeaking ? (
                  <>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
                ) : (
                  <>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SecretChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [hasTriedConnection, setHasTriedConnection] = useState(false);
  const chatWindowRef = useRef(null);

  // Stop speech when clicking outside chat window
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        speechManager.stopSpeech();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to establish WebSocket connection for secret chat
  const establishSecretConnection = () => {
    if (socket || hasTriedConnection) return Promise.resolve();
    
    setHasTriedConnection(true);
    
    return new Promise((resolve, reject) => {
      const newSocket = io("http://localhost:5000", {
        withCredentials: true, // Send cookies for isPrivate detection
      });

      newSocket.on('connect', () => {
        console.log('Secret WebSocket connected successfully');
        setSocket(newSocket);
        resolve(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Secret WebSocket connection failed:', error);
        setHasTriedConnection(false);
        reject(error);
      });

      newSocket.on('disconnect', () => {
        console.log('Secret WebSocket disconnected');
        setSocket(null);
      });
    });
  };

  useEffect(() => {
    // Set up socket event handlers when socket is available
    if (!socket) return;

    // Typing effect function
    const startTypingEffect = (fullText, messageIndex) => {
      let currentIndex = 0;
      const typingSpeed = 5;
      
      const typeInterval = setInterval(() => {
        currentIndex++;
        const currentText = fullText.substring(0, currentIndex);
        
        setMessages(prev => {
          const updatedMessages = [...prev];
          
          if (updatedMessages[messageIndex]) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              text: currentText,
              isTyping: currentIndex < fullText.length
            };
          }
          
          return updatedMessages;
        });
        
        // When typing is complete
        if (currentIndex >= fullText.length) {
          clearInterval(typeInterval);
        }
      }, typingSpeed);
    };

    socket.on('tempResponse', (response) => {
      // backend sends either a plain string or an object with `response` field
      const fullText = typeof response === 'string' ? response : (response && response.response) || '';
      
      console.log('Secret AI Response received:', fullText);

      setMessages(prev => {
        const current = [...prev];

        // find last loading bubble (role=model and text === '...')
        let idx = -1;
        for (let i = current.length - 1; i >= 0; i--) {
          const m = current[i];
          if (m && m.role === 'model' && m.text === '...') { 
            idx = i; 
            break; 
          }
        }

        // Start with empty text for typing effect
        const aiMessage = { 
          role: 'model', 
          text: '', 
          _id: `secret-model-${Date.now()}`, 
          isTyping: true 
        };

        if (idx !== -1) {
          const next = [...current];
          next[idx] = aiMessage;
          
          // Start typing effect
          startTypingEffect(fullText, idx);
          
          return next;
        }

        // fallback: append
        const newMessages = [...current, aiMessage];
        startTypingEffect(fullText, newMessages.length - 1);
        
        return newMessages;
      });
    });

    socket.on('limitReached', (data) => {
      console.log('Limit reached:', data);
      // Remove loading message and show limit reached message
      setMessages(prev => {
        const current = [...prev];
        
        // Remove last loading message
        const filtered = current.filter(m => !(m.role === 'model' && m.text === '...'));
        
        // Add limit reached message
        const limitMessage = {
          role: 'model',
          text: data.message || 'Login to continue chatting',
          _id: `limit-${Date.now()}`,
          isLimit: true
        };
        
        return [...filtered, limitMessage];
      });
    });
    
    return () => {
      socket.off('tempResponse');
      socket.off('limitReached');
    };
  }, [socket]);

  // Cleanup socket connection on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    };
  }, [socket]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Establish WebSocket connection if not already connected (first message)
    let currentSocket = socket;
    if (!currentSocket) {
      try {
        currentSocket = await establishSecretConnection();
      } catch (error) {
        console.error('Failed to establish secret connection:', error);
        return;
      }
    }

    const userMessage = { 
      role: 'user', 
      text, 
      _id: `secret-user-${Date.now()}` 
    };

    // Add user message to local state
    setMessages(prev => [...prev, userMessage]);

    const loadingMessage = { 
      role: 'model', 
      text: '...', 
      _id: `secret-loading-${Date.now()}` 
    };
    
    // Add loading message
    setMessages(prev => [...prev, loadingMessage]);

    if (currentSocket) {
      currentSocket.emit('ai-temp-message', {
        content: text
      });
    }
  };

  return (
    <div className="chat-window secret-chat-window" ref={chatWindowRef}>
      <div className="chat-header">
        <div className="chat-title-section">
          <h2 className="chat-title">🤫 Secret Chat</h2>
        </div>
      </div>
      
      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to Secret Chats</h1>
              <p className="hero-subtitle">Nothing will be saved here</p>
              <div className="hero-features">
                <div className="feature-grid">
                  <div className="feature-item">
                    <span className="feature-icon">🔒</span>
                    <span className="feature-text">Private & Secure</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🚫</span>
                    <span className="feature-text">No History Saved</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💭</span>
                    <span className="feature-text">Temporary Messages</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔄</span>
                    <span className="feature-text">Refreshes Clear All</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((message) => (
              <SecretMessage key={message._id} m={message} />
            ))}
          </div>
        )}
      </div>
      
      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default SecretChatWindow;
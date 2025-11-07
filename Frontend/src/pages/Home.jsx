import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SecretChatWindow from '../components/SecretChatWindow';
import MessageInput from '../components/MessageInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import '../styles/Home.css';
import axios from 'axios';
import confetti from 'canvas-confetti';

import { io } from 'socket.io-client';

// Helper to safely read a cookie by name (returns the value or null)
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie || '';
  const match = cookie.split('; ').find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

const Home = () => {
  const [chatsHistory, setChatsHistory] = useState([]);
  const [messages, setMessages] = useState({});
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  const [activeChat, setActiveChat] = useState('');
  // keep a ref to the active chat so socket handlers (which don't re-create)
  // have access to the latest active chat id without needing to re-register
  const activeChatRef = useRef(activeChat);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarHidden, setSidebarHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasTriedConnection, setHasTriedConnection] = useState(false); // Track if connection was attempted
  const [isSecretChat, setIsSecretChat] = useState(false); // Track if in Incognito Chat mode

  // Question type and context state
  const [questionType, setQuestionType] = useState(null); // 'mcq', 'short', or null
  const [contextInput, setContextInput] = useState('');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false); // Menu collapsed by default

  // Temporary variable to store question type when sending message
  const [tempQuestionType, setTempQuestionType] = useState(null);

  // Function to trigger confetti in chat window center
  const triggerConfetti = () => {
    // Get chat window element for better positioning
    const chatBody = document.querySelector('.chat-body');
    
    if (chatBody) {
      const rect = chatBody.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 3) / window.innerHeight;
      
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { x, y },
        colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7'],
        gravity: 0.8,
        scalar: 0.8
      });
    } else {
      // Fallback to center of screen
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7']
      });
    }
  };

  // Function to establish WebSocket connection
  const establishConnection = () => {
    if (socket || hasTriedConnection) return Promise.resolve();
    
    setHasTriedConnection(true);
    
    return new Promise((resolve, reject) => {
      const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected successfully');
        setSocket(newSocket);
        resolve(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.log('WebSocket connection failed:', error);
        setHasTriedConnection(false);
        
        // If authentication error, redirect to login
        if (error.message && error.message.includes('Authentication')) {
          navigate('/login');
        }
        reject(error);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setSocket(null);
      });
    });
  };

  // Function to set isPrivate cookie to false
  const clearPrivateCookie = () => {
    document.cookie = "isPrivate=false; path=/";
  };

  // Function to activate Incognito Chat mode
  const activateSecretChat = () => {
    // Set cookie to indicate private mode
    document.cookie = "isPrivate=true; path=/";
    setIsSecretChat(true);
  };

  // Function to exit Incognito Chat mode
  const exitSecretChat = () => {
    // Remove private cookie
    clearPrivateCookie();
    setIsSecretChat(false);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API to clear httpOnly cookies
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        withCredentials: true
      });
    } catch (error) {
      console.log("Error calling logout API:", error);
    }

    // Clear all cookies using js-cookie library
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      Cookies.remove(cookieName, { path: '/' });
      Cookies.remove(cookieName, { path: '/', domain: window.location.hostname });
      // Also try to remove from root domain
      if (window.location.hostname.includes('.')) {
        const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
        Cookies.remove(cookieName, { path: '/', domain: '.' + rootDomain });
      }
    });
    
    // Clear all cookies accessible via document.cookie
    try {
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        // expire cookie for current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`; 
        // try to expire for root domain variations
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Also try with leading dot
        if (window.location.hostname.includes('.')) {
          const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain}`;
        }
      }
    } catch {
      // ignore
    }

    // Clear storage for completeness
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();

    // Disconnect socket if connected
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.info('Logged out successfully', {
      position: "top-right",
      autoClose: 3000,
    });

    setIsLoggedIn(false);
    
    // redirect to login page
    setTimeout(() => {
      if (typeof navigate === 'function') navigate('/login');
    }, 2000);

    // axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
    //     withCredentials: true
    //   })
  };

  useEffect(() => {
    // Set up socket event handlers when socket is available
    if (!socket) return;

    // Typing effect function
    const startTypingEffect = (fullText, chatId, messageIndex) => {
      let currentIndex = 0;
      const typingSpeed = 5; // Increased speed (lower = faster)
      
      const typeInterval = setInterval(() => {
        currentIndex++;
        const currentText = fullText.substring(0, currentIndex);
        
        setMessages(prev => {
          const current = prev[chatId] || [];
          const updatedMessages = [...current];
          
          if (updatedMessages[messageIndex]) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              text: currentText,
              isTyping: currentIndex < fullText.length
            };
          }
          
          return { ...prev, [chatId]: updatedMessages };
        });
        
        // When typing is complete
        if (currentIndex >= fullText.length) {
          clearInterval(typeInterval);
          
          // Trigger confetti for MCQ responses after typing is complete
          if (tempQuestionType === 'mcq' && fullText && fullText !== '...') {
            console.log('Triggering confetti for MCQ response after typing'); // Debug log
            triggerConfetti();
            // Clear temp question type after use
            setTempQuestionType(null);
          }
        }
      }, typingSpeed);
    };

    socket.on('aiResponse', (response) => {
      // backend sends either a plain string or an object with `response` field
      const fullText = typeof response === 'string' ? response : (response && response.response) || '';
      
      console.log('AI Response received, tempQuestionType:', tempQuestionType, 'text:', fullText); // Debug log

      setMessages(prev => {
        const chatId = activeChatRef.current || '';
        const current = prev[chatId] || [];

        // find last loading bubble (role=model and text === '...')
        let idx = -1;
        for (let i = current.length - 1; i >= 0; i--) {
          const m = current[i];
          if (m && m.role === 'model' && m.text === '...') { idx = i; break; }
        }

        // Start with empty text for typing effect
        const aiMessage = { role: 'model', text: '', _id: `server-model-${Date.now()}`, isTyping: true };

        if (idx !== -1) {
          const next = current.slice();
          next[idx] = aiMessage;
          
          // Start typing effect
          startTypingEffect(fullText, chatId, idx);
          
          return { ...prev, [chatId]: next };
        }

        // fallback: append
        const newMessages = [...current, aiMessage];
        startTypingEffect(fullText, chatId, newMessages.length - 1);
        
        return { ...prev, [chatId]: newMessages };
      });
    });
    
    return () => {
      socket.off('aiResponse');
    };
  }, [socket, tempQuestionType]);

  useEffect(() => {
    // Only try to fetch chats if user appears to be logged in
    // This prevents immediate redirect to login for non-authenticated users
  const token = localStorage.getItem('token') || localStorage.getItem('user');
  // Consider backend-set loginStatus cookie (or token/connect.sid) as an authentication marker
  const cookieVal = getCookie('token') || getCookie('connect.sid') || getCookie('loginStatus');
  const hasAuthTokens = token || cookieVal;

    if (hasAuthTokens) {
      axios.post(`${import.meta.env.VITE_API_URL}/chat/getChats`, {}, {
        withCredentials: true
      }).then((res) => {
        let chatHistory = res.data.chat;
        setChatsHistory(chatHistory);
        setIsLoggedIn(true);
      }).catch((err) => {
        // Only redirect if we're specifically trying to access authenticated features
        // Don't redirect just for browsing the homepage
        console.log("Could not fetch chats:", err);
        setIsLoggedIn(false);
      });
    }
  }, [navigate]);

  useEffect(() => {
    // Clear private cookie on page load/refresh
    clearPrivateCookie();
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('user');
      const cookieVal = getCookie('token') || getCookie('connect.sid') || getCookie('loginStatus');
      // Also check for backend-set `loginStatus` cookie (value set to 1 on login)
      if (token || cookieVal) {
        setIsLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

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

    setSidebarOpen(false);

    // Establish WebSocket connection if not already connected (first message)
    let currentSocket = socket;
    if (!currentSocket) {
      try {
        currentSocket = await establishConnection();
      } catch (error) {
        console.error('Failed to establish connection:', error);
        // If connection fails due to authentication, user will be redirected to login
        return;
      }
    }

    const userMessage = { role: 'user', text, _id: `local-user-${Date.now()}` };
    let currentChatId = activeChat;

    if (!currentChatId) {
      const words = text.trim().split(/\s+/).slice(0, 3).join(' ');
      const chatTitle = words || 'New chat';
      
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat/`, 
          { title: chatTitle }, 
          { withCredentials: true }
        );
        const newChat = res.data.chat;
        currentChatId = newChat._id;
        
        setActiveChat(currentChatId);
        setChatsHistory(prev => [newChat, ...prev]);
        setMessages(prev => ({ ...prev, [currentChatId]: [userMessage] }));
      } catch (err) {
        console.error("Error creating new chat:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
        return; 
      }
    } else {
      setMessages(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), userMessage],
      }));
    }

    const loadingMessage = { role: 'model', text: '...', _id: `local-model-${Date.now()}` };
    setMessages(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), loadingMessage],
    }));

    if (currentSocket) {
      // Store current question type for confetti check when AI responds
      setTempQuestionType(questionType);
      
      currentSocket.emit('ai-message', {
        chat: currentChatId,
        content: text,
        questionType: questionType ? questionType:false,
        contextInput: contextInput ? contextInput:false
      });
    }
        
 
  };

  const handleSelect = (chat) => {
    const id = chat._id || chat.id;
    setActiveChat(id);
    setSidebarOpen(false);

    if (messages[id]) {
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/messages/`, { chatId: id }, {
      withCredentials: true
    }).then((res) => {
      setMessages(prev => ({ ...prev, [id]: Array.isArray(res.data.data) ? res.data.data : [] }));
    }).catch((err) => {
      console.log("error loading messages:", err);
    });
  };

  const handleNewChat = () => {
    setActiveChat('');
    setSidebarOpen(false);
  };

  // Question type handlers
  const handleQuestionTypeSelect = (type) => {
    // If the same type is clicked again, deselect it
    if (questionType === type) {
      setQuestionType(null);
      setContextInput('');
    } else {
      setQuestionType(type);
      if (type !== 'short') {
        setContextInput('');
      }
    }
  };

  const handleToggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  const handleContextInputChange = (value) => {
    setContextInput(value);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isSidebarHidden) {
      root.style.setProperty('--sidebar-offset', '12px');
    } else if (isSidebarCollapsed) {
      root.style.setProperty('--sidebar-offset', '56px');
    } else {
      root.style.setProperty('--sidebar-offset', '220px');
    }
  }, [isSidebarHidden, isSidebarCollapsed]);

  const activeChatDetails = chatsHistory.find(c => c._id === activeChat);

  return (
    <div className={`home-root ${isSecretChat ? 'secret-mode' : ''}`}>
      <ToastContainer />
      {!isLoggedIn && !isSecretChat && (
        <Link to="/login" className="top-right-login" aria-label="Login">Login</Link>
      )}
      
      {/* Login button in secret mode - show alongside exit button */}
      {isSecretChat && (
        <Link to="/login" className="top-right-login" aria-label="Login">Login</Link>
      )}
      
      {/* Incognito Chat Button - Only show if not logged in or no active chat */}
      {(!isLoggedIn || !activeChat) && !isSecretChat && (
        <button 
          className="secret-chat-button" 
          onClick={activateSecretChat}
          aria-label="Start Incognito Chat"
          title="Start Incognito Chat - Nothing will be saved"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Lock Icon - Security Symbol */}
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M16 11V7a4 4 0 0 0-8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            
            {/* Chat Bubble Elements */}
            <circle cx="8" cy="16" r="1" fill="currentColor" opacity="0.6"/>
            <circle cx="12" cy="16" r="1" fill="currentColor" opacity="0.8"/>
            <circle cx="16" cy="16" r="1" fill="currentColor"/>
            
            {/* Subtle Glow Effect */}
            <circle cx="12" cy="16" r="8" stroke="currentColor" strokeWidth="0.5" opacity="0.2" fill="none"/>
          </svg>
        </button>
      )}
      
      {/* Exit Incognito Chat Button - Only show in secret mode */}
      {isSecretChat && (
        <button 
          className="exit-secret-button" 
          onClick={exitSecretChat}
          aria-label="Exit Incognito Chat"
          title="Exit Incognito Chat"
        >
          ❌
        </button>
      )}
      
      <div className="home-layout">
        {/* Show sidebar only in normal mode */}
        {!isSecretChat && !isSidebarHidden && (
          <Sidebar 
            chats={chatsHistory} 
            activeId={activeChat} 
            onSelect={handleSelect} 
            isOpen={isSidebarOpen} 
            onClose={() => {
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                setSidebarHidden(true);
              } else {
                setSidebarOpen(false);
              }
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            onNewChat={handleNewChat}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            questionType={questionType}
            contextInput={contextInput}
            isMenuExpanded={isMenuExpanded}
            onQuestionTypeSelect={handleQuestionTypeSelect}
            onToggleMenu={handleToggleMenu}
            onContextInputChange={handleContextInputChange}
            onStartSecretChat={activateSecretChat}
            showSecretChatButton={(!isLoggedIn || !activeChat) && !isSecretChat}
          />
        )}
        <div className={`main-area ${isSidebarHidden || isSecretChat ? 'with-reopen' : ''}`}>
          {!isSecretChat && isSidebarHidden && (
            <button className="sidebar-reopen" onClick={() => setSidebarHidden(false)} aria-label="Open sidebar">☰</button>
          )}
          
          {/* Conditionally render either Incognito Chat or normal chat */}
          {isSecretChat ? (
            <SecretChatWindow />
          ) : (
            <>
              <ChatWindow 
                title={activeChatDetails?.title} 
                messages={messages[activeChat] || []} 
                onShowSidebar={() => {
                  if (window.innerWidth >= 768) {
                    setSidebarCollapsed(prev => !prev);
                  } else {
                    setSidebarOpen(true);
                  }
                }}
                onQuestionTypeSelect={handleQuestionTypeSelect}
              />
              <MessageInput onSend={handleSend} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

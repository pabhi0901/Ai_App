import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import '../styles/Home.css';
import axios from 'axios';

import { io } from 'socket.io-client';

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

  const handleLogout = () => {
    // Clear all cookies accessible via JS
    try {
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        // expire cookie for current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`; 
        // try to expire for root domain variations
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    } catch {
      // ignore
    }

    // also clear storage for completeness
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear();

  setIsLoggedIn(false);
  // redirect to login page
  if (typeof navigate === 'function') navigate('/login');
  };

  useEffect(() => {
    const newSocket = io("https://chatgpt-project-v26f.onrender.com", {
      withCredentials: true,
    });
    setSocket(newSocket);

  newSocket.on('aiResponse', (response) => {
    // backend sends either a plain string or an object with `response` field
    const text = typeof response === 'string' ? response : (response && response.response) || '';

    setMessages(prev => {
      const chatId = activeChatRef.current || '';
      const current = prev[chatId] || [];

      // find last loading bubble (role=model and text === '...')
      let idx = -1;
      for (let i = current.length - 1; i >= 0; i--) {
        const m = current[i];
        if (m && m.role === 'model' && m.text === '...') { idx = i; break; }
      }

      const aiMessage = { role: 'model', text, _id: `server-model-${Date.now()}` };

      if (idx !== -1) {
        const next = current.slice();
        next[idx] = aiMessage;
        return { ...prev, [chatId]: next };
      }

      // fallback: append
      return { ...prev, [chatId]: [...current, aiMessage] };
    });
  });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    axios.post("https://chatgpt-project-v26f.onrender.com/chat/getChats", {}, {
      withCredentials: true
    }).then((res) => {
      let chatHistory = res.data.chat;
      setChatsHistory(chatHistory);
    }).catch((err) => {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    });
  }, [navigate]);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('user');
      const cookie = typeof document !== 'undefined' ? document.cookie : '';
      if (token || (cookie && (cookie.includes('token=') || cookie.includes('connect.sid=')))) {
        setIsLoggedIn(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setSidebarOpen(false);

    const userMessage = { role: 'user', text, _id: `local-user-${Date.now()}` };
    let currentChatId = activeChat;

    if (!currentChatId) {
      const words = text.trim().split(/\s+/).slice(0, 3).join(' ');
      const chatTitle = words || 'New chat';
      
      try {
        const res = await axios.post("https://chatgpt-project-v26f.onrender.com/chat/", { title: chatTitle }, { withCredentials: true });
        const newChat = res.data.chat;
        currentChatId = newChat._id;
        
        setActiveChat(currentChatId);
        setChatsHistory(prev => [newChat, ...prev]);
        setMessages(prev => ({ ...prev, [currentChatId]: [userMessage] }));
      } catch (err) {
        console.error("Error creating new chat:", err);
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

    if (socket) {
      socket.emit('ai-message', {
        chat: currentChatId,
        content: text,
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

    axios.post(`https://chatgpt-project-v26f.onrender.com/messages/`, { chatId: id }, {
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
    <div className="home-root">
      {!isLoggedIn && (
        <Link to="/login" className="top-right-login" aria-label="Login">Login</Link>
      )}
      <div className="home-layout">
        {!isSidebarHidden && (
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
            setActiveChat={setActiveChat}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        )}
        <div className={`main-area ${isSidebarHidden ? 'with-reopen' : ''}`}>
          {isSidebarHidden && (
            <button className="sidebar-reopen" onClick={() => setSidebarHidden(false)} aria-label="Open sidebar">☰</button>
          )}
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
          />
          <MessageInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default Home;

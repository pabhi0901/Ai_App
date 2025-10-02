import React from 'react';
import './Sidebar.css';

const ChatItem = ({ chat, active, onClick }) => (
  <button
    className={`chat-item ${active ? 'active' : ''}`}
    onClick={() => onClick(chat)}
    aria-current={active}
  >
    <div className="chat-title">{chat.title}</div>
    <div className="chat-sub">{chat.lastMessage}</div>
  </button>
);

const Sidebar = ({ chats = [], activeId, onSelect, isOpen = false, onClose, isCollapsed, onToggleCollapse, onNewChat,setActiveChat, isLoggedIn=false, onLogout }) => {
  // fixed sidebar width; user can still collapse/close via provided controls
  const sidebarRef = React.useRef(null);

  const asideContent = (
    <aside 
      ref={sidebarRef}
      style={{ width: isCollapsed ? '0' : '300px', flex: '0 0 auto' }}
      className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} 
      aria-label="Chat history">
      <div className="sidebar-header">
        <div>
          <h3 className="sidebar-title">Chats</h3>
          <small className="sidebar-sub">Recent conversations</small>
        </div>
        <div className="header-actions">
          {onClose ? (
            <button className="close-btn lg:self-end" onClick={onClose} aria-label="Close sidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <button className="close-btn" onClick={onToggleCollapse} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d={isCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M20 6L4 6M20 12L4 12M20 18L4 18"} 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        {/* resize handle removed - fixed width */}
      </div>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="empty">No chats yet — start a new conversation</div>
        ) : (
          chats.map((c) => (
            <ChatItem key={c.id} chat={c} active={c.id === activeId} onClick={onSelect} />
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="new-chat" onClick={() => onNewChat && onNewChat()}>+ New chat</button>
        {isLoggedIn && (
          <button className="logout-btn" onClick={() => onLogout && onLogout()}>Logout</button>
        )}
      </div>
    </aside>
  );

  // On mobile, when isOpen is true, show overlay + backdrop
  if (isOpen) {
    return (
      <div className="sidebar-overlay" role="dialog" aria-modal="true">
        <div className="sidebar-backdrop" onClick={onClose} />
        {asideContent}
      </div>
    );
  }

  return asideContent;
};

export default Sidebar;
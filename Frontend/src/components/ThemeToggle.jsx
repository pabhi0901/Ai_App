import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

const themes = [
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Github Dark', icon: '🌙' },
  { id: 'chatgpt', name: 'Extra Dark', icon: '🤖' },
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'executive', name: 'Executive', icon: '🏢' },
  { id: 'corporate', name: 'Corporate', icon: '👔' },
  { id: 'enterprise', name: 'Enterprise', icon: '🏛️' },
  { id: 'midnight', name: 'Midnight', icon: '🌃' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'sunset', name: 'Sunset', icon: '🌅' },
  { id: 'purple', name: 'Purple', icon: '🔮' },
  { id: 'rose', name: 'Rose', icon: '🌹' },
  { id: 'emerald', name: 'Emerald', icon: '💎' },
  { id: 'indigo', name: 'Indigo', icon: '🌌' },
  { id: 'amber', name: 'Amber', icon: '🜂' },
  { id: 'teal', name: 'Teal', icon: '🌿' },
  { id: 'cyan', name: 'Cyan', icon: '🧊' },
  { id: 'pink', name: 'Pink', icon: '🌸' },
  { id: 'lime', name: 'Lime', icon: '🍃' },
  { id: 'violet', name: 'Violet', icon: '🦄' },
  { id: 'slate', name: 'Slate', icon: '🪨' }
];

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId) => {
    const root = document.documentElement;
    
    if (themeId === 'light') {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    } else {
      root.setAttribute('data-theme', themeId);
      // Keep dark class for backward compatibility
      if (themeId === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  const currentThemeObj = themes.find(theme => theme.id === currentTheme);

  return (
    <div className="theme-toggle">
      <button 
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
      >
        <span className="theme-icon">{currentThemeObj?.icon}</span>
        <span className="theme-name">{currentThemeObj?.name}</span>
        <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
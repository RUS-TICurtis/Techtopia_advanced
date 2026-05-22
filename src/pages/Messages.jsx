import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import './Messages.css';

const MOCK_CHAT = [
  { id: 1, text: "Hi Curtis, I reviewed the proposal.", sender: "Alice", time: "10:30 AM", type: "received" },
  { id: 2, text: "Great! Do you have any questions?", sender: "Me", time: "10:32 AM", type: "sent" },
  { id: 3, text: "Mainly regarding the SOC2 compliance docs.", sender: "Alice", time: "10:35 AM", type: "received" },
  { id: 4, text: "I just sent them over via email. Let me know if you received them.", sender: "Me", time: "10:38 AM", type: "sent" },
  { id: 5, text: "Yes, the SOC2 details look good.", sender: "Alice", time: "10:42 AM", type: "received" }
];

export default function Messages() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [chat, setChat] = useState(MOCK_CHAT);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const loadedThreads = mockDb.getMessages();
    setThreads(loadedThreads);
    if (loadedThreads.length > 0) {
      setActiveThread(loadedThreads[0]);
    }
  }, []);

  if (!activeThread) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Communicate with your team and clients</p>
        </div>
      </div>

      <div className="messages-layout">
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <div className="search-wrapper" style={{ width: '100%', display: 'block' }}>
              <Search size={16} className="search-icon" />
              <input type="text" className="search-input" placeholder="Search messages..." />
            </div>
          </div>
          <div className="messages-list">
            {threads.map(thread => (
              <div 
                key={thread.id} 
                className={`message-thread ${activeThread.id === thread.id ? 'active' : ''}`}
                onClick={() => setActiveThread(thread)}
              >
                <div className="message-thread-avatar">{thread.avatar}</div>
                <div className="message-thread-content">
                  <div className="message-thread-header">
                    <span className="message-thread-name">{thread.name}</span>
                    <span className="message-thread-time">{thread.time}</span>
                  </div>
                  <div className={`message-thread-preview ${thread.unread ? 'unread' : ''}`}>
                    {thread.lastMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="messages-main">
          <div className="messages-main-header">
            <div className="messages-main-user">
              <div className="messages-main-avatar">{activeThread.avatar}</div>
              <div>
                <div className="messages-main-name">{activeThread.name}</div>
                <div className="messages-main-status">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="messages-action-btn"><Phone size={18} /></button>
              <button className="messages-action-btn"><Video size={18} /></button>
              <button className="messages-action-btn"><MoreVertical size={18} /></button>
            </div>
          </div>

          <div className="messages-chat-area">
            {chat.map(msg => (
              <div key={msg.id} className={`message-bubble-wrapper ${msg.type}`}>
                <div className="message-bubble">{msg.text}</div>
                <div className="message-time">{msg.time}</div>
              </div>
            ))}
          </div>

          <div className="message-input-area">
            <div className="message-input-wrapper">
              <button className="messages-action-btn" style={{ padding: '4px' }}>
                <Paperclip size={18} />
              </button>
              <input 
                type="text" 
                className="message-input" 
                placeholder="Type a message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    setChat([...chat, { id: Date.now(), text: inputValue, sender: "Me", time: "Now", type: "sent" }]);
                    setInputValue('');
                  }
                }}
              />
              <button className="message-send-btn">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

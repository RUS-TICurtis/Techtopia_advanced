import React, { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';
import { useCommunications, useConversationMessages } from '../../hooks/useCrmData';
import { useAuthStore } from '../../store/authStore';
import './Messages.css';

export default function Messages() {
  const { conversations = [], isLoadingConversations } = useCommunications();
  const { user: authUser } = useAuthStore();
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const { messages = [], sendMessage, isLoading: isLoadingMessages } = useConversationMessages(activeThreadId);

  // Set the first thread active by default once loaded
  useEffect(() => {
    if (conversations.length > 0 && !activeThreadId) {
      setActiveThreadId(conversations[0].id);
    }
  }, [conversations, activeThreadId]);

  const activeThread = conversations.find(t => t.id === activeThreadId);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !activeThreadId) return;

    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Communicate with your team and clients</p>
        </div>
      </div>

      <div className="messages-layout">
        {/* SIDEBAR */}
        <div className="messages-sidebar">
          <div className="messages-sidebar-header">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input type="text" className="search-input" placeholder="Search messages..." />
            </div>
          </div>
          
          <div className="messages-list">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#01FDF6]"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500 text-center gap-1">
                <MessageSquare size={24} className="text-gray-700" />
                <span className="text-xs font-bold">No Conversations</span>
              </div>
            ) : (
              conversations.map(thread => {
                const threadName = thread.name || 'Direct Chat';
                return (
                  <div 
                    key={thread.id} 
                    className={`message-thread ${activeThreadId === thread.id ? 'active' : ''}`}
                    onClick={() => setActiveThreadId(thread.id)}
                  >
                    <div className="message-thread-avatar">{getInitials(threadName)}</div>
                    <div className="message-thread-content">
                      <div className="message-thread-header">
                        <span className="message-thread-name">{threadName}</span>
                        <span className="message-thread-time">{formatTime(thread.updatedAt || thread.createdAt)}</span>
                      </div>
                      <div className="message-thread-preview">
                        {thread.messages && thread.messages.length > 0 
                          ? thread.messages[thread.messages.length - 1].content 
                          : 'No messages yet'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT MAIN WINDOW */}
        <div className="messages-main">
          {activeThread ? (
            <>
              <div className="messages-main-header">
                <div className="messages-main-user">
                  <div className="messages-main-avatar">{getInitials(activeThread.name || 'Direct Chat')}</div>
                  <div>
                    <div className="messages-main-name">{activeThread.name || 'Direct Chat'}</div>
                    <div className="messages-main-status">Active Thread</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="messages-action-btn"><Phone size={18} /></button>
                  <button className="messages-action-btn"><Video size={18} /></button>
                  <button className="messages-action-btn"><MoreVertical size={18} /></button>
                </div>
              </div>

              <div className="messages-chat-area">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01FDF6]"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-1">
                    <MessageSquare size={32} className="text-gray-700 animate-bounce" />
                    <span className="text-xs font-semibold">Start of Conversation</span>
                    <span className="text-[10px] text-gray-600">Send a message to begin the chat.</span>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isSent = msg.sender?.id?.toString() === authUser?.id?.toString() || msg.sender?.email === authUser?.email;
                    const senderName = msg.sender?.name || 'Me';
                    return (
                      <div key={msg.id} className={`message-bubble-wrapper ${isSent ? 'sent' : 'received'}`}>
                        {!isSent && <div className="message-sender-name">{senderName}</div>}
                        <div className="message-bubble">{msg.content}</div>
                        <div className="message-time">{formatTime(msg.createdAt)}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="message-input-area" onSubmit={handleSend}>
                <div className="message-input-wrapper">
                  <button type="button" className="messages-action-btn" style={{ padding: '4px' }}>
                    <Paperclip size={18} />
                  </button>
                  <input 
                    type="text" 
                    className="message-input" 
                    placeholder="Type a message..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button type="submit" className="message-send-btn">
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
              <MessageSquare size={48} className="text-gray-700" />
              <span className="font-bold text-sm">Select a Conversation</span>
              <span className="text-xs text-gray-600">Choose a thread from the list on the left to start messaging.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

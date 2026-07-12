import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, MapPin, Circle } from 'lucide-react';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow() {
  const { user } = useAuth();
  const { messages, sendMessage, emitTyping, addMessages, onlineUsers, typingUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(searchParams.get('userId') || null);
  const [activeUser, setActiveUser] = useState(null);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Load conversation list
  useEffect(() => {
    if (!user) return;
    axios.get('/api/messages').then(r => setConversations(r.data)).catch(() => {});
  }, [user]);

  // Load message history for active thread
  useEffect(() => {
    if (!activeId || !user) return;
    axios.get(`/api/messages/${activeId}`)
      .then(r => {
        addMessages(activeId, r.data);
        // find user info from conversations
        const conv = conversations.find(c => c.other_id === activeId);
        setActiveUser(conv);
      })
      .catch(() => {});
  }, [activeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[activeId]]);

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    sendMessage(activeId, input.trim(), searchParams.get('listingId'));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      emitTyping(activeId);
    }
  };

  const thread = messages[activeId] || [];
  const isOnline = onlineUsers?.includes(activeId);

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/8`}>
        <div className="p-4 border-b border-white/8">
          <h2 className="font-display font-bold text-lg text-slate-100">Messages</h2>
          <p className="text-xs text-slate-500 mt-0.5">{conversations.length} conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                <Smile size={28} className="text-brand-400" />
              </div>
              <p className="text-sm text-slate-400">No messages yet. Start chatting by clicking "Message Seller" on a listing.</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.other_id}
                onClick={() => setActiveId(conv.other_id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/6 ${
                  activeId === conv.other_id ? 'bg-brand-500/10 border-r-2 border-brand-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                    {conv.other_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  {onlineUsers?.includes(conv.other_id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-slate-200 truncate">{conv.other_name}</span>
                    {conv.last_at && (
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{formatTime(conv.last_at)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(conv.other_city || conv.other_state) && (
                      <p className="text-xs text-slate-500 flex items-center gap-0.5 truncate">
                        <MapPin size={10} />
                        {[conv.other_city, conv.other_state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                  {conv.unread_count > 0 && (
                    <span className="badge-blue text-[10px] mt-1">{conv.unread_count} new</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      {activeId ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Thread Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <button
              className="md:hidden btn-ghost p-1.5"
              onClick={() => setActiveId(null)}
            >←</button>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm">
                {activeUser?.other_name?.[0]?.toUpperCase() || '?'}
              </div>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-surface" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{activeUser?.other_name || 'User'}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Circle size={6} className={isOnline ? 'fill-emerald-400 text-emerald-400' : 'fill-slate-500 text-slate-500'} />
                {isOnline ? 'Online' : 'Offline'}
                {activeUser?.other_city && ` · ${activeUser.other_city}`}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {thread.map((msg, i) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-brand-500 text-white rounded-br-md'
                          : 'bg-surface-2 border border-white/10 text-slate-200 rounded-bl-md'
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-brand-200' : 'text-slate-500'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            {typingUsers?.[activeId] && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-surface-2 border border-white/10 rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/8">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="textarea flex-1 resize-none max-h-32"
                style={{ minHeight: '44px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="btn-primary px-4 py-3 flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
              <Send size={36} className="text-brand-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-200 mb-2">Select a conversation</h3>
            <p className="text-sm text-slate-500">Choose a chat from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

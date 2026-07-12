import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({}); // keyed by otherId
  const [typingUsers, setTypingUsers] = useState({}); // keyed by userId

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', user.id);
    });

    socket.on('online_users', (users) => setOnlineUsers(users));

    socket.on('receive_message', (msg) => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      setMessages(prev => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg],
      }));
    });

    socket.on('user_typing', ({ senderId }) => {
      setTypingUsers(prev => ({ ...prev, [senderId]: true }));
      setTimeout(() => setTypingUsers(prev => { const n = { ...prev }; delete n[senderId]; return n; }), 2000);
    });

    return () => socket.disconnect();
  }, [user]);

  const sendMessage = (receiverId, body, listingId = null) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('send_message', {
      senderId: user.id,
      receiverId,
      body,
      listingId,
    });
  };

  const emitTyping = (receiverId) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('typing', { senderId: user.id, receiverId });
  };

  const addMessages = (otherId, msgs) => {
    setMessages(prev => ({ ...prev, [otherId]: msgs }));
  };

  return (
    <SocketContext.Provider value={{ onlineUsers, messages, typingUsers, sendMessage, emitTyping, addMessages }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

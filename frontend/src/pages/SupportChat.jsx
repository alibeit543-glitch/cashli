import { useState, useRef, useEffect } from 'react';
import { supportAPI } from '../services/api';
import { FiSend, FiUser, FiX, FiMessageCircle, FiCpu } from 'react-icons/fi';

const quickReplies = [
  'My reward didn\'t track',
  'I can\'t withdraw',
  'When will I get paid?',
  'My account was banned',
  'How do I earn?',
];

const SupportChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm Cashli AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (msg) => {
    const text = msg || input;
    if (!text.trim() || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await supportAPI.chat(text);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
        setLoading(false);
      }, 500);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
      setLoading(false);
    }
  };

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  if (!open) {
    return (
      <button className="chat-fab" onClick={() => setOpen(true)} title="AI Support">
        <FiMessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <FiCpu size={20} />
          <div>
            <strong>Cashli AI Support</strong>
            <span className="chat-status">Online</span>
          </div>
        </div>
        <button className="btn-icon" onClick={() => setOpen(false)}><FiX size={18} /></button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
            <div className="chat-msg-avatar">
              {msg.role === 'bot' ? <FiCpu size={14} /> : <FiUser size={14} />}
            </div>
            <div className="chat-msg-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg-bot">
            <div className="chat-msg-avatar"><FiCpu size={14} /></div>
            <div className="chat-msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div className="chat-quick-replies">
        {quickReplies.map((qr, i) => (
          <button key={i} className="quick-reply-btn" onClick={() => handleQuickReply(qr)}>
            {qr}
          </button>
        ))}
      </div>
      <div className="chat-input-bar">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-send" onClick={() => handleSend()} disabled={!input.trim()}>
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default SupportChat;
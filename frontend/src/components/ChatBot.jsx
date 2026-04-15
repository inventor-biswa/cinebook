import { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

/* ── Rule-based responses (no API needed) ─────────────────────────────── */
const RULES = [
  {
    keywords: ['book', 'booking', 'ticket', 'reserve', 'seat'],
    answer:
      '🎟️ To book a ticket:\n1. Go to Movies or Events\n2. Click a title you like\n3. Pick a show time\n4. Select seats\n5. Pay via Razorpay\n\nYour confirmation email arrives instantly!',
  },
  {
    keywords: ['cancel', 'refund', 'cancelation'],
    answer:
      '❌ Cancellations are handled by our support team.\nEmail us at **support@qwikshow.in** with your **Booking Reference** (e.g. QS-20260403-0012) and we\'ll process it within 24 hours.',
  },
  {
    keywords: ['payment', 'pay', 'razorpay', 'upi', 'card', 'failed', 'deducted', 'charge'],
    answer:
      '💳 We accept UPI, Cards, Net Banking & Wallets via Razorpay.\n\nIf payment failed but money was deducted, it auto-refunds in **5–7 business days**. Share your Razorpay Order ID with support if needed.',
  },
  {
    keywords: ['otp', 'email', 'verification', 'password', 'login', 'sign in'],
    answer:
      '🔐 OTP Issues:\n• Check your spam/junk folder\n• OTPs expire in 10 minutes\n• Click "Resend OTP" to get a fresh one\n• Make sure your email address is correct\n\nFor password-free login, use "Login with OTP" on the login page.',
  },
  {
    keywords: ['reward', 'point', 'points', 'earn', 'loyalty'],
    answer:
      '🏆 Reward Points:\n• Earn **1 point per ₹1 spent**\n• Points credited instantly on confirmed booking\n• View your balance by clicking the avatar in the top-right\n\nRedemption feature coming soon!',
  },
  {
    keywords: ['offer', 'coupon', 'discount', 'code', 'promo'],
    answer:
      '🎁 Current Offers:\n• **FIRST50** — 50% off your first booking\n• **MOVIE100** — Flat ₹100 off on bookings above ₹300\n• **WEEKEND20** — 20% off on weekend shows\n\nApply at checkout on the booking confirm page.',
  },
  {
    keywords: ['show', 'timing', 'schedule', 'time', 'date'],
    answer:
      '🕐 No shows available?\n• Check your selected city (📍 in navbar)\n• Some movies may not have shows in all cities\n• New shows are added by the admin regularly',
  },
  {
    keywords: ['city', 'location', 'change city', 'select city'],
    answer:
      '📍 To change your city:\n• Click the **📍 city selector** in the navbar\n• Choose your city from the dropdown\n• Movies & shows update automatically!',
  },
  {
    keywords: ['trailer', 'video', 'watch', 'preview'],
    answer:
      '🎬 To watch a trailer:\n• Open any Movie or Event detail page\n• Click the **"Watch Trailer"** button\n• It plays in a popup modal!',
  },
  {
    keywords: ['my booking', 'my ticket', 'my orders', 'history'],
    answer:
      '📋 To see your bookings:\n• Click your **avatar icon** top-right\n• Select **"My Bookings"**\n• Or go directly to **/my-bookings**',
  },
  {
    keywords: ['admin', 'dashboard', 'manage', 'add movie', 'add event'],
    answer:
      '⚡ Admin Panel:\n• Login with admin credentials\n• Access via the **Admin ⚡** link in the navbar\n• Manage Movies, Events, Theatres, Shows & Offers',
  },
  {
    keywords: ['register', 'signup', 'sign up', 'account', 'create'],
    answer:
      '👤 To create an account:\n• Click **Sign Up** in the navbar\n• Enter your name, email & password\n• You\'re ready to book!',
  },
  {
    keywords: ['support', 'help', 'contact', 'problem', 'issue', 'complaint'],
    answer:
      '🎧 Need more help?\n• Visit our **Support page** at /support\n• Email: **support@qwikshow.in**\n• Available Mon–Sat, 10am–8pm IST\n• Response within 24 hours',
  },
  {
    keywords: ['hi', 'hello', 'hey', 'hola', 'namaste'],
    answer:
      '👋 Hello! I\'m QwikBot, your QwikShow assistant!\n\nI can help you with:\n• 🎟️ Bookings\n• 💳 Payments\n• 🔐 OTP & Login\n• 🏆 Reward Points\n• 🎁 Offers & Coupons\n\nWhat do you need help with?',
  },
  {
    keywords: ['bye', 'thanks', 'thank you', 'ok', 'got it', 'done'],
    answer:
      '😊 Glad I could help! Enjoy your show! 🎬\nIf you need anything else, I\'m always here.',
  },
];

const SUGGESTIONS = [
  '🎟️ How to book?',
  '💳 Payment failed',
  '🔐 OTP not received',
  '🏆 Reward points',
  '🎁 View offers',
  '❌ Cancel booking',
];

function getBotResponse(input) {
  const lower = input.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return rule.answer;
    }
  }
  return "🤔 I'm not sure about that. Try asking about:\n• Bookings, Payments, OTP, Offers, Rewards\n\nOr visit our **Support page** at /support for full help.";
}

function formatMessage(text) {
  // Convert **bold** and newlines
  return text
    .split('\n')
    .map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
}

let msgId = 0;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: msgId++,
      from: 'bot',
      text: "👋 Hi! I'm **QwikBot**.\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    setMessages(prev => [...prev, { id: msgId++, from: 'user', text: msg }]);
    setTyping(true);

    setTimeout(() => {
      const reply = getBotResponse(msg);
      setMessages(prev => [...prev, { id: msgId++, from: 'bot', text: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        className={`chatbot-bubble ${open ? 'chatbot-bubble--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat support"
        id="chatbot-toggle"
      >
        {open ? '✕' : '💬'}
        {!open && <span className="chatbot-badge">?</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window" id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-header__avatar">🤖</div>
              <div>
                <div className="chatbot-header__name">QwikBot</div>
                <div className="chatbot-header__status">
                  <span className="chatbot-dot" />
                  Always online
                </div>
              </div>
            </div>
            <button
              className="chatbot-header__close"
              onClick={() => setOpen(false)}
              id="chatbot-close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`chatbot-msg chatbot-msg--${msg.from}`}
              >
                {msg.from === 'bot' && (
                  <div className="chatbot-msg__avatar">🤖</div>
                )}
                <div className="chatbot-msg__bubble">
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}

            {typing && (
              <div className="chatbot-msg chatbot-msg--bot">
                <div className="chatbot-msg__avatar">🤖</div>
                <div className="chatbot-msg__bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="chatbot-suggestion"
                onClick={() => send(s)}
                id={`chatbot-suggestion-${i}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              id="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className="chatbot-send"
              onClick={() => send()}
              disabled={!input.trim()}
              id="chatbot-send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

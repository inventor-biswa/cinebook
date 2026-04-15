import { useState } from 'react';
import Layout from '../components/Layout';
import './SupportPage.css';

const FAQ = [
  {
    category: '🎟️ Bookings',
    items: [
      {
        q: 'How do I book a ticket?',
        a: 'Browse Movies or Events, click on a title, select your show time, choose your seats, and complete payment through Razorpay. Your booking confirmation is sent to your email.',
      },
      {
        q: 'Can I cancel my booking?',
        a: 'Currently cancellations must be requested through our support team. Contact us with your Booking Reference (e.g. QS-20260403-0012) and we will process it within 24 hours.',
      },
      {
        q: 'Where can I see my bookings?',
        a: 'Go to your profile avatar → "My Bookings", or navigate to /my-bookings after logging in.',
      },
      {
        q: 'What is a Booking Reference?',
        a: 'A unique ID like QS-20260403-0012 assigned to every confirmed booking. Use it to track or cancel your booking.',
      },
    ],
  },
  {
    category: '💳 Payments',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We support UPI, Credit/Debit cards, Net Banking, and Wallets through Razorpay — India\'s trusted payment gateway.',
      },
      {
        q: 'My payment failed but money was deducted. What do I do?',
        a: 'If a Razorpay payment fails after deduction, the amount is auto-refunded within 5–7 business days. Contact your bank or our support team with the Razorpay Order ID.',
      },
      {
        q: 'Are there any extra charges?',
        a: 'No hidden charges. The price shown at seat selection is the final amount you pay.',
      },
    ],
  },
  {
    category: '🏆 Reward Points',
    items: [
      {
        q: 'How do I earn reward points?',
        a: 'You earn 1 point for every ₹1 spent on a confirmed booking. Points are credited instantly after payment.',
      },
      {
        q: 'Where can I see my points?',
        a: 'Click your avatar in the top-right corner. Your points balance is shown in the dropdown menu.',
      },
      {
        q: 'Can I redeem points for discounts?',
        a: 'Reward point redemption is coming soon! Stay tuned for updates.',
      },
    ],
  },
  {
    category: '🔐 Account & OTP',
    items: [
      {
        q: 'I did not receive my OTP email.',
        a: 'Check your spam/junk folder. OTPs expire after 10 minutes — request a new one. Make sure you entered the correct email address.',
      },
      {
        q: 'How do I reset my password?',
        a: 'On the Login page, click "Login with OTP" to receive a one-time code to your email — no password needed.',
      },
      {
        q: 'How do I change my city?',
        a: 'Use the city selector in the navbar (the 📍 pin dropdown). Your shows and movies are filtered by this selection.',
      },
    ],
  },
  {
    category: '🎬 Movies & Events',
    items: [
      {
        q: 'Why don\'t I see any shows for a movie?',
        a: 'Shows may not be available in your selected city. Try changing city in the navbar, or the movie may not have upcoming shows scheduled yet.',
      },
      {
        q: 'How do I watch a trailer?',
        a: 'On any Movie or Event detail page, click the "Watch Trailer" button to open the trailer in a modal popup.',
      },
    ],
  },
];

function SupportPage() {
  const [openIdx, setOpenIdx] = useState({});

  const toggle = (catI, itemI) => {
    const key = `${catI}-${itemI}`;
    setOpenIdx(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Layout>
      <div className="support-page">
        {/* Hero */}
        <div className="support-hero">
          <div className="container">
            <div className="support-hero__icon">🎧</div>
            <h1 className="support-hero__title">How can we help?</h1>
            <p className="support-hero__sub">
              Find quick answers below, or reach our support team directly.
            </p>
          </div>
        </div>

        <div className="container support-body">
          {/* Quick Links */}
          <div className="support-quick">
            <a href="mailto:support@qwikshow.in" className="support-quick__card" id="support-email">
              <span className="support-quick__icon">✉️</span>
              <div>
                <strong>Email Us</strong>
                <p>support@qwikshow.in</p>
              </div>
            </a>
            <div className="support-quick__card" id="support-hours">
              <span className="support-quick__icon">🕐</span>
              <div>
                <strong>Support Hours</strong>
                <p>Mon–Sat, 10am – 8pm IST</p>
              </div>
            </div>
            <div className="support-quick__card" id="support-response">
              <span className="support-quick__icon">⚡</span>
              <div>
                <strong>Response Time</strong>
                <p>Within 24 hours</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <h2 className="support-faq__heading">Frequently Asked Questions</h2>

          {FAQ.map((cat, catI) => (
            <div key={catI} className="support-faq__category">
              <h3 className="support-faq__cat-title">{cat.category}</h3>
              <div className="support-faq__list">
                {cat.items.map((item, itemI) => {
                  const key = `${catI}-${itemI}`;
                  const isOpen = !!openIdx[key];
                  return (
                    <div
                      key={itemI}
                      className={`support-faq__item ${isOpen ? 'support-faq__item--open' : ''}`}
                      id={`faq-${catI}-${itemI}`}
                    >
                      <button
                        className="support-faq__q"
                        onClick={() => toggle(catI, itemI)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span className="support-faq__chevron">{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div className="support-faq__a">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contact Form */}
          <div className="support-contact" id="support-contact-form">
            <h2 className="support-contact__title">Still need help?</h2>
            <p className="support-contact__sub">
              Send us a message and we'll get back to you within 24 hours.
            </p>
            <form
              className="support-contact__form"
              onSubmit={e => {
                e.preventDefault();
                alert('Message sent! We will reply within 24 hours.');
                e.target.reset();
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sc-name">Your Name</label>
                  <input id="sc-name" type="text" placeholder="Biswajeet" required />
                </div>
                <div className="form-group">
                  <label htmlFor="sc-email">Email Address</label>
                  <input id="sc-email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="sc-subject">Subject</label>
                <select id="sc-subject">
                  <option>Booking Issue</option>
                  <option>Payment Problem</option>
                  <option>Account / OTP</option>
                  <option>Reward Points</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sc-booking">Booking Reference (optional)</label>
                <input id="sc-booking" type="text" placeholder="QS-20260403-0012" />
              </div>
              <div className="form-group">
                <label htmlFor="sc-msg">Message</label>
                <textarea id="sc-msg" rows={5} placeholder="Describe your issue in detail..." required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" id="support-submit-btn">
                🚀 Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SupportPage;

import { Link } from 'react-router-dom';
import { FiArrowRight, FiDollarSign, FiUsers, FiAward, FiShield, FiZap, FiMail } from 'react-icons/fi';

const Landing = () => (
  <div className="landing">
    <header className="landing-header">
      <div className="landing-nav">
        <div className="landing-brand">
          <span className="brand-icon">C</span>
          <span className="brand-text">Cashli</span>
        </div>
        <div className="landing-actions">
          <Link to="/login" className="btn btn-outline">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
    </header>

    <section className="hero">
      <div className="hero-content">
        <h1>Turn Your <span className="gradient-text">Free Time</span> Into Real Rewards</h1>
        <p>Complete offers, surveys, and tasks to earn coins. Redeem for PayPal cash, crypto, and gift cards.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Start Earning Now <FiArrowRight />
        </Link>
        <div className="hero-stats">
          <span>🏆 50,000+ Users</span>
          <span>💰 $500K+ Paid Out</span>
          <span>⭐ 4.8/5 Rating</span>
        </div>
      </div>
      <div className="hero-image">
        <div className="hero-phone">
          <div className="phone-screen">
            <div className="phone-header">Cashli</div>
            <div className="phone-balance">Balance: 1,250 coins</div>
            <div className="phone-offers">
              <div className="phone-offer" />
              <div className="phone-offer" />
              <div className="phone-offer" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="features">
      <h2>Why Choose Cashli?</h2>
      <div className="features-grid">
        <div className="feature-card">
          <FiZap size={32} className="feature-icon" />
          <h3>Instant Rewards</h3>
          <p>Get credited immediately after completing offers</p>
        </div>
        <div className="feature-card">
          <FiDollarSign size={32} className="feature-icon" />
          <h3>Multiple Payouts</h3>
          <p>PayPal, Crypto, or Gift Cards - you choose</p>
        </div>
        <div className="feature-card">
          <FiUsers size={32} className="feature-icon" />
          <h3>Referral Program</h3>
          <p>Earn 50 coins for every friend you invite</p>
        </div>
        <div className="feature-card">
          <FiAward size={32} className="feature-icon" />
          <h3>Levels & Badges</h3>
          <p>Climb the ranks and unlock achievements</p>
        </div>
        <div className="feature-card">
          <FiShield size={32} className="feature-icon" />
          <h3>Secure & Trusted</h3>
          <p>Your data and earnings are always protected</p>
        </div>
        <div className="feature-card">
          <FiZap size={32} className="feature-icon" />
          <h3>Daily Bonuses</h3>
          <p>Log in daily and claim your streak rewards</p>
        </div>
      </div>
    </section>

    <section className="cta">
      <h2>Ready to Start Earning?</h2>
      <p>Join thousands of users already earning real rewards</p>
      <Link to="/register" className="btn btn-primary btn-lg">
        Create Free Account <FiArrowRight />
      </Link>
    </section>

    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <p>&copy; 2026 Cashli. All rights reserved.</p>
        <div className="landing-footer-links">
          <a href="mailto:support@cashli.app"><FiMail size={14} /> support@cashli.app</a>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;

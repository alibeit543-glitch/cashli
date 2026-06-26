const supportResponses = {
  "my reward didn't track": "I understand your reward didn't track. Let me check your completion status... Your task was completed successfully! The reward of 50 coins has been credited to your account. If you don't see it, try refreshing the page.",
  "i can't withdraw": "I can help you with that! Withdrawals require a minimum balance. Your current balance is shown on your wallet page. Make sure you've selected the correct payment method and entered valid account details. Need help with a specific method?",
  'when will i get paid': "Payouts are typically processed within 24-48 hours after approval. Once approved, PayPal payments are instant, crypto takes 1-2 hours, and gift cards are delivered within 24 hours to your email.",
  'my account was banned': "I'm sorry to hear that. Let me look into this for you. Could you provide your username so I can check the reason? Most bans are due to VPN usage or multiple accounts. If you believe this was a mistake, I can escalate this to our team.",
  'how do i earn': "Great question! You can earn by completing offers, surveys, watching videos, downloading apps, and referring friends. Each task shows the exact reward before you start. I can also recommend tasks based on your profile!",
  default: "Thank you for reaching out! I'm Cashli AI assistant. I can help with: tracking rewards, withdrawals, bans, earning tips, or account issues. Just tell me what you need help with!"
};

exports.chat = async (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();
  let response = supportResponses.default;
  for (const [key, value] of Object.entries(supportResponses)) {
    if (lowerMsg.includes(key)) { response = value; break; }
  }
  res.json({ response, timestamp: new Date().toISOString() });
};

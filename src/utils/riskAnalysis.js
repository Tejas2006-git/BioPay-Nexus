export const analyzeRisk = (amount, recipient, upiId = '') => {
  const risks = [];
  let score = 0;

  // Amount-based risk
  if (amount > 100000) { score += 40; risks.push('Transaction amount exceeds ₹1,00,000 — unusually large payment'); }
  else if (amount > 50000) { score += 25; risks.push('Transaction amount exceeds ₹50,000 — requires careful verification'); }
  else if (amount > 10000) { score += 10; }

  // Recipient-based risk
  const knownSafe = ['university', 'college', 'school', 'hospital', 'cbse', 'iit', 'nit', 'board', 'government', 'gov', 'municipal', 'metro', 'water'];
  const knownRisky = ['unknown', 'vendor', 'xyz', 'test', 'temp', 'casino', 'lottery', 'win'];

  const recipientLower = (recipient || '').toLowerCase();
  const upiLower = (upiId || '').toLowerCase();

  const isSafe = knownSafe.some(k => recipientLower.includes(k) || upiLower.includes(k));
  const isRisky = knownRisky.some(k => recipientLower.includes(k) || upiLower.includes(k));

  if (isRisky) { score += 45; risks.push('Recipient appears to be an unverified or suspicious entity'); }
  else if (!isSafe) { score += 15; risks.push('Recipient is not in the verified institution database'); }

  // UPI format check
  if (upiId && !upiId.includes('@')) { score += 20; risks.push('UPI ID format appears invalid or malformed'); }

  // Time-based risk (late night)
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) { score += 15; risks.push('Transaction initiated during unusual hours (late night)'); }

  score = Math.min(score, 100);
  let level, color;
  if (score < 30) { level = 'low'; color = 'green'; }
  else if (score < 60) { level = 'medium'; color = 'yellow'; }
  else { level = 'high'; color = 'red'; }

  return { score, level, color, risks, requiresAdditionalAuth: score >= 60 };
};

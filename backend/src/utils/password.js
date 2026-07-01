const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, message: 'At least 8 characters' },
  { test: (p) => /[a-z]/.test(p), message: 'One lowercase letter' },
  { test: (p) => /[A-Z]/.test(p), message: 'One uppercase letter' },
  { test: (p) => /\d/.test(p), message: 'One number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), message: 'One special character' },
];

function validatePasswordStrength(password) {
  const failures = PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.message
  );
  return { valid: failures.length === 0, failures };
}

module.exports = { validatePasswordStrength, PASSWORD_RULES };

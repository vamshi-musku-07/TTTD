import { PASSWORD_RULES, getPasswordStrength } from '../lib/validation';

export function PasswordStrength({ password }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const passedCount = PASSWORD_RULES.filter((r) => r.test(password)).length;

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                passedCount >= level * 1.25
                  ? level <= 1
                    ? 'bg-[#ef4444]'
                    : level <= 2
                      ? 'bg-[#f97316]'
                      : level <= 3
                        ? 'bg-[#eab308]'
                        : 'bg-[#22c55e]'
                  : 'bg-[rgba(255,255,255,0.08)]'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-[#71717a] w-12 text-right">
          {strength.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <span
              key={rule.id}
              className={`text-[11px] ${passed ? 'text-[#4ade80]' : 'text-[#52525b]'}`}
            >
              {passed ? '✓' : '·'} {rule.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

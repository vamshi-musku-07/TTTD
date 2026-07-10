export function getNameInitial(name) {
  const trimmed = name?.trim();
  if (!trimmed) return 'U';
  return trimmed[0].toUpperCase();
}

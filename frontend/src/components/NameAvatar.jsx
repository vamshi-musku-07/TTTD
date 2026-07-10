import { getNameInitial } from '../lib/nameAvatar';

export function NameAvatar({ name, className = 'mf-avatar-letter', title }) {
  const letter = getNameInitial(name);

  return (
    <div className={className} title={title} aria-hidden={title ? undefined : true}>
      {letter}
    </div>
  );
}

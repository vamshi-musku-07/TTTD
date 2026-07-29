import { getNameInitial } from '../lib/nameAvatar';

export function NameAvatar({ name, avatar, className = 'mf-avatar-letter', title }) {
  const letter = getNameInitial(name);

  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        title={title}
        className={`${className} object-cover`}
        aria-hidden={title ? undefined : true}
      />
    );
  }

  return (
    <div className={className} title={title} aria-hidden={title ? undefined : true}>
      {letter}
    </div>
  );
}

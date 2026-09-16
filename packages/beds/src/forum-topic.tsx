import { Children, useId, type ComponentProps, type ReactNode } from 'react';
import { Avatar, Icon } from './foundation';
import { Badge } from './feedback';
import './forum-topic.css';

type TopicDestination = { href: string; onOpen?: never } | { href?: never; onOpen: () => void };

export type ForumTopicCardProps = {
  title: string;
  author: { name: string; avatarSrc?: string };
  excerpt?: string;
  activity?: { label: string; dateTime?: string };
  repliesLabel?: string;
  status?: { label: string; tone?: ComponentProps<typeof Badge>['tone'] };
  unreadLabel?: string;
  selected?: boolean;
} & TopicDestination;

/** One destination, no nested actions. The host exposes the full excerpt on open. */
export function ForumTopicCard({ title, author, excerpt, activity, repliesLabel, status, unreadLabel, selected = false, href, onOpen }: ForumTopicCardProps) {
  const id = useId();
  const content = <>
    <span className="es-forum-topic-avatar" aria-hidden="true"><Avatar name={author.name} src={author.avatarSrc} purpose="forum" /></span>
    <span className="es-forum-topic-content">
      <span id={`${id}-byline`} className="es-forum-topic-byline"><bdi>{author.name}</bdi>{unreadLabel && <span className="es-forum-topic-unread">{unreadLabel}</span>}</span>
      <span id={`${id}-title`} className="es-forum-topic-title">{title}</span>
      {excerpt && <span id={`${id}-excerpt`} className="es-forum-topic-excerpt">{excerpt}</span>}
    </span>
    <span id={`${id}-meta`} className="es-forum-topic-meta">
      {status && <Badge purpose="status" label={status.label} tone={status.tone} />}
      {repliesLabel && <span className="es-forum-topic-replies"><Icon name="MessageCircle" purpose="small" /><span>{repliesLabel}</span></span>}
      {activity && <time dateTime={activity.dateTime}>{activity.label}</time>}
      {selected && <Icon name="Check" purpose="small" />}
    </span>
  </>;
  const common = {
    className: `es-forum-topic${selected ? ' es-forum-topic--selected' : ''}`,
    'aria-labelledby': `${id}-title`,
    'aria-describedby': `${id}-byline ${id}-meta${excerpt ? ` ${id}-excerpt` : ''}`,
    'aria-current': selected ? 'true' as const : undefined,
  };
  return <article className="es-forum-topic-frame">
    {href !== undefined ? <a {...common} href={href}>{content}</a> : <button {...common} type="button" onClick={onOpen}>{content}</button>}
  </article>;
}

/** Semantic list with a fixed quiet rhythm, not a selectable listbox. */
export function ForumTopicList({ label, children }: { label: string; children: ReactNode }) {
  return <ul className="es-forum-topic-list" aria-label={label}>{Children.map(children, child => child == null ? null : <li>{child}</li>)}</ul>;
}

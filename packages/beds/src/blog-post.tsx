import { Children, useId, type ReactNode } from 'react';
import { Avatar, Icon } from './foundation';
import { CardMedia } from './card-media';
import './blog-post.css';

export type BlogPostCardProps = {
  title: string;
  href: string;
  excerpt?: string;
  author?: { name: string; avatarSrc?: string };
  image?: { src: string; alt: string };
  published?: { label: string; dateTime: string };
  readingTime?: string;
  tags?: readonly string[];
  headingLevel?: 2 | 3;
};

/** One native destination. Tags are metadata, not nested links or filters. */
export function BlogPostCard({ title, href, excerpt, author, image, published, readingTime, tags = [], headingLevel = 2 }: BlogPostCardProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const hasMetadata = author || published || readingTime;
  const topics = [...new Set(tags.map(tag => tag.trim()).filter(Boolean))];

  return <article className="es-blog-post-frame">
    <a className={`es-blog-post${image ? '' : ' es-blog-post--text'}`} href={href} aria-labelledby={`${id}-title`}>
      {image && <CardMedia key={image.src} {...image} purpose="blog" fallback={<Icon name="Image" purpose="feature" />} />}
      <div className="es-blog-post-content">
        {hasMetadata && <div className="es-blog-post-meta">
          {author && <span className="es-blog-post-author">
            {author.avatarSrc && <span aria-hidden="true"><Avatar name={author.name} src={author.avatarSrc} purpose="workspace" /></span>}
            <bdi>{author.name}</bdi>
          </span>}
          {(published || readingTime) && <span className="es-blog-post-details">
            {published && <time dateTime={published.dateTime}>{published.label}</time>}
            {readingTime && <span>{readingTime}</span>}
          </span>}
        </div>}
        <Heading className="es-blog-post-title" id={`${id}-title`}>{title}</Heading>
        {excerpt && <p className="es-blog-post-excerpt">{excerpt}</p>}
        {topics.length > 0 && <ul className="es-blog-post-tags">{topics.map(tag => <li key={tag}>{tag}</li>)}</ul>}
      </div>
    </a>
  </article>;
}

/** Editorial feed; fixed reading width, spacing and native list semantics. */
export function BlogPostList({ label, children }: { label: string; children: ReactNode }) {
  return <ul className="es-blog-post-list" aria-label={label}>{Children.map(children, child => child == null ? null : <li>{child}</li>)}</ul>;
}

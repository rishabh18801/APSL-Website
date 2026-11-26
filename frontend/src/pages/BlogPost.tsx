import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { Reveal } from '../components/Reveal';
import { formatPostDate } from './Blog';
import NotFound from './NotFound';

/**
 * Post bodies are light Markdown: "## Heading" lines and blank-line separated
 * paragraphs, matching how product descriptions are written.
 */
function Body({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="mt-8">
      {blocks.map((block, i) => {
        const heading = block.match(/^#{2,3}\s+(.*)$/);
        if (heading) {
          return (
            <h2 key={i} className={`text-xl font-semibold ${i === 0 ? '' : 'mt-10'}`}>
              {heading[1]}
            </h2>
          );
        }
        return (
          <p key={i} className="mt-4 leading-relaxed text-copy">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export default function BlogPost() {
  const { slug = '' } = useParams();
  const { data: post, loading, error } = useAsync(() => api.post(slug), [slug]);

  useEffect(() => {
    if (post) document.title = `${post.title} | APSL Solutions LLP`;
  }, [post]);

  if (loading) {
    return (
      <div className="container-x animate-pulse pt-24 sm:pt-32">
        <div className="h-10 w-2/3 rounded bg-sand" />
        <div className="mt-6 aspect-[16/9] rounded-3xl bg-sand/50" />
      </div>
    );
  }
  if (error || !post) return <NotFound />;

  return (
    <div className="pt-24 sm:pt-32">
      <article className="container-x max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-mist hover:text-signal">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        <Reveal>
          <span className="mt-6 flex items-center gap-1.5 text-sm text-mist">
            <CalendarDays className="h-4 w-4" /> {formatPostDate(post.created_at)}
            {post.author && <span>· {post.author}</span>}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg text-mist">{post.excerpt}</p>}

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt=""
              className="mt-8 aspect-[16/9] w-full rounded-3xl border border-sand object-cover"
            />
          )}

          <Body text={post.body} />
        </Reveal>
      </article>

      {post.related && post.related.length > 0 && (
        <section className="container-x py-14 sm:py-20">
          <h2 className="text-2xl font-semibold">More from the blog</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {post.related.map((r) => (
              <Link
                key={r.id}
                to={`/blog/${r.slug}`}
                className="group rounded-3xl border border-sand bg-paper p-5 shadow-sm transition hover:-translate-y-1 hover:border-signal/50 hover:shadow-lg"
              >
                <span className="text-xs text-mist">{formatPostDate(r.created_at)}</span>
                <h3 className="mt-2 font-semibold leading-snug text-graphite">{r.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-mist">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { Reveal, SectionHeading } from '../components/Reveal';

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Blog() {
  const { data, loading, error } = useAsync(() => api.posts(), []);

  useEffect(() => {
    document.title = 'Blog | APSL Solutions LLP';
  }, []);

  return (
    <div className="container-x pt-24 sm:pt-32">
      <SectionHeading
        eyebrow="Blog"
        title="News, guides and field notes"
        text="Product launches, survey workflows and practical notes from our team."
      />

      {error && <p className="mt-10 text-red-600">Could not load posts: {error}</p>}
      {loading && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-sand bg-paper">
              <div className="aspect-[16/10] bg-sand/50" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 rounded bg-sand" />
                <div className="h-5 w-3/4 rounded bg-sand" />
                <div className="h-3 w-full rounded bg-sand/60" />
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <p className="mt-10 rounded-3xl border border-sand bg-paper p-10 text-center text-mist">
          No posts yet. Check back soon.
        </p>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 0.07}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-paper shadow-sm transition hover:-translate-y-1 hover:border-signal/50 hover:shadow-lg"
            >
              <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-white to-sand/50">
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <span className="flex items-center gap-1.5 text-xs text-mist">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatPostDate(post.created_at)}
                  {post.author && <span>· {post.author}</span>}
                </span>
                <h2 className="text-lg font-semibold leading-snug text-graphite">{post.title}</h2>
                <p className="line-clamp-3 text-sm text-mist">{post.excerpt}</p>
                <span className="mt-auto flex items-center gap-1 pt-3 text-sm font-medium text-signal">
                  Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="h-14 sm:h-20" />
    </div>
  );
}

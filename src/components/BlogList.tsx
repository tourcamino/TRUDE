import * as React from "react";
import { BlogCard } from "~/components/BlogCard";
import { BlogArticle } from "~/data/blog-articles";

export interface BlogListProps {
  articles: BlogArticle[];
  title?: string;
  subtitle?: string;
  showExcerpt?: boolean;
  showTags?: boolean;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function BlogList({
  articles,
  title,
  subtitle,
  showExcerpt = true,
  showTags = true,
  columns = 3,
  className,
}: BlogListProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`grid ${gridClasses[columns]} gap-8`}>
        {articles.map((article) => (
          <BlogCard
            key={article.id}
            {...article}
            showExcerpt={showExcerpt}
            showTags={showTags}
          />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found.</p>
        </div>
      )}
    </div>
  );
}
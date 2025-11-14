import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Calendar, Clock, User, Tag, Share2, Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { BlogArticle } from "~/data/blog-articles";
import { BlogList } from "~/components/BlogList";
import { cn } from "~/lib/utils";

export interface BlogPostProps {
  article: BlogArticle;
  relatedArticles?: BlogArticle[];
  showAuthor?: boolean;
  showShareButtons?: boolean;
  showRelatedArticles?: boolean;
}

export function BlogPost({
  article,
  relatedArticles = [],
  showAuthor = true,
  showShareButtons = true,
  showRelatedArticles = true,
}: BlogPostProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  const formattedDate = new Date(article.publishDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: string) => {
    const text = `Check out this article: ${article.title}`;
    const url = encodeURIComponent(articleUrl);
    const encodedText = encodeURIComponent(text);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(article.seo.structuredData)
        }}
      />

      {/* Header */}
      <header className="mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.readTime} min read
          </span>
          {showAuthor && (
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article.authorAvatar && (
                <img
                  src={article.authorAvatar}
                  alt={article.author}
                  className="w-6 h-6 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              {article.author}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="inline-flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Featured Image */}
        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 mb-8">
          <img
            src={article.imageUrl}
            alt={article.imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Share Buttons */}
        {showShareButtons && (
          <div className="flex items-center gap-2 mb-8">
            <span className="text-sm text-gray-600 mr-2">Share this article:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="gap-2"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="gap-2"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: article.content
              .split('\n\n').map(paragraph => `<p class="mb-6">${paragraph}</p>`).join('')
              .replace(/<h([1-6])>(.*?)<\/h([1-6])>/g, '<h$1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$2</h$1>')
              .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-bold text-gray-900">$1</strong>')
              .replace(/<ul>(.*?)<\/ul>/gs, '<ul class="list-disc pl-6 mb-6 space-y-2">$1</ul>')
              .replace(/<li>(.*?)<\/li>/g, '<li class="mb-2">$1</li>')
          }}
        />
      </div>

      {/* Author Bio */}
      {showAuthor && (
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-4">
            {article.authorAvatar && (
              <img
                src={article.authorAvatar}
                alt={article.author}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{article.author}</h3>
              <p className="text-gray-600 text-sm">
                Expert in blockchain technology and supply chain innovation with over 10 years of experience in decentralized systems.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Related Articles */}
      {showRelatedArticles && relatedArticles.length > 0 && (
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Articles
          </h2>
          <BlogList
            articles={relatedArticles}
            showExcerpt={false}
            showTags={false}
            columns={3}
          />
        </div>
      )}
    </article>
  );
}
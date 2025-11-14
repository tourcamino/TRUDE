import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Calendar, Clock, User, ArrowRight, Tag } from "lucide-react";
import { cn } from "~/lib/utils";

export interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  authorAvatar?: string;
  publishDate: string;
  readTime: number;
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  className?: string;
  showExcerpt?: boolean;
  showTags?: boolean;
}

export function BlogCard({
  title,
  slug,
  excerpt,
  author,
  authorAvatar,
  publishDate,
  readTime,
  tags,
  imageUrl,
  imageAlt,
  className,
  showExcerpt = true,
  showTags = true,
}: BlogCardProps) {
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1", className)}>
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
          <span className="mx-1">•</span>
          <Clock className="w-4 h-4" />
          <span>{readTime} min read</span>
        </div>
        
        <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link to="/blog/$slug" params={{ slug }} className="hover:no-underline">
            {title}
          </Link>
        </CardTitle>
      </CardHeader>

      {showExcerpt && (
        <CardContent className="pb-3">
          <p className="text-gray-600 line-clamp-3">{excerpt}</p>
        </CardContent>
      )}

      {showTags && tags.length > 0 && (
        <CardContent className="pt-0 pb-3">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {authorAvatar && (
            <img
              src={authorAvatar}
              alt={author}
              className="w-6 h-6 rounded-full object-cover"
              loading="lazy"
            />
          )}
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <User className="w-4 h-4" />
            {author}
          </span>
        </div>
        
        <Button variant="ghost" size="sm" className="group" asChild>
          <Link to="/blog/$slug" params={{ slug }} className="flex items-center gap-1">
            Read More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
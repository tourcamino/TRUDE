import { createFileRoute } from "@tanstack/react-router";
import { BlogList } from "~/components/BlogList";
import { getLatestBlogArticles } from "~/data/blog-articles";

export const Route = createFileRoute("/blog/")({
  component: BlogPage,
});

function BlogPage() {
  const articles = getLatestBlogArticles(10); // Show all articles on the blog page

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <BlogList
          articles={articles}
          title="TruDe Blog"
          subtitle="Discover insights, strategies, and innovations in supply chain management, DeFi, and AI technology. Stay updated with the latest trends and best practices."
          showExcerpt={true}
          showTags={true}
          columns={2}
        />
      </div>
    </div>
  );
}
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BlogPost } from "~/components/BlogPost";
import { getBlogArticleBySlug, getRelatedArticles } from "~/data/blog-articles";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogArticlePage,
  loader: ({ params }) => {
    const article = getBlogArticleBySlug(params.slug);
    if (!article) {
      throw notFound();
    }
    return {
      article,
      relatedArticles: getRelatedArticles(article, 3),
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        name: "description",
        content: loaderData.article.seo.metaDescription,
      },
      {
        name: "keywords",
        content: loaderData.article.seo.keywords.join(", "),
      },
      {
        property: "og:title",
        content: loaderData.article.title,
      },
      {
        property: "og:description",
        content: loaderData.article.seo.metaDescription,
      },
      {
        property: "og:image",
        content: loaderData.article.imageUrl,
      },
      {
        property: "og:type",
        content: "article",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: loaderData.article.title,
      },
      {
        name: "twitter:description",
        content: loaderData.article.seo.metaDescription,
      },
      {
        name: "twitter:image",
        content: loaderData.article.imageUrl,
      },
    ],
  }),
});

function BlogArticlePage() {
  const { article, relatedArticles } = Route.useLoaderData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <BlogPost
          article={article}
          relatedArticles={relatedArticles}
          showAuthor={true}
          showShareButtons={true}
          showRelatedArticles={true}
        />
      </div>
    </div>
  );
}
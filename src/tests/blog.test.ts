import { describe, it, expect } from 'vitest';
import { getBlogArticleBySlug, getLatestBlogArticles, getRelatedArticles } from '../data/blog-articles';
import { blogArticles } from '../data/blog-articles';

describe('Blog Articles', () => {
  it('should return the correct article by slug', () => {
    const article = getBlogArticleBySlug('trude-revolutionizes-supply-chain-transparency-ai-defi');
    expect(article).toBeDefined();
    expect(article?.title).toContain('TruDe Revolutionizes Supply Chain');
  });

  it('should return undefined for non-existent slug', () => {
    const article = getBlogArticleBySlug('non-existent-article');
    expect(article).toBeUndefined();
  });

  it('should return latest articles sorted by date', () => {
    const latestArticles = getLatestBlogArticles(3);
    expect(latestArticles).toHaveLength(3);
    
    // Check if articles are sorted by date (newest first)
    for (let i = 1; i < latestArticles.length; i++) {
      const currentDate = new Date(latestArticles[i].publishDate);
      const previousDate = new Date(latestArticles[i - 1].publishDate);
      expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
    }
  });

  it('should return related articles based on tags', () => {
    const currentArticle = blogArticles[0];
    const relatedArticles = getRelatedArticles(currentArticle, 2);
    
    expect(relatedArticles).toHaveLength(2);
    expect(relatedArticles[0].id).not.toBe(currentArticle.id);
    
    // Check if related articles share at least one tag
    relatedArticles.forEach(article => {
      const hasSharedTag = article.tags.some(tag => currentArticle.tags.includes(tag));
      expect(hasSharedTag).toBe(true);
    });
  });

  it('should have all required article properties', () => {
    blogArticles.forEach(article => {
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('slug');
      expect(article).toHaveProperty('excerpt');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('publishDate');
      expect(article).toHaveProperty('readTime');
      expect(article).toHaveProperty('tags');
      expect(article).toHaveProperty('imageUrl');
      expect(article).toHaveProperty('imageAlt');
      expect(article).toHaveProperty('seo');
      expect(article.seo).toHaveProperty('metaDescription');
      expect(article.seo).toHaveProperty('keywords');
      expect(article.seo).toHaveProperty('structuredData');
    });
  });

  it('should have valid SEO structured data', () => {
    blogArticles.forEach(article => {
      expect(article.seo.structuredData).toHaveProperty('@context', 'https://schema.org');
      expect(article.seo.structuredData).toHaveProperty('@type', 'Article');
      expect(article.seo.structuredData).toHaveProperty('headline');
      expect(article.seo.structuredData).toHaveProperty('description');
      expect(article.seo.structuredData).toHaveProperty('author');
      expect(article.seo.structuredData).toHaveProperty('datePublished');
      expect(article.seo.structuredData).toHaveProperty('image');
    });
  });
});
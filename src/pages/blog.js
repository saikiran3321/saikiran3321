import React from 'react';
import Layout from '@theme/Layout';
import BlogPostItem from '@theme/BlogPostItem';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import {useBlogListPageStructuredData} from '@docusaurus/theme-common';

function BlogListPageMetadata(props) {
  const {metadata} = props;
  return (
    <>
      <SearchMetadata
        tag="blog_posts_list"
        locale={metadata.blogTitle}
        description={metadata.blogDescription}
      />
    </>
  );
}

function BlogListPageContent(props) {
  const {metadata, items, sidebar} = props;
  
  useBlogListPageStructuredData(metadata);

  return (
    <Layout
      title={metadata.title}
      description={metadata.description}
      wrapperClassName="blog-wrapper"
    >
      <div className="blog-list-container">
        <div className="blog-list-header">
          <h1 className="blog-list-title">Latest Insights</h1>
          <p className="blog-list-subtitle">
            Exploring the frontiers of AI, machine learning, and software development. 
            Dive deep into technical concepts, practical implementations, and future trends.
          </p>
        </div>
        
        <div className="blog-list-grid">
          {items.map(({content: BlogPostContent}) => (
            <div key={BlogPostContent.metadata.permalink} className="blog-post-card">
              <div className="blog-post-header">
                <h2 className="blog-post-title">
                  <a href={BlogPostContent.metadata.permalink}>
                    {BlogPostContent.metadata.title}
                  </a>
                </h2>
                
                <div className="blog-post-meta">
                  <div className="blog-post-author">
                    {BlogPostContent.metadata.authors.map((author, index) => (
                      <div key={index} className="blog-post-author">
                        {author.imageURL && (
                          <img
                            src={author.imageURL}
                            alt={author.name}
                            className="blog-post-author-avatar"
                          />
                        )}
                        <span>{author.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="blog-post-date">
                    <span>📅</span>
                    <time dateTime={BlogPostContent.metadata.date}>
                      {new Date(BlogPostContent.metadata.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
                
                {BlogPostContent.metadata.tags.length > 0 && (
                  <div className="blog-post-tags">
                    {BlogPostContent.metadata.tags.map((tag) => (
                      <a
                        key={tag.permalink}
                        href={tag.permalink}
                        className="blog-post-tag"
                      >
                        {tag.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="blog-post-content">
                <div className="blog-post-excerpt">
                  {BlogPostContent.metadata.description || 
                   (BlogPostContent.contentTitle && 
                    BlogPostContent.contentTitle.length > 150 
                      ? BlogPostContent.contentTitle.substring(0, 150) + '...'
                      : BlogPostContent.contentTitle
                   )}
                </div>
                
                <div className="blog-post-footer">
                  <a
                    href={BlogPostContent.metadata.permalink}
                    className="blog-post-read-more"
                  >
                    Read More
                    <span>→</span>
                  </a>
                  
                  <div className="blog-post-read-time">
                    <span>⏱️</span>
                    <span>{BlogPostContent.metadata.readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <BlogListPaginator metadata={metadata} />
      </div>
    </Layout>
  );
}

export default function BlogListPage(props) {
  return (
    <>
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </>
  );
}
import React from 'react';
import Layout from '@theme/Layout';
import BlogPostItem from '@theme/BlogPostItem';
import BlogPostPaginator from '@theme/BlogPostPaginator';
import BlogSidebar from '@theme/BlogSidebar';
import TOC from '@theme/TOC';
import {useBlogPost} from '@docusaurus/theme-common/internal';

function BlogPostPageContent({sidebar, children}) {
  const {metadata, toc} = useBlogPost();
  const {
    title,
    description,
    date,
    formattedDate,
    authors,
    tags,
    readingTime,
    editUrl,
  } = metadata;

  return (
    <Layout
      title={title}
      description={description}
      wrapperClassName="blog-wrapper"
    >
      <div className="blog-post-container">
        <article className="blog-post-full">
          <header className="blog-post-full-header">
            <h1 className="blog-post-full-title">{title}</h1>
            
            <div className="blog-post-full-meta">
              <div className="blog-post-full-author">
                {authors.map((author, index) => (
                  <div key={index} className="blog-post-full-author">
                    {author.imageURL && (
                      <img
                        src={author.imageURL}
                        alt={author.name}
                        className="blog-post-full-author-avatar"
                      />
                    )}
                    <div className="blog-post-full-author-info">
                      <div className="blog-post-full-author-name">{author.name}</div>
                      {author.title && (
                        <div className="blog-post-full-author-title">{author.title}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="blog-post-full-date">
                <span>📅</span>
                <time dateTime={date}>{formattedDate}</time>
              </div>
              
              {readingTime && (
                <div className="blog-post-full-date">
                  <span>⏱️</span>
                  <span>{Math.ceil(readingTime)} min read</span>
                </div>
              )}
            </div>
            
            {tags.length > 0 && (
              <div className="blog-post-full-tags">
                {tags.map((tag) => (
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
          </header>
          
          <div className="blog-post-full-content">
            {children}
          </div>
          
          {editUrl && (
            <div className="blog-post-edit">
              <a href={editUrl} target="_blank" rel="noopener noreferrer">
                Edit this page
              </a>
            </div>
          )}
        </article>
        
        <BlogPostPaginator />
      </div>
    </Layout>
  );
}

export default function BlogPostPage(props) {
  const BlogPostContent = props.content;
  return (
    <BlogPostPageContent {...props}>
      <BlogPostContent />
    </BlogPostPageContent>
  );
}
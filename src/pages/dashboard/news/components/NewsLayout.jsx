import React from 'react';

export default function NewsLayout(newsData) {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getPublisherInitials = (publisher) => {
    return publisher.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  const renderNewsCard = (article, index, isFeatured = false) => {
    if (isFeatured) {
      return (
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          key={index}
          className="block bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-zinc-700 transition-all"
        >
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2 py-1 rounded">
                  {article.symbol}
                </span>
                <span className="text-xs text-zinc-500">{article.publisher}</span>
              </div>
              <h2 className="text-4xl font-serif text-white mb-4 leading-tight">
                {article.title}
              </h2>
              <div className="flex items-center text-zinc-500 text-sm mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Published {formatTimeAgo(article.publishedDate)}
              </div>
              <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                {article.text}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-zinc-400 text-sm">{article.site}</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={(e) => e.preventDefault()}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => e.preventDefault()}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-full object-cover min-h-[400px]"
              />
            </div>
          </div>
        </a>
      );
    }

    return (
      <a 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer"
        key={index}
        className="block bg-zinc-900 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-zinc-700 transition-all"
      >
        <div className="relative h-64">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2 py-1 rounded">
              {article.symbol}
            </span>
            <span className="text-xs text-zinc-500">{article.publisher}</span>
          </div>
          <h3 className="text-white text-xl font-medium mb-4 leading-snug group-hover:text-zinc-300 transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">{article.site}</span>
            <div className="flex gap-3">
              <button 
                onClick={(e) => e.preventDefault()}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button 
                onClick={(e) => e.preventDefault()}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </a>
    );
  };

  const renderNewsGroup = (articles) => {
    if (articles.length === 0) return null;
    
    const featured = articles[0];
    const cards = articles.slice(1, 4);

    return (
      <div className="space-y-6">
        {renderNewsCard(featured, 0, true)}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => renderNewsCard(card, idx + 1, false))}
          </div>
        )}
      </div>
    );
  };

  // Group news into sets of 4
  const newsGroups = [];
  for (let i = 0; i < newsData.length; i += 4) {
    newsGroups.push(newsData.slice(i, i + 4));
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {newsGroups.map((group, idx) => (
          <div key={idx}>
            {renderNewsGroup(group)}
          </div>
        ))}
      </div>
    </div>
  );
}
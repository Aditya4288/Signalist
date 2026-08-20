"use client";

import { formatTimeAgo } from "@/lib/utils";

const WatchlistNews = ({ news }: WatchlistNewsProps) => {
    if (!news || news.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500">
                <p>No news available</p>
            </div>
        );
    }

    return (
        <div className="watchlist-news">
            {news.map((article) => (
                <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-item"
                >
                    {article.related && (
                        <span className="news-tag">{article.related}</span>
                    )}
                    <h3 className="news-title">{article.headline}</h3>
                    <div className="news-meta">
                        <span>{article.source}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTimeAgo(article.datetime)}</span>
                    </div>
                    <p className="news-summary">{article.summary}</p>
                    <span className="news-cta">Read more →</span>
                </a>
            ))}
        </div>
    );
};

export default WatchlistNews;
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, TrendingUp } from "lucide-react";
import { newsService, type NewsArticle } from "@/services/newsService";

export function CryptoNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Use newsdata.io service for real crypto news
        const articles = await newsService.fetchCryptoNews();
        // Limit to 6 articles for the component
        setNews(articles.slice(0, 6));
      } catch (error) {
        console.error('Error fetching news:', error);
        // Use fallback data if service fails
        const fallbackNews = newsService.getFallbackNews().slice(0, 6);
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-crypto-green';
      case 'negative':
        return 'text-crypto-red';
      default:
        return 'text-crypto-blue';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-crypto-green/20 text-crypto-green border-crypto-green/30';
      case 'negative':
        return 'bg-crypto-red/20 text-crypto-red border-crypto-red/30';
      default:
        return 'bg-crypto-blue/20 text-crypto-blue border-crypto-blue/30';
    }
  };

  const formatTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-crypto-orange" />
          <span>Latest Crypto News</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {news.map((article, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-crypto-green/10 hover:border-crypto-green/50 hover:shadow-lg hover:shadow-crypto-green/20 transition-all duration-500 hover:scale-105 group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSentimentBadge(article.sentiment || 'neutral')}>
                      {article.sentiment || 'neutral'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.source.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className={`text-xs font-medium ${getSentimentColor(article.sentiment || 'neutral')}`}>
                    Market Sentiment: {article.sentiment?.toUpperCase() || 'NEUTRAL'}
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1 transition-colors">
                    <span>Read more</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
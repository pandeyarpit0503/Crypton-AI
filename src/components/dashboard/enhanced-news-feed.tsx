import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ExternalLink, Calendar, TrendingUp, Search, Filter, Clock, BookOpen } from "lucide-react";
import { newsService, type NewsArticle } from "@/services/newsService";

export function EnhancedNewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Use newsdata.io service for real crypto news
        const articles = await newsService.fetchCryptoNews();
        setNews(articles);
      } catch (error) {
        console.error('Error fetching news:', error);
        // Use fallback data if service fails
        const fallbackNews = newsService.getFallbackNews();
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter news based on active tab and search term

  useEffect(() => {
    let filtered = news;
    
    // Filter by category
    if (activeTab !== "all") {
      filtered = filtered.filter(article => article.category === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredNews(filtered);
  }, [news, activeTab, searchTerm]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-crypto-green';
      case 'negative': return 'text-crypto-red';
      default: return 'text-crypto-blue';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-crypto-green/20 text-crypto-green border-crypto-green/30';
      case 'negative': return 'bg-crypto-red/20 text-crypto-red border-crypto-red/30';
      default: return 'bg-crypto-blue/20 text-crypto-blue border-crypto-blue/30';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-crypto-orange/20 text-crypto-orange border-crypto-orange/30';
      case 'medium': return 'bg-crypto-blue/20 text-crypto-blue border-crypto-blue/30';
      case 'low': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bitcoin': return '₿';
      case 'ethereum': return 'Ξ';
      case 'defi': return '🏦';
      case 'nft': return '🎨';
      case 'regulation': return '⚖️';
      default: return '📰';
    }
  };

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-crypto-orange" />
            <span>Crypto News & Analysis</span>
          </CardTitle>
          <Badge variant="outline" className="text-crypto-green">
            Live Feed
          </Badge>
        </div>
        
  Search and Filter 
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Filter className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="nft">NFT</TabsTrigger>
            <TabsTrigger value="regulation">Regulation</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="animate-fade-in">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse p-4 rounded-lg bg-muted/20">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No news found matching your criteria</p>
                  </div>
                ) : (
                  filteredNews.map((article, index) => (
                    <div
                      key={article.id}
                      className="group p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-crypto-green/10 hover:border-crypto-green/50 hover:shadow-lg hover:shadow-crypto-green/20 transition-all duration-500 hover:scale-105 animate-slide-up cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
             
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(article.category)}</span>
                          <Badge className={getSentimentBadge(article.sentiment)}>
                            {article.sentiment}
                          </Badge>
                          <Badge className={getImpactBadge(article.impact)}>
                            {article.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {article.source.name}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                      
                 
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                        {article.description}
                      </p>
                      

                      <div className="flex justify-between items-center">
                        <div className={`text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                          Market Sentiment: {article.sentiment.toUpperCase()}
                        </div>
                        <button className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1 transition-colors group-hover:translate-x-1">
                          <span>Read Full Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
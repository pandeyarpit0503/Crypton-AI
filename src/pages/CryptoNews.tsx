import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter, 
  Clock, 
  BookOpen,
  Newspaper,
  Globe,
  Star,
  Eye,
  Share2,
  Bookmark,
  RefreshCw
} from "lucide-react";
import { newsService, type NewsArticle } from "@/services/newsService";

// Using NewsArticle interface from newsService

const CryptoNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch news from newsdata.io
  const fetchCryptoNews = async () => {
    try {
      setRefreshing(true);

      // Using newsdata.io service for crypto news
      const articles = await newsService.fetchCryptoNews();

      setNews(articles);
      setFilteredNews(articles);
      setError(null);

      console.log(`✅ Loaded ${articles.length} crypto news articles`);
    } catch (err) {
      console.error('Error fetching news:', err);
      // Use fallback data from the service

      // Use fallback data from the service
      const fallbackArticles = newsService.getFallbackNews();

      setNews(fallbackArticles);
      setFilteredNews(fallbackArticles);

      // Check if it's due to rate limiting
      const cacheStatus = newsService.getCacheStatus();
      if (cacheStatus.isRateLimited) {
        setError('Using curated crypto news. Live news resumes when API quota resets (24h).');
      } else {
        setError('Using curated crypto news. API might be temporarily unavailable.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptoNews();
  }, []);

  useEffect(() => {
    let filtered = news;
    
    if (activeTab !== "all") {
      filtered = filtered.filter(article => article.category === activeTab);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.source.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'medium': return 'bg-crypto-yellow/20 text-crypto-yellow border-crypto-yellow/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return `${diffMinutes}m ago`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gray-900 rounded-lg"></div>
            <div className="grid gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-900 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl md:text-4xl font-bold flex items-center space-x-2 md:space-x-3 bg-gradient-primary bg-clip-text text-transparent">
                  <Newspaper className="w-8 h-8 md:w-10 md:h-10 text-crypto-green" />
                  <span>Crypto News Hub</span>
                </CardTitle>
                <p className="text-muted-foreground text-base md:text-lg mt-2">
                  Latest cryptocurrency news, analysis, and market insights
                </p>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4">
                <button
                  onClick={fetchCryptoNews}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-crypto-blue hover:bg-crypto-blue/80 text-white rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <Badge variant="outline" className="text-crypto-green border-crypto-green text-xs md:text-sm">
                  Live Updates
                </Badge>
              </div>
            </div>
            
            {/* Search and Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mt-6">
              <div className="relative flex-1 max-w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/70 border-gray-700/50 text-white placeholder-gray-500 focus:border-crypto-blue/50 w-full"
                />
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{filteredNews.length} Articles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-crypto-red/20 border-crypto-red/50">
            <CardContent className="p-4">
              <p className="text-crypto-red">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* News Content */}
        <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="p-6 pb-0">
                {/* Mobile: Scrollable horizontal tabs */}
                <div className="block md:hidden">
                  <TabsList className="flex w-full overflow-x-auto bg-card border-border scrollbar-hide">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">All</TabsTrigger>
                    <TabsTrigger value="bitcoin" className="data-[state=active]:bg-crypto-orange data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">Bitcoin</TabsTrigger>
                    <TabsTrigger value="ethereum" className="data-[state=active]:bg-crypto-blue data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">Ethereum</TabsTrigger>
                    <TabsTrigger value="defi" className="data-[state=active]:bg-crypto-green data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">DeFi</TabsTrigger>
                    <TabsTrigger value="nft" className="data-[state=active]:bg-crypto-purple data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">NFT</TabsTrigger>
                    <TabsTrigger value="regulation" className="data-[state=active]:bg-crypto-red data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">Regulation</TabsTrigger>
                    <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-3 py-2 text-sm">General</TabsTrigger>
                  </TabsList>
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden md:block">
                  <TabsList className="grid w-full grid-cols-7 bg-card border-border">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                    <TabsTrigger value="bitcoin" className="data-[state=active]:bg-crypto-orange data-[state=active]:text-primary-foreground">Bitcoin</TabsTrigger>
                    <TabsTrigger value="ethereum" className="data-[state=active]:bg-crypto-blue data-[state=active]:text-primary-foreground">Ethereum</TabsTrigger>
                    <TabsTrigger value="defi" className="data-[state=active]:bg-crypto-green data-[state=active]:text-primary-foreground">DeFi</TabsTrigger>
                    <TabsTrigger value="nft" className="data-[state=active]:bg-crypto-purple data-[state=active]:text-primary-foreground">NFT</TabsTrigger>
                    <TabsTrigger value="regulation" className="data-[state=active]:bg-crypto-red data-[state=active]:text-primary-foreground">Regulation</TabsTrigger>
                    <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General</TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value={activeTab} className="p-6 pt-4">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No articles found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredNews.map((article, index) => (
                      <Card
                        key={article.id}
                        className="group bg-glass-bg backdrop-blur-glass border-glass-border hover:border-crypto-green/50 hover:scale-105 hover:shadow-xl hover:shadow-crypto-green/20 transition-all duration-500 overflow-hidden animate-scale-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            {article.urlToImage && (
                              <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                                <img 
                                  src={article.urlToImage} 
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="flex-1 p-6">
                              {/* Header */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-lg">{getCategoryIcon(article.category || 'general')}</span>
                                <Badge className={getSentimentBadge(article.sentiment || 'neutral')}>
                                  {article.sentiment}
                                </Badge>
                                <Badge className={getImpactBadge(article.impact || 'low')}>
                                  {article.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                                  {article.source.name}
                                </Badge>
                                <div className="flex items-center space-x-1 text-xs text-gray-400 ml-auto">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatTimeAgo(article.publishedAt)}</span>
                                </div>
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-bold text-xl text-white mb-3 group-hover:text-crypto-blue transition-colors leading-tight">
                                {article.title}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-gray-300 mb-4 leading-relaxed">
                                {article.description}
                              </p>
                              
                              {/* Content Preview */}
                              {article.content && (
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                  {article.content.substring(0, 200)}...
                                </p>
                              )}
                              
                              {/* Footer Actions */}
                              <div className="flex items-center justify-between">
                                <div className={`text-sm font-medium ${getSentimentColor(article.sentiment || 'neutral')}`}>
                                  Market Impact: {(article.impact || 'low').toUpperCase()}
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <button className="flex items-center space-x-1 text-gray-400 hover:text-crypto-blue transition-colors">
                                    <Bookmark className="w-4 h-4" />
                                    <span className="text-sm">Save</span>
                                  </button>
                                  <button className="flex items-center space-x-1 text-gray-400 hover:text-crypto-blue transition-colors">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-sm">Share</span>
                                  </button>
                                  <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 text-crypto-blue hover:text-crypto-blue/80 transition-colors"
                                  >
                                    <span className="text-sm font-medium">Read Full Article</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Articles', value: news.length, icon: BookOpen, color: 'blue' },
            { label: 'Positive News', value: news.filter(n => n.sentiment === 'positive').length, icon: TrendingUp, color: 'green' },
            { label: 'High Impact', value: news.filter(n => n.impact === 'high').length, icon: Star, color: 'orange' },
            { label: 'Sources', value: new Set(news.map(n => n.source.name)).size, icon: Globe, color: 'purple' }
          ].map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br from-crypto-${stat.color}/20 to-crypto-${stat.color}/10 border-crypto-${stat.color}/30`}>
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 text-crypto-${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoNews;
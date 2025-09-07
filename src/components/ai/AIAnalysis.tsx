import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { geminiAI, AIAnalysis } from '@/lib/gemini';
import { calculateConfidence, type MarketData } from '@/utils/confidenceCalculator';

interface AIAnalysisProps {
  coinData: any;
}

export function AIAnalysisComponent({ coinData }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidenceFactors, setConfidenceFactors] = useState<any>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate confidence factors for the display
      const marketData: MarketData = {
        price_usd: coinData.price_usd,
        percent_change_24h: coinData.percent_change_24h,
        percent_change_7d: coinData.percent_change_7d || 0,
        volume24: coinData.volume24,
        market_cap_usd: coinData.market_cap_usd,
        rank: coinData.rank
      };

      const confidenceResult = calculateConfidence(marketData);
      setConfidenceFactors(confidenceResult);

      const result = await geminiAI.analyzeCryptocurrency(coinData);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to generate AI analysis. Please try again.');
      console.error('AI Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coinData) {
      generateAnalysis();
    }
  }, [coinData]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-crypto-green" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-crypto-red" />;
      default:
        return <Target className="w-4 h-4 text-crypto-blue" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-crypto-green/20 text-crypto-green border-crypto-green/30';
      case 'bearish':
        return 'bg-crypto-red/20 text-crypto-red border-crypto-red/30';
      default:
        return 'bg-crypto-blue/20 text-crypto-blue border-crypto-blue/30';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Shield className="w-4 h-4 text-crypto-green" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-crypto-red" />;
      default:
        return <Target className="w-4 h-4 text-crypto-orange" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-crypto-green/20 text-crypto-green border-crypto-green/30';
      case 'high':
        return 'bg-crypto-red/20 text-crypto-red border-crypto-red/30';
      default:
        return 'bg-crypto-orange/20 text-crypto-orange border-crypto-orange/30';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-crypto-green/20 text-crypto-green border-crypto-green/30';
      case 'sell':
        return 'bg-crypto-red/20 text-crypto-red border-crypto-red/30';
      default:
        return 'bg-crypto-blue/20 text-crypto-blue border-crypto-blue/30';
    }
  };

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-crypto-green" />
            <span>AI Analysis</span>
            <Sparkles className="w-4 h-4 text-crypto-orange" />
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAnalysis}
            disabled={loading}
            className="hover:bg-crypto-green/10"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-crypto-green animate-pulse" />
              <div className="text-muted-foreground">AI is analyzing market data...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-crypto-red/10 border border-crypto-red/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-crypto-red" />
              <span className="text-crypto-red text-sm">{error}</span>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <>
            {/* Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">AI Summary</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(analysis.sentiment)}
                  <span className="text-sm font-medium">Sentiment</span>
                </div>
                <Badge className={getSentimentColor(analysis.sentiment)}>
                  {analysis.sentiment.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-crypto-blue" />
                  <span className="text-sm font-medium">Confidence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        analysis.confidence >= 80 ? 'bg-crypto-green' :
                        analysis.confidence >= 60 ? 'bg-crypto-blue' :
                        analysis.confidence >= 40 ? 'bg-crypto-orange' : 'bg-crypto-red'
                      }`}
                      style={{ width: `${analysis.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono">{analysis.confidence}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(analysis.riskLevel)}
                  <span className="text-sm font-medium">Risk Level</span>
                </div>
                <Badge className={getRiskColor(analysis.riskLevel)}>
                  {analysis.riskLevel.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-crypto-orange" />
                  <span className="text-sm font-medium">Timeframe</span>
                </div>
                <Badge variant="outline" className="border-crypto-orange/30 text-crypto-orange">
                  {analysis.timeframe.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">AI Recommendation</h4>
              <div className="flex items-center space-x-3">
                <Badge className={`${getRecommendationColor(analysis.recommendation)} text-lg px-4 py-2`}>
                  {analysis.recommendation.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Based on current market analysis
                </span>
              </div>
            </div>

            {/* Key Points */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Key Insights</h4>
              <div className="space-y-2">
                {analysis.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-crypto-green rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-crypto-orange mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  This AI analysis is for informational purposes only and should not be considered as financial advice. 
                  Always conduct your own research and consult with financial professionals before making investment decisions.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

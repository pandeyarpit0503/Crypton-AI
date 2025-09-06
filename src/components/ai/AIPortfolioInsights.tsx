import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  PieChart,
  AlertTriangle,
  Target,
  Sparkles,
  RefreshCw,
  Shield,
  BarChart3
} from 'lucide-react';
import { geminiAI, AIPortfolioInsight } from '@/lib/gemini';
import { portfolioService } from '@/services/portfolioService';
import { PortfolioHolding } from '@/types/portfolio';

interface AIPortfolioInsightsProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

export function AIPortfolioInsights({ holdings, totalValue }: AIPortfolioInsightsProps) {
  const [insights, setInsights] = useState<AIPortfolioInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    if (!holdings.length) return;

    setLoading(true);
    setError(null);

    try {
      // Enrich holdings with current prices for AI analysis
      const enrichedHoldings = await Promise.all(
        holdings.map(async holding => ({
          ...holding,
          current_price: await portfolioService.getCoinPrice(holding.coin_id)
        }))
      );

      // Check if we have valid data for analysis
      const hasValidData = enrichedHoldings.some(h => h.current_price > 0 && h.amount > 0);

      if (!hasValidData) {
        setInsights({
          overallHealth: 'Portfolio data is incomplete. Please ensure your holdings have valid amounts and current market prices are available.',
          diversificationScore: 0,
          riskAssessment: 'Cannot assess risk due to missing data.',
          recommendations: ['Add valid holdings with current market data', 'Ensure cryptocurrency prices are available'],
          rebalancingSuggestions: ['Complete portfolio setup first']
        });
        return;
      }

      const result = await geminiAI.analyzePortfolio(enrichedHoldings);

      // Ensure diversification score is properly calculated
      if (result.diversificationScore === 0 && enrichedHoldings.length > 0) {
        // Calculate fallback diversification score
        const totalValue = enrichedHoldings.reduce((sum, h) => sum + (h.amount * h.current_price), 0);
        const numHoldings = enrichedHoldings.length;
        const largestHoldingPercentage = Math.max(...enrichedHoldings.map(h =>
          ((h.amount * h.current_price) / totalValue) * 100
        ));

        let diversificationScore = Math.min(numHoldings * 15, 60);
        if (largestHoldingPercentage < 50) diversificationScore += 20;
        if (largestHoldingPercentage < 30) diversificationScore += 20;
        diversificationScore = Math.min(diversificationScore, 100);

        result.diversificationScore = diversificationScore;
      }

      setInsights(result);
    } catch (err) {
      setError('Failed to generate portfolio insights. Please try again.');
      console.error('Portfolio Insights Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (holdings.length > 0) {
      generateInsights();
    }
  }, [holdings]);

  const getDiversificationColor = (score: number) => {
    if (score >= 80) return 'text-crypto-green';
    if (score >= 60) return 'text-crypto-orange';
    return 'text-crypto-red';
  };



  if (!holdings.length) {
    return (
      <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <PieChart className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Add holdings to your portfolio to get AI-powered insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-crypto-green" />
            <span>AI Portfolio Insights</span>
            <Sparkles className="w-4 h-4 text-crypto-orange" />
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
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
              <div className="text-muted-foreground">AI is analyzing your portfolio...</div>
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

        {insights && !loading && (
          <>
            {/* Portfolio Health */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-crypto-green" />
                <h4 className="font-semibold text-foreground">Portfolio Health</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {insights.overallHealth}
              </p>
            </div>

            {/* Diversification Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-crypto-blue" />
                  <h4 className="font-semibold text-foreground">Diversification Score</h4>
                </div>
                <Badge className={`${getDiversificationColor(insights.diversificationScore)} font-mono`}>
                  {insights.diversificationScore}/100
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={insights.diversificationScore} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-crypto-orange" />
                <h4 className="font-semibold text-foreground">Risk Assessment</h4>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {insights.riskAssessment}
              </p>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-crypto-green" />
                <h4 className="font-semibold text-foreground">AI Recommendations</h4>
              </div>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-crypto-green rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebalancing Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-crypto-blue" />
                <h4 className="font-semibold text-foreground">Rebalancing Suggestions</h4>
              </div>
              <div className="space-y-2">
                {insights.rebalancingSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-crypto-blue rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {holdings.length}
                </div>
                <div className="text-xs text-muted-foreground">Assets</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  ${totalValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center space-y-1">
                <div className={`text-2xl font-bold ${getDiversificationColor(insights.diversificationScore || 0)}`}>
                  {(insights.diversificationScore || 0) >= 80 ? 'A+' :
                   (insights.diversificationScore || 0) >= 60 ? 'B' : 'C'}
                </div>
                <div className="text-xs text-muted-foreground">Grade</div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-crypto-orange mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  AI insights are based on current market data and portfolio composition. 
                  This analysis is for informational purposes only and should not be considered as financial advice.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

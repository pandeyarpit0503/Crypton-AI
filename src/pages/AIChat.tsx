import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Target,
  MessageCircle,
  Zap
} from 'lucide-react';
import { AIChat } from '@/components/ai/AIChat';

export default function AIChatPage() {
  const features = [
    {
      icon: <Brain className="w-5 h-5 text-crypto-green" />,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights on any cryptocurrency using advanced AI"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-crypto-blue" />,
      title: "Market Predictions",
      description: "Receive data-driven predictions and trend analysis"
    },
    {
      icon: <Shield className="w-5 h-5 text-crypto-orange" />,
      title: "Risk Assessment",
      description: "Understand investment risks with AI-powered evaluation"
    },
    {
      icon: <Target className="w-5 h-5 text-purple-500" />,
      title: "Personalized Advice",
      description: "Get tailored recommendations based on your questions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-crypto">
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-green/5 via-transparent to-crypto-blue/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-crypto-green/10 rounded-full blur-xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-crypto-blue/10 rounded-full blur-xl animate-pulse-glow" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-crypto-green" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Crypton AI Assistant
            </h1>
            <Sparkles className="w-6 h-6 text-crypto-orange" />
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your intelligent cryptocurrency advisor powered by advanced AI. 
            Ask questions, get insights, and make informed investment decisions.
          </p>
          <Badge className="mt-4 bg-crypto-green/20 text-crypto-green border-crypto-green/30">
            <Zap className="w-3 h-3 mr-1" />
            Powered by Gemini AI
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Chat */}
          <div className="lg:col-span-2 animate-scale-in">
            <AIChat />
          </div>

          {/* Features & Info */}
          <div className="space-y-6 animate-slide-in">
            {/* Features */}
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-crypto-blue" />
                  <span>AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-muted/20 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sample Questions */}
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-crypto-green" />
                  <span>Sample Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      "What's the best strategy for investing in Bitcoin?"
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      "How risky is investing in altcoins?"
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      "Explain DeFi and its potential returns"
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      "Should I diversify my crypto portfolio?"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-glass-bg backdrop-blur-glass border-glass-border">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-crypto-orange mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">
                      Important Disclaimer
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This AI assistant provides educational information and analysis for research purposes only. 
                      It is not financial advice. Always conduct your own research and consult with qualified 
                      financial professionals before making investment decisions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Loader2
} from 'lucide-react';
import { geminiAI, AIChatResponse } from '@/lib/gemini';
import { getConfidenceColor } from '@/utils/confidenceCalculator';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
}

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m CryptoTrend AI, your cryptocurrency advisor. I can help answer questions about Bitcoin, Ethereum, DeFi, investing strategies, wallets, staking, and more!\n\n💡 Currently running on knowledge base mode - I can still provide helpful information about cryptocurrency topics.',
      timestamp: new Date(),
      confidence: 85
    }
  ]);


  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = input.trim();
    setInput('');
    setLoading(true);

    try {
      console.log('AIChat - Sending message:', questionText);
      const response: AIChatResponse = await geminiAI.chatWithAI(questionText);
      console.log('AIChat - Received response:', response);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        confidence: response.confidence
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AIChat - Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please check the browser console for more details and try again.',
        timestamp: new Date(),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  const suggestedQuestions = [
    "What's the best strategy for DCA investing?",
    "Should I invest in Bitcoin or Ethereum?",
    "How do I analyze cryptocurrency trends?",
    "What are the risks of crypto investing?",
    "Explain blockchain technology simply"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };



  return (
    <Card className="bg-glass-bg backdrop-blur-glass border-glass-border h-[600px] flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-crypto-green" />
            <span>AI Crypto Advisor</span>
            <Sparkles className="w-4 h-4 text-crypto-orange" />
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-muted/50">
            Knowledge Base Mode
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4 min-h-0 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 break-words overflow-wrap-anywhere ${
                  message.type === 'user'
                    ? 'bg-crypto-green/20 text-foreground ml-2 sm:ml-4'
                    : 'bg-muted/50 text-foreground mr-2 sm:mr-4'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Bot className="w-4 h-4 text-crypto-green mt-1 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 text-crypto-blue mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === 'ai' && message.confidence !== undefined && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceColor(message.confidence)}`}
                        >
                          {message.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-lg p-3 mr-2 sm:mr-4 max-w-[85%] sm:max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-crypto-green flex-shrink-0" />
                  <Loader2 className="w-4 h-4 animate-spin text-crypto-green flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs hover:bg-crypto-green/10 hover:border-crypto-green/30 break-words whitespace-normal h-auto py-2 px-3"
                >
                  <span className="break-words">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex space-x-2 min-w-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about cryptocurrency..."
            className="flex-1 min-w-0 bg-card border-border focus:border-crypto-green/50"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="bg-crypto-green hover:bg-crypto-green/90 text-primary-foreground flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
